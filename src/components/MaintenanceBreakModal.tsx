import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/soundManager';

interface MaintenanceBreakModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const MaintenanceBreakModal: React.FC<MaintenanceBreakModalProps> = ({
  isOpen,
  onDismiss,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkStatus, setCheckStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsRemaining(45);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReload = () => {
    soundManager.playUiClick();
    setIsChecking(true);
    setCheckStatus('Pinging matchmaker gateway (eu-west-1)...');

    setTimeout(() => {
      setCheckStatus('Synchronizing game assets...');
      setTimeout(() => {
        setIsChecking(false);
        setCheckStatus(null);
        onDismiss();
      }, 900);
    }, 800);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Yellow-and-Black Hazard Striped Header */}
        <div className="hazard-stripes py-3 px-6 border-b-4 border-slate-950 flex items-center justify-center shadow-md">
          <div className="bg-slate-950 px-6 py-1.5 rounded-lg border-2 border-amber-400">
            <span className="font-brawl text-2xl text-amber-400 tracking-wider brawl-stroke">
              MAINTENANCE BREAK
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner animate-pulse">
            🚧
          </div>

          <div>
            <h3 className="font-brawl text-2xl text-white brawl-stroke-sm">
              SERVERS CURRENTLY UNDERGOING UPGRADE
            </h3>
            <p className="text-slate-300 text-sm mt-1">
              Paula Drops servers are temporarily offline while our engineering team applies the
              latest balance patch and improves netcode matchmaking.
            </p>
          </div>

          {/* Live Countdown Timer */}
          <div className="w-full bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col items-center">
            <span className="text-xs font-brawl text-slate-400 tracking-wider">
              ESTIMATED TIME REMAINING
            </span>
            <span className="font-brawl text-4xl text-amber-400 mt-1 tracking-widest font-mono">
              {timeFormatted}
            </span>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-1000"
                style={{ width: `${((45 - secondsRemaining) / 45) * 100}%` }}
              />
            </div>
          </div>

          {/* Patch Notes Preview */}
          <div className="w-full bg-slate-800/60 rounded-xl p-3 border border-slate-700 text-left text-xs space-y-1.5">
            <div className="font-brawl text-sky-400 text-xs">WHAT'S NEW IN UPDATE v54.102:</div>
            <div className="text-slate-300">• Vexa: Paradox Warp return speed increased by 15%</div>
            <div className="text-slate-300">• Gulliver: Depth Charge cluster spread tightened by 10%</div>
            <div className="text-slate-300">• Nyx: Luminescent Canopy heal tick normalized to 500 HP/sec</div>
            <div className="text-slate-300">• Netcode: Latency prediction and client anti-lag smoothing</div>
          </div>

          {checkStatus && (
            <div className="text-xs font-mono text-amber-300 animate-pulse">
              {checkStatus}
            </div>
          )}

          {/* Reload Connection Button */}
          <button
            onClick={handleReload}
            disabled={isChecking}
            className="w-full py-4 rounded-2xl brawl-btn-yellow font-brawl text-2xl text-slate-950 font-black tracking-wider flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <span className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                CHECKING SERVER...
              </>
            ) : (
              'RELOAD CONNECTION'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
