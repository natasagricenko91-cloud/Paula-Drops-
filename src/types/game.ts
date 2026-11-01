export type BrawlerRarity = 'Common' | 'Rare' | 'Super Rare' | 'Epic' | 'Mythic' | 'Legendary';
export type BrawlerClass = 'Assassin' | 'Artillery' | 'Support' | 'Tank' | 'Damage Dealer' | 'Marksman';

export interface AbilityInfo {
  name: string;
  description: string;
  icon?: string;
  damage?: number;
  healing?: number;
  range?: number;
  reloadTime?: number; // seconds
  cooldown?: number;
}

export interface BrawlerData {
  id: string;
  name: string;
  title: string;
  class: BrawlerClass;
  rarity: BrawlerRarity;
  description: string;
  lore: string;
  accentColor: string;
  themeColor: string;
  glowColor: string;
  modelStyle: {
    primaryColor: number;
    secondaryColor: number;
    accentColor: number;
    hatType: 'clockwork' | 'diver_helmet' | 'spore_hood';
  };
  baseStats: {
    health: number;
    speed: number; // units/sec
    damage: number;
    reloadSpeed: number; // seconds per ammo
    maxAmmo: number;
    superChargeHits: number;
  };
  attack: AbilityInfo & {
    projectileSpeed: number;
    projectileCount: number;
    spreadAngle: number;
    projectileType: 'disc' | 'mortar' | 'spores';
  };
  superAbility: AbilityInfo & {
    duration?: number;
    superRadius?: number;
  };
  starPowers: [AbilityInfo, AbilityInfo];
  gadgets: [AbilityInfo, AbilityInfo];
  hypercharge: AbilityInfo & {
    statBoosts: {
      speed: number;
      damage: number;
      shield: number;
    };
  };
}

export interface ProjectileEntity {
  id: string;
  ownerId: string;
  team: 'blue' | 'red';
  x: number;
  z: number;
  vx: number;
  vz: number;
  startY: number;
  currentY: number;
  type: 'disc' | 'mortar' | 'spores' | 'super';
  damage: number;
  healing?: number;
  radius: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
  isLobbed?: boolean;
  targetX?: number;
  targetZ?: number;
}

export interface ObstacleEntity {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  type: 'crate' | 'rock' | 'gem_mine' | 'bush';
  health: number;
  maxHealth: number;
  isBreakable: boolean;
  blocksBullets: boolean;
  blocksWalk: boolean;
  destroyed?: boolean;
}

export interface GemEntity {
  id: string;
  x: number;
  z: number;
  vy: number;
  y: number;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  brawler: BrawlerData;
  team: 'blue' | 'red';
  isLocalPlayer: boolean;
  x: number;
  z: number;
  rotY: number;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  superCharge: number; // 0 to 100
  hyperchargeCharge: number; // 0 to 100
  isHypercharged: boolean;
  hyperchargeTimer: number;
  gemsCarried: number;
  isAlive: boolean;
  respawnTimer: number;
  isInBush: boolean;
  isAiming: boolean;
  aimAngle: number;
  aimType: 'attack' | 'super';
  gadgetCharges: number;
  kills: number;
  deaths: number;
  damageDealt: number;
}

export interface DamageNumber {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  timeRemaining: number;
}

export type GameMode = 'Gem Grab 3v3' | 'Showdown Solo' | 'Ranked 3v3';
export type CameraPreset = 'isometric' | 'crazy_cam' | 'free_look' | 'first_person';
export type LightingPreset = 'day' | 'night' | 'toxic';

export interface DebugSettings {
  botAiEnabled: boolean;
  botDifficulty: 'easy' | 'normal' | 'nightmare';
  godMode: boolean;
  infiniteAmmo: boolean;
  instantSuper: boolean;
  instantHypercharge: boolean;
  gameSpeed: number;
  moveSpeedMultiplier: number;
  damageMultiplier: number;
  rangeMultiplier: number;
  brawlerScale: number;
  showHitboxes: boolean;
  showFpsOverlay: boolean;
  simulatedLatency: number; // ms
  packetLoss: number; // %
  lightingPreset: LightingPreset;
  fov: number;
  pauseToxicGas: boolean;
  // 1738 Dev Build Cheats & Modifiers
  dev1738Active: boolean;
  bigHeadMode: boolean;
  discoArena: boolean;
  wireframeMode: boolean;
  moonGravity: boolean;
  superMagnet: boolean;
  gatlingFire: boolean;
  clusterShot: boolean;
  iceSlide: boolean;
  ghostPhasing: boolean;
  goldSkin: boolean;
  freezeBots: boolean;
  pacifistBots: boolean;
  oneHitKill: boolean;
  unlimitedGadgets: boolean;
  confettiStorm: boolean;
  crtShader: boolean;
}
