import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { Physics } from '@react-three/rapier';

import TreeForest from './TreeModel';
import GrassModel from './GrassModel';
import RockModel from './RockModel';

export default function Terrain() {
  // Load textures
  const [grassTex, pathRocks, rocks, desertRocks] = useLoader(THREE.TextureLoader, [
    '/textures/Grass.jpg',
    '/textures/PathRocks_Diffuse.png',
    '/textures/Rocks_Diffuse.png',
    '/textures/Rocks_Desert_Diffuse.png',
  ]);

  // Configure texture tiling
  useMemo(() => {
    [grassTex, pathRocks, rocks, desertRocks].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(40, 40);
    });
  }, [grassTex, pathRocks, rocks, desertRocks]);

  // Generate terrain geometry with Perlin noise
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 200, 256, 256);
    const vertices = geo.attributes.position;
    const noise = new ImprovedNoise();

    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const height = noise.noise(x / 25, y / 25, 0) * 4;
      vertices.setZ(i, height);
    }

    vertices.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Height-based shader material
  const material = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      varying float vHeight;
      void main() {
        vUv = uv;
        vHeight = position.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D grassTex;
      uniform sampler2D pathTex;
      uniform sampler2D rockTex;
      uniform sampler2D desertTex;
      varying vec2 vUv;
      varying float vHeight;
      void main() {
        vec4 grassColor = texture2D(grassTex, vUv * 4.0);
        vec4 pathColor = texture2D(pathTex, vUv * 2.0);
        vec4 rockColor = texture2D(rockTex, vUv * 3.0);
        vec4 desertColor = texture2D(desertTex, vUv * 2.0);

        vec4 color = grassColor;
        if (vHeight > 1.5) color = mix(grassColor, pathColor, smoothstep(1.5, 2.5, vHeight));
        if (vHeight > 2.5) color = mix(pathColor, rockColor, smoothstep(2.5, 3.5, vHeight));
        if (vHeight > 3.5) color = mix(rockColor, desertColor, smoothstep(3.5, 5.0, vHeight));

        gl_FragColor = vec4(color.rgb, 1.0);
      }
    `;

    const uniforms = {
      grassTex: { value: grassTex },
      pathTex: { value: pathRocks },
      rockTex: { value: rocks },
      desertTex: { value: desertRocks },
    };

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      lights: false,
    });
  }, [grassTex, pathRocks, rocks, desertRocks]);

  return (
    <Physics gravity={[0, -9.81, 0]}>
      <group>
        {/* Base terrain */}
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <primitive object={material} attach="material" />
        </mesh>

        {/* Vegetation */}
        <GrassModel count={200} areaSize={180} terrainGeo={geometry} />
        <RockModel count={100} areaSize={180} terrainGeo={geometry} />

        <TreeForest
          genericCount={100}
          forestCount={150}
          areaSize={180}
          terrainGeo={geometry}
        />

        {/* Ambient fog and lighting */}
        <fog attach="fog" args={['#a0c4a8', 10, 150]} />
        <hemisphereLight skyColor="#b1e1ff" groundColor="#4d654e" intensity={0.6} />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
      </group>
    </Physics>
  );
}
