import { BrawlerData } from '../types/game';

export const ORIGINAL_BRAWLERS: BrawlerData[] = [
  {
    id: 'vexa',
    name: 'Vexa',
    title: 'The Chrono Assassin',
    class: 'Assassin',
    rarity: 'Mythic',
    description: 'A rogue temporal horologist from the Chrono Factory who rewinds combat blunders and slices reality with quantum clock-discs.',
    lore: 'Vexa was once the lead chronometer engineer for the Starr Park Temporal Exhibit. After a catastrophic gear-spill fractured her pocket dimensions, she gained the uncanny ability to manipulate localized timelines. Armed with razor-sharp chronoblades and a portable paradox capacitor, she enters the arena to ensure every second counts—and every mistake is erased!',
    accentColor: '#00f0ff',
    themeColor: '#0369a1',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    modelStyle: {
      primaryColor: 0x0284c7, // Cyan blue jacket
      secondaryColor: 0x1e293b, // Dark trousers
      accentColor: 0x38bdf8, // Glowing clock parts
      hatType: 'clockwork',
    },
    baseStats: {
      health: 4800,
      speed: 8.2, // Very fast
      damage: 1440, // 3 discs x 480
      reloadSpeed: 1.3,
      maxAmmo: 3,
      superChargeHits: 5,
    },
    attack: {
      name: 'Chronoblades',
      description: 'Hurls 3 razor-thin spinning temporal discs in a fan. Discs accelerate over distance. Hitting an enemy at maximum range recovers 0.5 ammo instantly.',
      damage: 480,
      range: 8.5,
      reloadTime: 1.3,
      projectileSpeed: 18.0,
      projectileCount: 3,
      spreadAngle: 0.22,
      projectileType: 'disc',
    },
    superAbility: {
      name: 'Paradox Warp',
      description: 'Vexa places a temporal anchor at her current location and blinks forward with an explosive dash. Activating Super again within 4 seconds snaps her back to the anchor, healing 40% of all damage sustained during that window and releasing a 1200 damage shockwave.',
      damage: 1200,
      range: 7.0,
      duration: 4.0,
      superRadius: 2.5,
    },
    starPowers: [
      {
        name: 'Rewind Resonance',
        description: 'Snapping back to the Paradox Anchor emits an echo pulse that slows down all enemies in a 4-tile radius by 35% for 2.5 seconds.',
      },
      {
        name: 'Temporal Loop',
        description: 'Landing all three Chronoblades from a single attack instantly restores 1 full ammo slot and reduces Super cooldown by 20%.',
      },
    ],
    gadgets: [
      {
        name: 'Stasis Shell',
        description: 'Vexa encases herself in a localized time stasis for 1.2 seconds, becoming completely invulnerable and immune to status effects, but unable to move or fire.',
        cooldown: 5.0,
      },
      {
        name: 'Fast Forward',
        description: 'Vexa overclocks her kinetic drive: her next basic attack travels 60% faster, pierces all obstacles, and ignores brush stealth.',
        cooldown: 5.0,
      },
    ],
    hypercharge: {
      name: 'Quantum Cataclysm',
      description: 'When Hypercharged, Vexa gains +25% Speed, +20% Damage, and +15% Shield. Her Paradox Warp now creates 3 chain-detonating temporal rifts upon teleportation, knocking all foes into the air.',
      statBoosts: {
        speed: 1.25,
        damage: 1.20,
        shield: 0.15,
      },
    },
  },
  {
    id: 'gulliver',
    name: 'Gulliver',
    title: 'Siege Salvager',
    class: 'Artillery',
    rarity: 'Epic',
    description: 'A deep-sea salvage captain clad in a motorized brass diving bell with a pressurized steam mortar that lobs explosive cluster depth-charges.',
    lore: 'Scouring the sunken toxic trenches beneath the arena, Captain Gulliver found more than gold—he salvaged high-pressure thermal steam weaponry and welded an armored diving suit capable of withstanding the crushing depths of the abyss. On land, his bouncing depth-charges shatter fortifications and flush cowardly foes out of the tall grass.',
    accentColor: '#f59e0b',
    themeColor: '#b45309',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    modelStyle: {
      primaryColor: 0xd97706, // Brass suit
      secondaryColor: 0x451a03, // Copper trim
      accentColor: 0x38bdf8, // Glass porthole glowing blue
      hatType: 'diver_helmet',
    },
    baseStats: {
      health: 6600,
      speed: 6.8, // Normal / heavy
      damage: 1800,
      reloadSpeed: 1.8,
      maxAmmo: 3,
      superChargeHits: 4,
    },
    attack: {
      name: 'Depth Charge',
      description: 'Lobs a heavy pressurized canister over walls. On ground contact, it violently detonates for 1800 damage and splinters into 3 mini-shrapnel mines dealing 450 damage each.',
      damage: 1800,
      range: 9.2,
      reloadTime: 1.8,
      projectileSpeed: 13.0,
      projectileCount: 1,
      spreadAngle: 0,
      projectileType: 'mortar',
    },
    superAbility: {
      name: 'Whirlpool Barrage',
      description: 'Gulliver fires a titanic deep-sea vortex anchor that crashes into the arena, shattering all environmental walls and pulling enemy brawlers toward its epicenter while dealing 2200 continuous crush damage.',
      damage: 2200,
      range: 9.5,
      superRadius: 4.2,
    },
    starPowers: [
      {
        name: 'Barnacle Plating',
        description: 'When Gulliver drops below 40% health, his pressurized diving suit seals shut, granting him a durable 25% damage reduction shield for 4 seconds.',
      },
      {
        name: 'Shockwave Shrapnel',
        description: 'Depth Charge mini-shrapnel pieces push enemies back 1.5 tiles upon detonation and destroy wooden crates.',
      },
    ],
    gadgets: [
      {
        name: 'Steam Vent',
        description: 'Gulliver releases a blast of scalding boiler steam around him, knocking back encroaching melee brawlers and blinding them for 1.5s.',
        cooldown: 5.0,
      },
      {
        name: 'Sonar Ping',
        description: 'Gulliver activates his acoustic sonar dish, instantly revealing all enemies hiding inside bushes across the entire arena for 5 seconds.',
        cooldown: 6.0,
      },
    ],
    hypercharge: {
      name: 'Tidal Overload',
      description: 'When Hypercharged, Gulliver gains +20% Speed, +25% Damage, and +25% Shield. Whirlpool Barrage spawns boiling hydrothermal geysers that launch and stun trapped enemies for 1.2 seconds.',
      statBoosts: {
        speed: 1.20,
        damage: 1.25,
        shield: 0.25,
      },
    },
  },
  {
    id: 'nyx',
    name: 'Nyx',
    title: 'Bioluminescent Sprite',
    class: 'Support',
    rarity: 'Legendary',
    description: 'An ancient subterranean spirit who commands glowing fungal spores to regenerate allies and poison enemy brawlers.',
    lore: 'Deep in the crystal caves beneath the arena, Nyx tends to the glowing mycelium networks that feed the arena flora. She views battle as an energetic ecosystem: what withers on the enemy team directly nourishes her squad. With a wave of her bioluminescent staff, she cloaks teammates in whispering shadows and covers the turf in healing spore fields.',
    accentColor: '#10b981',
    themeColor: '#047857',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    modelStyle: {
      primaryColor: 0x10b981, // Emerald green
      secondaryColor: 0x8b5cf6, // Violet accents
      accentColor: 0x6ee7b7, // Glowing spore hood
      hatType: 'spore_hood',
    },
    baseStats: {
      health: 5200,
      speed: 7.5, // Fast
      damage: 1350,
      reloadSpeed: 1.4,
      maxAmmo: 3,
      superChargeHits: 4,
    },
    attack: {
      name: 'Spore Burst',
      description: 'Fires a wave of 3 bioluminescent spores in a rhythmic arc. Passing through allies heals them for 850 HP; impacting enemies deals 1350 damage plus 200 poison per second for 3 seconds.',
      damage: 1350,
      healing: 850,
      range: 8.8,
      reloadTime: 1.4,
      projectileSpeed: 16.0,
      projectileCount: 3,
      spreadAngle: 0.18,
      projectileType: 'spores',
    },
    superAbility: {
      name: 'Luminescent Canopy',
      description: 'Spawns an enchanting mushroom grove (5-tile radius). All allies inside gain complete invisibility and +15% move speed even while firing attacks, lasting 7 seconds.',
      range: 8.0,
      duration: 7.0,
      superRadius: 5.0,
    },
    starPowers: [
      {
        name: 'Symbiotic Link',
        description: 'Healing allies with Spore Burst charges Nyx’s Super meter by 12% per friendly hero healed.',
      },
      {
        name: 'Toxic Photosynthesis',
        description: 'Enemies who dare enter the Luminescent Canopy suffer 450 poison damage per second and have their healing reduced by 50%.',
      },
    ],
    gadgets: [
      {
        name: 'Spore Bloom',
        description: 'Instantly detonates all active spores in the arena, healing nearby allies for 1200 HP and dealing 800 burst damage to surrounding enemies.',
        cooldown: 5.0,
      },
      {
        name: 'Fungal Snare',
        description: 'Causes all active poison afflictions on enemies to crystallize, rooting them in place for 1.3 seconds.',
        cooldown: 5.0,
      },
    ],
    hypercharge: {
      name: 'Bioluminescent Bloom',
      description: 'When Hypercharged, Nyx gains +30% Speed, +15% Damage, and +20% Shield. Luminescent Canopy expands by 50% radius and continuously grants allies 500 HP/sec life regeneration.',
      statBoosts: {
        speed: 1.30,
        damage: 1.15,
        shield: 0.20,
      },
    },
  },
];
