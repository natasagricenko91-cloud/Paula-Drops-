import React, { useState, useRef, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { BrawlerData, CameraPreset, DebugSettings, GameMode } from './types/game';
import { ORIGINAL_BRAWLERS } from './data/brawlers';
import { Lobby } from './components/Lobby';
import { ThreeArena } from './game/ThreeArena';
import { BrawlerSelectModal } from './components/BrawlerSelectModal';
import { TrophyRoadModal } from './components/TrophyRoadModal';
import { BrawlPassModal } from './components/BrawlPassModal';
import { ShopModal } from './components/ShopModal';
import { DebugMenu } from './components/DebugMenu';
import { SupportModal } from './components/SupportModal';
import { SpecModal } from './components/SpecModal';
import { MaintenanceBreakModal } from './components/MaintenanceBreakModal';
import { DisconnectModal, AccountDeletionModal } from './components/DangerModals';
import { CompensationModal20 } from './components/CompensationModal20';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { soundManager } from './audio/soundManager';
import {
  auth,
  signInWithPaulaGoogle,
  signOutPaula,
  syncPaulaProfile,
  savePaulaProfile,
  testConnection,
  type PaulaUserProfile,
} from './services/firebase';

export default function App() {
  // Navigation State: Lobby vs 3D Match
  const [currentScreen, setCurrentScreen] = useState<'lobby' | 'match'>('lobby');

  // Paula ID Firebase Authentication & Cloud Sync
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [paulaProfile, setPaulaProfile] = useState<PaulaUserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Player Progression & Economy State
  const [selectedBrawler, setSelectedBrawler] = useState<BrawlerData>(ORIGINAL_BRAWLERS[0]);
  const [trophies, setTrophies] = useState<number>(680);
  const [gold, setGold] = useState<number>(4500);
  const [gems, setGems] = useState<number>(240);
  const [bling, setBling] = useState<number>(() => {
    const saved = localStorage.getItem('paula_drops_bling');
    return saved ? parseInt(saved, 10) : 2500;
  });
  const [hasClaimed20Compensation, setHasClaimed20Compensation] = useState<boolean>(() => {
    return localStorage.getItem('paula_drops_2_0_claimed') === 'true';
  });
  const [isCompensationOpen, setIsCompensationOpen] = useState(false);
  const [isGoogleWorkspaceOpen, setIsGoogleWorkspaceOpen] = useState(false);
  const [brawlerLevels, setBrawlerLevels] = useState<{ [id: string]: number }>({
    vexa: 7,
    gulliver: 5,
    nyx: 4,
  });
  const [brawlerMastery, setBrawlerMastery] = useState<{ [id: string]: number }>({
    vexa: 450,
    gulliver: 240,
    nyx: 180,
  });

  // Game Settings & Debug Suite 2.0 Config
  const [gameMode, setGameMode] = useState<GameMode>('Gem Grab 3v3');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    botAiEnabled: true,
    botDifficulty: 'normal',
    godMode: false,
    infiniteAmmo: false,
    instantSuper: false,
    instantHypercharge: false,
    gameSpeed: 1.0,
    moveSpeedMultiplier: 1.0,
    damageMultiplier: 1.0,
    rangeMultiplier: 1.0,
    brawlerScale: 1.0,
    showHitboxes: false,
    showFpsOverlay: false,
    simulatedLatency: 28,
    packetLoss: 0,
    lightingPreset: 'day',
    fov: 45,
    pauseToxicGas: false,
    dev1738Active: false,
    bigHeadMode: false,
    discoArena: false,
    wireframeMode: false,
    moonGravity: false,
    superMagnet: false,
    gatlingFire: false,
    clusterShot: false,
    iceSlide: false,
    ghostPhasing: false,
    goldSkin: false,
    freezeBots: false,
    pacifistBots: false,
    oneHitKill: false,
    unlimitedGadgets: false,
    confettiStorm: false,
    crtShader: false,
  });

  // Live arena actions reference (spawning, obstacles, toxic gas)
  const arenaActionRef = useRef<{
    spawnGems: (count: number) => void;
    rebuildObstacles: () => void;
    nukeObstacles: () => void;
    resetToxicGas: () => void;
    suddenDeathGas: () => void;
    refillGadgets: () => void;
    respawnPlayer: () => void;
    triggerShake: () => void;
    spawnPaulaDrop?: (rarity: 'rare' | 'epic' | 'mythic' | 'legendary') => void;
  } | null>(null);

  // Modals Visibility State
  const [isBrawlersOpen, setIsBrawlersOpen] = useState(false);
  const [isTrophyRoadOpen, setIsTrophyRoadOpen] = useState(false);
  const [isBrawlPassOpen, setIsBrawlPassOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  // Firebase Auth Lifecycle & Cloud Sync
  useEffect(() => {
    testConnection().then((ok) => {
      if (ok) console.log('Paula Drops: Firebase Firestore online.');
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          const profile = await syncPaulaProfile(user, {
            trophies,
            gold,
            gems,
            selectedBrawler: selectedBrawler.id,
          });
          if (profile) {
            setPaulaProfile(profile);
            setTrophies(profile.trophies);
            setGold(profile.gold);
            setGems(profile.gems);
            if (profile.bling !== undefined) {
              setBling(profile.bling);
              localStorage.setItem('paula_drops_bling', String(profile.bling));
            }
            if (profile.hasClaimed20Compensation !== undefined) {
              setHasClaimed20Compensation(profile.hasClaimed20Compensation);
              localStorage.setItem('paula_drops_2_0_claimed', String(profile.hasClaimed20Compensation));
            }
            const foundBrawler = ORIGINAL_BRAWLERS.find((b) => b.id === profile.selectedBrawler);
            if (foundBrawler) {
              setSelectedBrawler(foundBrawler);
            }
          }
        } catch (err) {
          console.error('Failed to sync Paula ID profile:', err);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setPaulaProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignInGoogle = async () => {
    try {
      setIsSyncing(true);
      const result = await signInWithPaulaGoogle();
      if (result?.user) {
        const user = result.user;
        soundManager.playVictory();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#facc15', '#4ade80'],
        });
        const profile = await syncPaulaProfile(user, {
          trophies,
          gold,
          gems,
          selectedBrawler: selectedBrawler.id,
        });
        if (profile) {
          setPaulaProfile(profile);
          setTrophies(profile.trophies);
          setGold(profile.gold);
          setGems(profile.gems);
        }
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await signOutPaula();
      setCurrentUser(null);
      setPaulaProfile(null);
      soundManager.playUiClick();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Match Flow Callbacks
  const handleStartBattle = () => {
    setCurrentScreen('match');
  };

  const handleMatchEnd = (victory: boolean, trophiesGained: number, masteryPoints: number) => {
    const nextTrophies = Math.max(0, trophies + trophiesGained);
    const nextGold = gold + (victory ? 80 : 30);
    setTrophies(nextTrophies);
    setGold(nextGold);
    setBrawlerMastery((prev) => ({
      ...prev,
      [selectedBrawler.id]: (prev[selectedBrawler.id] || 0) + masteryPoints,
    }));
    if (currentUser) {
      savePaulaProfile(currentUser.uid, {
        trophies: nextTrophies,
        gold: nextGold,
      }).catch(console.error);
    }
    setCurrentScreen('lobby');
  };

  const handleExitMatch = () => {
    soundManager.playUiClick();
    setCurrentScreen('lobby');
  };

  // Economy & Debug Actions
  const handleInjectGems = (amount: number) => {
    setGems((prev) => prev + amount);
  };

  const handleInjectGold = (amount: number) => {
    setGold((prev) => prev + amount);
  };

  const handleAddTrophies = (amount: number) => {
    setTrophies((prev) => prev + amount);
  };

  const handleSetTrophies = (amount: number) => {
    setTrophies(amount);
  };

  const handleUnlockAllBrawlers = () => {
    soundManager.playSuperReady();
  };

  const handleMaxPowerLevel = () => {
    setBrawlerLevels({
      vexa: 11,
      gulliver: 11,
      nyx: 11,
    });
    soundManager.playSuperReady();
  };

  const handleMaxMastery = () => {
    setBrawlerMastery({
      vexa: 2000,
      gulliver: 2000,
      nyx: 2000,
    });
    soundManager.playSuperReady();
  };

  const handleCompleteBrawlPass = () => {
    setGold((prev) => prev + 5000);
    setGems((prev) => prev + 250);
    soundManager.playSuperReady();
  };

  const handleUpgradeBrawler = (brawlerId: string, cost: number) => {
    if (gold < cost) return;
    setGold((prev) => prev - cost);
    setBrawlerLevels((prev) => ({
      ...prev,
      [brawlerId]: Math.min(11, (prev[brawlerId] || 1) + 1),
    }));
  };

  const handleSpendGems = (amount: number): boolean => {
    if (gems < amount) {
      soundManager.playHit();
      return false;
    }
    setGems((prev) => prev - amount);
    return true;
  };

  const handleSpendGold = (amount: number): boolean => {
    if (gold < amount) {
      soundManager.playHit();
      return false;
    }
    setGold((prev) => prev - amount);
    return true;
  };

  const handleClaimRoadReward = (rewardType: 'gold' | 'gems' | 'credits', amount: number) => {
    if (rewardType === 'gold') setGold((prev) => prev + amount);
    else if (rewardType === 'gems') setGems((prev) => prev + amount);
    else setGold((prev) => prev + amount * 3);
  };

  // 2.0 Legacy Level & Trophy Audit
  const total10Levels = Object.values(brawlerLevels).reduce((acc, lvl) => acc + lvl, 0);

  const handleClaim20Compensation = (rewards: {
    gold: number;
    gems: number;
    bling: number;
    paulaDrops: number;
  }) => {
    const nextGold = gold + rewards.gold;
    const nextGems = gems + rewards.gems;
    const nextBling = bling + rewards.bling;

    setGold(nextGold);
    setGems(nextGems);
    setBling(nextBling);
    setHasClaimed20Compensation(true);

    localStorage.setItem('paula_drops_bling', String(nextBling));
    localStorage.setItem('paula_drops_2_0_claimed', 'true');

    if (currentUser) {
      savePaulaProfile(currentUser.uid, {
        hasClaimed20Compensation: true,
        gold: nextGold,
        gems: nextGems,
        bling: nextBling,
        legacy10Levels: total10Levels,
        legacy10Trophies: trophies,
        compensationReceipt: `#PD20-${Date.now().toString(36).toUpperCase()}`,
      }).catch(console.error);
    }
  };

  const handleResetCompensationClaim = () => {
    setHasClaimed20Compensation(false);
    localStorage.removeItem('paula_drops_2_0_claimed');
    if (currentUser) {
      savePaulaProfile(currentUser.uid, {
        hasClaimed20Compensation: false,
      }).catch(console.error);
    }
    setIsCompensationOpen(true);
  };

  const handleResetAccount = () => {
    setTrophies(0);
    setGold(500);
    setGems(50);
    setBling(1000);
    setBrawlerLevels({ vexa: 1, gulliver: 1, nyx: 1 });
    setBrawlerMastery({ vexa: 0, gulliver: 0, nyx: 0 });
    setIsDeleteAccountOpen(false);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-white">
      {/* SCREEN ROUTING */}
      {currentScreen === 'lobby' ? (
        <Lobby
          selectedBrawler={selectedBrawler}
          trophies={trophies}
          gold={gold}
          gems={gems}
          bling={bling}
          brawlerLevels={brawlerLevels}
          brawlerMastery={brawlerMastery}
          gameMode={gameMode}
          setGameMode={setGameMode}
          onStartBattle={handleStartBattle}
          onOpenBrawlers={() => setIsBrawlersOpen(true)}
          onOpenTrophyRoad={() => setIsTrophyRoadOpen(true)}
          onOpenBrawlPass={() => setIsBrawlPassOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenDebug={() => setIsDebugOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenSpec={() => setIsSpecOpen(true)}
          onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
          onOpenCompensation={() => setIsCompensationOpen(true)}
          hasClaimed20Compensation={hasClaimed20Compensation}
          currentUser={currentUser}
          paulaProfile={paulaProfile}
          onSignInGoogle={handleSignInGoogle}
          onSignOutGoogle={handleSignOutGoogle}
          isSyncing={isSyncing}
        />
      ) : (
        <ThreeArena
          selectedBrawler={selectedBrawler}
          gameMode={gameMode}
          cameraPreset={cameraPreset}
          debugSettings={debugSettings}
          onMatchEnd={handleMatchEnd}
          onExitMatch={handleExitMatch}
          onOpenDebug={() => setIsDebugOpen(true)}
          arenaActionRef={arenaActionRef}
        />
      )}

      {/* MODALS */}
      {/* 0. PAULA DROPS 2.0 PROGRESSION RESET & COMPENSATION WINDOW */}
      <CompensationModal20
        isOpen={isCompensationOpen}
        onClose={() => setIsCompensationOpen(false)}
        legacyLevels={total10Levels}
        legacyTrophies={trophies}
        isAlreadyClaimed={hasClaimed20Compensation}
        onClaim={handleClaim20Compensation}
      />

      {/* 1. Brawler Selection & Upgrade Modal */}
      <BrawlerSelectModal
        isOpen={isBrawlersOpen}
        onClose={() => setIsBrawlersOpen(false)}
        selectedBrawler={selectedBrawler}
        onSelectBrawler={(b) => setSelectedBrawler(b)}
        gold={gold}
        onUpgradeBrawler={handleUpgradeBrawler}
        brawlerLevels={brawlerLevels}
        brawlerMastery={brawlerMastery}
      />

      {/* 2. Trophy Road Milestone Ladder */}
      <TrophyRoadModal
        isOpen={isTrophyRoadOpen}
        onClose={() => setIsTrophyRoadOpen(false)}
        currentTrophies={trophies}
        onClaimReward={handleClaimRoadReward}
      />

      {/* 3. Brawl Pass Modal */}
      <BrawlPassModal
        isOpen={isBrawlPassOpen}
        onClose={() => setIsBrawlPassOpen(false)}
        gems={gems}
        onSpendGems={handleSpendGems}
        onAddGold={(amt) => setGold((prev) => prev + amt)}
        onAddGems={(amt) => setGems((prev) => prev + amt)}
      />

      {/* 4. Shop Modal */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        gems={gems}
        gold={gold}
        onSpendGems={handleSpendGems}
        onSpendGold={handleSpendGold}
        onAddGems={(amt) => setGems((prev) => prev + amt)}
        onAddGold={(amt) => setGold((prev) => prev + amt)}
      />

      {/* 5. Developer Debug Drawer 2.0 */}
      <DebugMenu
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
        debugSettings={debugSettings}
        setDebugSettings={setDebugSettings}
        onInjectGems={handleInjectGems}
        onInjectGold={handleInjectGold}
        onAddTrophies={handleAddTrophies}
        onSetTrophies={handleSetTrophies}
        onUnlockAllBrawlers={handleUnlockAllBrawlers}
        onMaxPowerLevel={handleMaxPowerLevel}
        onMaxMastery={handleMaxMastery}
        onCompleteBrawlPass={handleCompleteBrawlPass}
        onTriggerMaintenance={() => {
          setIsDebugOpen(false);
          setIsMaintenanceOpen(true);
        }}
        onTriggerDisconnect={() => {
          setIsDebugOpen(false);
          setIsDisconnectOpen(true);
        }}
        onTriggerDeleteAccount={() => {
          setIsDebugOpen(false);
          setIsDeleteAccountOpen(true);
        }}
        onForceMatchResult={(victory) => {
          setIsDebugOpen(false);
          handleMatchEnd(victory, victory ? 8 : -4, victory ? 45 : 10);
        }}
        onSpawnGems={(cnt) => arenaActionRef.current?.spawnGems(cnt)}
        onRebuildObstacles={() => arenaActionRef.current?.rebuildObstacles()}
        onNukeObstacles={() => arenaActionRef.current?.nukeObstacles()}
        onResetToxicGas={() => arenaActionRef.current?.resetToxicGas()}
        onSuddenDeathGas={() => arenaActionRef.current?.suddenDeathGas()}
        onRefillGadgets={() => arenaActionRef.current?.refillGadgets()}
        onRespawnPlayer={() => arenaActionRef.current?.respawnPlayer()}
        onTriggerShake={() => arenaActionRef.current?.triggerShake()}
        isInMatch={currentScreen === 'match'}
        onTriggerCompensation={() => {
          setIsDebugOpen(false);
          setIsCompensationOpen(true);
        }}
        onResetCompensationClaim={handleResetCompensationClaim}
        onSpawnPaulaDrop={(rarity) => arenaActionRef.current?.spawnPaulaDrop?.(rarity)}
        onSelectBrawler={(bId) => {
          const b = ORIGINAL_BRAWLERS.find((x) => x.id === bId);
          if (b) setSelectedBrawler(b);
        }}
        currentSelectedBrawlerId={selectedBrawler.id}
      />

      {/* 6. Help & Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

      {/* 7. Game Director Technical Blueprint Specification Modal */}
      <SpecModal isOpen={isSpecOpen} onClose={() => setIsSpecOpen(false)} />

      {/* 8. Maintenance Break Hazard Modal */}
      <MaintenanceBreakModal
        isOpen={isMaintenanceOpen}
        onDismiss={() => setIsMaintenanceOpen(false)}
      />

      {/* 9. Danger Modals (Disconnect & Delete Account) */}
      <DisconnectModal
        isOpen={isDisconnectOpen}
        onDismiss={() => setIsDisconnectOpen(false)}
      />

      <AccountDeletionModal
        isOpen={isDeleteAccountOpen}
        onDismiss={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleResetAccount}
      />

      {/* 10. Google Workspace & AI Hub Modal (Drive, Sheets, Calendar, Gemini) */}
      <GoogleWorkspaceModal
        isOpen={isGoogleWorkspaceOpen}
        onClose={() => setIsGoogleWorkspaceOpen(false)}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
        gameState={{
          trophies,
          gold,
          gems,
          bling,
          selectedBrawler: selectedBrawler.id,
          brawlerLevels,
        }}
      />
    </div>
  );
}
