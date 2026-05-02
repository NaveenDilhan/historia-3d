import React, { useMemo, memo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { getExactHeight, getDistToRexPath } from './Terrain';

const RockModel = memo(function RockModel({ count = 100, bounds, terrainGeo, obstacles = [] }) {
  const rockModels = [
    useGLTF('/models/rock1.glb'),
    useGLTF('/models/rock2.glb'),
    useGLTF('/models/rock3.glb'),
  ];

  const rocks = useMemo(() => {
    const data = [];
    let attempts = 0;
    while (data.length < count && attempts < count * 3) {
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
      if (getDistToRexPath(x, z) < 6) continue;
      
      let isClipping = false;
      for (let obs of obstacles) {
         if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius + 1.8)) {
             isClipping = true;
             break;
         }
      }
      if (isClipping) continue;

      let y = getExactHeight(x, z, terrainGeo);
      const scale = 1.0 + Math.random() * 2.5;
      const modelIndex = Math.floor(Math.random() * rockModels.length);
      const rotY = Math.random() * Math.PI * 2;
      
      data.push({ x, y: y - 0.5, z, scale, modelIndex, rotY });
      obstacles.push({ x, z, radius: scale * 1.6, type: 'rock' });
    }
    return data;
  }, [count, bounds, terrainGeo, obstacles]);

  return (
    <group>
      {rocks.map((r, i) => (
        <RigidBody key={`rock-${i}`} type="fixed" colliders="hull" position={[r.x, r.y, r.z]}>
          <Clone
             object={rockModels[r.modelIndex].scene}
             scale={r.scale}
             rotation={[0, r.rotY, 0]}
             dispose={null}
           />
        </RigidBody>
      ))}
    </group>
  );
});

export default RockModel;

useGLTF.preload('/models/rock1.glb');
useGLTF.preload('/models/rock2.glb');
useGLTF.preload('/models/rock3.glb');