import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { getExactHeight, getDistToRexPath } from './Terrain';

export default function GrassModel({ count = 200, bounds, terrainGeo }) {
  const grassModels = [
    useGLTF('/models/grass1.glb'),
    useGLTF('/models/grass2.glb'),
    useGLTF('/models/grass3.glb'),
    useGLTF('/models/grass4.glb'),
  ];

  const grasses = useMemo(() => {
    const data = [];
    let attempts = 0;
    while (data.length < count && attempts < count * 3) {
      // Use bounds if provided by Terrain.jsx, otherwise fallback
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
      // Worn path in the center
      if (getDistToRexPath(x, z) < 4) continue;
      
      const y = getExactHeight(x, z, terrainGeo);
      
      const scale = 0.5 + Math.random() * 1.5;
      const rotationY = Math.random() * Math.PI * 2;
      const windOffset = Math.random() * Math.PI * 2;
      const modelIndex = Math.floor(Math.random() * grassModels.length);
      data.push({ x, y, z, scale, rotationY, windOffset, modelIndex });
    }
    return data;
  }, [count, bounds, terrainGeo]);

  const grassRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    grassRefs.current.forEach((grass, i) => {
      if (grass) {
        const sway = Math.sin(t * 0.5 + grasses[i].windOffset) * 0.015;
        const tilt = Math.cos(t * 0.3 + grasses[i].windOffset) * 0.01;
        grass.rotation.z = sway;
        grass.rotation.x = tilt;
      }
    });
  });

  return (
    <>
      {grasses.map((g, i) => (
        <primitive
          key={`grass-${i}`}
          ref={(el) => (grassRefs.current[i] = el)}
          object={grassModels[g.modelIndex].scene.clone()}
          position={[g.x, g.y, g.z]}
          scale={g.scale}
          rotation={[0, g.rotationY, 0]}
        />
      ))}
    </>
  );
}