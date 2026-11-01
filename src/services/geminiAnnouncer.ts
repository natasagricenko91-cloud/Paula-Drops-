/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;

try {
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    '';
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn('Gemini client not initialized with env key, using tactical fallback:', e);
}

export interface MatchAnalysisPrompt {
  brawlerName: string;
  gameMode: string;
  result: 'VICTORY' | 'DEFEAT';
  kills: number;
  deaths: number;
  damage: number;
  dropsFound: number;
  trophies: number;
}

export async function generateEsportsCastingCommentary(stats: MatchAnalysisPrompt): Promise<string> {
  if (aiClient) {
    try {
      const prompt = `You are "Paula AI", the legendary high-energy Supercell Brawl Stars / Paula Drops 2.0 esports live caster.
Write a 2-3 sentence electrifying match debrief for this match:
- Brawler: ${stats.brawlerName}
- Mode: ${stats.gameMode}
- Result: ${stats.result} (${stats.kills} Kills, ${stats.deaths} Deaths, ${stats.damage.toLocaleString()} Damage)
- Starr Drops unboxed: ${stats.dropsFound}
- Current Trophies: ${stats.trophies}

Use authentic Brawl Stars & Paula Drops hype slang (e.g. "WHAT A CLUTCH HYPERCHARGE!", "Starr Drop jackpot!", "Calculated play!"). Keep it under 50 words and punchy!`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini generateContent error, falling back to local lines:', err);
    }
  }

  // Authentic Supercell caster backup lines
  const victoryLines = [
    `🔥 "ABSOLUTELY INSANE! ${stats.brawlerName} dominated the ${stats.gameMode} arena with ${stats.kills} kills and claimed ${stats.dropsFound} Starr Drop(s)! Give this MVP the Paula Drops trophy!"`,
    `⚡ "WHAT A CLUTCH SHOWDOWN! ${stats.damage.toLocaleString()} damage blasted onto the board. That Hypercharge timing was pure masterclass!"`,
    `✨ "UNSTOPPABLE! ${stats.brawlerName} carries the squad to victory, racking up trophies and lighting up the Paula ID global leaderboard!"`,
  ];

  const defeatLines = [
    `🛡️ "A tough brawl in ${stats.gameMode}, but ${stats.brawlerName} held the line with ${stats.kills} takedowns. Charge up your Hypercharge and run it back!"`,
    `💫 "Close battle! Reset your lane control, grab that next Starr Drop from the Shop, and climb back to the top of Trophy Road!"`,
  ];

  const list = stats.result === 'VICTORY' ? victoryLines : defeatLines;
  return list[Math.floor(Math.random() * list.length)];
}
