import React, { useState } from 'react';
import { BrawlerData, GameMode } from '../types/game';
import { HeroPodium } from './HeroPodium';
import { soundManager } from '../audio/soundManager';
import { getRankedTierFromElo } from '../types/ranked';

import type { User } from 'firebase/auth';
import type { PaulaUserProfile } from '../services/firebase';

interface LobbyProps {
  selectedBrawler: BrawlerData;
  trophies: number;
  gold: number;
  gems: number;
  brawlerLevels: { [id: string]: number };
  brawlerMastery: { [id: string]: number };
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  onStartBattle: () => void;
  onOpenBrawlers: () => void;
  onOpenTrophyRoad: () => void;
  onOpenBrawlPass: () => void;
  onOpenShop: () => void;
  onOpenDebug: () => void;
  onOpenSupport: () => void;
  onOpenSpec: () => void;
  onOpenGoogleWorkspace?: () => void;
  onOpenRanked?: () => void;
  onOpenNews?: () => void;
  rankedElo?: number;
  bling?: number;
  onOpenCompensation?: () => void;
  hasClaimed20Compensation?: boolean;
  currentUser?: User | null;
  paulaProfile?: PaulaUserProfile | null;
  onSignInGoogle?: () => void;
  onSignOutGoogle?: () => void;
  isSyncing?: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({
  selectedBrawler,
  trophies,
  gold,
  gems,
  bling = 2500,
  brawlerLevels,
  brawlerMastery,
  gameMode,
  setGameMode,
  onStartBattle,
  onOpenBrawlers,
  onOpenTrophyRoad,
  onOpenBrawlPass,
  onOpenShop,
  onOpenDebug,
  onOpenSupport,
  onOpenSpec,
  onOpenGoogleWorkspace,
  onOpenRanked,
  onOpenNews,
  rankedElo = 5240,
  onOpenCompensation,
  hasClaimed20Compensation,
  currentUser,
  paulaProfile,
  onSignInGoogle,
  onSignOutGoogle,
  isSyncing,
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<'shop' | 'brawlers' | 'play' | 'pass' | 'ranked' | 'news'>('play');
  const [profileOpen, setProfileOpen] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);

  const currentLevel = brawlerLevels[selectedBrawler.id] || 1;
  const currentMastery = brawlerMastery[selectedBrawler.id] || 0;
  const currentRankedTier = getRankedTierFromElo(rankedElo);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 select-none font-body">
      {/* 3D Background & Center Hero Podium */}
      <div className="absolute inset-0 z-0">
        <HeroPodium brawler={selectedBrawler} />
      </div>

      {/* TOP BAR: Trophies, Gold, Gems, Supercell ID */}
      <div className="relative z-10 w-full px-4 pt-3 flex justify-between items-center">
        {/* Left: Trophies & Trophy Road CTA */}
        <div
          onClick={() => {
            soundManager.playUiClick();
            onOpenTrophyRoad();
          }}
          className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border-2 border-slate-800 shadow-xl cursor-pointer hover:border-amber-400 transition-all hover:scale-102"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-lg shadow-inner">
            🏆
          </div>
          <div className="flex flex-col">
            <span className="font-brawl text-base text-amber-400 leading-tight">
              {trophies.toLocaleString()}
            </span>
            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${Math.min(100, (trophies / 2000) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-brawl text-slate-400 ml-1">ROAD ▸</span>
        </div>

        {/* Center: Gold & Gems Currency Clusters */}
        <div className="flex items-center gap-3">
          {/* Gold */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 shadow-md cursor-pointer hover:border-amber-500"
          >
            <span className="text-amber-400 text-lg">🪙</span>
            <span className="font-brawl text-sm text-amber-300">{gold.toLocaleString()}</span>
            <span className="text-amber-500 text-xs font-black">+</span>
          </div>

          {/* Gems */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 shadow-md cursor-pointer hover:border-emerald-500"
          >
            <span className="text-emerald-400 text-lg">💎</span>
            <span className="font-brawl text-sm text-emerald-300">{gems.toLocaleString()}</span>
            <span className="text-emerald-500 text-xs font-black">+</span>
          </div>

          {/* Bling */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              onOpenShop();
            }}
            className="hidden sm:flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 shadow-md cursor-pointer hover:border-indigo-400"
          >
            <span className="text-indigo-400 text-base">✨</span>
            <span className="font-brawl text-sm text-indigo-300">{bling.toLocaleString()}</span>
          </div>
        </div>

        {/* Right: Supercell ID & Top Controls */}
        <div className="flex items-center gap-2">
          {/* Google Workspace & AI Hub Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenGoogleWorkspace?.();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-900/90 to-blue-900/90 hover:from-sky-800 hover:to-blue-800 text-sky-200 font-brawl text-xs border border-sky-400/70 shadow-md flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            title="Google Workspace & AI Hub (Drive, Sheets, Calendar, Gemini)"
          >
            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center p-0.5 shadow-xs">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <span>GOOGLE HUB</span>
          </button>

          {/* Tech Spec Blueprint Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenSpec();
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 font-brawl text-xs border border-indigo-500/50 shadow-md flex items-center gap-1.5"
            title="Open Technical Blueprint"
          >
            <span>📐</span> TECH BLUEPRINT
          </button>

          {/* Developer Debug Drawer Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenDebug();
            }}
            className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-brawl text-lg flex items-center justify-center border-2 border-amber-300 shadow-lg active:translate-y-0.5 cursor-pointer"
            title="Open Dev Debug Drawer"
          >
            🛠️
          </button>

          {/* Paula ID Profile Pill (with Google Auth) */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              setProfileOpen(!profileOpen);
            }}
            className={`flex items-center gap-2 bg-slate-950/85 pl-2 pr-3 py-1 rounded-full border cursor-pointer transition-all hover:scale-102 ${
              currentUser
                ? 'border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'border-amber-400/80 animate-pulse hover:border-amber-300'
            }`}
          >
            {currentUser ? (
              currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full border border-sky-300 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-xs text-white font-brawl border border-sky-300">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'P'}
                </div>
              )
            ) : (
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="font-brawl text-[11px] text-white leading-tight">
                {currentUser
                  ? currentUser.displayName || paulaProfile?.displayName || 'PAULA HERO'
                  : 'PAULA ID'}
              </span>
              <span className="text-[9px] font-mono text-sky-300">
                {currentUser ? (isSyncing ? 'SYNCING...' : 'CLOUD ON') : 'SIGN IN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.0 UPDATE, RANKED SEASON 1 & ESPORTS NEWS BANNERS */}
      <div className="relative z-20 px-4 pt-1 flex flex-wrap justify-center items-center gap-2 pointer-events-auto">
        {/* 2.0 Level Compensation Button */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenCompensation?.();
          }}
          className={`px-4 py-1.5 rounded-2xl border-2 flex items-center gap-2 shadow-xl transition-all hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md ${
            !hasClaimed20Compensation
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-amber-300 text-slate-950 font-black animate-pulse'
              : 'bg-slate-950/85 border-amber-500/50 text-amber-300 hover:border-amber-400'
          }`}
        >
          <span className="text-base">⚡</span>
          <div className="flex flex-col text-left">
            <span className="font-brawl text-xs uppercase tracking-wide">
              {!hasClaimed20Compensation
                ? 'PAULA DROPS 2.0: 1.0 COMPENSATION'
                : '2.0 FOUNDING VETERAN'}
            </span>
            <span className="text-[9px] opacity-85 font-sans font-semibold">
              {!hasClaimed20Compensation
                ? 'Audited into Legendary Drops!'
                : 'Cloud Save Active'}
            </span>
          </div>
          <span className="font-brawl text-[10px] ml-1 bg-black/20 px-2 py-0.5 rounded-full">
            {!hasClaimed20Compensation ? 'OPEN ▸' : 'VIEW ▸'}
          </span>
        </button>

        {/* Ranked Season 1 Badge Button */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenRanked?.();
          }}
          className="px-4 py-1.5 rounded-2xl bg-slate-950/90 border-2 border-purple-500 hover:border-purple-300 text-white flex items-center gap-2.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <div className={`w-7 h-7 rounded-xl ${currentRankedTier.badgeBg} border border-purple-400 flex items-center justify-center text-sm shadow`}>
            {currentRankedTier.icon}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-brawl text-xs text-purple-300 uppercase tracking-wide">
                RANKED: {currentRankedTier.name} {currentRankedTier.subTier}
              </span>
              <span className="text-[9px] bg-purple-950 text-purple-200 px-1.5 py-0.2 rounded font-mono font-bold">
                {rankedElo.toLocaleString()} ELO
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-sans">
              Season 1 Live · Modifiers Active
            </span>
          </div>
          <span className="font-brawl text-[10px] ml-1 bg-purple-600/30 text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded-full">
            ENTER ▸
          </span>
        </button>

        {/* Esports Live News Ticker Button */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenNews?.();
          }}
          className="px-4 py-1.5 rounded-2xl bg-slate-950/90 border-2 border-amber-500/70 hover:border-amber-400 text-white flex items-center gap-2 shadow-lg transition-all hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-brawl text-xs text-amber-300">
            ESPORTS FINALS
          </span>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
            PICK'EMS
          </span>
        </button>
      </div>

      {/* PAULA ID PROFILE & GOOGLE SIGN-IN MODAL DROPDOWN */}
      {profileOpen && (
        <div className="absolute top-14 right-4 z-40 w-80 bg-slate-900/95 border-3 border-sky-500/60 rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-sm shadow-md border border-sky-300">
                🛡️
              </div>
              <div>
                <h3 className="font-brawl text-sm text-white tracking-wider">PAULA ID PROFILE</h3>
                <span className="text-[10px] text-sky-400 font-mono">FIREBASE CLOUD SYNC</span>
              </div>
            </div>
            <button
              onClick={() => setProfileOpen(false)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-brawl"
            >
              ✕
            </button>
          </div>

          {currentUser ? (
            /* Authenticated Paula ID Profile */
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Google Profile"
                    className="w-12 h-12 rounded-full border-2 border-sky-400 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center text-lg text-white font-brawl border-2 border-sky-400">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'P'}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="font-brawl text-sm text-white truncate">
                    {currentUser.displayName || paulaProfile?.displayName || 'Paula Player'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {currentUser.email}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full font-mono border border-sky-500/40 font-bold">
                      {paulaProfile?.paulaId || '#PAULA-9182'}
                    </span>
                    <button
                      onClick={() => {
                        const tag = paulaProfile?.paulaId || '#PAULA-9182';
                        navigator.clipboard?.writeText(tag);
                        setCopiedTag(true);
                        setTimeout(() => setCopiedTag(false), 1500);
                      }}
                      className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono cursor-pointer"
                    >
                      {copiedTag ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Realtime Synced Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-brawl text-slate-400">TROPHIES</div>
                  <div className="font-brawl text-base text-amber-400">🏆 {trophies}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-brawl text-slate-400">GOLD</div>
                  <div className="font-brawl text-base text-amber-300">🪙 {gold}</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-brawl text-slate-400">GEMS</div>
                  <div className="font-brawl text-base text-emerald-400">💎 {gems}</div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-300 font-mono text-[11px] font-bold">
                    Firestore Auto-Sync Online
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">60Hz</span>
              </div>

              {/* Google Workspace & AI Hub Button */}
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  setProfileOpen(false);
                  onOpenGoogleWorkspace?.();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-sky-900 to-indigo-900 hover:from-sky-800 hover:to-indigo-800 text-sky-200 rounded-xl font-brawl text-xs border border-sky-400/60 shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🌐</span> GOOGLE DRIVE & SHEETS HUB
              </button>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onSignOutGoogle?.();
                  setProfileOpen(false);
                }}
                className="w-full py-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-xl font-brawl text-xs border border-rose-500/50 shadow-md cursor-pointer transition-colors"
              >
                SIGN OUT OF PAULA ID
              </button>
            </div>
          ) : (
            /* Unauthenticated / Guest State - CTA to Sign in with Google */
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-inner">
                  👑
                </div>
                <h4 className="font-brawl text-base text-amber-300">LINK YOUR PAULA ID</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sign in with your Google Account to activate cloud saves, preserve your Trophy Road progress, unlock cloud backup, and share brawlers across devices!
                </p>
              </div>

              {/* Google Sign-in Button */}
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onSignInGoogle?.();
                }}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:scale-98 text-slate-900 rounded-2xl font-brawl text-xs font-black shadow-xl flex items-center justify-center gap-2.5 border-2 border-slate-200 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                SIGN IN WITH GOOGLE (PAULA ID)
              </button>

              <div className="text-[10px] text-center text-slate-400 font-mono">
                🔒 Secured by Firebase Google Authentication
              </div>
            </div>
          )}

          {/* Support & Security Link */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setProfileOpen(false);
              onOpenSupport();
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl font-brawl text-xs border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>💬</span> PAULA DROPS SUPPORT & HELP
          </button>
        </div>
      )}

      {/* CENTER-LEFT FLOATING BRAWLER BADGE & PAULA DROPS LOGO */}
      <div className="relative z-10 pl-6 flex flex-col items-start space-y-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 bg-slate-950/80 rounded-2xl border border-amber-500/40 backdrop-blur-xs shadow-lg">
          <span className="text-lg">🔥</span>
          <span className="font-brawl text-xl text-amber-300 tracking-wider brawl-stroke-sm">
            PAULA DROPS
          </span>
          <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono">
            3v3 ARENA
          </span>
        </div>
        <div className="pointer-events-auto bg-slate-950/85 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col space-y-1.5 w-64 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-brawl border font-bold"
              style={{
                borderColor: selectedBrawler.accentColor,
                color: selectedBrawler.accentColor,
                backgroundColor: `${selectedBrawler.themeColor}30`,
              }}
            >
              {selectedBrawler.rarity.toUpperCase()}
            </span>

            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-brawl">
              {selectedBrawler.class.toUpperCase()}
            </span>
          </div>

          <h2 className="font-brawl text-3xl text-white tracking-wide brawl-stroke-sm">
            {selectedBrawler.name}
          </h2>

          <div className="flex items-center justify-between text-xs font-brawl text-slate-400 pt-1 border-t border-slate-800">
            <span>POWER LEVEL</span>
            <span className="text-amber-400 font-black text-sm">LVL {currentLevel}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-brawl text-slate-400">
            <span>MASTERY</span>
            <span className="text-purple-400 font-bold">⭐ {currentMastery} pts</span>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenBrawlers();
            }}
            className="w-full mt-2 py-2 rounded-xl brawl-btn-blue font-brawl text-xs text-white tracking-wider flex items-center justify-center gap-1.5"
          >
            <span>👥</span> BRAWLER DETAILS
          </button>
        </div>
      </div>

      {/* BOTTOM ACTION CLUSTER: Mode Card & Giant Green BATTLE Button */}
      <div className="relative z-10 pb-2 px-6 flex flex-col items-center">
        {/* Game Mode Selector Card & BATTLE Button Container */}
        <div className="flex items-center gap-4 mb-4">
          {/* Game Mode Card */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              const modes: GameMode[] = ['Gem Grab 3v3', 'Showdown Solo', 'Ranked 3v3'];
              const nextMode = modes[(modes.indexOf(gameMode) + 1) % modes.length];
              setGameMode(nextMode);
            }}
            className="bg-slate-950/85 hover:bg-slate-900 border-3 border-slate-700 hover:border-amber-400 rounded-3xl p-3 px-5 shadow-2xl cursor-pointer flex items-center gap-4 transition-all duration-100 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center text-2xl border-2 border-indigo-400 shadow-inner">
              {gameMode === 'Gem Grab 3v3' ? '💎' : gameMode === 'Showdown Solo' ? '💀' : '⚔️'}
            </div>

            <div>
              <div className="text-[10px] font-brawl text-slate-400 uppercase tracking-widest">
                SELECT GAME MODE
              </div>
              <div className="font-brawl text-lg text-white leading-tight flex items-center gap-2">
                {gameMode}
                <span className="text-amber-400 text-xs font-sans">⇄</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {gameMode === 'Gem Grab 3v3'
                  ? 'Crystal Cavern · Hold 10 Gems'
                  : gameMode === 'Showdown Solo'
                  ? 'Toxic Arena · Last Brawler Standing'
                  : 'Competitive Draft · Modifiers Active'}
              </div>
            </div>
          </div>

          {/* Giant Skewed Cartoon "BATTLE" Button */}
          <button
            onClick={() => {
              soundManager.playSuperReady();
              onStartBattle();
            }}
            className={`w-56 h-20 rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer active:scale-95 -skew-x-3 transition-transform ${
              gameMode === 'Ranked 3v3'
                ? 'bg-gradient-to-b from-purple-500 via-indigo-600 to-purple-800 border-4 border-purple-300 shadow-[0_8px_0_#4c1d95,0_12px_20px_rgba(147,51,234,0.4)]'
                : 'brawl-btn-green'
            }`}
          >
            <span className="font-brawl text-3xl font-black tracking-wider brawl-stroke">
              {gameMode === 'Ranked 3v3' ? 'RANKED' : 'BATTLE'}
            </span>
            <span className="text-[10px] font-brawl text-green-100 tracking-widest -mt-1">
              {gameMode === 'Ranked 3v3' ? 'PLAY FOR ELO' : 'PLAY NOW'}
            </span>
          </button>
        </div>

        {/* BOTTOM DOCK NAVIGATION (Supercell Lobby Tabs) */}
        <div className="w-full max-w-2xl bg-slate-950/90 border-2 border-slate-800 rounded-2xl p-1.5 flex justify-between shadow-2xl text-xs font-brawl backdrop-blur-sm gap-1">
          {/* Shop */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveBottomTab('shop');
              onOpenShop();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeBottomTab === 'shop'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🛍️</span>
            <span>SHOP</span>
          </button>

          {/* Brawlers */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveBottomTab('brawlers');
              onOpenBrawlers();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeBottomTab === 'brawlers'
                ? 'bg-slate-800 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">👥</span>
            <span>BRAWLERS</span>
          </button>

          {/* Play / Lobby (Active center) */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveBottomTab('play');
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeBottomTab === 'play'
                ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🎮</span>
            <span>LOBBY</span>
          </button>

          {/* Brawl Pass */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveBottomTab('pass');
              onOpenBrawlPass();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeBottomTab === 'pass'
                ? 'bg-slate-800 text-purple-400 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🎫</span>
            <span>PASS</span>
          </button>

          {/* Ranked Mode Tab */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveBottomTab('ranked');
              onOpenRanked?.();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all relative ${
              activeBottomTab === 'ranked'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-lg'
                : 'text-purple-400 hover:text-white'
            }`}
          >
            <span className="text-base">🏆</span>
            <span>RANKED</span>
            <span className="absolute -top-1 -right-1 text-[8px] bg-purple-600 text-white px-1 py-0.2 rounded-full font-bold">
              S1
            </span>
          </button>

          {/* News & Esports Tab */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveBottomTab('news');
              onOpenNews?.();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all relative ${
              activeBottomTab === 'news'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-lg'
                : 'text-amber-400 hover:text-white'
            }`}
          >
            <span className="text-base">📰</span>
            <span>NEWS</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border border-slate-900" />
          </button>

          {/* Help & Support */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenSupport();
            }}
            className="flex-1 py-2 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all"
          >
            <span className="text-base">💬</span>
            <span>SUPPORT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
