/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore using the provisioned firestoreDatabaseId or default
const firestoreDatabaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || '(default)';
export const db = getFirestore(app, firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Workspace Scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.events',
];

// Google Auth Provider for Paula ID + Google Workspace APIs
export const googleProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token cache (Workspace guideline: never use localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface PaulaUserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  paulaId: string;
  trophies: number;
  gold: number;
  gems: number;
  bling?: number;
  selectedBrawler: string;
  hasClaimed20Compensation?: boolean;
  legacy10Levels?: number;
  legacy10Trophies?: number;
  compensationReceipt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Validate connection to Firestore on boot
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or connecting.');
    }
    return false;
  }
}

/**
 * Initialize auth listener with access token sync
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in via persistent session, token might need refreshing or popup
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign In with Google for Paula ID & Google Workspace APIs
 */
export async function signInWithPaulaGoogle(): Promise<{ user: User; accessToken: string } | null> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Sign Out
 */
export async function signOutPaula(): Promise<void> {
  cachedAccessToken = null;
  await signOut(auth);
}

/**
 * Generate a friendly Paula ID tag like #PAULA-9182
 */
export function generatePaulaIdTag(uid: string): string {
  const hash = Math.abs(
    uid.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  )
    .toString()
    .slice(-4)
    .padStart(4, '7');
  return `#PAULA-${hash}`;
}

/**
 * Load or initialize Paula ID User Profile in Firestore
 */
export async function syncPaulaProfile(
  user: User,
  currentGameState: {
    trophies: number;
    gold: number;
    gems: number;
    selectedBrawler: string;
  }
): Promise<PaulaUserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as PaulaUserProfile;
      return data;
    }

    // Create new profile linked to Paula ID
    const paulaTag = generatePaulaIdTag(user.uid);
    const newProfile: PaulaUserProfile = {
      id: user.uid,
      email: user.email || 'brawler@pauladrops.io',
      displayName: user.displayName || 'Paula Brawler',
      photoURL: user.photoURL || '',
      paulaId: paulaTag,
      trophies: currentGameState.trophies || 850,
      gold: currentGameState.gold || 1250,
      gems: currentGameState.gems || 80,
      selectedBrawler: currentGameState.selectedBrawler || 'vexa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, newProfile);
    return newProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save updated player progress to Firestore
 */
export async function savePaulaProfile(
  userId: string,
  updates: Partial<PaulaUserProfile>
): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  const path = `users/${userId}`;

  try {
    await setDoc(
      userDocRef,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
