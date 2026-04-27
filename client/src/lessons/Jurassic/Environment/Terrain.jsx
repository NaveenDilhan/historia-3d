import React, { useMemo, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGLTF, Clone } from '@react-three/drei';

import TreeForest from './TreeModel';
import GrassModel from './GrassModel';
import RockModel from './RockModel';

// --- GLB Mountain Range ---
function BorderMountains() {
  const { scene: mountainScene } = useGLTF('/models/mountain1.glb');
  const { scene: volcanoScene } = useGLTF('/models/volcano.glb');

  // Pushed further back (-260 to -280) to accommodate the massive scale increase
  const borderPositions = useMemo(() => [
    // Left Border Range
    [-260, -10, -180], [-270, -10, -80], [-250, -10, 20], [-280, -10, 110], [-260, -10, 200],
    // Back Border Range (Top)
    [-140, -10, -270], [-50, -10, -250], [50, -10, -280], [140, -10, -260], [220, -10, -275],
    // Front Border Range (Bottom)
    [-150, -10, 270], [-60, -10, 260], [40, -10, 280], [130, -10, 255], [210, -10, 265]
  ], []);

  return (
    <group>
      {/* Massive Mountain Range */}
      {borderPositions.map((pos, index) => (
        <Clone
          key={`mountain-${index}`}
          object={mountainScene}
          position={pos}
          scale={45} // INCREASED: Was 15, now 45 for towering peaks
          rotation={[0, Math.random() * Math.PI, 0]}
        />
      ))}

      {/* Epic Volcano in the top-left corner */}
      <Clone
        object={volcanoScene}
        position={[-270, -20, -270]} // Sunk slightly so the wider base blends into the ground
        scale={65} // INCREASED: Was 20, now 65 for a massive landmark
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

      if (x > 175) {
        height -= Math.pow((x - 175) * 0.15, 2); 
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
      {/* 1. Main Playable Terrain */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <primitive object={material} attach="material" />
        </mesh>
      </RigidBody>

      {/* 2. GLB Mountain & Volcano Borders */}
      <BorderMountains />

      {/* 3. Ocean Extension */}
      <mesh position={[300, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 600]} />
        <meshStandardMaterial color="#005577" transparent opacity={0.7} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* 4. Invisible Playable Area Bounds */}
      {/* INCREASED WALL HEIGHT: Position Y moved from 50 to 150, Half-height arg increased from 100 to 200 */}
      <RigidBody type="fixed">
        <CuboidCollider position={[185, 150, 0]} args={[1, 200, 200]} />   
        <CuboidCollider position={[-185, 150, 0]} args={[1, 200, 200]} />  
        <CuboidCollider position={[0, 150, 185]} args={[200, 200, 1]} />   
        <CuboidCollider position={[0, 150, -185]} args={[200, 200, 1]} />  
      </RigidBody>

      {/* 5. Vegetation */}
      {/* Rocks & Grass remain untouched */}
      <GrassModel count={500} areaSize={350} terrainGeo={geometry} />
      <RockModel count={180} areaSize={350} terrainGeo={geometry} />
      
      {/* Trees get the new treeScale multiplier to make them tower over the Dinosaurs */}
      <TreeForest 
        genericCount={180} 
        forestCount={250} 
        areaSize={350} 
        terrainGeo={geometry} 
        treeScale={4.5} 
      />
    </group>
  );
}