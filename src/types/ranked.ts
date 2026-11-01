/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RankedTierName =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Diamond'
  | 'Mythic'
  | 'Legendary'
  | 'Masters';

export type RankedSubTier = 'I' | 'II' | 'III';

export interface RankedTier {
  name: RankedTierName;
  subTier: RankedSubTier;
  minElo: number;
  maxElo: number;
  color: string;
  badgeBg: string;
  borderColor: string;
  icon: string;
}

export type RankedModifierType =
  | 'classic'
  | 'quick_fire'
  | 'hypercharge_surge'
  | 'big_friend'
  | 'timed_detonation';

export interface RankedModifierInfo {
  type: RankedModifierType;
  name: string;
  icon: string;
  description: string;
  tagColor: string;
  badgeColor: string;
}

export interface RankedPlayerProfile {
  elo: number;
  tier: RankedTierName;
  subTier: RankedSubTier;
  peakElo: number;
  wins: number;
  losses: number;
  currentWinStreak: number;
  rankedStarrDropsClaimed: number;
  rankedProtectionActive: boolean;
  activeModifier: RankedModifierType;
  selectedBrawlerBan?: string;
}

export interface EsportsMatchPrediction {
  id: string;
  tournament: string;
  round: string;
  teamA: { name: string; tag: string; logo: string; odds: number };
  teamB: { name: string; tag: string; logo: string; odds: number };
  scheduledTime: string;
  status: 'upcoming' | 'live' | 'finished';
  userPick?: 'teamA' | 'teamB';
  winner?: 'teamA' | 'teamB';
  reward: { bling: number; drops: number };
}

export interface EsportsNewsArticle {
  id: string;
  title: string;
  category: 'ESPORTS' | 'UPDATE' | 'BALANCE' | 'COMMUNITY';
  date: string;
  readTime: string;
  imageTag: string;
  summary: string;
  content: string[];
  badgeColor: string;
  featured?: boolean;
}

export const RANKED_TIERS: RankedTier[] = [
  { name: 'Bronze', subTier: 'I', minElo: 0, maxElo: 499, color: 'text-amber-700', badgeBg: 'bg-amber-900/60', borderColor: 'border-amber-700', icon: '🥉' },
  { name: 'Bronze', subTier: 'II', minElo: 500, maxElo: 999, color: 'text-amber-700', badgeBg: 'bg-amber-900/60', borderColor: 'border-amber-700', icon: '🥉' },
  { name: 'Bronze', subTier: 'III', minElo: 1000, maxElo: 1499, color: 'text-amber-700', badgeBg: 'bg-amber-900/60', borderColor: 'border-amber-700', icon: '🥉' },
  { name: 'Silver', subTier: 'I', minElo: 1500, maxElo: 1999, color: 'text-slate-300', badgeBg: 'bg-slate-700/60', borderColor: 'border-slate-400', icon: '🥈' },
  { name: 'Silver', subTier: 'II', minElo: 2000, maxElo: 2499, color: 'text-slate-300', badgeBg: 'bg-slate-700/60', borderColor: 'border-slate-400', icon: '🥈' },
  { name: 'Silver', subTier: 'III', minElo: 2500, maxElo: 2999, color: 'text-slate-300', badgeBg: 'bg-slate-700/60', borderColor: 'border-slate-400', icon: '🥈' },
  { name: 'Gold', subTier: 'I', minElo: 3000, maxElo: 3499, color: 'text-yellow-400', badgeBg: 'bg-yellow-900/60', borderColor: 'border-yellow-400', icon: '🥇' },
  { name: 'Gold', subTier: 'II', minElo: 3500, maxElo: 3999, color: 'text-yellow-400', badgeBg: 'bg-yellow-900/60', borderColor: 'border-yellow-400', icon: '🥇' },
  { name: 'Gold', subTier: 'III', minElo: 4000, maxElo: 4499, color: 'text-yellow-400', badgeBg: 'bg-yellow-900/60', borderColor: 'border-yellow-400', icon: '🥇' },
  { name: 'Diamond', subTier: 'I', minElo: 4500, maxElo: 4999, color: 'text-cyan-400', badgeBg: 'bg-cyan-950/70', borderColor: 'border-cyan-400', icon: '💎' },
  { name: 'Diamond', subTier: 'II', minElo: 5000, maxElo: 5499, color: 'text-cyan-400', badgeBg: 'bg-cyan-950/70', borderColor: 'border-cyan-400', icon: '💎' },
  { name: 'Diamond', subTier: 'III', minElo: 5500, maxElo: 5999, color: 'text-cyan-400', badgeBg: 'bg-cyan-950/70', borderColor: 'border-cyan-400', icon: '💎' },
  { name: 'Mythic', subTier: 'I', minElo: 6000, maxElo: 6499, color: 'text-rose-400', badgeBg: 'bg-rose-950/70', borderColor: 'border-rose-400', icon: '🔮' },
  { name: 'Mythic', subTier: 'II', minElo: 6500, maxElo: 6999, color: 'text-rose-400', badgeBg: 'bg-rose-950/70', borderColor: 'border-rose-400', icon: '🔮' },
  { name: 'Mythic', subTier: 'III', minElo: 7000, maxElo: 7499, color: 'text-rose-400', badgeBg: 'bg-rose-950/70', borderColor: 'border-rose-400', icon: '🔮' },
  { name: 'Legendary', subTier: 'I', minElo: 7500, maxElo: 7999, color: 'text-amber-400', badgeBg: 'bg-amber-950/80', borderColor: 'border-amber-400', icon: '👑' },
  { name: 'Legendary', subTier: 'II', minElo: 8000, maxElo: 8499, color: 'text-amber-400', badgeBg: 'bg-amber-950/80', borderColor: 'border-amber-400', icon: '👑' },
  { name: 'Legendary', subTier: 'III', minElo: 8500, maxElo: 8999, color: 'text-amber-400', badgeBg: 'bg-amber-950/80', borderColor: 'border-amber-400', icon: '👑' },
  { name: 'Masters', subTier: 'I', minElo: 9000, maxElo: 99999, color: 'text-purple-300', badgeBg: 'bg-purple-950/90', borderColor: 'border-purple-400', icon: '🌟' },
];

export const RANKED_MODIFIERS: Record<RankedModifierType, RankedModifierInfo> = {
  classic: {
    type: 'classic',
    name: 'Classic Brawl',
    icon: '⚔️',
    description: 'Pure esports arena combat with standard mechanics and no modifiers.',
    tagColor: 'text-slate-300',
    badgeColor: 'bg-slate-800 border-slate-600',
  },
  quick_fire: {
    type: 'quick_fire',
    name: 'Quick Fire',
    icon: '⚡',
    description: 'Hitting any enemy target immediately refunds 0.5 ammo bar! High-fire rate madness.',
    tagColor: 'text-amber-300',
    badgeColor: 'bg-amber-950/80 border-amber-500',
  },
  hypercharge_surge: {
    type: 'hypercharge_surge',
    name: 'Hypercharge Surge',
    icon: '🔥',
    description: 'Hypercharge charge rate increased by +300%! Pop ultimate overdrives back-to-back.',
    tagColor: 'text-rose-400',
    badgeColor: 'bg-rose-950/80 border-rose-500',
  },
  big_friend: {
    type: 'big_friend',
    name: 'Big Friend',
    icon: '🛡️',
    description: 'All brawlers on the squad inherit the massive maximum HP pool of their tankiest teammate.',
    tagColor: 'text-emerald-300',
    badgeColor: 'bg-emerald-950/80 border-emerald-500',
  },
  timed_detonation: {
    type: 'timed_detonation',
    name: 'Timed Detonation',
    icon: '💥',
    description: 'Environmental obstacles and cover collapse every 15 seconds into open battlegrounds.',
    tagColor: 'text-purple-300',
    badgeColor: 'bg-purple-950/80 border-purple-500',
  },
};

export function getRankedTierFromElo(elo: number): RankedTier {
  for (let i = RANKED_TIERS.length - 1; i >= 0; i--) {
    if (elo >= RANKED_TIERS[i].minElo) {
      return RANKED_TIERS[i];
    }
  }
  return RANKED_TIERS[0];
}
