import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';

interface BrawlPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  gems: number;
  onSpendGems: (amount: number) => boolean;
  onAddGold: (amount: number) => void;
  onAddGems: (amount: number) => void;
}

export const BrawlPassModal: React.FC<BrawlPassModalProps> = ({
  isOpen,
  onClose,
  gems,
  onSpendGems,
  onAddGold,
  onAddGems,
}) => {
  const [hasPlus, setHasPlus] = useState(false);
  const [currentTier, setCurrentTier] = useState(6);
  const [claimedTiers, setClaimedTiers] = useState<{ [tier: number]: boolean }>({ 1: true, 2: true });

  if (!isOpen) return null;

  const tiers = [
    { tier: 1, free: '300 Gold', plus: 'Mega Box (10x)', iconFree: '🪙', iconPlus: '📦' },
    { tier: 2, free: '20 Gems', plus: 'Exclusive Vexa Pin', iconFree: '💎', iconPlus: '📌' },
    { tier: 3, free: '500 Gold', plus: '1,500 Gold', iconFree: '🪙', iconPlus: '🪙' },
    { tier: 4, free: '100 Credits', plus: 'Hypercharge Drop', iconFree: '🎫', iconPlus: '🔥' },
    { tier: 5, free: '50 Gems', plus: 'Gulliver Steampunk Skin', iconFree: '💎', iconPlus: '🤿' },
    { tier: 6, free: '800 Gold', plus: '2,500 Gold + 100 Gems', iconFree: '🪙', iconPlus: '💎' },
    { tier: 7, free: 'Mega Box', plus: 'Nyx Bioluminescent Halo', iconFree: '📦', iconPlus: '👑' },
  ];

  const handleActivatePlus = () => {
    if (hasPlus) return;
    if (onSpendGems(169)) {
      soundManager.playSuperReady();
      setHasPlus(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl h-[620px] bg-slate-900 border-4 border-purple-600 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-body">
        {/* Banner */}
        <div className="p-4 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-950 border-b-2 border-slate-950 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎫</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-brawl text-2xl text-purple-200 tracking-wide brawl-stroke-sm">
                  SEASON 1: APEX CHRONICLES
                </h2>
                {hasPlus && (
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded-full border border-amber-200">
                    BRAWL PASS PLUS ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300">TIER {currentTier} / 7 COMPLETED · 18 DAYS REMAINING</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!hasPlus && (
              <button
                onClick={handleActivatePlus}
                className="px-4 py-2 rounded-xl brawl-btn-yellow font-brawl text-xs text-slate-950 font-black flex items-center gap-1.5 shadow-lg"
              >
                <span>ACTIVATE PLUS</span>
                <span className="text-sm">💎 169</span>
              </button>
            )}

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

        {/* Tier Ladder Container */}
        <div className="flex-1 overflow-x-auto p-6 bg-slate-950 flex items-center gap-4">
          {tiers.map((t) => {
            const unlocked = t.tier <= currentTier;
            const isClaimed = claimedTiers[t.tier];

            return (
              <div
                key={t.tier}
                className="w-56 shrink-0 bg-slate-900 rounded-3xl border-2 border-slate-800 flex flex-col p-4 shadow-xl"
              >
                {/* Tier Number Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
                  <span className="font-brawl text-sm text-slate-400">TIER {t.tier}</span>
                  {unlocked ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-brawl">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-brawl">
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Free Track Reward */}
                <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 mb-3 text-center">
                  <span className="text-[10px] font-brawl text-slate-400 block mb-1">FREE PASS</span>
                  <div className="text-2xl mb-1">{t.iconFree}</div>
                  <div className="font-brawl text-xs text-white truncate">{t.free}</div>
                </div>

                {/* Brawl Pass Plus Track Reward */}
                <div
                  className={`rounded-2xl p-3 border text-center mb-3 transition-colors ${
                    hasPlus
                      ? 'bg-purple-950/60 border-purple-500/80'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-brawl text-amber-400 block mb-1">PLUS TRACK</span>
                  <div className="text-2xl mb-1">{t.iconPlus}</div>
                  <div className="font-brawl text-xs text-amber-200 truncate">{t.plus}</div>
                </div>

                {/* Claim CTA */}
                <div className="mt-auto pt-2">
                  {isClaimed ? (
                    <div className="w-full py-2 bg-slate-800 text-slate-500 text-center rounded-xl font-brawl text-xs">
                      CLAIMED ✓
                    </div>
                  ) : unlocked ? (
                    <button
                      onClick={() => {
                        soundManager.playGemPickup();
                        setClaimedTiers((prev) => ({ ...prev, [t.tier]: true }));
                        onAddGold(600);
                        if (hasPlus) onAddGems(30);
                      }}
                      className="w-full py-2.5 rounded-xl brawl-btn-yellow font-brawl text-xs text-slate-950 font-black cursor-pointer shadow-md"
                    >
                      CLAIM REWARDS
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-800/40 border border-slate-800 text-slate-600 text-center rounded-xl font-brawl text-xs">
                      TIER LOCKED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
