import React, { useMemo, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { RigidBody } from '@react-three/rapier';

import TreeForest from './TreeModel';
import GrassModel from './GrassModel';
import RockModel from './RockModel';

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
      vertices.setZ(i, height);
    }

    vertices.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Pass geometry up to Scene so Player can spawn safely
  useEffect(() => {
    if (geometry && setTerrainGeo) setTerrainGeo(geometry);
  }, [geometry, setTerrainGeo]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0.05 });
    // ... KEEP YOUR EXACT CUSTOM ONBEFORECOMPILE SHADER LOGIC HERE ...
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
      {/* Explicit trimesh collider makes hills completely solid for the player */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <primitive object={material} attach="material" />
        </mesh>
      </RigidBody>

      <GrassModel count={500} areaSize={350} terrainGeo={geometry} />
      <RockModel count={180} areaSize={350} terrainGeo={geometry} />
      <TreeForest genericCount={180} forestCount={250} areaSize={350} terrainGeo={geometry} />
    </group>
  );
}