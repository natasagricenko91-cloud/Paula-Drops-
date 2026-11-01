import React from 'react';
import { soundManager } from '../audio/soundManager';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gems: number;
  gold: number;
  onSpendGems: (amount: number) => boolean;
  onSpendGold: (amount: number) => boolean;
  onAddGems: (amount: number) => void;
  onAddGold: (amount: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  gems,
  gold,
  onSpendGems,
  onAddGold,
}) => {
  if (!isOpen) return null;

  const deals = [
    {
      id: 'daily_free',
      title: 'Daily Freebie',
      desc: 'Claim daily arena rations',
      icon: '🪙',
      reward: '+200 Gold',
      cost: 'FREE',
      type: 'free',
    },
    {
      id: 'mega_box',
      title: 'Mega Box Special',
      desc: 'Guaranteed Power Points & Credits',
      icon: '📦',
      reward: '10x Loot Rolls',
      cost: '80 GEMS',
      gemsCost: 80,
      type: 'box',
    },
    {
      id: 'hypercharge_drop',
      title: 'Hypercharge Drop',
      desc: 'Instant Hypercharge unlock for Vexa',
      icon: '🔥',
      reward: 'Quantum Cataclysm',
      cost: '99 GEMS',
      gemsCost: 99,
      type: 'hyper',
    },
    {
      id: 'gold_pouch',
      title: 'Mountain of Gold',
      desc: 'Massive stash for Brawler upgrades',
      icon: '💰',
      reward: '+5,000 Gold',
      cost: '50 GEMS',
      gemsCost: 50,
      type: 'gold',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl h-[580px] bg-slate-900 border-4 border-emerald-600 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-body">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 border-b-2 border-slate-950 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛍️</span>
            <div>
              <h2 className="font-brawl text-2xl text-emerald-200 tracking-wide brawl-stroke-sm">
                ARENA SHOP
              </h2>
              <p className="text-xs text-emerald-300">DAILY DEALS, MEGA BOXES & BRAWLER SKINS</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800 text-sm">
              <span className="text-amber-400">🪙 {gold.toLocaleString()}</span>
              <span className="text-emerald-400">💎 {gems.toLocaleString()}</span>
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

        {/* Deals Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 grid grid-cols-2 gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-slate-900 rounded-3xl border-2 border-slate-800 p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-inner">
                  {deal.icon}
                </div>
                <div>
                  <h3 className="font-brawl text-lg text-white">{deal.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{deal.desc}</p>
                  <div className="mt-2 inline-block px-2.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-brawl text-xs">
                    {deal.reward}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (deal.type === 'free') {
                      soundManager.playGemPickup();
                      onAddGold(200);
                    } else if (deal.gemsCost) {
                      if (onSpendGems(deal.gemsCost)) {
                        soundManager.playSuperReady();
                        if (deal.type === 'gold') onAddGold(5000);
                        else onAddGold(1500);
                      }
                    }
                  }}
                  className={`w-full py-3 rounded-2xl font-brawl text-base tracking-wider ${
                    deal.type === 'free'
                      ? 'brawl-btn-green text-white font-black'
                      : 'brawl-btn-yellow text-slate-950 font-black'
                  }`}
                >
                  {deal.cost}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
