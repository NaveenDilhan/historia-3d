import React, { useMemo, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGLTF, Clone } from '@react-three/drei';

import TreeForest from './TreeModel';
import GrassModel from './GrassModel';
import RockModel from './RockModel';

// --- Shared Helper for Ground Alignment ---
export const getExactHeight = (x, z, terrainGeo) => {
  if (!terrainGeo) return 0;
  const sizeX = 500; // Expanded to 500 to create a shoulder for mountains to sit on
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

// --- Shared T-Rex Path Logic (Confined to Forest Biome) ---
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

// --- Desert Dead Trees Spawner (Confined to Desert Biome: Z -400 to 0) ---
function DesertDeadTrees({ terrainGeo, count = 40 }) {
  const { scene: d1 } = useGLTF('/models/dead1.glb');
  const { scene: d2 } = useGLTF('/models/dead2.glb');
  const { scene: d3 } = useGLTF('/models/dead3.glb');
  const models = [d1, d2, d3];

  const instances = useMemo(() => {
    if (!terrainGeo) return [];
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 360; 
      const z = -(Math.random() * 380 + 10); 
      const y = getExactHeight(x, z, terrainGeo);
      
      const model = models[Math.floor(Math.random() * models.length)];
      arr.push({ x, y, z, model, scale: 3 + Math.random() * 2, rot: Math.random() * Math.PI * 2 });
    }
    return arr;
  }, [terrainGeo, count]);

  return (
    <group>
      {instances.map((inst, i) => (
        <Clone key={`deadtree-${i}`} object={inst.model} position={[inst.x, inst.y, inst.z]} scale={inst.scale} rotation={[0, inst.rot, 0]} />
      ))}
    </group>
  );
}

// --- GLB Mountain Range (Placed on the extended 500-width shoulder) ---
function BorderMountains() {
  const { scene: mountainScene } = useGLTF('/models/mountain1.glb');
  const { scene: volcanoScene } = useGLTF('/models/volcano.glb');

  const borderElements = useMemo(() => {
    const elements = [];
    const step = 25; 

    const addEdge = (startX, startZ, endX, endZ, type = 'mountain', skipChance = 0) => {
      const dist = Math.hypot(endX - startX, endZ - startZ);
      const steps = Math.floor(dist / step);
      
      for (let i = 0; i <= steps; i++) {
        if (Math.random() < skipChance) continue; 

        const t = i / steps;
        const x = startX + (endX - startX) * t;
        const z = startZ + (endZ - startZ) * t;
        
        const jx = x + (Math.random() - 0.5) * 15;
        const jz = z + (Math.random() - 0.5) * 15;
        const y = -35 + Math.random() * 10; 

        elements.push({
          pos: [jx, y, jz],
          rot: [0, Math.random() * Math.PI, 0],
          scale: (type === 'volcano' ? 85 : 55) + Math.random() * 25,
          type: type
        });
      }
    };

    // Right Edge Walls (X = 230: Off the 200-playable bounds, perfectly on the terrain edge)
    addEdge(230, 550, 230, 400, 'mountain', 0.85); // Beach (sparse)
    addEdge(230, 400, 230, -400, 'mountain', 0);   // Forest & Desert
    addEdge(230, -400, 230, -820, 'mountain', 0);  // Volcano

    // Left Edge Walls (X = -230: Off the 200-playable bounds, perfectly on the terrain edge)
    addEdge(-230, 550, -230, 400, 'mountain', 0.85); // Beach (sparse)
    addEdge(-230, 400, -230, -400, 'mountain', 0);   // Forest & Desert
    addEdge(-230, -400, -230, -820, 'mountain', 0);  // Volcano

    // Front Edge Wall (Volcano End Z = -820)
    addEdge(-240, -820, 240, -820, 'volcano', 0); 

    return elements;
  }, []);

  return (
    <group>
      {borderElements.map((el, index) => (
        <Clone
          key={`border-${index}`}
          object={el.type === 'volcano' ? volcanoScene : mountainScene}
          position={el.pos}
          scale={el.scale}
          rotation={el.rot}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/models/mountain1.glb');
useGLTF.preload('/models/volcano.glb');
useGLTF.preload('/models/dead1.glb');
useGLTF.preload('/models/dead2.glb');
useGLTF.preload('/models/dead3.glb');

export default function Terrain({ setTerrainGeo }) {
  const [mossTex, mudTex, rockTex] = useLoader(THREE.TextureLoader, [
    '/textures/grass_mossy.png',
    '/textures/mud.png',
    '/textures/rock.png',
  ]);

  useMemo(() => {
    [mossTex, mudTex, rockTex].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [mossTex, mudTex, rockTex]);

  const geometry = useMemo(() => {
    // Terrain is physically 500 wide to support mountains safely outside the 400 playable width
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

      // Biome Maths
      let forestH = noise.noise(worldX / 90, worldZ / 90, 0) * 14; 
      forestH += noise.noise(worldX / 30, worldZ / 30, 0) * 3;     
      if (worldX > 175) forestH -= Math.pow((worldX - 175) * 0.15, 2); 

      let desertH = noise.noise(worldX / 120, worldZ / 120, 0) * 12 + noise.noise(worldX / 40, worldZ / 40, 0) * 4 + 5;
      
      let beachH = -2 + noise.noise(worldX / 80, worldZ / 80, 0) * 1.5; 
      
      // Slopes the beach end down into the water gradually
      if (worldZ > 480) {
        beachH -= (worldZ - 480) * 0.15; 
      }
      
      // Rounds off the sides of the beach so it looks like a peninsula
      if (worldZ > 380) {
        if (worldX > 180) beachH -= (worldX - 180) * 0.2;
        if (worldX < -180) beachH -= (-180 - worldX) * 0.2;
      }

      let volcanoH = noise.noise(worldX / 70, worldZ / 70, 0) * 25 + noise.noise(worldX / 20, worldZ / 20, 0) * 10 + 15;

      // Combine
      let finalHeight = (forestH * forestWeight) + (desertH * desertWeight) + (beachH * beachWeight) + (volcanoH * volcanoWeight);

      // Preserve T-Rex Path Flattening
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
         varying float vHeight;\n 
         varying vec2 vCustomUv;\n
         varying vec2 vWorldPos;`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <color_fragment>`, 
        `#include <color_fragment>\n 
         // Proportional UV scaling prevents texture stretching on non-square map sizes
         vec2 texUv = vCustomUv * vec2(50.0, 160.0); 
         
         vec4 mossColor = texture2D(mossTex, texUv);
         vec4 mudColor = texture2D(mudTex, texUv);
         vec4 rockColor = texture2D(rockTex, texUv);

         vec4 sandColor = mudColor * vec4(1.6, 1.4, 0.9, 1.0); 
         vec4 lavaColor = rockColor * vec4(3.0, 0.6, 0.1, 1.0); 
         
         float beachMix = smoothstep(375.0, 425.0, vWorldPos.y);
         float forestMix = smoothstep(-25.0, 25.0, vWorldPos.y) * (1.0 - smoothstep(375.0, 425.0, vWorldPos.y));
         float desertMix = smoothstep(-425.0, -375.0, vWorldPos.y) * (1.0 - smoothstep(-25.0, 25.0, vWorldPos.y));
         float volcanoMix = 1.0 - smoothstep(-425.0, -375.0, vWorldPos.y);

         float h = vHeight;
         
         vec4 fColor = mix(mudColor, mossColor, smoothstep(1.0, 1.2, h));
         fColor = mix(fColor, rockColor, smoothstep(6.0, 6.5, h)); 

         vec4 dColor = mix(sandColor, rockColor, smoothstep(16.0, 20.0, h));
         vec4 bColor = sandColor; // Pure sand

         vec4 vColor = rockColor;
         float lavaVeins = smoothstep(1.0, 2.0, h) - smoothstep(4.0, 6.0, h);
         vColor = mix(vColor, lavaColor, lavaVeins);
         vColor = mix(vColor, lavaColor, smoothstep(35.0, 40.0, h));

         vec4 terrainColor = (fColor * forestMix) + (dColor * desertMix) + (bColor * beachMix) + (vColor * volcanoMix);
         vec3 sceneTint = vec3(0.05, 0.07, 0.03); 
         diffuseColor = vec4(terrainColor.rgb + sceneTint, 1.0);`
      );
    };
    return mat;
  }, [mossTex, mudTex, rockTex]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <primitive object={material} attach="material" />
        </mesh>
      </RigidBody>

      <BorderMountains />

      {/* Stylized Ocean Water */}
      <mesh position={[0, -4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 3000, 64, 64]} />
        <meshPhysicalMaterial 
          color="#002b1f" 
          transmission={0.8} 
          opacity={1} 
          transparent 
          roughness={0.2} 
          metalness={0.5} 
          ior={1.33} 
          thickness={10} 
        />
      </mesh>

      {/* Box Colliders: Playable Area is tightly constrained to 400x1600 */}
      <RigidBody type="fixed">
        <CuboidCollider position={[-205, 150, -100]} args={[1, 200, 700]} />  {/* Left Wall */}
        <CuboidCollider position={[205, 150, -100]} args={[1, 200, 700]} />   {/* Right Wall */}
        <CuboidCollider position={[0, 150, -805]} args={[250, 200, 1]} />     {/* Front Wall (Volcano End) */}
        
        {/* Beach Water Blocker Wall (Allows user to wade into ankle-deep water before stopping them) */}
        <CuboidCollider position={[0, 150, 540]} args={[250, 200, 1]} />      {/* Back Wall (Beach Surf) */}
      </RigidBody>

      {/* Forest Biome Elements strictly confined */}
      <GrassModel 
        count={500} 
        terrainGeo={geometry} 
        bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} 
      />
      <RockModel 
        count={220} 
        terrainGeo={geometry} 
        bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} 
      />
      <TreeForest 
        genericCount={180} 
        forestCount={250} 
        terrainGeo={geometry} 
        treeScale={4.5} 
        bounds={{ xMin: -190, xMax: 190, zMin: 10, zMax: 390 }} 
      />

      {/* Desert Biome Elements confined to Z: -400 to 0 */}
      <DesertDeadTrees terrainGeo={geometry} count={45} />
    </group>
  );
}