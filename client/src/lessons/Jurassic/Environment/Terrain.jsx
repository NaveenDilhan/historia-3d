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
  const size = 400;
  const segments = 256;
  const halfSize = size / 2;

  let u = (x + halfSize) / size;
  let v = (z + halfSize) / size;
  u = Math.max(0, Math.min(1, u));
  v = Math.max(0, Math.min(1, v));

  const fX = u * segments;
  const fY = v * segments;
  const x0 = Math.floor(fX);
  const x1 = Math.min(segments, x0 + 1);
  const y0 = Math.floor(fY);
  const y1 = Math.min(segments, y0 + 1);

  const tx = fX - x0;
  const ty = fY - y0;

  const pos = terrainGeo.attributes.position;
  const getZ = (ix, iy) => pos.getZ(ix + iy * (segments + 1));

  const h0 = getZ(x0, y0) * (1 - tx) + getZ(x1, y0) * tx;
  const h1 = getZ(x0, y1) * (1 - tx) + getZ(x1, y1) * tx;

  return h0 * (1 - ty) + h1 * ty;
};

// --- Shared T-Rex Path Logic ---
export const rexPathVectors = [
  new THREE.Vector3(10, 0, -60),
  new THREE.Vector3(30, 0, -20),
  new THREE.Vector3(0, 0, 40),
  new THREE.Vector3(-30, 0, -20),
];
// Exported curve so DinosaurModel can follow it
export const rexCurve = new THREE.CatmullRomCurve3(rexPathVectors, true, 'centripetal', 0.5);
// Sample points to easily calculate distance for obstacles
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

// --- GLB Mountain Range ---
function BorderMountains() {
  const { scene: mountainScene } = useGLTF('/models/mountain1.glb');
  const { scene: volcanoScene } = useGLTF('/models/volcano.glb');

  const borderPositions = useMemo(() => [
    [-280, -20, -200], [-300, -15, -80], [-270, -25, 40], [-290, -10, 150], [-260, -20, 240],
    [-160, -20, -290], [-60, -15, -280], [60, -25, -300], [160, -10, -280], [250, -20, -295],
    [-180, -20, 290], [-70, -15, 280], [50, -25, 300], [150, -10, 275], [240, -20, 285]
  ], []);

  return (
    <group>
      {borderPositions.map((pos, index) => (
        <Clone
          key={`mountain-${index}`}
          object={mountainScene}
          position={pos}
          scale={50 + Math.random() * 20}
          rotation={[0, Math.random() * Math.PI, 0]}
        />
      ))}
      <Clone
        object={volcanoScene}
        position={[-280, -35, -280]}
        scale={80}
        rotation={[0, Math.PI / 4, 0]}
      />
    </group>
  );
}

useGLTF.preload('/models/mountain1.glb');
useGLTF.preload('/models/volcano.glb');

export default function Terrain({ setTerrainGeo }) {
  const [grassTex, pathRocks, rocks, desertRocks] = useLoader(THREE.TextureLoader, [
    '/textures/Grass.jpg',
    '/textures/PathRocks_Diffuse.png',
    '/textures/Rocks_Diffuse.png',
    '/textures/Rocks_Desert_Diffuse.png',
  ]);

  useMemo(() => {
    [grassTex, pathRocks, rocks, desertRocks].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [grassTex, pathRocks, rocks, desertRocks]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(400, 400, 256, 256);
    const vertices = geo.attributes.position;
    const noise = new ImprovedNoise();

    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i); 
      
      let height = noise.noise(x / 80, y / 80, 0) * 12; 
      height += noise.noise(x / 25, y / 25, 0) * 4;     
      height += noise.noise(x / 5, y / 5, 0) * 0.8;     

      if (x > 175) height -= Math.pow((x - 175) * 0.15, 2); 

      // CARVE THE PATH: Note that the 'y' from the plane geometry represents World Z.
      const distFromRexZone = getDistToRexPath(x, y);
      if (distFromRexZone < 15) {
        const flattenFactor = THREE.MathUtils.smoothstep(distFromRexZone, 4, 15);
        height = THREE.MathUtils.lerp(0, height, flattenFactor);
      }

      vertices.setZ(i, height);
    }

    vertices.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    if (geometry && setTerrainGeo) setTerrainGeo(geometry);
  }, [geometry, setTerrainGeo]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0.05 });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.grassTex = { value: grassTex };
      shader.uniforms.pathTex = { value: pathRocks };
      shader.uniforms.rockTex = { value: rocks };
      shader.uniforms.desertTex = { value: desertRocks };
      shader.vertexShader = shader.vertexShader.replace(`#include <common>`, `#include <common>\n varying float vHeight;\n varying vec3 vWorldPosition;\n varying vec2 vCustomUv;`);
      shader.vertexShader = shader.vertexShader.replace(`#include <begin_vertex>`, `#include <begin_vertex>\n vHeight = position.z;\n vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n vCustomUv = uv;`);
      shader.fragmentShader = shader.fragmentShader.replace(`#include <common>`, `#include <common>\n uniform sampler2D grassTex;\n uniform sampler2D pathTex;\n uniform sampler2D rockTex;\n uniform sampler2D desertTex;\n varying float vHeight;\n varying vec3 vWorldPosition;\n varying vec2 vCustomUv;\n float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }`);
      shader.fragmentShader = shader.fragmentShader.replace(`#include <color_fragment>`, `#include <color_fragment>\n vec2 texUv = vCustomUv * 60.0;\n vec4 grassColor = texture2D(grassTex, texUv);\n vec4 pathColor = texture2D(pathTex, texUv);\n vec4 rockColor = texture2D(rockTex, texUv);\n vec4 desertColor = texture2D(desertTex, texUv);\n float noiseVal = random(floor(vWorldPosition.xy * 2.5)) * 2.0;\n float h = vHeight + noiseVal;\n vec4 terrainColor = grassColor;\n if (h > 2.0) terrainColor = mix(grassColor, pathColor, smoothstep(2.0, 5.0, h));\n if (h > 6.0) terrainColor = mix(pathColor, rockColor, smoothstep(6.0, 10.0, h));\n if (h > 12.0) terrainColor = mix(rockColor, desertColor, smoothstep(12.0, 15.0, h));\n diffuseColor = vec4(terrainColor.rgb, 1.0);`);
    };
    return mat;
  }, [grassTex, pathRocks, rocks, desertRocks]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <primitive object={material} attach="material" />
        </mesh>
      </RigidBody>

      <BorderMountains />

      <mesh position={[0, -4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1500, 1500, 64, 64]} />
        <meshPhysicalMaterial color="#006699" transmission={0.8} opacity={1} transparent roughness={0.1} metalness={0.6} ior={1.33} thickness={10} />
      </mesh>

      <RigidBody type="fixed">
        <CuboidCollider position={[195, 150, 0]} args={[1, 200, 200]} />   
        <CuboidCollider position={[-195, 150, 0]} args={[1, 200, 200]} />  
        <CuboidCollider position={[0, 150, 195]} args={[200, 200, 1]} />   
        <CuboidCollider position={[0, 150, -195]} args={[200, 200, 1]} />  
      </RigidBody>

      <GrassModel count={500} areaSize={350} terrainGeo={geometry} />
      <RockModel count={220} areaSize={350} terrainGeo={geometry} />
      <TreeForest genericCount={180} forestCount={250} areaSize={350} terrainGeo={geometry} treeScale={4.5} />
    </group>
  );
}