import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import {
  BrawlerData,
  CameraPreset,
  DamageNumber,
  DebugSettings,
  GameMode,
  GemEntity,
  ObstacleEntity,
  PlayerCharacter,
  ProjectileEntity,
} from '../types/game';
import { ORIGINAL_BRAWLERS } from '../data/brawlers';
import { soundManager } from '../audio/soundManager';
import {
  createBrawlerMesh,
  createBushMesh,
  createCrateMesh,
  createGemMesh,
  createGemMineMesh,
  createPaulaDropMesh,
  createWallMesh,
} from './proceduralModels';

// Scratch math helpers outside render loop
const _vec3 = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _camTarget = new THREE.Vector3();

export interface PaulaDropEntity {
  id: string;
  x: number;
  z: number;
  y: number;
  vy: number;
  rarity: 'rare' | 'epic' | 'mythic' | 'legendary';
}

interface ThreeArenaProps {
  selectedBrawler: BrawlerData;
  gameMode: GameMode;
  cameraPreset: CameraPreset;
  debugSettings: DebugSettings;
  onMatchEnd: (victory: boolean, trophiesGained: number, masteryPoints: number) => void;
  onExitMatch: () => void;
  onOpenDebug?: () => void;
  arenaActionRef?: React.MutableRefObject<{
    spawnGems: (count: number) => void;
    rebuildObstacles: () => void;
    nukeObstacles: () => void;
    resetToxicGas: () => void;
    suddenDeathGas: () => void;
    refillGadgets: () => void;
    respawnPlayer: () => void;
    triggerShake: () => void;
    spawnPaulaDrop?: (rarity: 'rare' | 'epic' | 'mythic' | 'legendary') => void;
  } | null>;
}

export const ThreeArena: React.FC<ThreeArenaProps> = ({
  selectedBrawler,
  gameMode,
  cameraPreset,
  debugSettings,
  onMatchEnd,
  onExitMatch,
  onOpenDebug,
  arenaActionRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Live telemetry profiling state
  const [telemetry, setTelemetry] = useState<{
    fps: number;
    frameTime: number;
    entities: number;
    drawCalls: number;
  }>({ fps: 60, frameTime: 16.6, entities: 0, drawCalls: 0 });

  // Match HUD state
  const [hudState, setHudState] = useState<{
    health: number;
    maxHealth: number;
    ammo: number;
    maxAmmo: number;
    superCharge: number;
    isSuperReady: boolean;
    hyperCharge: number;
    isHypercharged: boolean;
    blueGems: number;
    redGems: number;
    countdown: number | null;
    brawlersRemaining: number;
    kills: number;
    gadgetCharges: number;
  }>({
    health: selectedBrawler.baseStats.health,
    maxHealth: selectedBrawler.baseStats.health,
    ammo: selectedBrawler.baseStats.maxAmmo,
    maxAmmo: selectedBrawler.baseStats.maxAmmo,
    superCharge: 0,
    isSuperReady: false,
    hyperCharge: 0,
    isHypercharged: false,
    blueGems: 0,
    redGems: 0,
    countdown: null,
    brawlersRemaining: 6,
    kills: 0,
    gadgetCharges: 3,
  });

  const [matchResult, setMatchResult] = useState<'victory' | 'defeat' | null>(null);

  // Joystick states
  const [leftStick, setLeftStick] = useState<{ active: boolean; dx: number; dy: number }>({
    active: false,
    dx: 0,
    dy: 0,
  });
  const [rightStick, setRightStick] = useState<{ active: boolean; dx: number; dy: number; isSuper: boolean }>({
    active: false,
    dx: 0,
    dy: 0,
    isSuper: false,
  });

  // Mutable game simulation state
  const stateRef = useRef<{
    players: PlayerCharacter[];
    projectiles: ProjectileEntity[];
    obstacles: ObstacleEntity[];
    gems: GemEntity[];
    paulaDrops: PaulaDropEntity[];
    damageNumbers: DamageNumber[];
    gemSpawnTimer: number;
    toxicRadius: number;
    countdownTimer: number;
    countdownTeam: 'blue' | 'red' | null;
    shakeIntensity: number;
    keyboard: { [key: string]: boolean };
    matchOver: boolean;
  }>({
    players: [],
    projectiles: [],
    obstacles: [],
    gems: [],
    paulaDrops: [],
    damageNumbers: [],
    gemSpawnTimer: 2.0,
    toxicRadius: 36,
    countdownTimer: 15,
    countdownTeam: null,
    shakeIntensity: 0,
    keyboard: {},
    matchOver: false,
  });

  // Three.js scene references
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    playerMeshes: Map<string, THREE.Group>;
    obstacleMeshes: Map<string, THREE.Group>;
    gemMeshes: Map<string, THREE.Mesh>;
    paulaDropMeshes: Map<string, THREE.Group>;
    projectileMeshes: Map<string, THREE.Mesh>;
    toxicCircle: THREE.Mesh | null;
    aimIndicator: THREE.Line | null;
    animFrameId: number;
  } | null>(null);

  // Initialize Game Map and Players
  const initGameEntities = useCallback(() => {
    const isShowdown = gameMode === 'Showdown Solo';

    // 1. Players Setup
    const players: PlayerCharacter[] = [];
    const brawlerPool = ORIGINAL_BRAWLERS;

    // Player
    players.push({
      id: 'local_player',
      name: 'You',
      brawler: selectedBrawler,
      team: 'blue',
      isLocalPlayer: true,
      x: isShowdown ? -10 : 0,
      z: isShowdown ? -10 : 12,
      rotY: 0,
      health: selectedBrawler.baseStats.health,
      maxHealth: selectedBrawler.baseStats.health,
      ammo: selectedBrawler.baseStats.maxAmmo,
      maxAmmo: selectedBrawler.baseStats.maxAmmo,
      superCharge: 0,
      hyperchargeCharge: 0,
      isHypercharged: false,
      hyperchargeTimer: 0,
      gemsCarried: 0,
      isAlive: true,
      respawnTimer: 0,
      isInBush: false,
      isAiming: false,
      aimAngle: 0,
      aimType: 'attack',
      gadgetCharges: 3,
      kills: 0,
      deaths: 0,
      damageDealt: 0,
    });

    if (!isShowdown) {
      // 3v3 Gem Grab: 2 Blue Bots, 3 Red Bots
      // Teammate 1
      players.push({
        id: 'bot_blue_1',
        name: 'Ally Colt',
        brawler: brawlerPool[1], // Gulliver
        team: 'blue',
        isLocalPlayer: false,
        x: -4,
        z: 13,
        rotY: 0,
        health: brawlerPool[1].baseStats.health,
        maxHealth: brawlerPool[1].baseStats.health,
        ammo: 3,
        maxAmmo: 3,
        superCharge: 20,
        hyperchargeCharge: 0,
        isHypercharged: false,
        hyperchargeTimer: 0,
        gemsCarried: 0,
        isAlive: true,
        respawnTimer: 0,
        isInBush: false,
        isAiming: false,
        aimAngle: 0,
        aimType: 'attack',
        gadgetCharges: 3,
        kills: 0,
        deaths: 0,
        damageDealt: 0,
      });

      // Teammate 2
      players.push({
        id: 'bot_blue_2',
        name: 'Ally Poco',
        brawler: brawlerPool[2], // Nyx
        team: 'blue',
        isLocalPlayer: false,
        x: 4,
        z: 13,
        rotY: 0,
        health: brawlerPool[2].baseStats.health,
        maxHealth: brawlerPool[2].baseStats.health,
        ammo: 3,
        maxAmmo: 3,
        superCharge: 30,
        hyperchargeCharge: 0,
        isHypercharged: false,
        hyperchargeTimer: 0,
        gemsCarried: 0,
        isAlive: true,
        respawnTimer: 0,
        isInBush: false,
        isAiming: false,
        aimAngle: 0,
        aimType: 'attack',
        gadgetCharges: 3,
        kills: 0,
        deaths: 0,
        damageDealt: 0,
      });

      // Enemy 1
      players.push({
        id: 'bot_red_1',
        name: 'Enemy Spike',
        brawler: brawlerPool[0], // Vexa
        team: 'red',
        isLocalPlayer: false,
        x: 0,
        z: -12,
        rotY: Math.PI,
        health: brawlerPool[0].baseStats.health,
        maxHealth: brawlerPool[0].baseStats.health,
        ammo: 3,
        maxAmmo: 3,
        superCharge: 10,
        hyperchargeCharge: 0,
        isHypercharged: false,
        hyperchargeTimer: 0,
        gemsCarried: 0,
        isAlive: true,
        respawnTimer: 0,
        isInBush: false,
        isAiming: false,
        aimAngle: 0,
        aimType: 'attack',
        gadgetCharges: 3,
        kills: 0,
        deaths: 0,
        damageDealt: 0,
      });

      // Enemy 2
      players.push({
        id: 'bot_red_2',
        name: 'Enemy Bull',
        brawler: brawlerPool[1],
        team: 'red',
        isLocalPlayer: false,
        x: -5,
        z: -13,
        rotY: Math.PI,
        health: brawlerPool[1].baseStats.health,
        maxHealth: brawlerPool[1].baseStats.health,
        ammo: 3,
        maxAmmo: 3,
        superCharge: 0,
        hyperchargeCharge: 0,
        isHypercharged: false,
        hyperchargeTimer: 0,
        gemsCarried: 0,
        isAlive: true,
        respawnTimer: 0,
        isInBush: false,
        isAiming: false,
        aimAngle: 0,
        aimType: 'attack',
        gadgetCharges: 3,
        kills: 0,
        deaths: 0,
        damageDealt: 0,
      });

      // Enemy 3
      players.push({
        id: 'bot_red_3',
        name: 'Enemy Crow',
        brawler: brawlerPool[2],
        team: 'red',
        isLocalPlayer: false,
        x: 5,
        z: -13,
        rotY: Math.PI,
        health: brawlerPool[2].baseStats.health,
        maxHealth: brawlerPool[2].baseStats.health,
        ammo: 3,
        maxAmmo: 3,
        superCharge: 0,
        hyperchargeCharge: 0,
        isHypercharged: false,
        hyperchargeTimer: 0,
        gemsCarried: 0,
        isAlive: true,
        respawnTimer: 0,
        isInBush: false,
        isAiming: false,
        aimAngle: 0,
        aimType: 'attack',
        gadgetCharges: 3,
        kills: 0,
        deaths: 0,
        damageDealt: 0,
      });
    } else {
      // Showdown 5 enemy bots scattered around
      const spawnPoints = [
        { x: 12, z: -10 },
        { x: 10, z: 12 },
        { x: -12, z: 10 },
        { x: 0, z: -15 },
        { x: 0, z: 15 },
      ];
      spawnPoints.forEach((sp, i) => {
        const b = brawlerPool[i % brawlerPool.length];
        players.push({
          id: `sd_bot_${i}`,
          name: `Rival ${b.name}`,
          brawler: b,
          team: 'red',
          isLocalPlayer: false,
          x: sp.x,
          z: sp.z,
          rotY: Math.random() * Math.PI * 2,
          health: b.baseStats.health,
          maxHealth: b.baseStats.health,
          ammo: 3,
          maxAmmo: 3,
          superCharge: 15,
          hyperchargeCharge: 0,
          isHypercharged: false,
          hyperchargeTimer: 0,
          gemsCarried: 0,
          isAlive: true,
          respawnTimer: 0,
          isInBush: false,
          isAiming: false,
          aimAngle: 0,
          aimType: 'attack',
          gadgetCharges: 3,
          kills: 0,
          deaths: 0,
          damageDealt: 0,
        });
      });
    }

    // 2. Obstacles & Bushes Layout
    const obstacles: ObstacleEntity[] = [];

    // Crates & Stone Walls
    const wallPositions = [
      { x: -6, z: 4, type: 'rock' as const },
      { x: -6, z: 5.5, type: 'rock' as const },
      { x: 6, z: 4, type: 'rock' as const },
      { x: 6, z: 5.5, type: 'rock' as const },
      { x: -6, z: -4, type: 'rock' as const },
      { x: -6, z: -5.5, type: 'rock' as const },
      { x: 6, z: -4, type: 'rock' as const },
      { x: 6, z: -5.5, type: 'rock' as const },
      // Wooden Crates
      { x: -3, z: 2, type: 'crate' as const },
      { x: 3, z: 2, type: 'crate' as const },
      { x: -3, z: -2, type: 'crate' as const },
      { x: 3, z: -2, type: 'crate' as const },
      { x: -10, z: 0, type: 'crate' as const },
      { x: 10, z: 0, type: 'crate' as const },
    ];

    wallPositions.forEach((wp, idx) => {
      obstacles.push({
        id: `obs_${idx}`,
        x: wp.x,
        z: wp.z,
        width: 1.4,
        depth: 1.4,
        height: 1.5,
        type: wp.type,
        health: wp.type === 'crate' ? 3000 : 99999,
        maxHealth: wp.type === 'crate' ? 3000 : 99999,
        isBreakable: true,
        blocksBullets: true,
        blocksWalk: true,
      });
    });

    // Center Gem Mine (in Gem Grab)
    if (!isShowdown) {
      obstacles.push({
        id: 'gem_mine_center',
        x: 0,
        z: 0,
        width: 2.2,
        depth: 2.2,
        height: 0.8,
        type: 'gem_mine',
        health: 999999,
        maxHealth: 999999,
        isBreakable: false,
        blocksBullets: false,
        blocksWalk: true,
      });
    }

    // Bushes (Stealth grass patches)
    const bushPositions = [
      { x: 0, z: 5 },
      { x: 1.8, z: 5 },
      { x: -1.8, z: 5 },
      { x: 0, z: -5 },
      { x: 1.8, z: -5 },
      { x: -1.8, z: -5 },
      { x: -8, z: 2 },
      { x: -8, z: -2 },
      { x: 8, z: 2 },
      { x: 8, z: -2 },
      { x: -12, z: 7 },
      { x: 12, z: -7 },
    ];

    bushPositions.forEach((bp, idx) => {
      obstacles.push({
        id: `bush_${idx}`,
        x: bp.x,
        z: bp.z,
        width: 2.0,
        depth: 2.0,
        height: 0.9,
        type: 'bush',
        health: 9999,
        maxHealth: 9999,
        isBreakable: false,
        blocksBullets: false,
        blocksWalk: false,
      });
    });

    stateRef.current.players = players;
    stateRef.current.obstacles = obstacles;
    stateRef.current.gems = [];
    stateRef.current.projectiles = [];
    stateRef.current.damageNumbers = [];
    stateRef.current.matchOver = false;
    stateRef.current.countdownTeam = null;
    stateRef.current.countdownTimer = 15;
    stateRef.current.toxicRadius = 35;
  }, [gameMode, selectedBrawler]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1322);
    scene.fog = new THREE.FogExp2(0x0c1322, 0.018);

    // Studio Environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Balanced 3-point Lighting
    const keyLight = new THREE.DirectionalLight(0xfff3d6, 1.8);
    keyLight.position.set(15, 30, 20);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 80;
      const d = 25;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 0.85);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-15, 12, -20);
    scene.add(rimLight);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    camera.position.set(0, 28, 22);
    camera.lookAt(0, 0, 0);

    // Ground Arena Arena Floor
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const gctx = groundCanvas.getContext('2d')!;
    // Supercell cartoon hex tile pattern
    gctx.fillStyle = '#22c55e'; // Grass green
    gctx.fillRect(0, 0, 512, 512);
    gctx.strokeStyle = '#16a34a';
    gctx.lineWidth = 4;
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 64) {
        gctx.strokeRect(x, y, 64, 64);
        gctx.fillStyle = '#2ece6e';
        gctx.fillRect(x + 4, y + 4, 56, 56);
      }
    }
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(12, 12);
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    groundTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Toxic Fog Ring (Showdown mode)
    const toxicGeo = new THREE.RingGeometry(35, 60, 64);
    const toxicMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const toxicCircle = new THREE.Mesh(toxicGeo, toxicMat);
    toxicCircle.rotation.x = -Math.PI / 2;
    toxicCircle.position.y = 0.15;
    scene.add(toxicCircle);

    // Aim Indicator Line / Trajectory
    const aimGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0, 0.1, 1),
    ]);
    const aimMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
      transparent: true,
      opacity: 0.7,
    });
    const aimIndicator = new THREE.Line(aimGeo, aimMat);
    aimIndicator.visible = false;
    scene.add(aimIndicator);

    // Storage for dynamically created meshes
    const playerMeshes = new Map<string, THREE.Group>();
    const obstacleMeshes = new Map<string, THREE.Group>();
    const gemMeshes = new Map<string, THREE.Mesh>();
    const paulaDropMeshes = new Map<string, THREE.Group>();
    const projectileMeshes = new Map<string, THREE.Mesh>();

    threeRef.current = {
      renderer,
      scene,
      camera,
      playerMeshes,
      obstacleMeshes,
      gemMeshes,
      paulaDropMeshes,
      projectileMeshes,
      toxicCircle,
      aimIndicator,
      animFrameId: 0,
    };

    // Initialize entities
    initGameEntities();

    // Create obstacle meshes
    stateRef.current.obstacles.forEach((obs) => {
      let m: THREE.Group;
      if (obs.type === 'crate') {
        m = createCrateMesh();
      } else if (obs.type === 'rock') {
        m = createWallMesh();
      } else if (obs.type === 'gem_mine') {
        m = createGemMineMesh();
      } else {
        m = createBushMesh();
      }
      m.position.set(obs.x, 0, obs.z);
      scene.add(m);
      obstacleMeshes.set(obs.id, m);
    });

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keyboard[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Enter') {
        // Quick attack
        triggerQuickAttack();
      } else if (e.key.toLowerCase() === 'e') {
        // Super quick-fire
        triggerQuickSuper();
      } else if (e.key.toLowerCase() === 'f') {
        // Gadget
        triggerGadget();
      } else if (e.key.toLowerCase() === 'r') {
        // Hypercharge
        triggerHypercharge();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keyboard[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Hook arenaActionRef for external debug commands
    if (arenaActionRef) {
      arenaActionRef.current = {
        spawnGems: (count: number) => {
          for (let i = 0; i < count; i++) {
            stateRef.current.gems.push({
              id: `gem_debug_${Date.now()}_${i}`,
              x: (Math.random() - 0.5) * 3,
              z: (Math.random() - 0.5) * 3,
              vy: 4.0,
              y: 0.5,
            });
          }
          soundManager.playGemPickup();
        },
        rebuildObstacles: () => {
          stateRef.current.obstacles.forEach((obs) => {
            obs.health = obs.maxHealth;
            obs.destroyed = false;
            const m = threeRef.current?.obstacleMeshes.get(obs.id);
            if (m) m.visible = true;
          });
          soundManager.playSuperReady();
        },
        nukeObstacles: () => {
          stateRef.current.obstacles.forEach((obs) => {
            if (obs.isBreakable && !obs.destroyed) {
              obs.destroyed = true;
              const m = threeRef.current?.obstacleMeshes.get(obs.id);
              if (m) m.visible = false;
              stateRef.current.damageNumbers.push({
                id: `nuke_${obs.id}`,
                text: '💥 CRUSH',
                x: obs.x,
                y: 1.5,
                z: obs.z,
                color: '#f97316',
                timeRemaining: 1.0,
              });
            }
          });
          soundManager.playShoot('super');
          stateRef.current.shakeIntensity = 0.8;
        },
        resetToxicGas: () => {
          stateRef.current.toxicRadius = 35;
          soundManager.playSuperReady();
        },
        suddenDeathGas: () => {
          stateRef.current.toxicRadius = 8;
          soundManager.playHit();
          stateRef.current.shakeIntensity = 0.6;
        },
        refillGadgets: () => {
          const p = stateRef.current.players.find((pl) => pl.isLocalPlayer);
          if (p) {
            p.gadgetCharges = 3;
            soundManager.playSuperReady();
          }
        },
        respawnPlayer: () => {
          const p = stateRef.current.players.find((pl) => pl.isLocalPlayer);
          if (p) {
            p.x = 0;
            p.z = 12;
            p.health = p.maxHealth;
            p.ammo = p.maxAmmo;
            p.isAlive = true;
            soundManager.playSuperReady();
          }
        },
        triggerShake: () => {
          stateRef.current.shakeIntensity = 1.4;
          soundManager.playHit();
        },
        spawnPaulaDrop: (rarity: 'rare' | 'epic' | 'mythic' | 'legendary' = 'rare') => {
          const p = stateRef.current.players.find((pl) => pl.isLocalPlayer);
          const px = p ? p.x : 0;
          const pz = p ? p.z : 0;
          stateRef.current.paulaDrops.push({
            id: `pdrop_${Date.now()}_${Math.random()}`,
            x: px + (Math.random() - 0.5) * 4,
            z: pz + (Math.random() - 0.5) * 4,
            y: 0.5,
            vy: 3.5,
            rarity,
          });
          soundManager.playStarrDropRoll();
        },
      };
    }

    // Simulation Clock
    let lastTime = performance.now();
    let lastTelemetryTime = performance.now();
    let frameId = 0;

    const clockTick = () => {
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05) * debugSettings.gameSpeed;

      // Update FOV if altered by Debug 2.0
      const targetFov = debugSettings.fov || 45;
      if (camera.fov !== targetFov) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }

      // Update Scene Atmosphere & Lighting Presets
      if (debugSettings.lightingPreset === 'night') {
        scene.background = new THREE.Color(0x050711);
        if (scene.fog) scene.fog.color = new THREE.Color(0x050711);
        keyLight.color.setHex(0x60a5fa);
        hemiLight.color.setHex(0x38bdf8);
      } else if (debugSettings.lightingPreset === 'toxic') {
        scene.background = new THREE.Color(0x04180d);
        if (scene.fog) scene.fog.color = new THREE.Color(0x04180d);
        keyLight.color.setHex(0x34d399);
        hemiLight.color.setHex(0x10b981);
      } else {
        scene.background = new THREE.Color(0x0c1322);
        if (scene.fog) scene.fog.color = new THREE.Color(0x0c1322);
        keyLight.color.setHex(0xfff3d6);
        hemiLight.color.setHex(0x7dd3fc);
      }

      // Telemetry update throttled every 250ms
      if (now - lastTelemetryTime > 250) {
        lastTelemetryTime = now;
        const totalEntities =
          stateRef.current.players.length +
          stateRef.current.projectiles.length +
          stateRef.current.gems.length +
          stateRef.current.obstacles.filter((o) => !o.destroyed).length;

        setTelemetry({
          fps: Math.round(1 / Math.max(0.001, rawDt)),
          frameTime: +(rawDt * 1000).toFixed(1),
          entities: totalEntities,
          drawCalls: renderer.info.render.calls,
        });
      }

      // 1738 Disco Rainbow Arena floor
      if (debugSettings.discoArena) {
        const hue = (now * 0.0006) % 1;
        groundMat.color.setHSL(hue, 0.9, 0.5);
      } else {
        groundMat.color.setHex(0xffffff);
      }

      // 1738 Confetti celebration storm
      if (debugSettings.confettiStorm && Math.random() < 0.03) {
        confetti({
          particleCount: 16,
          spread: 70,
          origin: { x: Math.random(), y: 0.35 },
        });
      }

      updatePhysics(dt);
      updateThreeScene(dt);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(clockTick);
      if (threeRef.current) {
        threeRef.current.animFrameId = frameId;
      }
    };

    frameId = requestAnimationFrame(clockTick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [initGameEntities, arenaActionRef, debugSettings]);

  // Update Game Physics & AI Loop
  const updatePhysics = (dt: number) => {
    const s = stateRef.current;
    if (s.matchOver) return;

    const localPlayer = s.players.find((p) => p.isLocalPlayer);
    if (!localPlayer) return;

    // 1. Process Local Player Controls (WASD or Virtual Joystick)
    let moveX = 0;
    let moveZ = 0;

    if (s.keyboard['w'] || s.keyboard['arrowup']) moveZ -= 1;
    if (s.keyboard['s'] || s.keyboard['arrowdown']) moveZ += 1;
    if (s.keyboard['a'] || s.keyboard['arrowleft']) moveX -= 1;
    if (s.keyboard['d'] || s.keyboard['arrowright']) moveX += 1;

    if (leftStick.active) {
      moveX = leftStick.dx;
      moveZ = leftStick.dy;
    }

    const moveMag = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveMag > 0.1 && localPlayer.isAlive) {
      const normX = moveX / moveMag;
      const normZ = moveZ / moveMag;
      const speed =
        localPlayer.brawler.baseStats.speed *
        (localPlayer.isHypercharged ? 1.25 : 1.0) *
        (debugSettings.moveSpeedMultiplier || 1.0);
      const nextX = localPlayer.x + normX * speed * dt;
      const nextZ = localPlayer.z + normZ * speed * dt;

      // Obstacle collision check (Ghost Phasing ignores wall collision)
      if (debugSettings.ghostPhasing) {
        localPlayer.x = nextX;
        localPlayer.z = nextZ;
      } else if (!isCollidingWithWall(nextX, nextZ, 0.6)) {
        localPlayer.x = nextX;
        localPlayer.z = nextZ;
      } else if (!isCollidingWithWall(nextX, localPlayer.z, 0.6)) {
        localPlayer.x = nextX;
      } else if (!isCollidingWithWall(localPlayer.x, nextZ, 0.6)) {
        localPlayer.z = nextZ;
      }

      if (!localPlayer.isAiming) {
        localPlayer.rotY = Math.atan2(normX, normZ);
      }
    }

    // 1738 Super Magnet (Pulls all arena gems directly to local player)
    if (debugSettings.superMagnet && localPlayer.isAlive) {
      s.gems.forEach((g) => {
        const dx = localPlayer.x - g.x;
        const dz = localPlayer.z - g.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.1) {
          g.x += (dx / dist) * 16.0 * dt;
          g.z += (dz / dist) * 16.0 * dt;
        }
      });
    }

    // Ammo reload & Super overrides
    s.players.forEach((p) => {
      if (p.isAlive) {
        if (p.ammo < p.maxAmmo) {
          const reloadRate =
            debugSettings.infiniteAmmo || debugSettings.gatlingFire
              ? 30
              : 1 / p.brawler.baseStats.reloadSpeed;
          p.ammo = Math.min(p.maxAmmo, p.ammo + reloadRate * dt);
        }

        // Instant Super / Hypercharge / Unlimited Gadgets overrides
        if (p.isLocalPlayer) {
          if (debugSettings.instantSuper) {
            p.superCharge = 100;
          }
          if (debugSettings.instantHypercharge) {
            p.hyperchargeCharge = 100;
            p.isHypercharged = true;
            p.hyperchargeTimer = 999;
          }
          if (debugSettings.unlimitedGadgets) {
            p.gadgetCharges = 99;
          }
        }

        // Hypercharge timer
        if (p.isHypercharged && !debugSettings.instantHypercharge) {
          p.hyperchargeTimer -= dt;
          if (p.hyperchargeTimer <= 0) {
            p.isHypercharged = false;
          }
        }
      } else {
        // Respawn logic (Gem Grab mode)
        p.respawnTimer -= dt;
        if (p.respawnTimer <= 0 && gameMode === 'Gem Grab 3v3') {
          p.isAlive = true;
          p.health = p.maxHealth;
          p.ammo = p.maxAmmo;
          p.x = p.team === 'blue' ? 0 : 0;
          p.z = p.team === 'blue' ? 14 : -14;
        }
      }
    });

    // 2. Bushes Stealth Check
    s.players.forEach((p) => {
      let inBush = false;
      for (const obs of s.obstacles) {
        if (obs.type === 'bush') {
          const dist = Math.hypot(p.x - obs.x, p.z - obs.z);
          if (dist < 1.4) {
            inBush = true;
            break;
          }
        }
      }
      p.isInBush = inBush;
    });

    // 3. Bot AI Behavior (if enabled and not frozen by 1738)
    if (debugSettings.botAiEnabled && !debugSettings.freezeBots) {
      s.players.forEach((bot) => {
        if (bot.isLocalPlayer || !bot.isAlive) return;

        // Target nearest gem or nearest enemy
        const enemies = s.players.filter((p) => p.team !== bot.team && p.isAlive);
        let targetX = 0;
        let targetZ = 0;

        // Collect gems if available
        if (s.gems.length > 0 && gameMode === 'Gem Grab 3v3') {
          const nearestGem = s.gems[0];
          targetX = nearestGem.x;
          targetZ = nearestGem.z;
        } else if (enemies.length > 0) {
          // Attack closest visible enemy
          let closestEnemy = enemies[0];
          let minDist = 9999;
          enemies.forEach((en) => {
            const d = Math.hypot(bot.x - en.x, bot.z - en.z);
            if (d < minDist && (!en.isInBush || d < 3.5)) {
              minDist = d;
              closestEnemy = en;
            }
          });

          targetX = closestEnemy.x;
          targetZ = closestEnemy.z;

          // If within range, shoot based on difficulty (unless Pacifist Bots is active)
          const attackRange = bot.brawler.attack.range || 8.0;
          const fireProb =
            debugSettings.botDifficulty === 'nightmare'
              ? 0.08
              : debugSettings.botDifficulty === 'easy'
              ? 0.02
              : 0.04;
          if (!debugSettings.pacifistBots && minDist < attackRange && bot.ammo >= 1) {
            bot.rotY = Math.atan2(closestEnemy.x - bot.x, closestEnemy.z - bot.z);
            if (Math.random() < fireProb) {
              spawnProjectiles(bot, bot.rotY, false);
            }
          }
        }

        // Move towards target with distance keeping
        const dx = targetX - bot.x;
        const dz = targetZ - bot.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 3.0) {
          const diffSpeedMult =
            debugSettings.botDifficulty === 'nightmare'
              ? 1.15
              : debugSettings.botDifficulty === 'easy'
              ? 0.7
              : 0.85;
          const spd = bot.brawler.baseStats.speed * diffSpeedMult;
          const nx = bot.x + (dx / dist) * spd * dt;
          const nz = bot.z + (dz / dist) * spd * dt;
          if (!isCollidingWithWall(nx, nz, 0.6)) {
            bot.x = nx;
            bot.z = nz;
          }
          bot.rotY = Math.atan2(dx, dz);
        }
      });
    }

    // 4. Gem Spawning & Pickup (Gem Grab Mode)
    if (gameMode === 'Gem Grab 3v3') {
      s.gemSpawnTimer -= dt;
      if (s.gemSpawnTimer <= 0 && s.gems.length < 10) {
        s.gemSpawnTimer = 5.0;
        s.gems.push({
          id: `gem_${Date.now()}_${Math.random()}`,
          x: (Math.random() - 0.5) * 1.5,
          z: (Math.random() - 0.5) * 1.5,
          vy: 3.5,
          y: 0.5,
        });
      }

      // Pick up gems
      s.gems = s.gems.filter((gem) => {
        let picked = false;
        s.players.forEach((p) => {
          if (!picked && p.isAlive) {
            const dist = Math.hypot(p.x - gem.x, p.z - gem.z);
            if (dist < 1.3) {
              p.gemsCarried += 1;
              picked = true;
              soundManager.playGemPickup();
            }
          }
        });
        return !picked;
      });

      // 2.0 In-Match Paula Drop pickup & combat buffs
      s.paulaDrops = s.paulaDrops.filter((drop) => {
        let picked = false;
        s.players.forEach((p) => {
          if (!picked && p.isAlive) {
            const dist = Math.hypot(p.x - drop.x, p.z - drop.z);
            if (dist < 1.4) {
              picked = true;
              soundManager.playStarrDropRarity(drop.rarity);
              soundManager.playHypercharge();
              p.superCharge = 100;
              p.hyperchargeCharge = 100;
              p.isHypercharged = true;
              p.hyperchargeTimer = 7.0;
              p.ammo = p.maxAmmo;
              if (p.isLocalPlayer) {
                confetti({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              }
              s.damageNumbers.push({
                id: `pdrop_${Date.now()}`,
                text: `★ ${drop.rarity.toUpperCase()} DROP BUFF!`,
                x: p.x,
                y: 2.3,
                z: p.z,
                color: drop.rarity === 'legendary' ? '#facc15' : drop.rarity === 'mythic' ? '#f43f5e' : '#38bdf8',
                timeRemaining: 1.5,
              });
            }
          }
        });
        return !picked;
      });

      // Gem victory countdown check
      const blueGems = s.players.filter((p) => p.team === 'blue').reduce((acc, p) => acc + p.gemsCarried, 0);
      const redGems = s.players.filter((p) => p.team === 'red').reduce((acc, p) => acc + p.gemsCarried, 0);

      if (blueGems >= 10 && blueGems > redGems) {
        if (s.countdownTeam !== 'blue') {
          s.countdownTeam = 'blue';
          s.countdownTimer = 15;
        } else {
          s.countdownTimer -= dt;
          if (s.countdownTimer <= 0) {
            handleVictory('blue');
          }
        }
      } else if (redGems >= 10 && redGems > blueGems) {
        if (s.countdownTeam !== 'red') {
          s.countdownTeam = 'red';
          s.countdownTimer = 15;
        } else {
          s.countdownTimer -= dt;
          if (s.countdownTimer <= 0) {
            handleVictory('red');
          }
        }
      } else {
        s.countdownTeam = null;
        s.countdownTimer = 15;
      }
    } else {
      // Showdown Solo: Toxic gas shrinks map
      if (!debugSettings.pauseToxicGas) {
        s.toxicRadius = Math.max(5, s.toxicRadius - dt * 0.7);
      }

      // Check alive rivals
      const alivePlayers = s.players.filter((p) => p.isAlive);
      if (alivePlayers.length === 1 && alivePlayers[0].isLocalPlayer) {
        handleVictory('blue');
      } else if (!localPlayer.isAlive) {
        handleVictory('red');
      }

      // Toxic gas damage
      s.players.forEach((p) => {
        if (p.isAlive) {
          const distFromCenter = Math.hypot(p.x, p.z);
          if (distFromCenter > s.toxicRadius) {
            applyDamage(p, Math.round(1000 * dt), 'gas');
          }
        }
      });
    }

    // 5. Update Projectiles
    s.projectiles.forEach((proj) => {
      proj.x += proj.vx * dt;
      proj.z += proj.vz * dt;
      proj.lifetime += dt;

      // Hit obstacles
      for (const obs of s.obstacles) {
        if (obs.blocksBullets && !obs.destroyed) {
          const dist = Math.hypot(proj.x - obs.x, proj.z - obs.z);
          if (dist < 1.0) {
            proj.lifetime = proj.maxLifetime; // Explode
            if (obs.isBreakable) {
              obs.health -= proj.damage;
              if (obs.health <= 0) {
                obs.destroyed = true;
                soundManager.playHit();
              }
            }
            break;
          }
        }
      }

      // Hit players
      s.players.forEach((target) => {
        if (target.isAlive && proj.lifetime < proj.maxLifetime) {
          const dist = Math.hypot(proj.x - target.x, proj.z - target.z);
          if (dist < 0.9) {
            if (proj.team !== target.team) {
              // Enemy hit
              proj.lifetime = proj.maxLifetime;
              applyDamage(target, proj.damage, 'enemy', proj.ownerId);

              // Charge shooter's super & hypercharge
              const shooter = s.players.find((p) => p.id === proj.ownerId);
              if (shooter) {
                const chargeGain = 100 / shooter.brawler.baseStats.superChargeHits;
                shooter.superCharge = Math.min(100, shooter.superCharge + chargeGain);
                shooter.hyperchargeCharge = Math.min(100, shooter.hyperchargeCharge + chargeGain * 0.4);
                if (shooter.superCharge >= 100 && shooter.isLocalPlayer) {
                  soundManager.playSuperReady();
                }
              }
            } else if (proj.healing && target.health < target.maxHealth) {
              // Allied healing (Nyx spore burst)
              proj.lifetime = proj.maxLifetime;
              target.health = Math.min(target.maxHealth, target.health + proj.healing);
              s.damageNumbers.push({
                id: `heal_${Date.now()}_${Math.random()}`,
                text: `+${proj.healing}`,
                x: target.x,
                y: 1.8,
                z: target.z,
                color: '#4ade80',
                timeRemaining: 0.8,
              });
            }
          }
        }
      });
    });

    // Clean up finished projectiles
    s.projectiles = s.projectiles.filter((p) => p.lifetime < p.maxLifetime);

    // 6. Update Damage Numbers
    s.damageNumbers.forEach((d) => {
      d.y += dt * 1.5;
      d.timeRemaining -= dt;
    });
    s.damageNumbers = s.damageNumbers.filter((d) => d.timeRemaining > 0);

    // 7. Update HUD
    const blueGemsTotal = s.players.filter((p) => p.team === 'blue').reduce((acc, p) => acc + p.gemsCarried, 0);
    const redGemsTotal = s.players.filter((p) => p.team === 'red').reduce((acc, p) => acc + p.gemsCarried, 0);

    setHudState({
      health: localPlayer.health,
      maxHealth: localPlayer.maxHealth,
      ammo: Math.floor(localPlayer.ammo),
      maxAmmo: localPlayer.maxAmmo,
      superCharge: localPlayer.superCharge,
      isSuperReady: localPlayer.superCharge >= 100,
      hyperCharge: localPlayer.hyperchargeCharge,
      isHypercharged: localPlayer.isHypercharged,
      blueGems: blueGemsTotal,
      redGems: redGemsTotal,
      countdown: s.countdownTeam ? Math.ceil(s.countdownTimer) : null,
      brawlersRemaining: s.players.filter((p) => p.isAlive).length,
      kills: localPlayer.kills,
      gadgetCharges: localPlayer.gadgetCharges,
    });
  };

  // Wall collision helper
  const isCollidingWithWall = (x: number, z: number, radius = 0.6) => {
    for (const obs of stateRef.current.obstacles) {
      if (obs.blocksWalk && !obs.destroyed) {
        const halfW = obs.width / 2;
        const halfD = obs.depth / 2;
        if (
          x + radius > obs.x - halfW &&
          x - radius < obs.x + halfW &&
          z + radius > obs.z - halfD &&
          z - radius < obs.z + halfD
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Apply Damage with death & gem dropping
  const applyDamage = (target: PlayerCharacter, amount: number, source: string, attackerId?: string) => {
    if (target.isLocalPlayer && debugSettings.godMode) return;

    target.health = Math.max(0, target.health - amount);
    soundManager.playHit();

    // Damage number popup
    stateRef.current.damageNumbers.push({
      id: `dmg_${Date.now()}_${Math.random()}`,
      text: `-${amount}`,
      x: target.x + (Math.random() - 0.5) * 0.5,
      y: 1.8,
      z: target.z,
      color: source === 'gas' ? '#a855f7' : '#ef4444',
      timeRemaining: 0.8,
    });

    if (target.isLocalPlayer) {
      stateRef.current.shakeIntensity = 0.4;
    }

    if (target.health <= 0) {
      target.isAlive = false;
      target.deaths += 1;
      target.respawnTimer = 5.0;

      if (attackerId) {
        const killer = stateRef.current.players.find((p) => p.id === attackerId);
        if (killer) killer.kills += 1;
      }

      // Drop all held gems!
      if (target.gemsCarried > 0) {
        for (let i = 0; i < target.gemsCarried; i++) {
          stateRef.current.gems.push({
            id: `drop_${Date.now()}_${i}`,
            x: target.x + (Math.random() - 0.5) * 2,
            z: target.z + (Math.random() - 0.5) * 2,
            vy: 4.0,
            y: 0.5,
          });
        }
        target.gemsCarried = 0;
      }

      // 2.0 In-Match Paula Drop spawn on enemy defeat (45% chance)
      if (!target.isLocalPlayer && Math.random() < 0.45) {
        const rarities: ('rare' | 'epic' | 'mythic' | 'legendary')[] = ['rare', 'rare', 'epic', 'mythic'];
        const pickedRarity = rarities[Math.floor(Math.random() * rarities.length)];
        stateRef.current.paulaDrops.push({
          id: `pdrop_${Date.now()}_${Math.random()}`,
          x: target.x,
          z: target.z,
          y: 0.5,
          vy: 3.5,
          rarity: pickedRarity,
        });
      }
    }
  };

  // Spawn Projectiles
  const spawnProjectiles = (shooter: PlayerCharacter, angle: number, isSuper: boolean) => {
    const brawler = shooter.brawler;
    const attackData = isSuper ? brawler.superAbility : brawler.attack;

    if (!isSuper && shooter.ammo < 1 && !debugSettings.infiniteAmmo) return;
    if (!isSuper && !debugSettings.infiniteAmmo) {
      shooter.ammo = Math.max(0, shooter.ammo - 1);
    }
    if (isSuper) {
      shooter.superCharge = 0;
    }

    soundManager.playShoot(isSuper ? 'super' : brawler.attack.projectileType);

    const isCluster = debugSettings.clusterShot && shooter.isLocalPlayer && !isSuper;
    const count = isSuper ? 1 : isCluster ? 12 : brawler.attack.projectileCount;
    const speed = isSuper ? 20 : brawler.attack.projectileSpeed;
    const spread = isSuper ? 0 : isCluster ? (Math.PI * 2) / 12 : brawler.attack.spreadAngle;
    const baseDamage = attackData.damage || 1000;
    const mult =
      shooter.isLocalPlayer && debugSettings.oneHitKill
        ? 99999
        : shooter.isLocalPlayer
        ? debugSettings.damageMultiplier || 1.0
        : 1.0;
    const damage = Math.round(baseDamage * mult);
    const range =
      (attackData.range || 8.0) *
      (shooter.isLocalPlayer ? debugSettings.rangeMultiplier || 1.0 : 1.0);

    for (let i = 0; i < count; i++) {
      const offsetAngle = count === 1 ? 0 : (i - (count - 1) / 2) * spread;
      const finalAngle = angle + offsetAngle;
      const vx = Math.sin(finalAngle) * speed;
      const vz = Math.cos(finalAngle) * speed;

      stateRef.current.projectiles.push({
        id: `proj_${Date.now()}_${Math.random()}`,
        ownerId: shooter.id,
        team: shooter.team,
        x: shooter.x + Math.sin(finalAngle) * 0.8,
        z: shooter.z + Math.cos(finalAngle) * 0.8,
        vx,
        vz,
        startY: 1.0,
        currentY: 1.0,
        type: isSuper ? 'super' : brawler.attack.projectileType,
        damage,
        healing: !isSuper && brawler.attack.healing ? brawler.attack.healing : undefined,
        radius: isSuper ? 1.5 : 0.4,
        lifetime: 0,
        maxLifetime: range / speed,
        color: isSuper ? '#facc15' : brawler.accentColor,
      });
    }
  };

  // Quick Action Triggers
  const triggerQuickAttack = () => {
    const s = stateRef.current;
    const p = s.players.find((pl) => pl.isLocalPlayer);
    if (!p || !p.isAlive) return;

    // Find nearest visible enemy
    const enemies = s.players.filter((en) => en.team !== p.team && en.isAlive);
    let targetAngle = p.rotY;
    let minDist = 999;
    enemies.forEach((en) => {
      const d = Math.hypot(p.x - en.x, p.z - en.z);
      if (d < minDist && (!en.isInBush || d < 3.0)) {
        minDist = d;
        targetAngle = Math.atan2(en.x - p.x, en.z - p.z);
      }
    });

    p.rotY = targetAngle;
    spawnProjectiles(p, targetAngle, false);
  };

  const triggerQuickSuper = () => {
    const s = stateRef.current;
    const p = s.players.find((pl) => pl.isLocalPlayer);
    if (!p || !p.isAlive || p.superCharge < 100) return;

    const enemies = s.players.filter((en) => en.team !== p.team && en.isAlive);
    let targetAngle = p.rotY;
    let minDist = 999;
    enemies.forEach((en) => {
      const d = Math.hypot(p.x - en.x, p.z - en.z);
      if (d < minDist) {
        minDist = d;
        targetAngle = Math.atan2(en.x - p.x, en.z - p.z);
      }
    });

    p.rotY = targetAngle;
    spawnProjectiles(p, targetAngle, true);
  };

  const triggerGadget = () => {
    const s = stateRef.current;
    const p = s.players.find((pl) => pl.isLocalPlayer);
    if (!p || !p.isAlive || p.gadgetCharges <= 0) return;

    p.gadgetCharges -= 1;
    soundManager.playHit();
    // Heal or shield
    p.health = Math.min(p.maxHealth, p.health + 1500);
    s.damageNumbers.push({
      id: `gadget_${Date.now()}`,
      text: 'GADGET ACTIVATED!',
      x: p.x,
      y: 2.2,
      z: p.z,
      color: '#38bdf8',
      timeRemaining: 1.2,
    });
  };

  const triggerHypercharge = () => {
    const s = stateRef.current;
    const p = s.players.find((pl) => pl.isLocalPlayer);
    if (!p || !p.isAlive || p.hyperchargeCharge < 100 || p.isHypercharged) return;

    p.isHypercharged = true;
    p.hyperchargeTimer = 6.0;
    p.hyperchargeCharge = 0;
    soundManager.playHypercharge();
    s.damageNumbers.push({
      id: `hyp_${Date.now()}`,
      text: 'HYPERCHARGE!',
      x: p.x,
      y: 2.4,
      z: p.z,
      color: '#ec4899',
      timeRemaining: 1.5,
    });
  };

  const handleVictory = (winningTeam: 'blue' | 'red') => {
    if (stateRef.current.matchOver) return;
    stateRef.current.matchOver = true;
    const isWin = winningTeam === 'blue';

    if (isWin) {
      soundManager.playVictory();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
      setMatchResult('victory');
    } else {
      soundManager.playDefeat();
      setMatchResult('defeat');
    }
  };

  // Sync Three.js Visual Meshes with Physics Simulation
  const updateThreeScene = (dt: number) => {
    if (!threeRef.current) return;
    const {
      scene,
      camera,
      playerMeshes,
      obstacleMeshes,
      gemMeshes,
      paulaDropMeshes,
      projectileMeshes,
      toxicCircle,
      aimIndicator,
    } = threeRef.current;
    const s = stateRef.current;
    const localPlayer = s.players.find((p) => p.isLocalPlayer);

    // 1. Sync Players
    s.players.forEach((p) => {
      let mesh = playerMeshes.get(p.id);
      if (!mesh) {
        mesh = createBrawlerMesh(p.brawler, p.team === 'red');
        scene.add(mesh);
        playerMeshes.set(p.id, mesh);
      }

      // Smooth position damping
      mesh.position.x = THREE.MathUtils.damp(mesh.position.x, p.x, 18, dt);
      mesh.position.z = THREE.MathUtils.damp(mesh.position.z, p.z, 18, dt);
      mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, p.rotY, 18, dt);

      // Scale local player if altered by Debug 2.0 / 1738
      if (p.isLocalPlayer) {
        const sScale = debugSettings.brawlerScale || 1.0;
        mesh.scale.set(sScale, sScale, sScale);

        // 1738 Big Head Mode
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry?.type === 'SphereGeometry') {
            const headScale = debugSettings.bigHeadMode ? 2.4 : 1.0;
            child.scale.set(headScale, headScale, headScale);
          }
        });
      } else {
        mesh.scale.set(1, 1, 1);
      }

      // 1738 Wireframe Mode
      if (debugSettings.wireframeMode) {
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            mat.wireframe = true;
          }
        });
      }

      // Visibility & Bush stealth
      if (!p.isAlive) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
        // If in bush and not local player, hide unless close
        const distToLocal = localPlayer ? Math.hypot(p.x - localPlayer.x, p.z - localPlayer.z) : 999;
        const isHidden = p.isInBush && !p.isLocalPlayer && distToLocal > 3.0;
        mesh.visible = !isHidden;

        // Animate gear or props
        const gear = mesh.getObjectByName('spinning_gear');
        if (gear) gear.rotation.z += dt * 5;
      }
    });

    // 2. Sync Obstacles
    s.obstacles.forEach((obs) => {
      const m = obstacleMeshes.get(obs.id);
      if (m) {
        if (obs.destroyed) {
          m.visible = false;
        }
      }
    });

    // 3. Sync Gems
    // Remove old
    gemMeshes.forEach((mesh, id) => {
      if (!s.gems.find((g) => g.id === id)) {
        scene.remove(mesh);
        gemMeshes.delete(id);
      }
    });
    // Add / Update
    s.gems.forEach((gem) => {
      let mesh = gemMeshes.get(gem.id);
      if (!mesh) {
        mesh = createGemMesh();
        scene.add(mesh);
        gemMeshes.set(gem.id, mesh);
      }
      mesh.position.set(gem.x, 0.4 + Math.sin(performance.now() * 0.005) * 0.15, gem.z);
      mesh.rotation.y += dt * 3;
    });

    // 3.5 Sync 2.0 Paula Drops
    paulaDropMeshes.forEach((mesh, id) => {
      if (!s.paulaDrops.find((d) => d.id === id)) {
        scene.remove(mesh);
        paulaDropMeshes.delete(id);
      }
    });
    s.paulaDrops.forEach((drop) => {
      let mesh = paulaDropMeshes.get(drop.id);
      if (!mesh) {
        mesh = createPaulaDropMesh(drop.rarity);
        scene.add(mesh);
        paulaDropMeshes.set(drop.id, mesh);
      }
      mesh.position.set(drop.x, 0.45 + Math.sin(performance.now() * 0.006) * 0.2, drop.z);
      mesh.rotation.y += dt * 3.5;
    });

    // 4. Sync Projectiles
    projectileMeshes.forEach((mesh, id) => {
      if (!s.projectiles.find((p) => p.id === id)) {
        scene.remove(mesh);
        projectileMeshes.delete(id);
      }
    });

    s.projectiles.forEach((proj) => {
      let mesh = projectileMeshes.get(proj.id);
      if (!mesh) {
        const geo =
          proj.type === 'disc'
            ? new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12)
            : new THREE.SphereGeometry(proj.radius, 8, 8);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(proj.color),
          emissive: new THREE.Color(proj.color),
          emissiveIntensity: 0.8,
        });
        mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        projectileMeshes.set(proj.id, mesh);
      }
      mesh.position.set(proj.x, proj.currentY, proj.z);
      mesh.rotation.y += dt * 10;
    });

    // 5. Update Toxic Gas Circle (Showdown)
    if (toxicCircle) {
      if (gameMode === 'Showdown Solo') {
        toxicCircle.visible = true;
        toxicCircle.scale.set(s.toxicRadius / 35, s.toxicRadius / 35, 1);
      } else {
        toxicCircle.visible = false;
      }
    }

    // 6. Camera Follow
    if (localPlayer) {
      // Screen shake decay
      if (s.shakeIntensity > 0) {
        s.shakeIntensity = Math.max(0, s.shakeIntensity - dt * 2.5);
      }
      const shakeX = (Math.random() - 0.5) * s.shakeIntensity;
      const shakeZ = (Math.random() - 0.5) * s.shakeIntensity;

      if (cameraPreset === 'first_person') {
        // First Person POV directly inside Brawler visor
        const forwardX = Math.sin(localPlayer.rotY);
        const forwardZ = Math.cos(localPlayer.rotY);
        _camPos.set(localPlayer.x + forwardX * 0.2 + shakeX, 1.45, localPlayer.z + forwardZ * 0.2 + shakeZ);
        _camTarget.set(localPlayer.x + forwardX * 12, 1.45, localPlayer.z + forwardZ * 12);
      } else if (cameraPreset === 'isometric') {
        // Classic Brawl Stars Top-Down angle (55-degree pitch)
        _camPos.set(localPlayer.x + shakeX, 22, localPlayer.z + 16 + shakeZ);
        _camTarget.set(localPlayer.x, 1, localPlayer.z);
      } else if (cameraPreset === 'crazy_cam') {
        // Crazy Cam 3D: close behind the shoulder
        const forwardX = Math.sin(localPlayer.rotY);
        const forwardZ = Math.cos(localPlayer.rotY);
        _camPos.set(localPlayer.x - forwardX * 7 + shakeX, 6, localPlayer.z - forwardZ * 7 + shakeZ);
        _camTarget.set(localPlayer.x + forwardX * 6, 2, localPlayer.z + forwardZ * 6);
      } else {
        // Free look high overview
        _camPos.set(0, 36, 12);
        _camTarget.set(0, 0, 0);
      }

      camera.position.lerp(_camPos, 0.12);
      camera.lookAt(_camTarget);
    }
  };

  // Touch / Joystick Event Handlers
  const handleLeftTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setLeftStick({
      active: true,
      dx: (clientX - centerX) / (rect.width / 2),
      dy: (clientY - centerY) / (rect.height / 2),
    });
  };

  const handleLeftTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!leftStick.active) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;
    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const dist = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(rawDy, rawDx);

    setLeftStick({
      active: true,
      dx: (Math.cos(angle) * clampedDist) / maxRadius,
      dy: (Math.sin(angle) * clampedDist) / maxRadius,
    });
  };

  const handleLeftTouchEnd = () => {
    setLeftStick({ active: false, dx: 0, dy: 0 });
  };

  // Right Stick: Aiming & Shooting
  const handleRightTouchStart = (e: React.TouchEvent | React.MouseEvent, isSuper = false) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (clientX - centerX) / (rect.width / 2);
    const dy = (clientY - centerY) / (rect.height / 2);

    setRightStick({ active: true, dx, dy, isSuper });

    const localPlayer = stateRef.current.players.find((p) => p.isLocalPlayer);
    if (localPlayer) {
      localPlayer.isAiming = true;
      localPlayer.aimAngle = Math.atan2(dx, dy);
      localPlayer.rotY = localPlayer.aimAngle;
    }
  };

  const handleRightTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!rightStick.active) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;
    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const dist = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(rawDy, rawDx);

    const dx = (Math.cos(angle) * clampedDist) / maxRadius;
    const dy = (Math.sin(angle) * clampedDist) / maxRadius;

    setRightStick((prev) => ({ ...prev, dx, dy }));

    const localPlayer = stateRef.current.players.find((p) => p.isLocalPlayer);
    if (localPlayer) {
      localPlayer.aimAngle = Math.atan2(dx, dy);
      localPlayer.rotY = localPlayer.aimAngle;
    }
  };

  const handleRightTouchEnd = () => {
    if (!rightStick.active) return;
    const localPlayer = stateRef.current.players.find((p) => p.isLocalPlayer);
    if (localPlayer && localPlayer.isAlive) {
      const mag = Math.hypot(rightStick.dx, rightStick.dy);
      if (mag < 0.25) {
        // Tap = Auto-aim!
        if (rightStick.isSuper) triggerQuickSuper();
        else triggerQuickAttack();
      } else {
        // Drag release = Skill shot!
        spawnProjectiles(localPlayer, localPlayer.aimAngle, rightStick.isSuper);
      }
      localPlayer.isAiming = false;
    }
    setRightStick({ active: false, dx: 0, dy: 0, isSuper: false });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Damage Numbers Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {stateRef.current.damageNumbers.map((d) => (
          <div
            key={d.id}
            className="absolute font-brawl text-xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{
              left: `calc(50% + ${d.x * 24}px)`,
              top: `calc(50% + ${d.z * 18 - d.y * 30}px)`,
              color: d.color,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {d.text}
          </div>
        ))}
      </div>

      {/* 1738 Retro CRT Scanline & Chromatic Vignette Filter */}
      {debugSettings.crtShader && (
        <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)]">
          <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.4),rgba(0,0,0,0.4)_2px,transparent_2px,transparent_4px)]" />
        </div>
      )}

      {/* Live Telemetry Profiler 2.0 HUD Overlay */}
      {debugSettings.showFpsOverlay && (
        <div className="absolute top-14 left-4 z-30 bg-slate-950/90 border-2 border-emerald-500/80 rounded-2xl px-4 py-2.5 text-[11px] font-mono text-emerald-400 shadow-2xl backdrop-blur-xs flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white font-brawl tracking-wider text-xs">
              TITAN QA PROFILER 2.0
            </span>
            <span className="text-slate-600">|</span>
            <span className="font-bold text-emerald-300">{telemetry.fps} FPS</span>
            <span className="text-slate-400 text-[10px]">({telemetry.frameTime}ms)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-[10px]">
            <span>
              PING: <strong className="text-amber-400">{debugSettings.simulatedLatency}ms</strong>
            </span>
            <span>
              LOSS: <strong className="text-rose-400">{debugSettings.packetLoss}%</strong>
            </span>
            <span>
              ENTITIES: <strong className="text-sky-300">{telemetry.entities}</strong>
            </span>
            <span>
              DRAWS: <strong className="text-purple-300">{telemetry.drawCalls}</strong>
            </span>
            <span>
              TICK: <strong className="text-emerald-400">60Hz</strong>
            </span>
          </div>
        </div>
      )}

      {/* TOP MATCH HUD */}
      <div className="absolute top-3 left-0 right-0 px-4 flex justify-between items-center pointer-events-none z-10">
        {/* Left: Exit match & Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExitMatch}
            className="pointer-events-auto px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-brawl text-sm border-2 border-slate-900 shadow-md active:translate-y-0.5"
          >
            LEAVE
          </button>
          <div className="bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 text-xs font-brawl text-slate-300">
            {gameMode}
          </div>
        </div>

        {/* Center: Score / Gem Counter or Remaining Brawlers */}
        {gameMode === 'Gem Grab 3v3' ? (
          <div className="flex items-center gap-4 bg-slate-950/85 px-4 py-2 rounded-2xl border-2 border-slate-800 shadow-xl">
            {/* Blue Gems */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-700 rounded-sm rotate-45 shadow-sm" />
              <span className="font-brawl text-2xl text-cyan-400 brawl-stroke-sm">
                {hudState.blueGems}
              </span>
            </div>

            {/* Countdown Banner */}
            {hudState.countdown !== null && (
              <div className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg font-brawl text-lg animate-bounce">
                HOLD GEMS: {hudState.countdown}s
              </div>
            )}

            <span className="font-brawl text-slate-400 text-lg">VS</span>

            {/* Red Gems */}
            <div className="flex items-center gap-2">
              <span className="font-brawl text-2xl text-rose-400 brawl-stroke-sm">
                {hudState.redGems}
              </span>
              <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-700 rounded-sm rotate-45 shadow-sm" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/85 px-4 py-2 rounded-2xl border-2 border-slate-800 flex items-center gap-2">
            <span className="font-brawl text-amber-400 text-lg">BRAWLERS LEFT:</span>
            <span className="font-brawl text-2xl text-white brawl-stroke-sm">
              {hudState.brawlersRemaining} / 6
            </span>
          </div>
        )}

        {/* Right: Kills & Sound */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-sm font-brawl text-amber-400">
            ★ {hudState.kills} KILLS
          </div>
          <button
            onClick={() => {
              soundManager.isMuted = !soundManager.isMuted;
            }}
            className="pointer-events-auto p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
            title="Toggle Sound"
          >
            🔊
          </button>
          {onOpenDebug && (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenDebug();
              }}
              className="pointer-events-auto p-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-slate-950 font-brawl border-2 border-amber-300 shadow-md active:translate-y-0.5"
              title="Open Dev Debug Suite 2.0"
            >
              🛠️
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM CONTROLS & JOYS */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-10">
        {/* LEFT VIRTUAL JOYSTICK (Movement) */}
        <div
          className="relative w-36 h-36 rounded-full bg-slate-900/40 border-4 border-slate-600/60 pointer-events-auto touch-none flex items-center justify-center shadow-2xl backdrop-blur-none"
          onMouseDown={handleLeftTouchStart}
          onMouseMove={handleLeftTouchMove}
          onMouseUp={handleLeftTouchEnd}
          onMouseLeave={handleLeftTouchEnd}
          onTouchStart={handleLeftTouchStart}
          onTouchMove={handleLeftTouchMove}
          onTouchEnd={handleLeftTouchEnd}
        >
          {/* Thumb Nub */}
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 border-2 border-white shadow-lg pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${leftStick.dx * 36}px, ${leftStick.dy * 36}px)`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/60 font-brawl text-xs">
              MOVE
            </div>
          </div>
        </div>

        {/* CENTER PLAYER STATUS BARS */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-none mb-2">
          {/* Health Bar */}
          <div className="w-48 bg-slate-950/90 rounded-full p-1 border-2 border-slate-800 shadow-lg">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-150 flex items-center justify-center"
              style={{ width: `${(hudState.health / hudState.maxHealth) * 100}%` }}
            >
              <span className="font-brawl text-[10px] text-slate-950 font-black">
                {hudState.health} / {hudState.maxHealth}
              </span>
            </div>
          </div>

          {/* Ammo Bars (3 pip slots) */}
          <div className="flex gap-1.5 w-48">
            {[0, 1, 2].map((slot) => {
              const fill = Math.min(1, Math.max(0, hudState.ammo - slot));
              return (
                <div
                  key={slot}
                  className="flex-1 h-2.5 bg-slate-950/80 rounded-full border border-slate-700 overflow-hidden"
                >
                  <div
                    className="h-full bg-amber-400 transition-all duration-75"
                    style={{ width: `${fill * 100}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-brawl text-slate-400 tracking-wider">
            WASD: MOVE · SPACE: SHOOT · E: SUPER · F: GADGET · R: HYPERCHARGE
          </div>
        </div>

        {/* RIGHT ACTION BUTTON CLUSTER (Attack, Super, Gadget, Hypercharge) */}
        <div className="relative w-52 h-44 pointer-events-auto touch-none">
          {/* 1. Main Attack Red Stick */}
          <div
            className="absolute bottom-0 right-0 w-28 h-28 rounded-full bg-rose-950/60 border-4 border-rose-600/80 flex items-center justify-center shadow-2xl active:scale-95"
            onMouseDown={(e) => handleRightTouchStart(e, false)}
            onMouseMove={handleRightTouchMove}
            onMouseUp={handleRightTouchEnd}
            onMouseLeave={handleRightTouchEnd}
            onTouchStart={(e) => handleRightTouchStart(e, false)}
            onTouchMove={handleRightTouchMove}
            onTouchEnd={handleRightTouchEnd}
          >
            <div
              className="w-16 h-16 rounded-full brawl-btn-red flex flex-col items-center justify-center text-white pointer-events-none transition-transform"
              style={{
                transform:
                  rightStick.active && !rightStick.isSuper
                    ? `translate(${rightStick.dx * 28}px, ${rightStick.dy * 28}px)`
                    : 'none',
              }}
            >
              <span className="font-brawl text-lg font-black tracking-wider">AIM</span>
              <span className="text-[9px] font-brawl text-rose-100 opacity-80">TAP: FIRE</span>
            </div>
          </div>

          {/* 2. Yellow Super Button */}
          <button
            disabled={!hudState.isSuperReady}
            onMouseDown={(e) => hudState.isSuperReady && handleRightTouchStart(e, true)}
            onMouseMove={handleRightTouchMove}
            onMouseUp={handleRightTouchEnd}
            onTouchStart={(e) => hudState.isSuperReady && handleRightTouchStart(e, true)}
            onTouchMove={handleRightTouchMove}
            onTouchEnd={handleRightTouchEnd}
            className={`absolute top-2 right-24 w-16 h-16 rounded-full border-3 border-slate-900 flex flex-col items-center justify-center shadow-lg transition-all ${
              hudState.isSuperReady
                ? 'brawl-btn-yellow scale-105 animate-pulse cursor-pointer'
                : 'bg-slate-800/80 border-slate-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <span className="text-xl">💀</span>
            <span className="font-brawl text-[10px] text-slate-950 font-black">SUPER</span>
          </button>

          {/* 3. Green Gadget Button */}
          <button
            onClick={triggerGadget}
            disabled={hudState.gadgetCharges <= 0}
            className={`absolute bottom-2 right-32 w-12 h-12 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center shadow-md ${
              hudState.gadgetCharges > 0
                ? 'brawl-btn-green cursor-pointer'
                : 'bg-slate-800 border-slate-700 opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="text-sm">⚡</span>
            <span className="font-brawl text-[8px] text-white">x{hudState.gadgetCharges}</span>
          </button>

          {/* 4. Magenta Hypercharge Button */}
          {hudState.hyperCharge >= 100 && (
            <button
              onClick={triggerHypercharge}
              className="absolute -top-6 right-8 w-14 h-14 rounded-full brawl-btn-purple border-3 border-amber-300 flex flex-col items-center justify-center shadow-2xl animate-bounce cursor-pointer"
            >
              <span className="text-lg">🔥</span>
              <span className="font-brawl text-[9px] text-white font-black">HYPER</span>
            </button>
          )}
        </div>
      </div>

      {/* MATCH VICTORY / DEFEAT MODAL */}
      {matchResult && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[420px] bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-slate-700 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
            <div
              className={`font-brawl text-5xl mb-2 brawl-stroke ${
                matchResult === 'victory' ? 'text-amber-400' : 'text-rose-500'
              }`}
            >
              {matchResult === 'victory' ? 'VICTORY!' : 'DEFEAT'}
            </div>

            <p className="text-slate-300 font-brawl text-sm mb-6">
              {matchResult === 'victory'
                ? 'Outstanding performance in the arena!'
                : 'Regroup and upgrade your brawler to conquer the next match.'}
            </p>

            {/* Rewards */}
            <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700 mb-6 flex justify-around">
              <div className="flex flex-col items-center">
                <span className="text-2xl">🏆</span>
                <span className="font-brawl text-lg text-amber-400">
                  {matchResult === 'victory' ? '+8 Trophies' : '-4 Trophies'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">⭐</span>
                <span className="font-brawl text-lg text-purple-400">
                  {matchResult === 'victory' ? '+45 Mastery' : '+10 Mastery'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">🪙</span>
                <span className="font-brawl text-lg text-yellow-400">
                  {matchResult === 'victory' ? '+60 Gold' : '+20 Gold'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const trophies = matchResult === 'victory' ? 8 : -4;
                const mastery = matchResult === 'victory' ? 45 : 10;
                onMatchEnd(matchResult === 'victory', trophies, mastery);
              }}
              className="w-full py-4 rounded-2xl brawl-btn-yellow font-brawl text-2xl text-slate-950 tracking-wide font-black"
            >
              PROCEED TO LOBBY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
