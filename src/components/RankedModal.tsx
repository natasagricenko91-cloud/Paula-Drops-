/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../audio/soundManager';
import {
  RANKED_TIERS,
  RANKED_MODIFIERS,
  getRankedTierFromElo,
  type RankedModifierType,
  type RankedPlayerProfile,
} from '../types/ranked';
import { ORIGINAL_BRAWLERS } from '../data/brawlers';
import { BrawlerData } from '../types/game';

interface RankedModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankedProfile: RankedPlayerProfile;
  setRankedProfile: React.Dispatch<React.SetStateAction<RankedPlayerProfile>>;
  onStartRankedMatch: (modifier: RankedModifierType) => void;
  selectedBrawler: BrawlerData;
  onSelectBrawler: (brawler: BrawlerData) => void;
  onRewardBling?: (amount: number) => void;
}

export const RankedModal: React.FC<RankedModalProps> = ({
  isOpen,
  onClose,
  rankedProfile,
  setRankedProfile,
  onStartRankedMatch,
  selectedBrawler,
  onSelectBrawler,
  onRewardBling,
}) => {
  const [activeTab, setActiveTab] = useState<'arena' | 'road' | 'leaderboard' | 'draft'>('arena');
  const [draftStep, setDraftStep] = useState<'banning' | 'picking' | 'ready'>('banning');
  const [selectedBan, setSelectedBan] = useState<string>('nyx');
  const [unboxingDrop, setUnboxingDrop] = useState(false);
  const [unboxedReward, setUnboxedReward] = useState<{
    name: string;
    type: string;
    icon: string;
    rarity: 'Epic' | 'Mythic' | 'Legendary';
    blingBonus: number;
  } | null>(null);

  if (!isOpen) return null;

  const currentTier = getRankedTierFromElo(rankedProfile.elo);
  const nextTierIndex = RANKED_TIERS.findIndex((t) => t.name === currentTier.name && t.subTier === currentTier.subTier) + 1;
  const nextTier = nextTierIndex < RANKED_TIERS.length ? RANKED_TIERS[nextTierIndex] : null;

  const progressPercent = nextTier
    ? Math.min(100, Math.max(0, ((rankedProfile.elo - currentTier.minElo) / (nextTier.minElo - currentTier.minElo)) * 100))
    : 100;

  const currentModifier = RANKED_MODIFIERS[rankedProfile.activeModifier] || RANKED_MODIFIERS.classic;

  const cycleModifier = () => {
    soundManager.playUiClick();
    const modifierKeys = Object.keys(RANKED_MODIFIERS) as RankedModifierType[];
    const nextIdx = (modifierKeys.indexOf(rankedProfile.activeModifier) + 1) % modifierKeys.length;
    setRankedProfile((prev) => ({
      ...prev,
      activeModifier: modifierKeys[nextIdx],
    }));
  };

  const handleOpenRankedStarrDrop = () => {
    if (rankedProfile.rankedStarrDropsClaimed <= 0 && rankedProfile.wins === 0) {
      soundManager.playHit();
      return;
    }
    setUnboxingDrop(true);
    soundManager.playSuperReady();

    setTimeout(() => {
      soundManager.playVictory();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#c084fc', '#38bdf8', '#fbbf24', '#f43f5e'],
      });

      const rewards = [
        { name: 'Masters Hologram Battle Card', type: 'Ranked Cosmetic', icon: '🎴', rarity: 'Legendary' as const, blingBonus: 1000 },
        { name: 'Pro Caster Vexa Skin', type: 'Esports Skin', icon: '⚡', rarity: 'Mythic' as const, blingBonus: 500 },
        { name: 'Golden Champion Spray & Pin', type: 'Ranked Spray', icon: '🏆', rarity: 'Epic' as const, blingBonus: 300 },
        { name: 'Diamond Overdrive Icon', type: 'Profile Icon', icon: '💎', rarity: 'Epic' as const, blingBonus: 250 },
      ];
      const picked = rewards[Math.floor(Math.random() * rewards.length)];
      setUnboxedReward(picked);
      onRewardBling?.(picked.blingBonus);
      setUnboxingDrop(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 font-body">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-950 border-4 border-purple-500 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.4)] overflow-hidden text-white">

        {/* TOP BAR / TIER SUMMARY HEADER */}
        <div className="p-4 px-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b-2 border-purple-500/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${currentTier.badgeBg} border-3 ${currentTier.borderColor} flex items-center justify-center text-3xl shadow-xl relative`}>
              <span>{currentTier.icon}</span>
              <span className="absolute -bottom-1 -right-1 text-[10px] font-black font-brawl bg-black px-1.5 py-0.5 rounded-full border border-purple-400">
                {currentTier.subTier}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-brawl text-2xl text-white tracking-wide">
                  RANKED ARENA <span className="text-purple-400">SEASON 1</span>
                </h2>
                <span className="text-[10px] font-brawl bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/60 uppercase">
                  {currentTier.name} {currentTier.subTier}
                </span>
              </div>

              {/* Elo Progress Bar */}
              <div className="flex items-center gap-3 mt-1">
                <span className="font-brawl text-sm text-purple-300 font-bold">
                  {rankedProfile.elo.toLocaleString()} ELO
                </span>
                <div className="w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-400 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {nextTier && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Next: {nextTier.name} {nextTier.subTier} ({nextTier.minElo} Elo)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rank Protection Badge */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/50 shadow-inner">
              <span className="text-emerald-400 text-sm">🛡️</span>
              <div className="text-left">
                <div className="text-[9px] font-brawl text-emerald-400 uppercase leading-none">RANK SHIELD</div>
                <div className="text-[10px] font-mono text-slate-300 font-bold">
                  {rankedProfile.rankedProtectionActive ? 'PROTECTED' : 'AT RISK'}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-rose-600 text-white font-brawl text-lg flex items-center justify-center border-2 border-slate-600 hover:border-rose-400 transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-6 pt-2 gap-2 text-xs font-brawl">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('arena');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-slate-900 text-purple-300 border-t-2 border-x-2 border-purple-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚔️</span> RANKED BATTLE &amp; MODIFIER
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('road');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'road'
                ? 'bg-slate-900 text-amber-300 border-t-2 border-x-2 border-amber-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎁</span> RANKED ROAD &amp; STARR DROPS
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('draft');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'draft'
                ? 'bg-slate-900 text-cyan-300 border-t-2 border-x-2 border-cyan-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎯</span> PRO DRAFT &amp; BANS (DIAMOND+)
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('leaderboard');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-slate-900 text-yellow-300 border-t-2 border-x-2 border-yellow-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏆</span> ESPORTS GLOBAL TOP 100
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">

          {/* TAB 1: RANKED BATTLE */}
          {activeTab === 'arena' && (
            <div className="space-y-6">
              
              {/* Active Modifier Spotlight Card */}
              <div className={`p-5 rounded-3xl border-3 ${currentModifier.badgeColor} shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border-2 border-white/20 flex items-center justify-center text-4xl shadow-inner">
                    {currentModifier.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-brawl uppercase tracking-widest text-slate-400">
                        ACTIVE RANKED MODIFIER
                      </span>
                      <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-mono text-purple-300 border border-purple-500/40">
                        ROTATING
                      </span>
                    </div>
                    <h3 className={`font-brawl text-2xl ${currentModifier.tagColor} tracking-wide`}>
                      {currentModifier.name}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                      {currentModifier.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={cycleModifier}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-purple-300 font-brawl text-xs border border-purple-400/50 shadow flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  title="Cycle to next ranked modifier"
                >
                  <span>🔄</span> CYCLE MODIFIER (PRACTICE)
                </button>
              </div>

              {/* Ready Brawler & Ranked Stakes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Selected Brawler Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-3xl border-2 border-sky-400">
                    {selectedBrawler.id === 'vexa' ? '⏱️' : selectedBrawler.id === 'gulliver' ? '⚓' : '🍄'}
                  </div>
                  <div>
                    <div className="text-[10px] font-brawl text-slate-400">SELECTED HERO</div>
                    <div className="font-brawl text-lg text-white">{selectedBrawler.name}</div>
                    <span className="text-[10px] text-sky-400 font-mono">[{selectedBrawler.class}]</span>
                  </div>
                </div>

                {/* Stakes Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center">
                  <div className="text-[10px] font-brawl text-slate-400 mb-1">ELO STAKES</div>
                  <div className="flex items-center justify-between text-xs font-brawl">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span>▲ VICTORY:</span> <strong>+115 ELO</strong>
                    </span>
                    <span className="text-rose-400 flex items-center gap-1">
                      <span>▼ DEFEAT:</span> <strong>-75 ELO</strong>
                    </span>
                  </div>
                </div>

                {/* Win Streak & Form */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-brawl text-slate-400">CURRENT FORM</div>
                    <div className="font-brawl text-base text-amber-300">
                      🔥 {rankedProfile.currentWinStreak} WIN STREAK
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-400">
                    <div>W: <span className="text-emerald-400 font-bold">{rankedProfile.wins}</span></div>
                    <div>L: <span className="text-rose-400 font-bold">{rankedProfile.losses}</span></div>
                  </div>
                </div>
              </div>

              {/* Giant Skewed Cartoon "ENTER RANKED BATTLE" Button */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <button
                  onClick={() => {
                    soundManager.playSuperReady();
                    onClose();
                    onStartRankedMatch(rankedProfile.activeModifier);
                  }}
                  className="w-full max-w-md h-20 rounded-3xl bg-gradient-to-b from-purple-600 via-indigo-600 to-purple-800 hover:from-purple-500 hover:to-indigo-500 border-4 border-purple-300 shadow-[0_10px_0_#4c1d95,0_15px_30px_rgba(168,85,247,0.5)] active:translate-y-2 active:shadow-none transition-all flex flex-col items-center justify-center text-white cursor-pointer -skew-x-2"
                >
                  <span className="font-brawl text-3xl font-black tracking-wider brawl-stroke flex items-center gap-2">
                    <span>⚔️</span> PLAY RANKED 3v3
                  </span>
                  <span className="text-xs font-brawl text-purple-200 tracking-widest -mt-1 uppercase">
                    COMPETITIVE ARENA · MODIFIER: {currentModifier.name}
                  </span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: RANKED ROAD & STARR DROPS */}
          {activeTab === 'road' && (
            <div className="space-y-6">
              
              {/* Unbox Ranked Drop Banner */}
              <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl border-3 border-purple-400/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border-2 border-purple-400 flex items-center justify-center text-4xl animate-bounce">
                    🌟
                  </div>
                  <div>
                    <h3 className="font-brawl text-xl text-white">RANKED STARR DROP VAULT</h3>
                    <p className="text-xs text-purple-200">
                      Unbox exclusive Ranked cosmetics, seasonal pro skins, hologram battle cards, and Bling!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenRankedStarrDrop}
                  disabled={unboxingDrop}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-brawl text-sm font-black shadow-xl border-2 border-yellow-200 cursor-pointer active:translate-y-0.5"
                >
                  {unboxingDrop ? 'UNBOXING DROP...' : '✨ UNBOX RANKED DROP'}
                </button>
              </div>

              {/* Unboxed Reward Banner */}
              {unboxedReward && (
                <div className="p-4 bg-gradient-to-r from-amber-950/80 to-purple-950/80 rounded-2xl border-2 border-amber-400 flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{unboxedReward.icon}</span>
                    <div>
                      <div className="text-[10px] font-brawl uppercase text-amber-300">
                        [{unboxedReward.rarity}] {unboxedReward.type}
                      </div>
                      <div className="font-brawl text-lg text-white">{unboxedReward.name}</div>
                      <div className="text-xs text-amber-200 font-mono">+ {unboxedReward.blingBonus} Bling Awarded!</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setUnboxedReward(null)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-brawl text-xs rounded-lg"
                  >
                    DISMISS
                  </button>
                </div>
              )}

              {/* Ranked Tiers Ladder */}
              <div className="space-y-2">
                <h4 className="font-brawl text-sm text-purple-300 uppercase tracking-wider">
                  SEASON 1 RANKED ROAD REWARDS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {RANKED_TIERS.filter((_, idx) => idx % 2 === 0).map((tier) => {
                    const isUnlocked = rankedProfile.elo >= tier.minElo;
                    return (
                      <div
                        key={`${tier.name}-${tier.subTier}`}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          isUnlocked
                            ? 'bg-slate-900/90 border-purple-500/60 shadow-lg'
                            : 'bg-slate-950/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tier.icon}</span>
                          <div>
                            <div className="font-brawl text-sm text-white">
                              {tier.name} {tier.subTier}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Requires {tier.minElo.toLocaleString()} Elo
                            </div>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <span className="text-xs font-brawl bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/50">
                              ✓ UNLOCKED
                            </span>
                          ) : (
                            <span className="text-xs font-brawl bg-slate-900 text-slate-500 px-3 py-1 rounded-full border border-slate-700">
                              LOCKED 🔒
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PRO DRAFT & BANS (DIAMOND+) */}
          {activeTab === 'draft' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-cyan-500/40 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-brawl text-base">
                  <span>🎯</span> DIAMOND+ COMPETITIVE DRAFT SYSTEM
                </div>
                <p className="text-xs text-slate-300">
                  In Diamond tier and above, competitive matches follow a professional Pick &amp; Ban format. Ban your opponent's key brawler and pick your squad counter.
                </p>
              </div>

              {/* Draft Phase Steps */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-brawl text-sm text-white">BRAWLER BAN PHASE</h4>
                  <span className="text-xs font-mono text-cyan-400">TIMER: 15s</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {ORIGINAL_BRAWLERS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        soundManager.playUiClick();
                        setSelectedBan(b.id);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedBan === b.id
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-xl'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {b.id === 'vexa' ? '⏱️' : b.id === 'gulliver' ? '⚓' : '🍄'}
                      </div>
                      <div className="font-brawl text-base">{b.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">[{b.class}]</div>
                      {selectedBan === b.id && (
                        <div className="mt-2 text-[10px] font-brawl text-rose-400 uppercase">
                          ⛔ BANNED THIS MATCH
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    soundManager.playUiClick();
                    setActiveTab('arena');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-brawl text-xs shadow cursor-pointer font-bold border border-cyan-400"
                >
                  CONFIRM DRAFT &amp; PROCEED ▸
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ESPORTS GLOBAL LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-brawl text-sm text-yellow-300 uppercase tracking-wider">
                  TOP 10 PRO ESPORTS RANKINGS (GLOBAL MASTERS)
                </h4>
                <span className="text-xs font-mono text-slate-400">UPDATED: REAL-TIME</span>
              </div>

              <div className="space-y-2">
                {[
                  { rank: 1, name: 'Sitetampo', clan: '[ZETA]', elo: 10450, hero: 'Vexa', winRate: '88%' },
                  { rank: 2, name: 'Tensai', clan: '[CRAZY]', elo: 10180, hero: 'Gulliver', winRate: '86%' },
                  { rank: 3, name: 'PaulaPro#001', clan: '[DEV]', elo: 9940, hero: 'Nyx', winRate: '84%' },
                  { rank: 4, name: 'Tyrant', clan: '[TRIBE]', elo: 9780, hero: 'Vexa', winRate: '82%' },
                  { rank: 5, name: 'Zhar', clan: '[STMN]', elo: 9540, hero: 'Gulliver', winRate: '81%' },
                  { rank: 6, name: 'Symantec', clan: '[SK]', elo: 9320, hero: 'Nyx', winRate: '79%' },
                  { rank: 7, name: 'Joker', clan: '[FUT]', elo: 9150, hero: 'Vexa', winRate: '78%' },
                ].map((item) => (
                  <div
                    key={item.rank}
                    className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-yellow-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center font-brawl text-sm text-amber-400 font-bold border border-slate-800">
                        #{item.rank}
                      </div>
                      <div>
                        <div className="font-brawl text-sm text-white flex items-center gap-1.5">
                          {item.name}
                          <span className="text-[10px] font-mono text-purple-400 font-bold">{item.clan}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Main: {item.hero} · WR: {item.winRate}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-brawl text-base text-yellow-400">{item.elo.toLocaleString()} ELO</div>
                      <div className="text-[10px] text-purple-300 font-mono">🌟 MASTERS</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-brawl">
          <span>Paula Drops Esports Season 1 · Powered by Titan 54.200 Engine</span>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-brawl border border-slate-600 cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
