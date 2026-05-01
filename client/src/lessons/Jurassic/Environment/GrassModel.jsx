import React, { useMemo, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import { getExactHeight, getDistToRexPath } from './Terrain';

const GrassModel = memo(function GrassModel({ count = 200, bounds, terrainGeo }) {
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
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
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
        <Clone
          key={`grass-${i}`}
          ref={(el) => (grassRefs.current[i] = el)}
          object={grassModels[g.modelIndex].scene}
          position={[g.x, g.y, g.z]}
          scale={g.scale}
          rotation={[0, g.rotationY, 0]}
          dispose={null}
        />
      ))}
    </>
  );
});

export default GrassModel;

useGLTF.preload('/models/grass1.glb');
useGLTF.preload('/models/grass2.glb');
useGLTF.preload('/models/grass3.glb');
useGLTF.preload('/models/grass4.glb');