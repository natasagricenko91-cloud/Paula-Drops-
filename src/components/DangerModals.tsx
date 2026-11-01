import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';

interface DisconnectModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const DisconnectModal: React.FC<DisconnectModalProps> = ({ isOpen, onDismiss }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border-4 border-slate-700 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-3xl mb-3">
          📡
        </div>
        <h3 className="font-brawl text-2xl text-white mb-2 brawl-stroke-sm">CONNECTION LOST</h3>
        <p className="text-slate-300 text-sm mb-6">
          The connection to the match server was interrupted (Error code: 42-SYNC_TIMEOUT). Please verify your Wi-Fi or cellular network.
        </p>

        <button
          onClick={() => {
            soundManager.playUiClick();
            onDismiss();
          }}
          className="w-full py-3.5 rounded-2xl brawl-btn-yellow font-brawl text-xl text-slate-950 font-black"
        >
          RETRY
        </button>
      </div>
    </div>
  );
};

interface AccountDeletionModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  isOpen,
  onDismiss,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border-4 border-rose-600 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-3xl mb-3 text-rose-500">
          ⚠️
        </div>
        <h3 className="font-brawl text-2xl text-rose-500 mb-2 brawl-stroke-sm">
          PERMANENT ACCOUNT DELETION
        </h3>
        <p className="text-slate-300 text-xs mb-4">
          This action will permanently purge your Paula ID credentials, all unlocked Brawlers, Trophy Road milestones, and in-game currency. This action cannot be reversed.
        </p>

        <div className="w-full bg-slate-950 rounded-xl p-3 border border-slate-800 text-left mb-4">
          <label className="text-[11px] text-slate-400 font-brawl block mb-1">
            Type <span className="text-rose-400 font-mono">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-center tracking-widest focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onDismiss();
            }}
            className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-brawl text-base border border-slate-700"
          >
            CANCEL
          </button>
          <button
            disabled={confirmText !== 'DELETE'}
            onClick={() => {
              soundManager.playUiClick();
              onConfirm();
            }}
            className={`py-3 rounded-xl font-brawl text-base ${
              confirmText === 'DELETE'
                ? 'brawl-btn-red text-white cursor-pointer'
                : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
            }`}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};
