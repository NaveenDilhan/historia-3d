import React, { useMemo, memo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getExactHeight } from './Terrain';

const isPositionValid = (x, z, currentTrees, obstacles, minDist) => {
  const distToDino = Math.hypot(20 - x, -200 - z);
  if (distToDino < 80) return false;

  for (let t of currentTrees) {
    if (Math.hypot(t.x - x, t.z - z) < minDist) return false;
  }
  if (obstacles) {
    for (let obs of obstacles) {
      if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius + minDist / 2)) return false;
    }
  }
  return true;
};

const DesertDeadTrees = memo(function DesertDeadTrees({ terrainGeo, count = 15, obstacles = [] }) {
  const genericModels = [
    useGLTF('/models/dead1.glb'),
    useGLTF('/models/dead2.glb'),
    useGLTF('/models/dead3.glb')
  ];

  const MIN_DIST = 18; 
  const MAX_HEIGHT = 16.0; 

  const instances = useMemo(() => {
    if (!terrainGeo) return [];
    
    const arr = [];
    let attempts = 0;
    while (arr.length < count && attempts < count * 15) {
      attempts++;
      
      const x = (Math.random() - 0.5) * 360; 
      const z = -(Math.random() * 380 + 10); 
      const y = getExactHeight(x, z, terrainGeo);
      
      if (y > MAX_HEIGHT) continue;

      const slopeX = Math.abs(y - getExactHeight(x + 2, z, terrainGeo));
      const slopeZ = Math.abs(y - getExactHeight(x, z + 2, terrainGeo));
      if (slopeX > 1.2 || slopeZ > 1.2) continue; 
      
      if (!isPositionValid(x, z, arr, obstacles, MIN_DIST)) continue;
      
      const model = genericModels[Math.floor(Math.random() * genericModels.length)];
      arr.push({ x, y, z, model: model.scene, scale: 3 + Math.random() * 2, rot: Math.random() * Math.PI * 2 });
    }
    
    return arr;
  }, [terrainGeo, count, genericModels, obstacles]);

  return (
    <group>
      {instances.map((inst, i) => {
        const colliderHeight = inst.scale * 5;
        const colliderRadius = inst.scale * 0.8;
        return (
          <RigidBody key={`deadtree-${i}`} type="fixed" colliders={false} position={[inst.x, inst.y, inst.z]}>
            <CuboidCollider position={[0, colliderHeight / 2, 0]} args={[colliderRadius, colliderHeight / 2, colliderRadius]} />
            <primitive object={inst.model.clone()} scale={inst.scale} rotation={[0, inst.rot, 0]} />
          </RigidBody>
        );
      })}
    </group>
  );
});

export default DesertDeadTrees;

useGLTF.preload('/models/dead1.glb');
useGLTF.preload('/models/dead2.glb');
useGLTF.preload('/models/dead3.glb');