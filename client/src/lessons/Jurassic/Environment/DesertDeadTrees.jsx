import React, { useMemo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getExactHeight } from './Terrain';

const isPositionValid = (x, z, currentTrees, minDist) => {
  for (let t of currentTrees) {
    if (Math.hypot(t.x - x, t.z - z) < minDist) return false;
  }
  return true;
}

export default function DesertDeadTrees({ terrainGeo, count = 40 }) {
  const { scene: d1 } = useGLTF('/models/dead1.glb');
  const { scene: d2 } = useGLTF('/models/dead2.glb');
  const { scene: d3 } = useGLTF('/models/dead3.glb');
  const models = [d1, d2, d3];

  const MIN_DIST = 14; 
  const MAX_HEIGHT = 16.0; 

  const instances = useMemo(() => {
    if (!terrainGeo) return [];
    
    const arr = [];
    let attempts = 0;

    while (arr.length < count && attempts < count * 10) {
      attempts++;
      
      const x = (Math.random() - 0.5) * 360; 
      const z = -(Math.random() * 380 + 10); 
      const y = getExactHeight(x, z, terrainGeo);
      
      if (y > MAX_HEIGHT) continue;
      if (!isPositionValid(x, z, arr, MIN_DIST)) continue;
      
      // Kept a 45-unit clear radius around the new [x: 20, z: -200] location
      if (Math.hypot(x - 20, z - (-200)) < 45) continue; 

      const model = models[Math.floor(Math.random() * models.length)];
      arr.push({ x, y, z, model, scale: 3 + Math.random() * 2, rot: Math.random() * Math.PI * 2 });
    }
    
    return arr;
  }, [terrainGeo, count, models]);

  return (
    <group>
      {instances.map((inst, i) => {
        const colliderHeight = inst.scale * 5;
        const colliderRadius = inst.scale * 0.8;
        return (
          <RigidBody key={`deadtree-${i}`} type="fixed" colliders={false} position={[inst.x, inst.y, inst.z]}>
            <CuboidCollider position={[0, colliderHeight / 2, 0]} args={[colliderRadius, colliderHeight / 2, colliderRadius]} />
            <Clone object={inst.model} scale={inst.scale} rotation={[0, inst.rot, 0]} />
          </RigidBody>
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/dead1.glb');
useGLTF.preload('/models/dead2.glb');
useGLTF.preload('/models/dead3.glb');