import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { getExactHeight, getDistToRexPath } from './Terrain';

export default function RockModel({ count = 100, areaSize = 350, terrainGeo }) {
  const rockModels = [
    useGLTF('/models/rock1.glb'),
    useGLTF('/models/rock2.glb'),
    useGLTF('/models/rock3.glb'),
  ];

  const rocks = useMemo(() => {
    const data = [];
    let attempts = 0;
    while (data.length < count && attempts < count * 3) {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      attempts++;
      
      // Keep rocks 6 units away from the trail to prevent clipping with the dinosaur
      if (getDistToRexPath(x, z) < 6) continue;
      
      let y = getExactHeight(x, z, terrainGeo);

      const scale = 1.0 + Math.random() * 2.5;
      const modelIndex = Math.floor(Math.random() * rockModels.length);
      const rotY = Math.random() * Math.PI * 2;
      data.push({ x, y: y - 0.5, z, scale, modelIndex, rotY });
    }
    return data;
  }, [count, areaSize, terrainGeo]);

  return (
    <group>
      {rocks.map((r, i) => {
        const model = rockModels[r.modelIndex].scene.clone();
        return (
          <RigidBody key={`rock-${i}`} type="fixed" colliders="hull" position={[r.x, r.y, r.z]}>
            <primitive object={model} scale={r.scale} rotation={[0, r.rotY, 0]} />
          </RigidBody>
        );
      })}
    </group>
  );
}