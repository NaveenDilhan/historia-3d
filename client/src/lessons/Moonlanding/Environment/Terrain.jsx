import React, { useLayoutEffect } from 'react';
import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Terrain() {
  // 1. Grass Textures
  const grassTextures = useTexture({
    map: '/textures/moon/grass_diff.jpg',
    normalMap: '/textures/moon/grass_nor.jpg',
    roughnessMap: '/textures/moon/grass_rough.jpg'
  });

  // 2. Custom Paving Textures
  const [roadTex, padTex, slabTex] = useTexture([
    '/textures/moon/road.jpg',
    '/textures/moon/launchpad.jpg',
    '/textures/moon/slab.jpg'
  ]);

  // 3. Tile the textures extensively and apply Anisotropy to fix blurring
  useLayoutEffect(() => {
    
    const allTextures = [
      ...Object.values(grassTextures),
      roadTex,
      padTex,
      slabTex
    ];

    allTextures.forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

        tex.anisotropy = 16; 
      }
    });
    

    if (grassTextures.map) grassTextures.map.repeat.set(200, 200);
    if (grassTextures.normalMap) grassTextures.normalMap.repeat.set(200, 200);
    if (grassTextures.roughnessMap) grassTextures.roughnessMap.repeat.set(200, 200);
    
    if (roadTex) roadTex.repeat.set(4, 20); 
    if (padTex) padTex.repeat.set(12, 12);
    if (slabTex) slabTex.repeat.set(24, 24);

  }, [grassTextures, roadTex, padTex, slabTex]);

  return (
    <group>
      {/* 1. REALISTIC OCEAN */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -14, -800]} receiveShadow>
        <planeGeometry args={[8000, 3000]} />
        <MeshReflectorMaterial
          blur={[400, 100]} 
          resolution={1024} 
          mixBlur={1}
          mixStrength={1.5} 
          roughness={0.1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#424e4d" 
          metalness={0.8}
        />
      </mesh>

      {/* 2. DRY MARSHLAND TERRAIN */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -13.5, 0]} receiveShadow>
        <planeGeometry args={[8000, 8000, 64, 64]} />
        <meshStandardMaterial 
          {...grassTextures} 
          color="#64624b"
          metalness={0.05} 
          roughness={1}
        />
      </mesh>

      {/* 3. DISTANT ROLLING HILLS */}
      <mesh position={[-300, -80, -500]} scale={[1, 0.5, 1]} receiveShadow>
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial {...grassTextures} color="#5a553f" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[350, -100, -450]} scale={[1, 0.4, 1]} receiveShadow>
        <sphereGeometry args={[250, 32, 32]} />
        <meshStandardMaterial {...grassTextures} color="#5a553f" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, -120, -600]} scale={[1, 0.4, 1]} receiveShadow>
        <sphereGeometry args={[350, 32, 32]} />
        <meshStandardMaterial {...grassTextures} color="#4a4635" roughness={1} metalness={0} />
      </mesh>


      {/* 4. PROCEDURAL BASE RECREATION */}
      
      {/* --- CENTRAL LAUNCH PAD COMPLEX --- */}
      <group position={[0, -13.5, 0]}>
        
        {/* The Base Slab (Mound) */}
        <mesh position={[0, 7.5, 0]} rotation={[0, Math.PI / 4, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[45, 120, 15, 4]} />
          <meshStandardMaterial map={slabTex} color="#cccccc" roughness={0.9} />
        </mesh>

        {/* The Top Launchpad Area */}
        <mesh position={[0, 16.15, 0]} rotation={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[60, 0.6, 60]} />
          <meshStandardMaterial map={roadTex} color="#dddddd" roughness={0.8} />
        </mesh>

        {/* Flame Trench Cutout */}
        <mesh position={[0, 16.25, 0]} receiveShadow>
          <boxGeometry args={[15, 0.7, 60]} />
          <meshStandardMaterial color="#1a1a1a" roughness={1} />
        </mesh>

        {/* Crawlerway Ramp - grouped to include the new center black road */}
        <group position={[0, 7.32, 66.36]} rotation={[0.23, 0, 0]}>
          {/* Main Ramp Base */}
          <mesh receiveShadow castShadow>
            <boxGeometry args={[25, 1.2, 75]} />
            <meshStandardMaterial map={roadTex} color="#cccccc" roughness={0.9} />
          </mesh>

          <mesh position={[0, 0.61, 0]} receiveShadow>
            <boxGeometry args={[15, 0.05, 75]} />
            <meshStandardMaterial color="#1a1a1a" roughness={1} />
          </mesh>
        </group>
      </group>


      {/* --- ROAD NETWORK --- */}
      <group position={[0, -13.4, 0]}>
        

        <group position={[0, 0.05, 0]}>
          <mesh position={[0, 0, -97.5]} receiveShadow>
             <boxGeometry args={[220, 0.25, 25]} />
             <meshStandardMaterial color="#1a1a1a" roughness={1} />
          </mesh>
          <mesh position={[0, 0, 97.5]} receiveShadow>
             <boxGeometry args={[220, 0.25, 25]} />
             <meshStandardMaterial color="#1a1a1a" roughness={1} />
          </mesh>
          <mesh position={[-97.5, 0, 0]} receiveShadow>
             <boxGeometry args={[25, 0.25, 220]} />
             <meshStandardMaterial color="#1a1a1a" roughness={1} />
          </mesh>
          <mesh position={[97.5, 0, 0]} receiveShadow>
             <boxGeometry args={[25, 0.25, 220]} />
             <meshStandardMaterial color="#1a1a1a" roughness={1} />
          </mesh>
        </group>

        {/* Main Crawlerway passing under the camera */}
        <mesh position={[0, 0, 150]} receiveShadow>
          <boxGeometry args={[25, 0.2, 100]} />
          <meshStandardMaterial map={roadTex} color="#cccccc" roughness={0.9} />
        </mesh>

        <mesh position={[-60, 0, -60]} rotation={[0, Math.PI / 4, 0]} receiveShadow>
          <boxGeometry args={[10, 0.2, 170]} />
          <meshStandardMaterial map={roadTex} color="#cccccc" roughness={0.9} />
        </mesh>

        <mesh position={[60, 0, -60]} rotation={[0, -Math.PI / 4, 0]} receiveShadow>
          <boxGeometry args={[10, 0.2, 170]} />
          <meshStandardMaterial map={roadTex} color="#cccccc" roughness={0.9} />
        </mesh>
      </group>


      {/* --- FUEL STATION --- */}
      <group position={[-120, -13.5, -120]}>
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[25, 25, 0.4, 32]} />
          <meshStandardMaterial map={slabTex} color="#cccccc" roughness={0.9} />
        </mesh>

        <mesh position={[0, 12, 0]} receiveShadow castShadow>
          <sphereGeometry args={[10, 32, 32]} />
          <meshStandardMaterial color="#4a5240" roughness={0.6} metalness={0.2} />
        </mesh>

        <mesh position={[0, 5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[6, 8, 10, 16]} />
          <meshStandardMaterial map={slabTex} color="#cccccc" roughness={0.8} />
        </mesh>
      </group>


      {/* --- FACILITY / SUB-STATION --- */}
      <group position={[120, -13.5, -120]}>
        <mesh position={[0, 0.2, 0]} receiveShadow>
           <group>
             <mesh position={[0, 0, -30]}><boxGeometry args={[80, 0.4, 10]} /><meshStandardMaterial map={roadTex} color="#cccccc" /></mesh>
             <mesh position={[0, 0, 30]}><boxGeometry args={[80, 0.4, 10]} /><meshStandardMaterial map={roadTex} color="#cccccc" /></mesh>
             <mesh position={[-35, 0, 0]}><boxGeometry args={[10, 0.4, 50]} /><meshStandardMaterial map={roadTex} color="#cccccc" /></mesh>
             <mesh position={[35, 0, 0]}><boxGeometry args={[10, 0.4, 50]} /><meshStandardMaterial map={roadTex} color="#cccccc" /></mesh>
           </group>
        </mesh>

        <mesh position={[-15, 3, 0]} receiveShadow castShadow>
          <boxGeometry args={[15, 6, 20]} />
          <meshStandardMaterial color="#cccccc" roughness={0.9} />
        </mesh>

        <mesh position={[25, 15, -20]} receiveShadow castShadow>
          <cylinderGeometry args={[1.5, 1.5, 30, 8]} />
          <meshStandardMaterial color="#999999" />
        </mesh>

        <mesh position={[25, 30, -20]} receiveShadow castShadow>
          <boxGeometry args={[6, 4, 6]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
      </group>

    </group>
  );
}