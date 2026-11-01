import React, { useState } from 'react';
import { BrawlerData } from '../types/game';
import { ORIGINAL_BRAWLERS } from '../data/brawlers';
import { soundManager } from '../audio/soundManager';

interface BrawlerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrawler: BrawlerData;
  onSelectBrawler: (brawler: BrawlerData) => void;
  gold: number;
  onUpgradeBrawler: (brawlerId: string, cost: number) => void;
  brawlerLevels: { [id: string]: number };
  brawlerMastery: { [id: string]: number };
}

export const BrawlerSelectModal: React.FC<BrawlerSelectModalProps> = ({
  isOpen,
  onClose,
  selectedBrawler,
  onSelectBrawler,
  gold,
  onUpgradeBrawler,
  brawlerLevels,
  brawlerMastery,
}) => {
  const [inspectBrawler, setInspectBrawler] = useState<BrawlerData>(selectedBrawler);
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'mastery'>('stats');

  if (!isOpen) return null;

  const currentLevel = brawlerLevels[inspectBrawler.id] || 1;
  const currentMastery = brawlerMastery[inspectBrawler.id] || 0;
  const upgradeCost = currentLevel * 450;
  const canUpgrade = currentLevel < 11 && gold >= upgradeCost;

  // Mastery tier label
  const getMasteryRank = (pts: number) => {
    if (pts >= 1200) return { title: 'Gold III', color: '#facc15' };
    if (pts >= 800) return { title: 'Silver II', color: '#94a3b8' };
    if (pts >= 400) return { title: 'Bronze I', color: '#b45309' };
    return { title: 'Wood I', color: '#78350f' };
  };
  const masteryRank = getMasteryRank(currentMastery);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl h-[620px] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-body">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👥</span>
            <div>
              <h2 className="font-brawl text-2xl text-white tracking-wide brawl-stroke-sm">
                BRAWLERS ({ORIGINAL_BRAWLERS.length}/3 UNLOCKED)
              </h2>
              <p className="text-xs text-slate-400">SELECT AND UPGRADE YOUR HERO SQUAD</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="text-amber-400">🪙</span>
              <span className="font-brawl text-base text-amber-400">{gold.toLocaleString()}</span>
            </div>
            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-brawl text-xl flex items-center justify-center border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Content: Left Brawler Grid, Right Detail Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Brawler Cards Grid */}
          <div className="w-80 border-r border-slate-800 p-4 space-y-3 overflow-y-auto bg-slate-950/60">
            {ORIGINAL_BRAWLERS.map((b) => {
              const lvl = brawlerLevels[b.id] || 1;
              const isSelected = inspectBrawler.id === b.id;
              const isActive = selectedBrawler.id === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    soundManager.playUiClick();
                    setInspectBrawler(b);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-lg scale-102'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 shadow-inner"
                      style={{
                        backgroundColor: b.themeColor,
                        borderColor: b.accentColor,
                      }}
                    >
                      {b.id === 'vexa' ? '⏱️' : b.id === 'gulliver' ? '⚓' : '🍄'}
                    </div>

                    <div>
                      <div className="font-brawl text-base text-white flex items-center gap-1.5">
                        {b.name}
                        {isActive && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black">
                            IN USE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{b.class}</span>
                        <span>•</span>
                        <span style={{ color: b.accentColor }}>{b.rarity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-brawl text-amber-400">LVL {lvl}</span>
                    <span className="text-[10px] text-purple-400">⭐ {brawlerMastery[b.id] || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Inspection & Upgrade Sheet */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-900">
            {/* Top Brawler Identity Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-brawl text-3xl text-white tracking-wide brawl-stroke-sm">
                    {inspectBrawler.name}
                  </h3>
                  <span
                    className="px-3 py-0.5 rounded-full text-xs font-brawl border"
                    style={{
                      borderColor: inspectBrawler.accentColor,
                      color: inspectBrawler.accentColor,
                      backgroundColor: `${inspectBrawler.themeColor}40`,
                    }}
                  >
                    {inspectBrawler.rarity.toUpperCase()}
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-3 py-0.5 rounded-full text-xs font-brawl border border-slate-700">
                    {inspectBrawler.class.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 italic">{inspectBrawler.title}</p>
              </div>

              {/* Power Level & Upgrade Widget */}
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <div className="text-center px-3">
                  <div className="text-[10px] text-slate-400 font-brawl">POWER LEVEL</div>
                  <div className="text-2xl font-brawl text-amber-400 font-black">{currentLevel} / 11</div>
                </div>

                {currentLevel < 11 && (
                  <button
                    disabled={!canUpgrade}
                    onClick={() => {
                      if (canUpgrade) {
                        soundManager.playSuperReady();
                        onUpgradeBrawler(inspectBrawler.id, upgradeCost);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl font-brawl text-sm flex items-center gap-2 ${
                      canUpgrade
                        ? 'brawl-btn-yellow text-slate-950 font-black cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>UPGRADE</span>
                    <span>🪙 {upgradeCost}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sub-tabs: Stats / Abilities / Mastery */}
            <div className="flex border-b border-slate-800 gap-4 mb-4 text-xs font-brawl">
              <button
                onClick={() => setActiveTab('stats')}
                className={`pb-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'text-sky-400 border-b-2 border-sky-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 BASE STATS & LORE
              </button>
              <button
                onClick={() => setActiveTab('abilities')}
                className={`pb-2 transition-colors ${
                  activeTab === 'abilities'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚔️ ATTACK, SUPER, GADGETS & HYPERCHARGE
              </button>
              <button
                onClick={() => setActiveTab('mastery')}
                className={`pb-2 transition-colors ${
                  activeTab === 'mastery'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏆 MASTERY REWARDS
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* Lore Box */}
                <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800">
                  <h4 className="text-xs font-brawl text-slate-400 mb-1">ORIGIN LORE</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{inspectBrawler.lore}</p>
                </div>

                {/* Base Stat Bars */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <div className="flex justify-between text-xs font-brawl mb-1">
                      <span className="text-emerald-400">HEALTH</span>
                      <span className="text-white">
                        {Math.round(inspectBrawler.baseStats.health * (1 + (currentLevel - 1) * 0.1))}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(inspectBrawler.baseStats.health / 7000) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <div className="flex justify-between text-xs font-brawl mb-1">
                      <span className="text-rose-400">ATTACK DAMAGE</span>
                      <span className="text-white">
                        {Math.round(inspectBrawler.baseStats.damage * (1 + (currentLevel - 1) * 0.1))}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full"
                        style={{ width: `${(inspectBrawler.baseStats.damage / 2400) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <div className="flex justify-between text-xs font-brawl mb-1">
                      <span className="text-sky-400">MOVEMENT SPEED</span>
                      <span className="text-white">
                        {inspectBrawler.baseStats.speed > 8 ? 'Very Fast' : inspectBrawler.baseStats.speed > 7 ? 'Fast' : 'Normal'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full"
                        style={{ width: `${(inspectBrawler.baseStats.speed / 9) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <div className="flex justify-between text-xs font-brawl mb-1">
                      <span className="text-amber-400">RELOAD SPEED</span>
                      <span className="text-white">{inspectBrawler.baseStats.reloadSpeed}s</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(1 / inspectBrawler.baseStats.reloadSpeed) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'abilities' && (
              <div className="space-y-3">
                {/* Main Attack */}
                <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-brawl text-xs flex items-center justify-center">
                      ⚔️
                    </span>
                    <h4 className="font-brawl text-sm text-white">
                      MAIN ATTACK: {inspectBrawler.attack.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {inspectBrawler.attack.description}
                  </p>
                  <div className="flex gap-4 text-[11px] text-slate-400">
                    <span>Range: {inspectBrawler.attack.range} tiles</span>
                    <span>Reload: {inspectBrawler.attack.reloadTime}s</span>
                    <span>Base Damage: {inspectBrawler.attack.damage}</span>
                  </div>
                </div>

                {/* Super Ability */}
                <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-amber-600/60">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-brawl text-xs flex items-center justify-center font-black">
                      💀
                    </span>
                    <h4 className="font-brawl text-sm text-amber-400">
                      SUPER: {inspectBrawler.superAbility.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {inspectBrawler.superAbility.description}
                  </p>
                </div>

                {/* Star Powers */}
                <div className="grid grid-cols-2 gap-2">
                  {inspectBrawler.starPowers.map((sp, idx) => (
                    <div key={idx} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                      <div className="font-brawl text-xs text-purple-400 mb-0.5">
                        ⭐ STAR POWER: {sp.name}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">{sp.description}</p>
                    </div>
                  ))}
                </div>

                {/* Gadgets */}
                <div className="grid grid-cols-2 gap-2">
                  {inspectBrawler.gadgets.map((gad, idx) => (
                    <div key={idx} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                      <div className="font-brawl text-xs text-emerald-400 mb-0.5">
                        ⚡ GADGET: {gad.name}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">{gad.description}</p>
                    </div>
                  ))}
                </div>

                {/* Hypercharge */}
                <div className="bg-gradient-to-r from-purple-950/60 to-pink-950/60 rounded-2xl p-3.5 border-2 border-pink-500/60">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🔥</span>
                    <h4 className="font-brawl text-sm text-pink-400">
                      HYPERCHARGE: {inspectBrawler.hypercharge.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed mb-2">
                    {inspectBrawler.hypercharge.description}
                  </p>
                  <div className="flex gap-4 text-[11px] font-brawl text-pink-300">
                    <span>
                      Speed +
                      {Math.round((inspectBrawler.hypercharge.statBoosts.speed - 1) * 100)}%
                    </span>
                    <span>
                      Damage +
                      {Math.round((inspectBrawler.hypercharge.statBoosts.damage - 1) * 100)}%
                    </span>
                    <span>
                      Shield +
                      {Math.round(inspectBrawler.hypercharge.statBoosts.shield * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mastery' && (
              <div className="space-y-4">
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-brawl text-slate-400">CURRENT MASTERY RANK</span>
                    <div className="text-3xl font-brawl mt-1" style={{ color: masteryRank.color }}>
                      {masteryRank.title}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {currentMastery} / 2,000 Mastery Points accumulated in 3v3 battles
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xl">
                    🏆
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-brawl text-slate-400">MASTERY ROAD MILESTONES</h4>
                  {[
                    { pts: 200, reward: '1,000 Gold', icon: '🪙' },
                    { pts: 500, reward: '150 Credits', icon: '🎫' },
                    { pts: 1000, reward: 'Exclusive Player Pin', icon: '📌' },
                    { pts: 2000, reward: `Title: "${inspectBrawler.name} Master"`, icon: '👑' },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        currentMastery >= m.pts
                          ? 'bg-slate-800/80 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{m.icon}</span>
                        <span className="font-brawl">{m.reward}</span>
                      </div>
                      <span className="font-mono">{m.pts} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Select Action */}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onSelectBrawler(inspectBrawler);
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl brawl-btn-yellow font-brawl text-xl text-slate-950 font-black tracking-wider"
              >
                SELECT {inspectBrawler.name.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
