import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function GrassModel({ count = 200, areaSize = 350, terrainGeo }) {
  const grassModels = [
    useGLTF('/models/grass1.glb'),
    useGLTF('/models/grass2.glb'),
    useGLTF('/models/grass3.glb'),
    useGLTF('/models/grass4.glb'),
  ];

  // Function to get exact terrain height at (x, z)
  const getHeight = (x, z) => {
    if (!terrainGeo) return 0;
    
    // CRITICAL FIX: The geometry is 400x400. We must use 400 to look up 
    // the height array, even if the grasses only spawn in an areaSize of 350.
    const size = 400; 
    const segments = 256;
    
    let ix = Math.floor(((x + size / 2) / size) * segments);
    let iz = Math.floor(((z + size / 2) / size) * segments);

    // Clamp to prevent out of bounds edge errors
    ix = Math.max(0, Math.min(segments, ix));
    iz = Math.max(0, Math.min(segments, iz));

    const idx = ix + iz * (segments + 1);
    return terrainGeo.attributes.position.getZ(idx) || 0;
  };

  const grasses = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      
      const y = getHeight(x, z);
      
      const scale = 0.5 + Math.random() * 1.5;
      const rotationY = Math.random() * Math.PI * 2;
      const windOffset = Math.random() * Math.PI * 2;
      const modelIndex = Math.floor(Math.random() * grassModels.length);
      data.push({ x, y, z, scale, rotationY, windOffset, modelIndex });
    }
    return data;
  }, [count, areaSize, terrainGeo]);

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