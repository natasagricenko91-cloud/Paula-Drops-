import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CameraPreset, DebugSettings } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { getCachedAccessToken } from '../services/firebase';
import {
  uploadJsonToDrive,
  createEsportsMatchSpreadsheet,
  scheduleTournamentCalendarEvent,
} from '../services/googleWorkspace';
import { generateEsportsCastingCommentary } from '../services/geminiAnnouncer';

interface DebugMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  debugSettings: DebugSettings;
  setDebugSettings: React.Dispatch<React.SetStateAction<DebugSettings>>;
  onInjectGems: (amount: number) => void;
  onInjectGold: (amount: number) => void;
  onAddTrophies: (amount: number) => void;
  onSetTrophies?: (amount: number) => void;
  onUnlockAllBrawlers: () => void;
  onMaxPowerLevel: () => void;
  onMaxMastery?: () => void;
  onCompleteBrawlPass?: () => void;
  onTriggerMaintenance: () => void;
  onTriggerDisconnect: () => void;
  onTriggerDeleteAccount: () => void;
  onForceMatchResult?: (victory: boolean) => void;
  onSpawnGems?: (count: number) => void;
  onRebuildObstacles?: () => void;
  onNukeObstacles?: () => void;
  onResetToxicGas?: () => void;
  onSuddenDeathGas?: () => void;
  onRefillGadgets?: () => void;
  onRespawnPlayer?: () => void;
  onTriggerShake?: () => void;
  isInMatch: boolean;
  // 2.0 Update additions
  onTriggerCompensation?: () => void;
  onResetCompensationClaim?: () => void;
  onSpawnPaulaDrop?: (rarity: 'rare' | 'epic' | 'mythic' | 'legendary') => void;
  onSelectBrawler?: (brawlerId: string) => void;
  currentSelectedBrawlerId?: string;
}

export const DebugMenu: React.FC<DebugMenuProps> = ({
  isOpen,
  onClose,
  cameraPreset,
  setCameraPreset,
  debugSettings,
  setDebugSettings,
  onInjectGems,
  onInjectGold,
  onAddTrophies,
  onSetTrophies,
  onUnlockAllBrawlers,
  onMaxPowerLevel,
  onMaxMastery,
  onCompleteBrawlPass,
  onTriggerMaintenance,
  onTriggerDisconnect,
  onTriggerDeleteAccount,
  onForceMatchResult,
  onSpawnGems,
  onRebuildObstacles,
  onNukeObstacles,
  onResetToxicGas,
  onSuddenDeathGas,
  onRefillGadgets,
  onRespawnPlayer,
  onTriggerShake,
  isInMatch,
  onTriggerCompensation,
  onResetCompensationClaim,
  onSpawnPaulaDrop,
  onSelectBrawler,
  currentSelectedBrawlerId = 'vexa',
}) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'characters' | 'battle' | 'render' | 'network' | 'google_apis' | 'aka' | '1738_master'
  >('general');

  // AKA 1738 Tab state
  const [akaInput, setAkaInput] = useState('');
  const [is1738Unlocked, setIs1738Unlocked] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  // Google APIs diagnostic state
  const [googleApiLog, setGoogleApiLog] = useState<string | null>(null);
  const [isTestingGoogleApi, setIsTestingGoogleApi] = useState(false);

  // 1738 Category filter
  const [active1738Category, setActive1738Category] = useState<
    'all' | 'god' | 'arena' | 'audio' | 'mutation' | 'bots' | 'camera' | 'economy'
  >('all');

  // JSON State dump modal view
  const [showJsonDump, setShowJsonDump] = useState(false);

  if (!isOpen) return null;

  const handleUnlock1738 = (inputCode: string) => {
    const cleaned = inputCode.trim().toLowerCase();
    if (cleaned === '1738devbuild' || cleaned === '1738') {
      setIs1738Unlocked(true);
      setActiveTab('1738_master');
      soundManager.play1738Drop();
      setUnlockMessage('ACCESS GRANTED: 1738 REMY DEVELOPER MASTER CONSOLE UNLOCKED');
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#facc15', '#eab308', '#ca8a04', '#ffffff'],
      });
      setDebugSettings((prev) => ({ ...prev, dev1738Active: true }));
    } else {
      soundManager.playHit();
      setUnlockMessage(`ERROR: UNRECOGNIZED PASSCODE "${inputCode}". TYPE "1738devbuild"`);
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'GENERAL / CHEATS', icon: '⚡' },
    { id: 'characters' as const, label: 'CHARACTERS / HEROES', icon: '🎭' },
    { id: 'battle' as const, label: 'BATTLE / WORLD', icon: '🗺️' },
    { id: 'render' as const, label: 'RENDER / FX', icon: '👁️' },
    { id: 'network' as const, label: 'NETWORK & SYSTEM', icon: '🌐' },
    {
      id: 'google_apis' as const,
      label: 'GOOGLE WORKSPACE & AI',
      icon: '🚀',
      badge: getCachedAccessToken() ? 'CONNECTED' : 'GUEST',
    },
    {
      id: 'aka' as const,
      label: 'AKA TAB (1738)',
      icon: '🔑',
      badge: is1738Unlocked ? 'UNLOCKED' : '1738devbuild',
    },
    ...(is1738Unlocked
      ? [
          {
            id: '1738_master' as const,
            label: '1738 MASTER',
            icon: '👑',
            badge: '108+ MODS',
          },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-950 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden font-sans">
        
        {/* Authentic Supercell Titan / Laser Internal Header */}
        <div className="px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b-2 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg shadow-inner">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-brawl text-sm text-white tracking-wider">
                  TITAN / LASER ENGINE INTERNAL DEBUGGER v54.200 (DEV CBT)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
                  PaulaDropsCBTDevV1
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-brawl text-[10px] uppercase">
                  2.0 UPDATE
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>State: <strong className="text-emerald-400">{isInMatch ? 'IN_ARENA_SIM' : 'LOBBY_IDLE'}</strong></span>
                <span>•</span>
                <span>Ping: <strong className="text-sky-400">{debugSettings.simulatedLatency}ms</strong></span>
                <span>•</span>
                <span>Tick: <strong className="text-amber-400">60Hz</strong></span>
                <span>•</span>
                <span>Speed: <strong className="text-purple-400">{debugSettings.gameSpeed}x</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-brawl text-sm flex items-center justify-center transition-all border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-3 pt-2 gap-1.5 overflow-x-auto scrollbar-none font-brawl text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playUiClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-amber-400 border-t-2 border-amber-400 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950 space-y-5 custom-scrollbar text-white">

          {/* TAB 1: GENERAL / CHEATS */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              
              {/* 2.0 UPDATE & COMPENSATION CONTROLS */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-900 border-2 border-amber-500/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <h4 className="font-brawl text-sm text-amber-300 uppercase tracking-wide">
                      PAULA DROPS 2.0 UPDATE &amp; COMPENSATION TOOLS
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                    2.0 MIGRATION
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Trigger the official 2.0 level compensation window, reset claim status to re-test the unboxing sequence, or calibrate 1.0 grandfathered currency values.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onTriggerCompensation?.();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-brawl text-xs font-black shadow-md flex items-center gap-2"
                  >
                    <span>⚡</span> OPEN 2.0 COMPENSATION WINDOW
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onResetCompensationClaim?.();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-brawl text-xs flex items-center gap-2"
                  >
                    <span>🔄</span> RESET 2.0 CLAIM RECORD (ALLOW RE-CLAIM)
                  </button>
                </div>
              </div>

              {/* CURRENCY & ECONOMY INJECTORS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💎</span> INSTANT ACCOUNT INJECTIONS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-brawl">
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onInjectGold(10000);
                    }}
                    className="p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40"
                  >
                    +10,000 COINS 🪙
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onInjectGold(99999);
                    }}
                    className="p-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/60 font-black"
                  >
                    +99,999 COINS 🪙
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onInjectGems(500);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                  >
                    +500 GEMS 💎
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onInjectGems(99999);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/60 font-black"
                  >
                    +99,999 GEMS 💎
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onAddTrophies(1000);
                    }}
                    className="p-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40"
                  >
                    +1,000 TROPHIES 🏆
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onSetTrophies?.(0);
                    }}
                    className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40"
                  >
                    RESET TROPHIES (0) ⚠️
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onMaxPowerLevel();
                    }}
                    className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40"
                  >
                    MAX ALL POWER 11 ⚡
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onCompleteBrawlPass?.();
                    }}
                    className="p-2.5 rounded-xl bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40"
                  >
                    PASS TIER 50 🎫
                  </button>
                </div>
              </div>

              {/* REAL COMBAT & MATCH OVERRIDES */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚔️</span> LIVE ARENA COMBAT TOGGLES
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/50">
                    <div>
                      <span className="font-bold text-white block">God Mode</span>
                      <span className="text-[10px] text-slate-400">Invulnerable to all damage</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.godMode}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, godMode: e.target.checked }))}
                      className="accent-amber-400 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/50">
                    <div>
                      <span className="font-bold text-white block">Infinite Rapid Ammo</span>
                      <span className="text-[10px] text-slate-400">Never consume ammo bars</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.infiniteAmmo}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, infiniteAmmo: e.target.checked }))}
                      className="accent-amber-400 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/50">
                    <div>
                      <span className="font-bold text-white block">1-Shot Instakill</span>
                      <span className="text-[10px] text-slate-400">Deal 99,999 damage per bullet</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.oneHitKill}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, oneHitKill: e.target.checked }))}
                      className="accent-amber-400 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/50">
                    <div>
                      <span className="font-bold text-white block">Instant Super (100%)</span>
                      <span className="text-[10px] text-slate-400">Super charge is locked full</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.instantSuper}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, instantSuper: e.target.checked }))}
                      className="accent-amber-400 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/50">
                    <div>
                      <span className="font-bold text-white block">Instant Hypercharge (100%)</span>
                      <span className="text-[10px] text-slate-400">Hypercharge ready immediately</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.instantHypercharge}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, instantHypercharge: e.target.checked }))}
                      className="accent-amber-400 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/50">
                    <div>
                      <span className="font-bold text-white block">Unlimited Gadgets (3/3)</span>
                      <span className="text-[10px] text-slate-400">Instant gadget charge refill</span>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playUiClick();
                        onRefillGadgets?.();
                      }}
                      className="text-xs bg-sky-600 px-2.5 py-1 rounded-lg text-white font-brawl"
                    >
                      REFILL 3X
                    </button>
                  </label>
                </div>
              </div>

              {/* MATCH RESULT FORCE ACTIONS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏁</span> FORCE MATCH TERMINATION
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => onForceMatchResult?.(true)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-brawl text-xs font-black shadow-md flex items-center justify-center gap-2"
                  >
                    <span>🏆</span> FORCE VICTORY (+8 TROPHIES)
                  </button>
                  <button
                    onClick={() => onForceMatchResult?.(false)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-brawl text-xs font-black shadow-md flex items-center justify-center gap-2"
                  >
                    <span>💀</span> FORCE DEFEAT (-4 TROPHIES)
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CHARACTERS / HEROES */}
          {activeTab === 'characters' && (
            <div className="space-y-4">
              
              {/* BRAWLER HOT-SWAP */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎭</span> ACTIVE BRAWLER HOT-SWAP (LIVE ENGINE SWAP)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'vexa', name: 'Vexa', class: 'Assassin', icon: '⏱️' },
                    { id: 'gulliver', name: 'Gulliver', class: 'Artillery', icon: '⚓' },
                    { id: 'nyx', name: 'Nyx', class: 'Support', icon: '🍄' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        soundManager.playUiClick();
                        onSelectBrawler?.(b.id);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        currentSelectedBrawlerId === b.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{b.icon}</span>
                      <span className="font-brawl text-sm font-bold block">{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">[{b.class}]</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* BRAWLER ENTITY SCALE */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider">
                    ENTITY SCALE MULTIPLIER ({debugSettings.brawlerScale || 1.0}x)
                  </h4>
                  <span className="text-[10px] font-mono text-amber-400">
                    {debugSettings.brawlerScale === 0.5 ? 'MINI' : debugSettings.brawlerScale >= 2.0 ? 'BOSS' : 'NORMAL'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.25"
                  value={debugSettings.brawlerScale || 1.0}
                  onChange={(e) =>
                    setDebugSettings((p) => ({ ...p, brawlerScale: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-amber-400"
                />
              </div>

              {/* BOT AI SUITE */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🤖</span> BOT AI INTEL &amp; SIMULATION
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'normal', 'nightmare'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        soundManager.playUiClick();
                        setDebugSettings((p) => ({ ...p, botDifficulty: diff }));
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-brawl capitalize ${
                        debugSettings.botDifficulty === diff
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {diff === 'easy' ? 'Dumb / Practice' : diff === 'normal' ? 'Normal / 3v3' : 'Supercell Pro'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <span className="text-xs">Freeze All Bots</span>
                    <input
                      type="checkbox"
                      checked={debugSettings.freezeBots}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, freezeBots: e.target.checked }))}
                      className="accent-amber-400"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <span className="text-xs">Pacifist Bots (No Shoot)</span>
                    <input
                      type="checkbox"
                      checked={debugSettings.pacifistBots}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, pacifistBots: e.target.checked }))}
                      className="accent-amber-400"
                    />
                  </label>
                </div>
              </div>

              {/* VISUAL SKINS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider">
                  HERO SKIN OVERRIDE
                </h4>
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-amber-300 font-bold">★ Pure Gold 2.0 Skin Shader</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.goldSkin}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, goldSkin: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>
              </div>

            </div>
          )}

          {/* TAB 3: BATTLE / WORLD */}
          {activeTab === 'battle' && (
            <div className="space-y-4">
              
              {/* LIVE STARR / PAULA DROP SPAWNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-2 border-indigo-500/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-brawl text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌟</span> LIVE ARENA DROP SPAWNER (2.0 FEATURE)
                  </h4>
                  <span className="text-[10px] font-mono text-sky-400">IN-MATCH PICKUPS</span>
                </div>
                <p className="text-xs text-slate-300">
                  Spawn dynamic Starr / Paula drops into the live 3D arena map. Walking over them grants instant Hypercharge overdrive buffs!
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-brawl">
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onSpawnPaulaDrop?.('rare');
                    }}
                    className="p-2.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/50"
                  >
                    SPAWN RARE DROP 🔷
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onSpawnPaulaDrop?.('epic');
                    }}
                    className="p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/50"
                  >
                    SPAWN EPIC DROP 💜
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onSpawnPaulaDrop?.('mythic');
                    }}
                    className="p-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/50"
                  >
                    SPAWN MYTHIC DROP ❤️
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onSpawnPaulaDrop?.('legendary');
                    }}
                    className="p-2.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 border border-amber-400/60 font-black"
                  >
                    SPAWN LEGENDARY 🌟
                  </button>
                </div>
              </div>

              {/* ENVIRONMENT OBSTACLES & GEMS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🧱</span> ARENA ENTITY &amp; GEM CONTROLS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-brawl">
                  <button
                    onClick={() => onSpawnGems?.(10)}
                    className="p-2.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40"
                  >
                    BURST 10 GEMS 💎
                  </button>
                  <button
                    onClick={() => onNukeObstacles?.()}
                    className="p-2.5 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40"
                  >
                    NUKE ALL CRATES 💥
                  </button>
                  <button
                    onClick={() => onRebuildObstacles?.()}
                    className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                  >
                    REBUILD WALLS 🧱
                  </button>
                  <button
                    onClick={() => onTriggerShake?.()}
                    className="p-2.5 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/40"
                  >
                    CAMERA QUAKE 📳
                  </button>
                </div>
              </div>

              {/* TOXIC GAS & SHOWDOWN */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>☣️</span> SHOWDOWN POISON GAS
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-brawl">
                  <button
                    onClick={() => onSuddenDeathGas?.()}
                    className="p-2.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 font-bold"
                  >
                    SUDDEN DEATH GAS
                  </button>
                  <button
                    onClick={() => onResetToxicGas?.()}
                    className="p-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    RESET GAS CIRCLE
                  </button>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <span className="text-[11px]">Freeze Gas</span>
                    <input
                      type="checkbox"
                      checked={debugSettings.pauseToxicGas}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, pauseToxicGas: e.target.checked }))}
                      className="accent-amber-400"
                    />
                  </label>
                </div>
              </div>

              {/* CAMERA PRESETS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📹</span> CAMERA ENGINE PRESETS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-brawl">
                  {[
                    { id: 'isometric', label: 'Isometric 3v3', icon: '📐' },
                    { id: 'crazy_cam', label: 'Crazy Cam 3D', icon: '🎥' },
                    { id: 'free_look', label: 'Top-Down 90°', icon: '🚁' },
                    { id: 'first_person', label: 'First Person Visor', icon: '🥽' },
                  ].map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => {
                        soundManager.playUiClick();
                        setCameraPreset(cam.id as CameraPreset);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                        cameraPreset === cam.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      <span>{cam.icon}</span>
                      <span>{cam.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* GAME ENGINE SPEED SLIDER */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider">
                    GAME ENGINE SIMULATION SPEED ({debugSettings.gameSpeed}x)
                  </h4>
                  <span className="text-xs font-mono text-amber-400">
                    {debugSettings.gameSpeed === 1.0 ? 'REALTIME' : debugSettings.gameSpeed < 1.0 ? 'SLOW MOTION' : 'TURBO'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2.5"
                  step="0.25"
                  value={debugSettings.gameSpeed}
                  onChange={(e) => setDebugSettings((p) => ({ ...p, gameSpeed: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-400"
                />
              </div>

            </div>
          )}

          {/* TAB 4: RENDER / FX */}
          {activeTab === 'render' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👁️</span> DIAGNOSTIC RENDERING &amp; SHADERS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Wireframe Models</span>
                      <span className="text-[10px] text-slate-400">Render poly mesh wireframes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.wireframeMode}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, wireframeMode: e.target.checked }))}
                      className="accent-amber-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">FPS &amp; DrawCall Telemetry</span>
                      <span className="text-[10px] text-slate-400">HUD performance stats</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.showFpsOverlay}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, showFpsOverlay: e.target.checked }))}
                      className="accent-amber-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Disco Neon Arena</span>
                      <span className="text-[10px] text-slate-400">Dynamic rainbow terrain colors</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.discoArena}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, discoArena: e.target.checked }))}
                      className="accent-amber-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">CRT Retro Arcade Filter</span>
                      <span className="text-[10px] text-slate-400">Scanlines and vintage glow</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={debugSettings.crtShader}
                      onChange={(e) => setDebugSettings((p) => ({ ...p, crtShader: e.target.checked }))}
                      className="accent-amber-400"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NETWORK & SYSTEM */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🌐</span> SIMULATED NETWORK CONDITIONS
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Simulated Latency</span>
                      <span className="font-mono text-amber-400">{debugSettings.simulatedLatency}ms</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="400"
                      value={debugSettings.simulatedLatency}
                      onChange={(e) =>
                        setDebugSettings((p) => ({ ...p, simulatedLatency: parseInt(e.target.value) }))
                      }
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Simulated Packet Loss</span>
                      <span className="font-mono text-rose-400">{debugSettings.packetLoss}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={debugSettings.packetLoss}
                      onChange={(e) =>
                        setDebugSettings((p) => ({ ...p, packetLoss: parseInt(e.target.value) }))
                      }
                      className="w-full accent-rose-400"
                    />
                  </div>
                </div>
              </div>

              {/* DANGER & DIAGNOSTIC MODALS */}
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-3">
                <h4 className="font-brawl text-xs text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️</span> DANGER ZONE &amp; SIMULATION STRESS TESTS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-brawl">
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onTriggerMaintenance();
                    }}
                    className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
                  >
                    MAINTENANCE BREAK 🚧
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onTriggerDisconnect();
                    }}
                    className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30"
                  >
                    ERROR 42 DESYNC 🔌
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playUiClick();
                      onTriggerDeleteAccount();
                    }}
                    className="p-3 rounded-xl bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/30"
                  >
                    HARD ACCOUNT RESET 🗑️
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE WORKSPACE & AI DIAGNOSTICS */}
          {activeTab === 'google_apis' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    <h4 className="font-brawl text-sm text-sky-300 uppercase tracking-wide">
                      GOOGLE WORKSPACE &amp; GEMINI API DIAGNOSTICS
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    {getCachedAccessToken() ? 'AUTH TOKEN PRESENT' : 'GUEST / LOCAL MODE'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Developer diagnostics for Google Drive v3, Sheets v4, Calendar v3, and Gemini 2.5 Flash SDK integrations.
                </p>
              </div>

              {/* Scopes Overview */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h5 className="font-brawl text-xs text-slate-400 uppercase tracking-wider">
                  Configured Google OAuth Scopes
                </h5>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="p-2 bg-slate-950 rounded flex items-center justify-between">
                    <span className="text-sky-300">https://www.googleapis.com/auth/drive.file</span>
                    <span className="text-emerald-400 font-bold">DRIVE V3</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded flex items-center justify-between">
                    <span className="text-emerald-300">https://www.googleapis.com/auth/spreadsheets</span>
                    <span className="text-emerald-400 font-bold">SHEETS V4</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded flex items-center justify-between">
                    <span className="text-amber-300">https://www.googleapis.com/auth/calendar.events</span>
                    <span className="text-emerald-400 font-bold">CALENDAR V3</span>
                  </div>
                </div>
              </div>

              {/* Quick API Execution Tests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-brawl">
                <button
                  disabled={isTestingGoogleApi}
                  onClick={async () => {
                    soundManager.playUiClick();
                    setIsTestingGoogleApi(true);
                    setGoogleApiLog('Uploading test match telemetry to Google Drive...');
                    try {
                      const res = await uploadJsonToDrive(`Paula_Drops_DevTest_${Date.now()}.json`, {
                        testRun: true,
                        timestamp: new Date().toISOString(),
                        brawler: currentSelectedBrawlerId,
                        engine: 'Titan Engine 54.200',
                      });
                      setGoogleApiLog(`✅ Drive Upload Success! File ID: ${res.id} (${res.name})`);
                    } catch (err: any) {
                      setGoogleApiLog(`❌ Drive Error: ${err.message}`);
                    } finally {
                      setIsTestingGoogleApi(false);
                    }
                  }}
                  className="p-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-600/60 shadow flex items-center gap-2 cursor-pointer"
                >
                  <span>📁</span> TEST DRIVE V3 UPLOAD
                </button>

                <button
                  disabled={isTestingGoogleApi}
                  onClick={async () => {
                    soundManager.playUiClick();
                    setIsTestingGoogleApi(true);
                    setGoogleApiLog('Generating new Google Sheet for Esports Match History...');
                    try {
                      const res = await createEsportsMatchSpreadsheet(`Paula Drops Dev Match Sheet (${Date.now()})`);
                      setGoogleApiLog(`✅ Sheets Success! Created spreadsheet: "${res.title}" (${res.spreadsheetId})`);
                    } catch (err: any) {
                      setGoogleApiLog(`❌ Sheets Error: ${err.message}`);
                    } finally {
                      setIsTestingGoogleApi(false);
                    }
                  }}
                  className="p-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 shadow flex items-center gap-2 cursor-pointer"
                >
                  <span>📊</span> TEST SHEETS V4 CREATION
                </button>

                <button
                  disabled={isTestingGoogleApi}
                  onClick={async () => {
                    soundManager.playUiClick();
                    setIsTestingGoogleApi(true);
                    setGoogleApiLog('Scheduling test Championship qualifier event in Google Calendar...');
                    try {
                      const res = await scheduleTournamentCalendarEvent({
                        summary: '⚡ Dev Test: Paula Drops 2.0 Scrimmage',
                        description: 'Simulated dev scrimmage test event.',
                        startHoursFromNow: 2,
                        durationHours: 1,
                      });
                      setGoogleApiLog(`✅ Calendar Success! Scheduled event: "${res.summary}" (ID: ${res.id})`);
                    } catch (err: any) {
                      setGoogleApiLog(`❌ Calendar Error: ${err.message}`);
                    } finally {
                      setIsTestingGoogleApi(false);
                    }
                  }}
                  className="p-3 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-600/60 shadow flex items-center gap-2 cursor-pointer"
                >
                  <span>📅</span> TEST CALENDAR V3 EVENT
                </button>

                <button
                  disabled={isTestingGoogleApi}
                  onClick={async () => {
                    soundManager.playUiClick();
                    setIsTestingGoogleApi(true);
                    setGoogleApiLog('Requesting Gemini 2.5 Flash Esports Shoutcaster debrief...');
                    try {
                      const res = await generateEsportsCastingCommentary({
                        brawlerName: currentSelectedBrawlerId.toUpperCase(),
                        gameMode: 'Gem Grab 3v3',
                        result: 'VICTORY',
                        kills: 9,
                        deaths: 0,
                        damage: 54200,
                        dropsFound: 3,
                        trophies: 750,
                      });
                      setGoogleApiLog(`🎙️ Gemini AI Output:\n${res}`);
                    } catch (err: any) {
                      setGoogleApiLog(`❌ Gemini Error: ${err.message}`);
                    } finally {
                      setIsTestingGoogleApi(false);
                    }
                  }}
                  className="p-3 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-600/60 shadow flex items-center gap-2 cursor-pointer"
                >
                  <span>✨</span> TEST GEMINI 2.5 SHOUTCASTER
                </button>
              </div>

              {/* Realtime API Output Terminal */}
              {googleApiLog && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">// API EXECUTION LOG</div>
                  {googleApiLog}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AKA TAB (1738 ACCESS) */}
          {activeTab === 'aka' && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl">
                  🔑
                </div>
                <div>
                  <h4 className="font-brawl text-base text-amber-300 uppercase tracking-wide">
                    DEVELOPER AKA TAB GATEWAY
                  </h4>
                  <p className="text-xs text-slate-300">
                    Enter the developer passcode to unlock the 1738 Master Console with 108+ classified mods.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">// TITAN DEV ENGINE CBT</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    PaulaDropsCBTDevV1
                  </span>
                </div>
                <div className="text-emerald-400 font-bold">
                  DEV PASSCODE: <span className="text-amber-300">1738devbuild</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={akaInput}
                  onChange={(e) => setAkaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock1738(akaInput)}
                  placeholder="Type 1738devbuild..."
                  className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono focus:border-amber-400 focus:outline-hidden"
                />
                <button
                  onClick={() => handleUnlock1738(akaInput)}
                  className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-brawl text-xs font-black"
                >
                  AUTHENTICATE
                </button>
              </div>

              {unlockMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono font-bold ${
                    is1738Unlocked
                      ? 'bg-amber-950/70 border-amber-400 text-amber-300'
                      : 'bg-rose-950/70 border-rose-500 text-rose-300'
                  }`}
                >
                  {unlockMessage}
                </div>
              )}

              {is1738Unlocked && (
                <button
                  onClick={() => setActiveTab('1738_master')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl text-slate-950 font-brawl text-sm font-black flex items-center justify-center gap-2"
                >
                  <span>👑</span> PROCEED TO 1738 MASTER CONSOLE (108+ MODS)
                </button>
              )}
            </div>
          )}

          {/* TAB 7: 1738 MASTER CONSOLE */}
          {activeTab === '1738_master' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 p-4 rounded-2xl border-2 border-amber-300 shadow-2xl text-slate-950 flex items-center justify-between">
                <div>
                  <div className="font-brawl text-lg tracking-wide flex items-center gap-2">
                    <span>👑</span> 1738 CLASSIFIED DEVELOPER BUILD
                  </div>
                  <p className="text-xs font-bold text-amber-950 mt-0.5">
                    108 TOTAL DEVELOPER KERNEL SWITCHES · REMY BOYZ #1738
                  </p>
                </div>
                <button
                  onClick={() => soundManager.play1738Drop()}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 text-amber-400 font-brawl text-xs font-black shadow-md hover:scale-105 transition-transform"
                >
                  PLAY 1738 DROP 🎵
                </button>
              </div>

              {/* 1738 Sub-category pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-brawl scrollbar-none">
                {[
                  { id: 'all', label: 'ALL 108 FEATURES' },
                  { id: 'god', label: '👑 GODLIKE (15)' },
                  { id: 'arena', label: '🗺️ ARENA (15)' },
                  { id: 'audio', label: '🎵 1738 FX (15)' },
                  { id: 'mutation', label: '🎭 HERO MODS (15)' },
                  { id: 'bots', label: '🤖 BOTS (15)' },
                  { id: 'camera', label: '📹 CAMERAS (15)' },
                  { id: 'economy', label: '💎 ECONOMY (18)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundManager.playUiClick();
                      setActive1738Category(cat.id as typeof active1738Category);
                    }}
                    className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                      active1738Category === cat.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#1 True God Mode (Invulnerable)</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.godMode}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, godMode: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#2 1-Shot Super Instakill</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.oneHitKill}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, oneHitKill: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#3 Infinite Rapid Ammo</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.infiniteAmmo}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, infiniteAmmo: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#4 Super Magnet (Gem Pull)</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.superMagnet}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, superMagnet: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#5 Gatling Gun 10x Fire Rate</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.gatlingFire}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, gatlingFire: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#6 Cluster Shot (12 Proj)</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.clusterShot}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, clusterShot: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#7 Ice Slide (Zero Friction)</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.iceSlide}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, iceSlide: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#8 Ghost Phasing (Walk Walls)</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.ghostPhasing}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, ghostPhasing: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <span>#9 Confetti Celebration Storm</span>
                  <input
                    type="checkbox"
                    checked={debugSettings.confettiStorm}
                    onChange={(e) => setDebugSettings((p) => ({ ...p, confettiStorm: e.target.checked }))}
                    className="accent-amber-400"
                  />
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
