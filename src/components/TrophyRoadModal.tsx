import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';

interface TrophyRoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrophies: number;
  onClaimReward: (rewardType: 'gold' | 'gems' | 'credits', amount: number) => void;
}

interface Milestone {
  trophies: number;
  title: string;
  icon: string;
  rewardType: 'gold' | 'gems' | 'credits';
  amount: number;
}

export const TrophyRoadModal: React.FC<TrophyRoadModalProps> = ({
  isOpen,
  onClose,
  currentTrophies,
  onClaimReward,
}) => {
  const [claimed, setClaimed] = useState<{ [trophies: number]: boolean }>({});

  if (!isOpen) return null;

  const milestones: Milestone[] = [
    { trophies: 50, title: 'Brawler Token Pack', icon: '🎫', rewardType: 'credits', amount: 100 },
    { trophies: 150, title: 'Starter Gold Stash', icon: '🪙', rewardType: 'gold', amount: 500 },
    { trophies: 300, title: 'Gem Pouch', icon: '💎', rewardType: 'gems', amount: 30 },
    { trophies: 500, title: 'Mega Box Credits', icon: '📦', rewardType: 'credits', amount: 250 },
    { trophies: 800, title: 'Deep-Sea Bounty', icon: '🪙', rewardType: 'gold', amount: 1200 },
    { trophies: 1200, title: 'Chrono Gem Cache', icon: '💎', rewardType: 'gems', amount: 80 },
    { trophies: 2000, title: 'Pro Brawler Chest', icon: '🏆', rewardType: 'gold', amount: 2500 },
    { trophies: 3500, title: 'Mastery Crown Vault', icon: '👑', rewardType: 'gems', amount: 150 },
    { trophies: 5000, title: 'Apex Arena Champion Stash', icon: '🌟', rewardType: 'gold', amount: 5000 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl h-[580px] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-body">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 border-b-2 border-slate-950 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="font-brawl text-2xl text-slate-950 tracking-wide brawl-stroke-white">
                TROPHY ROAD
              </h2>
              <p className="text-xs text-amber-950 font-bold">CLIMB THE ARENA TIERS FOR MASSIVE REWARDS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-1.5 rounded-full border border-amber-300/40 flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="font-brawl text-xl text-amber-400">{currentTrophies}</span>
            </div>

            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-white font-brawl text-xl flex items-center justify-center border border-white/20"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrolling Milestone Track */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
          <div className="relative pl-8 border-l-4 border-slate-800 space-y-6">
            {milestones.map((m, idx) => {
              const reached = currentTrophies >= m.trophies;
              const isClaimed = claimed[m.trophies];

              return (
                <div key={idx} className="relative flex items-center justify-between">
                  {/* Road Milestone Node */}
                  <div
                    className={`absolute -left-[42px] w-6 h-6 rounded-full border-4 flex items-center justify-center text-[10px] ${
                      reached
                        ? 'bg-amber-400 border-slate-900 text-slate-950'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`flex-1 ml-4 p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      reached
                        ? 'bg-slate-900 border-amber-400/80 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                        {m.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-brawl text-xs text-amber-400">
                            {m.trophies} TROPHIES
                          </span>
                          {reached && !isClaimed && (
                            <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.2 rounded font-black animate-pulse">
                              UNLOCKED!
                            </span>
                          )}
                        </div>
                        <h4 className="font-brawl text-base text-white">{m.title}</h4>
                        <p className="text-xs text-slate-400">
                          Reward: +{m.amount.toLocaleString()} {m.rewardType.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Claim Button */}
                    <div>
                      {isClaimed ? (
                        <div className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl font-brawl text-xs">
                          CLAIMED ✓
                        </div>
                      ) : reached ? (
                        <button
                          onClick={() => {
                            soundManager.playGemPickup();
                            setClaimed((prev) => ({ ...prev, [m.trophies]: true }));
                            onClaimReward(m.rewardType, m.amount);
                          }}
                          className="px-5 py-2.5 rounded-xl brawl-btn-yellow text-slate-950 font-brawl text-sm font-black shadow-md cursor-pointer"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-500 rounded-xl font-brawl text-xs">
                          LOCKED
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
