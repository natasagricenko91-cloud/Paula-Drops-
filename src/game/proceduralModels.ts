import * as THREE from 'three';
import { BrawlerData } from '../types/game';

/**
 * Creates a soft radial contact shadow plane
 */
export function createContactShadow(radius = 0.8): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(geo, mat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  return shadowMesh;
}

/**
 * Procedural 3-12 Part Composite Hero Mesh
 */
export function createBrawlerMesh(brawler: BrawlerData, isEnemy = false): THREE.Group {
  const group = new THREE.Group();
  group.name = `brawler_${brawler.id}`;

  const primaryColor = isEnemy ? 0xef4444 : brawler.modelStyle.primaryColor;
  const accentColor = brawler.modelStyle.accentColor;

  // 1. Contact shadow
  group.add(createContactShadow(0.9));

  if (brawler.id === 'vexa') {
    // VEXA: Chrono Assassin
    // Torso (Cyan clockwork coat)
    const torsoGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 8);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.4,
      metalness: 0.3,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.8;
    torso.castShadow = true;
    group.add(torso);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.3, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.3, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Head
    const headGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.45;
    head.castShadow = true;
    group.add(head);

    // Chrono Visor / Goggles
    const visorGeo = new THREE.BoxGeometry(0.48, 0.15, 0.2);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.48, 0.25);
    group.add(visor);

    // Clockwork Gear Backpack
    const gearGeo = new THREE.TorusGeometry(0.38, 0.08, 8, 16);
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const gear = new THREE.Mesh(gearGeo, gearMat);
    gear.position.set(0, 0.9, -0.4);
    gear.name = 'spinning_gear';
    group.add(gear);

    // Weapon: Chronoblade in hand
    const bladeGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.9,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.rotation.x = Math.PI / 2;
    blade.position.set(0.55, 0.8, 0.4);
    blade.name = 'weapon';
    group.add(blade);

  } else if (brawler.id === 'gulliver') {
    // GULLIVER: Heavy Diving Bell Artillery
    // Torso: Chunky brass diving sphere
    const bellGeo = new THREE.SphereGeometry(0.65, 12, 12);
    const bellMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.3,
      metalness: 0.75,
    });
    const bell = new THREE.Mesh(bellGeo, bellMat);
    bell.position.y = 0.95;
    bell.castShadow = true;
    group.add(bell);

    // Heavy iron legs
    const legGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7, metalness: 0.5 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.35, 0.25, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.35, 0.25, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Porthole Glass with cage
    const portGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12);
    const portMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.7,
      roughness: 0.1,
    });
    const port = new THREE.Mesh(portGeo, portMat);
    port.rotation.x = Math.PI / 2;
    port.position.set(0, 1.05, 0.6);
    group.add(port);

    // Steam Exhaust Chimney
    const chimGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.45, 8);
    const chimMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.8, roughness: 0.3 });
    const chimney = new THREE.Mesh(chimGeo, chimMat);
    chimney.position.set(0, 1.65, -0.2);
    group.add(chimney);

    // Giant Steam Mortar Cannon
    const mortarGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.8, 10);
    const mortarMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.2 });
    const mortar = new THREE.Mesh(mortarGeo, mortarMat);
    mortar.rotation.x = Math.PI / 3;
    mortar.position.set(0.7, 1.1, 0.35);
    mortar.name = 'weapon';
    group.add(mortar);

  } else {
    // NYX: Bioluminescent Sprite
    // Robe / Body
    const robeGeo = new THREE.ConeGeometry(0.42, 0.9, 10);
    const robeMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.4,
      metalness: 0.1,
    });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.55;
    robe.castShadow = true;
    group.add(robe);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.25;
    head.castShadow = true;
    group.add(head);

    // Giant Bioluminescent Mushroom Cap / Hood
    const capGeo = new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x10b981,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.35;
    cap.castShadow = true;
    group.add(cap);

    // Fairy wings / Spore emitters
    const wingGeo = new THREE.PlaneGeometry(0.4, 0.6);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.35, 1.0, -0.25);
    leftWing.rotation.y = -Math.PI / 6;
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.35, 1.0, -0.25);
    rightWing.rotation.y = Math.PI / 6;
    group.add(rightWing);

    // Bio Staff
    const staffGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6);
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const staff = new THREE.Mesh(staffGeo, staffMat);
    staff.position.set(0.5, 0.75, 0.3);

    const orbGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x34d399,
      emissiveIntensity: 0.8,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 0.65;
    staff.add(orb);
    staff.name = 'weapon';
    group.add(staff);
  }

  // Team Ring Indicator at feet
  const ringGeo = new THREE.RingGeometry(0.65, 0.78, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isEnemy ? 0xef4444 : 0x3b82f6,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);

  return group;
}

/**
 * Breakable Wooden Crate (3-part composite)
 */
export function createCrateMesh(): THREE.Group {
  const group = new THREE.Group();

  // Core box
  const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.8,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = 0.6;
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);

  // Metal Corner bands
  const bandGeo = new THREE.BoxGeometry(1.24, 0.15, 1.24);
  const bandMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.6,
    roughness: 0.4,
  });
  const topBand = new THREE.Mesh(bandGeo, bandMat);
  topBand.position.y = 1.05;
  group.add(topBand);

  const btmBand = new THREE.Mesh(bandGeo, bandMat);
  btmBand.position.y = 0.15;
  group.add(btmBand);

  // Skull icon / crate stencil
  const stencilGeo = new THREE.PlaneGeometry(0.5, 0.5);
  const stencilMat = new THREE.MeshBasicMaterial({
    color: 0x1e293b,
  });
  const stencil = new THREE.Mesh(stencilGeo, stencilMat);
  stencil.position.set(0, 0.6, 0.61);
  group.add(stencil);

  return group;
}

/**
 * Destructible Stone Wall (Stone block)
 */
export function createWallMesh(): THREE.Group {
  const group = new THREE.Group();

  const wallGeo = new THREE.BoxGeometry(1.4, 1.6, 1.4);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.9,
    metalness: 0.1,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = 0.8;
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);

  // Top moss accent
  const mossGeo = new THREE.BoxGeometry(1.42, 0.2, 1.42);
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.9,
  });
  const moss = new THREE.Mesh(mossGeo, mossMat);
  moss.position.y = 1.55;
  group.add(moss);

  return group;
}

/**
 * Bush Patch (Stealth Grass cluster)
 */
export function createBushMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'bush_patch';

  const bushMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.8,
    transparent: true,
    opacity: 0.92,
  });

  const offsets = [
    { x: 0, z: 0, s: 0.9, y: 0.6 },
    { x: -0.4, z: -0.3, s: 0.7, y: 0.5 },
    { x: 0.4, z: -0.2, s: 0.75, y: 0.55 },
    { x: -0.3, z: 0.35, s: 0.7, y: 0.5 },
    { x: 0.35, z: 0.3, s: 0.75, y: 0.55 },
  ];

  offsets.forEach(({ x, z, s, y }) => {
    const geo = new THREE.DodecahedronGeometry(s, 1);
    const mesh = new THREE.Mesh(geo, bushMat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    group.add(mesh);
  });

  return group;
}

/**
 * Center Gem Mine Outcrop
 */
export function createGemMineMesh(): THREE.Group {
  const group = new THREE.Group();

  // Stone crater base
  const craterGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.5, 12);
  const craterMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  const crater = new THREE.Mesh(craterGeo, craterMat);
  crater.position.y = 0.25;
  crater.receiveShadow = true;
  group.add(crater);

  // Inner Mine Hole
  const holeGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.55, 12);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
  const hole = new THREE.Mesh(holeGeo, holeMat);
  hole.position.y = 0.3;
  group.add(hole);

  // Glowing Purple Crystals protruding
  const crystalGeo = new THREE.OctahedronGeometry(0.4, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0xa855f7,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });

  for (let i = 0; i < 4; i++) {
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    const angle = (i * Math.PI) / 2 + 0.3;
    crystal.position.set(Math.cos(angle) * 1.3, 0.45, Math.sin(angle) * 1.3);
    crystal.scale.set(0.7, 1.4, 0.7);
    crystal.rotation.z = 0.3;
    group.add(crystal);
  }

  return group;
}

/**
 * Gem Item (Floating purple diamond crystal)
 */
export function createGemMesh(): THREE.Mesh {
  const geo = new THREE.OctahedronGeometry(0.35, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0xc084fc,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.6,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Paula Drop 2.0 In-Match Pickup (Floating Starr Drop)
 */
export function createPaulaDropMesh(
  rarity: 'rare' | 'epic' | 'mythic' | 'legendary' = 'rare'
): THREE.Group {
  const group = new THREE.Group();
  group.name = `paula_drop_${rarity}`;

  const colors = {
    rare: { color: 0x38bdf8, emissive: 0x0284c7 },
    epic: { color: 0xc084fc, emissive: 0x9333ea },
    mythic: { color: 0xf43f5e, emissive: 0xe11d48 },
    legendary: { color: 0xfbbf24, emissive: 0xd97706 },
  };

  const scheme = colors[rarity] || colors.rare;

  // Contact shadow
  group.add(createContactShadow(0.7));

  // Central Star / Diamond Core
  const coreGeo =
    rarity === 'legendary'
      ? new THREE.DodecahedronGeometry(0.45, 0)
      : new THREE.OctahedronGeometry(0.42, 0);

  const coreMat = new THREE.MeshStandardMaterial({
    color: scheme.color,
    emissive: scheme.emissive,
    emissiveIntensity: 0.9,
    roughness: 0.15,
    metalness: 0.8,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0.55;
  core.castShadow = true;
  group.add(core);

  // Outer orbital ring
  const ringGeo = new THREE.TorusGeometry(0.55, 0.05, 8, 20);
  const ringMat = new THREE.MeshStandardMaterial({
    color: scheme.color,
    emissive: scheme.emissive,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.9,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.55;
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  return group;
}

