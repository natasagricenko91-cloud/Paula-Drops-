import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../audio/soundManager';

interface CompensationModal20Props {
  isOpen: boolean;
  onClose: () => void;
  legacyLevels: number;
  legacyTrophies: number;
  isAlreadyClaimed: boolean;
  onClaim: (rewards: {
    gold: number;
    gems: number;
    bling: number;
    paulaDrops: number;
  }) => void;
}

type DropRarity = 'Rare' | 'Super Rare' | 'Epic' | 'Mythic' | 'Legendary';

interface RewardCard {
  id: string;
  name: string;
  category: string;
  amount: string;
  icon: string;
  color: string;
  rarity: DropRarity;
  opened: boolean;
}

export const CompensationModal20: React.FC<CompensationModal20Props> = ({
  isOpen,
  onClose,
  legacyLevels,
  legacyTrophies,
  isAlreadyClaimed,
  onClaim,
}) => {
  const [activeStep, setActiveStep] = useState<'audit' | 'unboxing' | 'claimed'>(
    isAlreadyClaimed ? 'claimed' : 'audit'
  );

  // Dynamic compensation based on 1.0 levels
  const calculatedGold = Math.max(2500, legacyLevels * 220 + 1500);
  const calculatedGems = Math.max(120, Math.floor(legacyLevels * 12) + 80);
  const calculatedBling = Math.max(2000, legacyLevels * 150 + 1000);
  const paulaDropsCount = Math.max(6, Math.floor(legacyLevels / 2) + 4);

  const [rewardCards, setRewardCards] = useState<RewardCard[]>([
    {
      id: 'drop_leg',
      name: 'Legendary Paula Drop',
      category: 'Drop 2.0',
      amount: 'x2 Drops',
      icon: '🌟',
      color: 'from-amber-500 to-yellow-300',
      rarity: 'Legendary',
      opened: false,
    },
    {
      id: 'drop_mythic',
      name: 'Mythic Paula Drop',
      category: 'Drop 2.0',
      amount: `x${paulaDropsCount - 2}`,
      icon: '🔮',
      color: 'from-fuchsia-600 to-purple-400',
      rarity: 'Mythic',
      opened: false,
    },
    {
      id: 'megabox',
      name: 'Mega Box 2.0 Vintage',
      category: 'Progression',
      amount: 'x3 Boxes',
      icon: '🎁',
      color: 'from-rose-600 to-amber-500',
      rarity: 'Legendary',
      opened: false,
    },
    {
      id: 'gold_pack',
      name: 'Gold Compensation Pack',
      category: 'Power Points Converted',
      amount: `+${calculatedGold.toLocaleString()} Coins`,
      icon: '🪙',
      color: 'from-amber-600 to-yellow-500',
      rarity: 'Epic',
      opened: false,
    },
    {
      id: 'gems_pack',
      name: 'Gems Milestone Refund',
      category: '1.0 Pass Milestone',
      amount: `+${calculatedGems} Gems`,
      icon: '💎',
      color: 'from-emerald-600 to-teal-400',
      rarity: 'Mythic',
      opened: false,
    },
    {
      id: 'bling_pack',
      name: 'Bling Cosmetics Vault',
      category: 'Star Points Converted',
      amount: `+${calculatedBling.toLocaleString()} Bling`,
      icon: '✨',
      color: 'from-indigo-600 to-blue-400',
      rarity: 'Super Rare',
      opened: false,
    },
    {
      id: 'badge_legacy',
      name: 'Founding Veteran 1.0',
      category: 'Exclusive Title & Pin',
      amount: 'PERMANENT',
      icon: '🎖️',
      color: 'from-cyan-500 to-blue-600',
      rarity: 'Legendary',
      opened: false,
    },
  ]);

  const [currentUnboxingIndex, setCurrentUnboxingIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleStartUnboxing = () => {
    soundManager.playStarrDropRoll();
    setActiveStep('unboxing');
    setCurrentUnboxingIndex(0);
  };

  const handleOpenCard = (idx: number) => {
    const card = rewardCards[idx];
    if (card.opened) return;

    soundManager.playStarrDropRarity(
      card.rarity.toLowerCase().replace(' ', '_') as any
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#facc15', '#ec4899', '#a855f7'],
    });

    setRewardCards((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, opened: true } : c))
    );

    if (idx + 1 < rewardCards.length) {
      setCurrentUnboxingIndex(idx + 1);
    }
  };

  const handleClaimAll = () => {
    soundManager.playFanfare();
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#facc15', '#38bdf8', '#ec4899', '#22c55e', '#ffffff'],
    });

    setRewardCards((prev) => prev.map((c) => ({ ...c, opened: true })));
    setActiveStep('claimed');

    onClaim({
      gold: calculatedGold,
      gems: calculatedGems,
      bling: calculatedBling,
      paulaDrops: paulaDropsCount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-4 border-amber-400 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-between border-b-4 border-amber-700 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">⚡</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-brawl text-xl tracking-wider text-black font-black uppercase">
                  PAULA DROPS 2.0 UPDATE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 font-brawl text-[11px] uppercase tracking-wide">
                  LEGACY COMPENSATION
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900/80">
                Progression System Reset &amp; Level Conversion Window
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 font-brawl text-lg flex items-center justify-center transition-all border border-slate-950/30"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          
          {/* Status Alert Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-2 border-indigo-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-400/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                📦
              </div>
              <div>
                <h3 className="font-brawl text-sm text-amber-300 uppercase tracking-wide">
                  1.0 Account Progression Audit Complete
                </h3>
                <p className="text-xs text-slate-300">
                  Your 1.0 brawler power levels, mastery, and trophy brackets have been audited. All historical progression has been converted into high-tier 2.0 loot and currencies.
                </p>
              </div>
            </div>

            {/* Audited stats pill */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-indigo-400/40 shrink-0">
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">1.0 Levels</span>
                <span className="font-brawl text-amber-400 text-base">{legacyLevels}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">1.0 Trophies</span>
                <span className="font-brawl text-sky-400 text-base">{legacyTrophies}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="text-center px-2">
                <span className="block text-[10px] text-emerald-400 font-bold uppercase">Tier</span>
                <span className="font-brawl text-emerald-300 text-xs">VETERAN</span>
              </div>
            </div>
          </div>

          {/* Reward Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-brawl text-sm text-slate-200 tracking-wide uppercase flex items-center gap-2">
                <span>🎁</span> REWARD BUNDLE BREAKDOWN
              </h4>
              <span className="text-xs font-bold text-amber-400/90">
                {rewardCards.filter((c) => c.opened).length}/{rewardCards.length} Unboxed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {rewardCards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => handleOpenCard(idx)}
                  className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group select-none ${
                    card.opened
                      ? 'bg-slate-900/90 border-amber-400/60 shadow-lg'
                      : 'bg-slate-900/60 border-slate-700 hover:border-amber-400 hover:scale-[1.02]'
                  }`}
                >
                  {/* Glowing background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none`}
                  />

                  <div className="relative z-10 flex items-start justify-between">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      {card.icon}
                    </span>
                    <span
                      className={`text-[10px] font-brawl px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        card.rarity === 'Legendary'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          : card.rarity === 'Mythic'
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                      }`}
                    >
                      {card.rarity}
                    </span>
                  </div>

                  <div className="relative z-10 mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">
                      {card.category}
                    </span>
                    <span className="font-brawl text-sm text-white group-hover:text-amber-300 transition-colors block">
                      {card.name}
                    </span>
                    <span className="font-brawl text-base text-amber-400 mt-1 block font-bold">
                      {card.amount}
                    </span>
                  </div>

                  {/* Opened badge */}
                  <div className="relative z-10 mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    {card.opened ? (
                      <span className="text-emerald-400 font-brawl font-bold flex items-center gap-1">
                        ✓ CLAIMED
                      </span>
                    ) : (
                      <span className="text-amber-400 font-brawl group-hover:underline flex items-center gap-1">
                        TAP TO REVEAL ▸
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2.0 Evolution Summary Notice */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2">
            <h5 className="font-brawl text-xs text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🚀</span> WHAT CHANGED IN PAULA DROPS 2.0?
            </h5>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                <span><strong>Hypercharge 2.0:</strong> Overcharged Super projectiles with dynamic energy auras.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">🌟</span>
                <span><strong>In-Match Paula Drops:</strong> Drops spawn in combat from defeated foes and crates!</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">🛠️</span>
                <span><strong>Titan Debug Console:</strong> Authentic Supercell internal tool layout with 100+ mods.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">🛡️</span>
                <span><strong>Helpshift Support 2.0:</strong> Live ticket tracking and real-time conversational triage.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/90 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>🔒</span>
            <span>
              Claim status is permanently backed up to your Paula ID Cloud Save.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeStep !== 'claimed' ? (
              <button
                onClick={handleClaimAll}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-brawl text-sm font-black uppercase tracking-wider shadow-[0_4px_0_#92400e] active:translate-y-1 active:shadow-none hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>🎉</span> CLAIM ALL 2.0 REWARDS
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onClose();
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-brawl text-sm font-black uppercase tracking-wider shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-none hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <span>✓</span> READY TO PLAY 2.0
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
