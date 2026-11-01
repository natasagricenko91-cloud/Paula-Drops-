import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BrawlerData } from '../types/game';
import { createBrawlerMesh, createContactShadow } from '../game/proceduralModels';

interface HeroPodiumProps {
  brawler: BrawlerData;
}

export const HeroPodium: React.FC<HeroPodiumProps> = ({ brawler }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 1.6, 4.4);
    camera.lookAt(0, 1.0, 0);

    // Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Golden / Slate Supercell Trophy Podium
    const podiumGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.4, 32);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = -0.2;
    scene.add(podium);

    const rimGeo = new THREE.TorusGeometry(1.42, 0.06, 12, 32);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.0;
    scene.add(rim);

    // Add Hero mesh
    const heroMesh = createBrawlerMesh(brawler, false);
    heroMesh.position.y = 0.0;
    scene.add(heroMesh);

    // Soft shadow
    scene.add(createContactShadow(1.2));

    // Animation loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle heroic breathing / rotation
      heroMesh.rotation.y = Math.sin(elapsedTime * 0.8) * 0.35;
      heroMesh.position.y = Math.sin(elapsedTime * 2.0) * 0.04;

      const weapon = heroMesh.getObjectByName('weapon');
      if (weapon) {
        weapon.rotation.z = Math.sin(elapsedTime * 3) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [brawler]);

  return <div ref={mountRef} className="w-full h-full pointer-events-none" />;
};
