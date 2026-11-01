/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../audio/soundManager';
import { EsportsMatchPrediction, EsportsNewsArticle } from '../types/ranked';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardBling?: (amount: number) => void;
}

const INITIAL_ARTICLES: EsportsNewsArticle[] = [
  {
    id: 'wf_2026',
    title: '🏆 PAULA DROPS WORLD FINALS 2026 ANNOUNCED!',
    category: 'ESPORTS',
    date: 'OCT 31, 2026',
    readTime: '3 min read',
    imageTag: 'WORLD FINALS',
    summary: 'The top 16 pro squads collide in Helsinki for the $1,000,000 championship trophy, exclusive Legendary Starr Drops, and the official World Champion in-game title!',
    content: [
      'The Paula Drops Esports Championship reaches its pinnacle! 16 qualified organizations from EMEA, North America, and APAC will compete in a double-elimination 3v3 bracket.',
      'Spectators in-game can participate in live Pick\'ems predictions to earn exclusive World Championship pins and guaranteed Ranked Starr Drops!',
      'Grand Finals will feature the official live Gemini AI Esports Shoutcaster desk delivering instant statistical debriefs and clutch moment breakdowns.',
    ],
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    featured: true,
  },
  {
    id: 'patch_54_200',
    title: '⚡ ESPORTS BALANCE PATCH NOTES (v54.200)',
    category: 'BALANCE',
    date: 'OCT 31, 2026',
    readTime: '4 min read',
    imageTag: 'PATCH 54.200',
    summary: 'Comprehensive esports balance tune-up: Vexa dagger speed tweaked, Gulliver anchor stun duration normalized, and Nyx healing spore dispersion improved.',
    content: [
      '• Vexa: Main attack projectile travel speed increased by +6% to reward precise lane pressure. Hypercharge stat boost speed bonus increased from +20% to +25%.',
      '• Gulliver: Super ability "Abyssal Anchor" shockwave radius standardized to 4.2 tiles with 1.3s stun. Reload speed reduced by 0.1s.',
      '• Nyx: Toxic spore healing totem pulse rate boosted from 1.0s to 0.8s. Spore cloud now reveals enemies hidden in bushes for 1.5 seconds upon tick.',
    ],
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
  },
  {
    id: 'ranked_s1',
    title: '🔥 RANKED MODE 2.0: MODIFIERS UNLEASHED',
    category: 'UPDATE',
    date: 'OCT 30, 2026',
    readTime: '2 min read',
    imageTag: 'RANKED S1',
    summary: 'Climb from Bronze to Masters in the redesigned competitive league featuring Quick Fire, Hypercharge Surge, and Big Friend modifiers!',
    content: [
      'Say goodbye to standard Power League! Ranked Mode 2.0 brings dynamic rotating modifiers to every match, rewarding adaptability and tactical versatility.',
      'Rank Protection Shields guarantee that losing a close match will never drop you below a newly achieved tier floor.',
      'Earn exclusive Ranked Starr Drops containing seasonal pro skins, hologram battle cards, and Bling with every tier advance.',
    ],
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  },
];

const INITIAL_PREDICTIONS: EsportsMatchPrediction[] = [
  {
    id: 'match_1',
    tournament: 'World Finals 2026 · Quarterfinals',
    round: 'Match 1 of 4',
    teamA: { name: 'Zeta Division', tag: '[ZETA]', logo: '⚡', odds: 1.45 },
    teamB: { name: 'Tribe Gaming', tag: '[TRIBE]', logo: '🏹', odds: 2.1 },
    scheduledTime: 'TODAY · 18:00 UTC',
    status: 'upcoming',
    reward: { bling: 250, drops: 1 },
  },
  {
    id: 'match_2',
    tournament: 'World Finals 2026 · Quarterfinals',
    round: 'Match 2 of 4',
    teamA: { name: 'SK Gaming', tag: '[SK]', logo: '🛡️', odds: 1.75 },
    teamB: { name: 'STMN Esports', tag: '[STMN]', logo: '🌪️', odds: 1.95 },
    scheduledTime: 'TODAY · 20:30 UTC',
    status: 'upcoming',
    reward: { bling: 250, drops: 1 },
  },
  {
    id: 'match_3',
    tournament: 'World Finals 2026 · Semifinals',
    round: 'Match 3 of 4',
    teamA: { name: 'Paula Esports', tag: '[PAULA]', logo: '👑', odds: 1.6 },
    teamB: { name: 'Crazy Raccoon', tag: '[CR]', logo: '🦝', odds: 2.05 },
    scheduledTime: 'TOMORROW · 16:00 UTC',
    status: 'upcoming',
    reward: { bling: 500, drops: 2 },
  },
];

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose, onRewardBling }) => {
  const [activeTab, setActiveTab] = useState<'esports' | 'news' | 'predictions' | 'polls'>('esports');
  const [predictions, setPredictions] = useState<EsportsMatchPrediction[]>(INITIAL_PREDICTIONS);
  const [selectedArticle, setSelectedArticle] = useState<EsportsNewsArticle | null>(INITIAL_ARTICLES[0]);

  // Community Poll state
  const [pollVoted, setPollVoted] = useState<string | null>(null);
  const [pollVotes, setPollVotes] = useState<{ [id: string]: number }>({
    crystal: 1420,
    mine: 980,
    swoosh: 1850,
  });

  if (!isOpen) return null;

  const handleCastVote = (predictionId: string, pick: 'teamA' | 'teamB') => {
    soundManager.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#38bdf8', '#c084fc'],
    });

    setPredictions((prev) =>
      prev.map((m) => (m.id === predictionId ? { ...m, userPick: pick } : m))
    );
    onRewardBling?.(150);
  };

  const handleVotePoll = (optionId: string) => {
    if (pollVoted) return;
    soundManager.playUiClick();
    setPollVoted(optionId);
    setPollVotes((prev) => ({
      ...prev,
      [optionId]: prev[optionId] + 1,
    }));
    onRewardBling?.(100);
  };

  const totalPollVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 font-body">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-950 border-4 border-amber-500 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.4)] overflow-hidden text-white">

        {/* HEADER BAR */}
        <div className="p-4 px-6 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-b-2 border-amber-500/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-inner">
              📰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-brawl text-2xl text-white tracking-wide">
                  PAULA NEWS &amp; ESPORTS
                </h2>
                <span className="text-[10px] font-brawl bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                  ● LIVE BROADCAST
                </span>
              </div>
              <p className="text-xs text-amber-200">
                Official World Finals 2026, Pro Bracket, Patch Notes &amp; Community Pick'ems
              </p>
            </div>
          </div>

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

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-6 pt-2 gap-2 text-xs font-brawl">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('esports');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'esports'
                ? 'bg-slate-900 text-amber-300 border-t-2 border-x-2 border-amber-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏆</span> ESPORTS &amp; BRACKET
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('predictions');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'predictions'
                ? 'bg-slate-900 text-purple-300 border-t-2 border-x-2 border-purple-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎯</span> PRO PICK'EMS &amp; REWARDS
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('news');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'news'
                ? 'bg-slate-900 text-sky-300 border-t-2 border-x-2 border-sky-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📜</span> BRAWL NEWS &amp; PATCH NOTES
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('polls');
            }}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'polls'
                ? 'bg-slate-900 text-emerald-300 border-t-2 border-x-2 border-emerald-400 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🗳️</span> COMMUNITY POLLS
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">

          {/* TAB 1: ESPORTS & BRACKET */}
          {activeTab === 'esports' && (
            <div className="space-y-6">
              
              {/* World Championship Header Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 rounded-3xl border-3 border-amber-500/70 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
                <div>
                  <span className="text-[10px] font-brawl bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-400/50 uppercase">
                    🏆 OFFICIAL ESPORTS TOURNAMENT
                  </span>
                  <h3 className="font-brawl text-2xl text-white mt-2">
                    PAULA DROPS WORLD FINALS 2026
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                    The top competitive 3v3 teams battle for glory in the Paula Arena. Total prize purse: <strong>$1,000,000 USD</strong>.
                  </p>
                </div>
                <div className="p-3 bg-slate-950/90 rounded-2xl border border-amber-500/40 text-center min-w-[160px]">
                  <div className="text-[10px] font-brawl text-slate-400">PRIZE POOL</div>
                  <div className="font-brawl text-2xl text-amber-400 font-black">$1,000,000</div>
                  <div className="text-[10px] text-emerald-400 font-mono">16 Pro Squads</div>
                </div>
              </div>

              {/* Tournament Bracket Visualization */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-brawl text-sm text-amber-300 uppercase tracking-wider">
                    CHAMPIONSHIP BRACKET (PLAYOFFS)
                  </h4>
                  <span className="text-xs font-mono text-slate-400">BEST OF 5 SETS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Round 1: Quarterfinals */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-brawl text-slate-400 text-center pb-1 border-b border-slate-800">
                      QUARTERFINALS
                    </div>
                    
                    <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-brawl">
                        <span className="text-white flex items-center gap-1.5">
                          <span>⚡</span> Zeta Division
                        </span>
                        <span className="text-amber-400 font-bold">3</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-brawl">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <span>🏹</span> Tribe Gaming
                        </span>
                        <span className="text-slate-500">1</span>
                      </div>
                      <div className="text-[9px] text-emerald-400 font-mono text-right">FINISHED</div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-brawl">
                        <span className="text-white flex items-center gap-1.5">
                          <span>🛡️</span> SK Gaming
                        </span>
                        <span className="text-amber-400 font-bold">2</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-brawl">
                        <span className="text-white flex items-center gap-1.5">
                          <span>🌪️</span> STMN Esports
                        </span>
                        <span className="text-amber-400 font-bold">2</span>
                      </div>
                      <div className="text-[9px] text-rose-400 font-mono text-right animate-pulse">● LIVE SET 5</div>
                    </div>
                  </div>

                  {/* Round 2: Semifinals */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-brawl text-purple-400 text-center pb-1 border-b border-slate-800">
                      SEMIFINALS
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-purple-500/40 space-y-2 mt-4">
                      <div className="flex items-center justify-between text-xs font-brawl">
                        <span className="text-white flex items-center gap-1.5">
                          <span>⚡</span> Zeta Division
                        </span>
                        <span className="text-slate-400">-</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-brawl">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <span>👑</span> Winner QF 2
                        </span>
                        <span className="text-slate-400">-</span>
                      </div>
                      <div className="text-[9px] text-purple-300 font-mono text-right">UPCOMING · 21:00 UTC</div>
                    </div>
                  </div>

                  {/* Round 3: Grand Finals */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-brawl text-amber-400 text-center pb-1 border-b border-slate-800">
                      GRAND FINALS 🏆
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-950/70 to-slate-950 rounded-2xl border-2 border-amber-400/80 space-y-3 mt-4 text-center">
                      <div className="text-3xl">🏆</div>
                      <div className="font-brawl text-sm text-amber-300">WORLD CHAMPION MATCH</div>
                      <div className="text-[11px] text-slate-300 font-mono">Grand Finals Trophy &amp; $500,000 1st Prize</div>
                      <div className="text-[10px] text-amber-400 font-mono bg-black/40 py-1 rounded">
                        SUNDAY · 19:00 UTC
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRO PICK'EMS & PREDICTIONS */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-brawl text-base">
                  <span>🎯</span> ESPORTS PICK'EMS &amp; PREDICTIONS
                </div>
                <p className="text-xs text-slate-300">
                  Predict match winners to earn free Bling and Guaranteed Ranked Starr Drops! Cast your votes before match start.
                </p>
              </div>

              <div className="space-y-3">
                {predictions.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-brawl text-amber-300">{match.tournament}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{match.scheduledTime}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleCastVote(match.id, 'teamA')}
                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          match.userPick === 'teamA'
                            ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-lg'
                            : 'bg-slate-950 border-slate-800 text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-brawl text-sm">
                          <span className="text-xl">{match.teamA.logo}</span>
                          <span>{match.teamA.name}</span>
                          <span className="text-[10px] font-mono text-purple-400">{match.teamA.tag}</span>
                        </div>
                        <div className="text-xs font-mono text-amber-400">
                          {match.userPick === 'teamA' ? '✓ PICKED' : `${match.teamA.odds}x`}
                        </div>
                      </button>

                      <button
                        onClick={() => handleCastVote(match.id, 'teamB')}
                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          match.userPick === 'teamB'
                            ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-lg'
                            : 'bg-slate-950 border-slate-800 text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-brawl text-sm">
                          <span className="text-xl">{match.teamB.logo}</span>
                          <span>{match.teamB.name}</span>
                          <span className="text-[10px] font-mono text-purple-400">{match.teamB.tag}</span>
                        </div>
                        <div className="text-xs font-mono text-amber-400">
                          {match.userPick === 'teamB' ? '✓ PICKED' : `${match.teamB.odds}x`}
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Reward for correct pick:</span>
                      <span className="font-brawl text-amber-300">
                        🪙 +{match.reward.bling} Bling &amp; 🎁 {match.reward.drops} Ranked Drop
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BRAWL NEWS & PATCH NOTES */}
          {activeTab === 'news' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Article List */}
              <div className="space-y-3">
                <h4 className="font-brawl text-xs text-slate-400 uppercase tracking-wider">
                  ALL ARTICLES &amp; PATCH NOTES
                </h4>
                {INITIAL_ARTICLES.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => {
                      soundManager.playUiClick();
                      setSelectedArticle(article);
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedArticle?.id === article.id
                        ? 'bg-slate-900 border-sky-400 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-brawl px-2 py-0.5 rounded-full border ${article.badgeColor}`}>
                        {article.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{article.date}</span>
                    </div>
                    <div className="font-brawl text-sm text-white line-clamp-2">{article.title}</div>
                  </div>
                ))}
              </div>

              {/* Right Column: Full Reader View */}
              {selectedArticle && (
                <div className="md:col-span-2 p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-brawl px-2.5 py-1 rounded-full border ${selectedArticle.badgeColor}`}>
                      {selectedArticle.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedArticle.date}</span>
                    <span className="text-xs text-slate-400">• {selectedArticle.readTime}</span>
                  </div>

                  <h3 className="font-brawl text-xl text-white">{selectedArticle.title}</h3>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed border-l-2 border-sky-400 pl-3">
                    {selectedArticle.summary}
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-slate-300 leading-relaxed">
                    {selectedArticle.content.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: COMMUNITY POLLS */}
          {activeTab === 'polls' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-brawl text-base">
                  <span>🗳️</span> DEVELOPER COMMUNITY POLL
                </div>
                <p className="text-xs text-slate-300">
                  Your voice shapes Paula Drops! Vote in active community polls to decide upcoming map rotations and feature priority. Every vote earns 100 Bling!
                </p>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <h4 className="font-brawl text-base text-white">
                    Which map should be added to the official Ranked Season 2 rotation?
                  </h4>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Total Community Votes: {totalPollVotes.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'crystal', title: 'Crystal Cavern (Classic Chokepoints)', votes: pollVotes.crystal },
                    { id: 'mine', title: 'Hard Rock Mine (Open Flank Bush)', votes: pollVotes.mine },
                    { id: 'swoosh', title: 'Double Swoosh (Stealth Bush Warfare)', votes: pollVotes.swoosh },
                  ].map((option) => {
                    const percent = Math.round((option.votes / totalPollVotes) * 100);
                    const isSelected = pollVoted === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleVotePoll(option.id)}
                        disabled={!!pollVoted}
                        className={`w-full p-4 rounded-2xl border-2 text-left relative overflow-hidden transition-all ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Vote bar fill */}
                        <div
                          className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="font-brawl text-sm text-white">{option.title}</span>
                          <span className="font-brawl text-sm text-emerald-300 font-bold">
                            {percent}% ({option.votes.toLocaleString()})
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {pollVoted && (
                  <div className="text-xs font-brawl text-emerald-400 text-center">
                    ✓ Thanks for voting! +100 Bling deposited to your Paula ID.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-brawl">
          <span>Paula Drops Esports Hub · Helsinki Championship Broadcast</span>
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
