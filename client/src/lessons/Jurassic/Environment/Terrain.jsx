import React, { useMemo, useEffect, memo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

// Import separated environment models
import TreeForest from './TreeModel';
import GrassModel from './GrassModel';
import RockModel from './RockModel';
import BorderMountains from './BorderMountains';
import DesertDeadTrees from './DesertDeadTrees';
import Ocean from './Ocean';
import ForestFlora from './ForestFlora'; 
import BushScatter from './BushScatter'; 

// --- Shared Helper for Ground Alignment ---
export const getExactHeight = (x, z, terrainGeo) => {
  if (!terrainGeo) return 0;
  const sizeX = 500; 
  const sizeZ = 1600; 
  const segX = 125;
  const segZ = 400;

  let u = (x + sizeX / 2) / sizeX;
  let v = (z + sizeZ / 2) / sizeZ;
  u = Math.max(0, Math.min(1, u));
  v = Math.max(0, Math.min(1, v));

  const fX = u * segX;
  const fY = v * segZ;
  const x0 = Math.floor(fX);
  const x1 = Math.min(segX, x0 + 1);
  const y0 = Math.floor(fY);
  const y1 = Math.min(segZ, y0 + 1);

  const tx = fX - x0;
  const ty = fY - y0;

  const pos = terrainGeo.attributes.position;
  const getZ = (ix, iy) => pos.getZ(ix + iy * (segX + 1));

  const h0 = getZ(x0, y0) * (1 - tx) + getZ(x1, y0) * tx;
  const h1 = getZ(x0, y1) * (1 - tx) + getZ(x1, y1) * tx;

  return h0 * (1 - ty) + h1 * ty;
};

// --- Shared T-Rex Path Logic ---
export const rexPathVectors = [
  new THREE.Vector3(50, 0, 100),
  new THREE.Vector3(150, 0, 200),
  new THREE.Vector3(0, 0, 300),
  new THREE.Vector3(-100, 0, 200),
];
export const rexCurve = new THREE.CatmullRomCurve3(rexPathVectors, true, 'centripetal', 0.5);
export const curveSamples = rexCurve.getPoints(100); 

export const getDistToRexPath = (x, z) => {
  let minDist = Infinity;
  for (let i = 0; i < curveSamples.length; i++) {
    const pt = curveSamples[i];
    const d = Math.hypot(pt.x - x, pt.z - z);
    if (d < minDist) minDist = d;
  }
  return minDist;
};

// OPTIMIZATION: Wrap in React.memo to prevent expensive re-evaluations of the shader and noise logic
const Terrain = memo(function Terrain({ setTerrainGeo }) {
  const [mossTex, mudTex, rockTex, lavaTex] = useLoader(THREE.TextureLoader, [
    '/textures/grass_mossy.png',
    '/textures/mud.png',
    '/textures/rock.png',
    '/textures/Lava.webp',
  ]);

  useMemo(() => {
    [mossTex, mudTex, rockTex, lavaTex].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [mossTex, mudTex, rockTex, lavaTex]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(500, 1600, 125, 400);
    const vertices = geo.attributes.position;
    const noise = new ImprovedNoise();

    const smoothBlend = (min, max, val) => {
      const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
      return t * t * (3 - 2 * t);
    };

    for (let i = 0; i < vertices.count; i++) {
      const xPlane = vertices.getX(i);
      const yPlane = vertices.getY(i);
      
      const worldX = xPlane;
      const worldZ = -yPlane;

      const beachWeight = smoothBlend(375, 425, worldZ);
      const forestWeight = smoothBlend(-25, 25, worldZ) * (1.0 - smoothBlend(375, 425, worldZ));
      const desertWeight = smoothBlend(-425, -375, worldZ) * (1.0 - smoothBlend(-25, 25, worldZ));
      const volcanoWeight = 1.0 - smoothBlend(-425, -375, worldZ);

      let forestH = noise.noise(worldX / 90, worldZ / 90, 0) * 14; 
      forestH += noise.noise(worldX / 30, worldZ / 30, 0) * 3;     
      if (worldX > 175) forestH -= Math.pow((worldX - 175) * 0.15, 2); 

      let desertH = noise.noise(worldX / 120, worldZ / 120, 0) * 12 + noise.noise(worldX / 40, worldZ / 40, 0) * 4 + 5;
      
      let beachH = -2 + noise.noise(worldX / 80, worldZ / 80, 0) * 1.5;      
      if (worldZ > 480) beachH -= (worldZ - 480) * 0.15; 
      if (worldZ > 380) {
        if (worldX > 180) beachH -= (worldX - 180) * 0.2;
        if (worldX < -180) beachH -= (-180 - worldX) * 0.2;
      }

      let volcanoH = noise.noise(worldX / 70, worldZ / 70, 0) * 25 + noise.noise(worldX / 20, worldZ / 20, 0) * 10 + 15;

      let finalHeight = (forestH * forestWeight) + (desertH * desertWeight) + (beachH * beachWeight) + (volcanoH * volcanoWeight);

      const distFromRexZone = getDistToRexPath(worldX, worldZ);
      if (distFromRexZone < 15) {
        const flattenFactor = THREE.MathUtils.smoothstep(distFromRexZone, 4, 15);
        finalHeight = THREE.MathUtils.lerp(0, finalHeight, flattenFactor);
      }

      vertices.setZ(i, finalHeight);
    }
    vertices.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  const obstacles = useMemo(() => {
    const obs = [];
    
    // Apatosaurus parameters from Scene.jsx
    const dinoX = 20;
    const dinoZ = -200;
    const angle = -Math.PI / 4;
    
    for (let i = -2; i <= 2; i++) {
      obs.push({
        x: dinoX + Math.sin(angle) * (i * 12),
        z: dinoZ + Math.cos(angle) * (i * 12),
        radius: 14 
      });
    }
    return obs;
  }, [geometry]);

  useEffect(() => {
    if (geometry && setTerrainGeo) setTerrainGeo(geometry);
  }, [geometry, setTerrainGeo]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ 
      roughness: 0.9, 
      metalness: 0.0,
      flatShading: true 
    });
    
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.mossTex = { value: mossTex };
      shader.uniforms.mudTex = { value: mudTex };
      shader.uniforms.rockTex = { value: rockTex };
      shader.uniforms.lavaTex = { value: lavaTex };
      
      shader.vertexShader = shader.vertexShader.replace(
        `#include <common>`, 
        `#include <common>\n varying float vHeight;\n varying vec2 vCustomUv;\n varying vec2 vWorldPos;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`, 
        `#include <begin_vertex>\n vHeight = position.z;\n vCustomUv = uv;\n vWorldPos = vec2(position.x, -position.y);`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <common>`, 
        `#include <common>\n 
         uniform sampler2D mossTex;\n 
         uniform sampler2D mudTex;\n 
         uniform sampler2D rockTex;\n 
         uniform sampler2D lavaTex;\n 
         varying float vHeight;\n 
         varying vec2 vCustomUv;\n 
         varying vec2 vWorldPos;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <color_fragment>`, 
        `#include <color_fragment>\n 
         vec2 texUv = vCustomUv * vec2(50.0, 160.0);           
         
         vec4 mossColor = texture2D(mossTex, texUv);
         mossColor.rgb *= vec3(0.85, 1.25, 0.85);

         vec4 mudColor = texture2D(mudTex, texUv);
         vec4 rockColor = texture2D(rockTex, texUv);
         vec4 lavaMapColor = texture2D(lavaTex, texUv);
         
         vec4 sandColor = mudColor * vec4(1.6, 1.4, 0.9, 1.0);           

         float beachMix = smoothstep(375.0, 425.0, vWorldPos.y);
         float forestMix = smoothstep(-25.0, 25.0, vWorldPos.y) * (1.0 - smoothstep(375.0, 425.0, vWorldPos.y));
         float desertMix = smoothstep(-425.0, -375.0, vWorldPos.y) * (1.0 - smoothstep(-25.0, 25.0, vWorldPos.y));
         float volcanoMix = 1.0 - smoothstep(-425.0, -375.0, vWorldPos.y);

         float h = vHeight;
         
         vec4 fColor = mix(mudColor, mossColor, smoothstep(1.0, 1.2, h));
         fColor = mix(fColor, rockColor, smoothstep(6.0, 6.5, h)); 
         
         vec4 dColor = mix(sandColor, rockColor, smoothstep(16.0, 20.0, h));
         vec4 bColor = sandColor;
         vec4 vColor = lavaMapColor;

         vec4 terrainColor = (fColor * forestMix) + (dColor * desertMix) + (bColor * beachMix) + (vColor * volcanoMix);
         vec3 sceneTint = vec3(0.05, 0.07, 0.03); 
         
         diffuseColor = vec4(terrainColor.rgb + sceneTint, 1.0);`
      );
    };

    return mat;
  }, [mossTex, mudTex, rockTex, lavaTex]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <primitive object={material} attach="material" />
        </mesh>
      </RigidBody>

      {/* Pass obstacles array into the mountain component! */}
      <BorderMountains obstacles={obstacles} />
      
      <Ocean />

      <RigidBody type="fixed">
        <CuboidCollider position={[-205, 150, -100]} args={[1, 200, 700]} />
        <CuboidCollider position={[205, 150, -100]} args={[1, 200, 700]} />
        <CuboidCollider position={[0, 150, -805]} args={[250, 200, 1]} />
        <CuboidCollider position={[0, 150, 480]} args={[250, 200, 1]} /> 
      </RigidBody>

      {/* Model Scatters */}
      <GrassModel count={500} terrainGeo={geometry} bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} />
      <RockModel count={220} terrainGeo={geometry} bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} obstacles={obstacles} />
      <TreeForest genericCount={180} forestCount={250} terrainGeo={geometry} treeScale={4.5} bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} obstacles={obstacles} />
      <DesertDeadTrees terrainGeo={geometry} count={15} obstacles={obstacles} />
      <ForestFlora count={300} terrainGeo={geometry} bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} obstacles={obstacles} />
      
      {/* NEW: Spawning the interactive Bushes */}
      <BushScatter count={40} terrainGeo={geometry} bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} obstacles={obstacles} />
    </group>
  );
});

export default Terrain;

// OPTIMIZATION: Aggressively preload textures outside the component tree
// This forces the browser to pull these heavy image files immediately
useLoader.preload(THREE.TextureLoader, '/textures/grass_mossy.png');
useLoader.preload(THREE.TextureLoader, '/textures/mud.png');
useLoader.preload(THREE.TextureLoader, '/textures/rock.png');
useLoader.preload(THREE.TextureLoader, '/textures/Lava.webp');