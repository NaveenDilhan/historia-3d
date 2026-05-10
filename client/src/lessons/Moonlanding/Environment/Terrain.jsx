import React, { useLayoutEffect } from 'react';
import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Terrain() {
  // 1. Load Textures (ensure these are in your public/textures folder)
  const grassTextures = useTexture({
    map: '/textures/moon/grass_diff.jpg',
    normalMap: '/textures/moon/grass_nor.jpg',
    roughnessMap: '/textures/moon/grass_rough.jpg'
  });

  const gravelTextures = useTexture({
    map: '/textures/moon/gravel_diff.jpg',
    normalMap: '/textures/moon/gravel_nor.jpg',
    roughnessMap: '/textures/moon/gravel_rough.jpg'
  });

  const concreteTextures = useTexture({
    map: '/textures/moon/concrete_diff.jpg',
    normalMap: '/textures/moon/concrete_nor.jpg',
    roughnessMap: '/textures/moon/concrete_rough.jpg'
  });

  // 2. Tile the textures to prevent stretching
  useLayoutEffect(() => {
    Object.values(grassTextures).forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(100, 100);
    });

    Object.values(gravelTextures).forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 40);
    });

    Object.values(concreteTextures).forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(15, 15);
    });
  }, [grassTextures, gravelTextures, concreteTextures]);

  return (
    <group>
      {/* REALISTIC OCEAN */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12.5, -400]} receiveShadow>
        <planeGeometry args={[3000, 1500]} />
        <MeshReflectorMaterial
          blur={[400, 100]} 
          resolution={1024} 
          mixBlur={1}
          mixStrength={1.5} 
          roughness={0.2}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#3a4b5c" 
          metalness={0.8}
        />
      </mesh>

      {/* DRY MARSHLAND TERRAIN */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, 0]} receiveShadow>
        <planeGeometry args={[2000, 2000, 64, 64]} />
        <meshStandardMaterial 
          {...grassTextures} 
          color="#8c8662" 
          metalness={0.1} 
          roughness={0.9}
        />
      </mesh>

      {/* MAIN CRAWLERWAY */}
      <mesh position={[0, -11.9, 200]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 400]} />
        <meshStandardMaterial {...gravelTextures} color="#707070" />
      </mesh>

      {/* SECONDARY ROADS */}
      <mesh position={[100, -11.8, 50]} rotation={[-Math.PI / 2, 0, -Math.PI / 6]} receiveShadow>
        <planeGeometry args={[15, 300]} />
        <meshStandardMaterial {...concreteTextures} color="#606060" />
      </mesh>
      <mesh position={[-100, -11.8, 50]} rotation={[-Math.PI / 2, 0, Math.PI / 6]} receiveShadow>
        <planeGeometry args={[15, 300]} />
        <meshStandardMaterial {...concreteTextures} color="#606060" />
      </mesh>

      {/* SLOPED CONCRETE MOUND (Your 3D model will sit on top of this at Y=0) */}
      <mesh position={[0, -6, 0]} rotation={[0, Math.PI / 4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[65, 130, 12, 4]} />
        <meshStandardMaterial {...concreteTextures} color="#8a8a8a" roughness={0.8} />
      </mesh>

      {/* SPHERICAL FUEL TANK */}
      <group position={[-90, -4, 40]}>
        <mesh receiveShadow castShadow>
          <sphereGeometry args={[8, 32, 32]} />
          <meshStandardMaterial color="#4a524a" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -6, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[6, 6, 4, 16]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </group>
    </group>
  );
}