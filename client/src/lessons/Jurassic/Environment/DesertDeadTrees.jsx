import React, { useMemo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { getExactHeight } from './Terrain'; // Shared height function

export default function DesertDeadTrees({ terrainGeo, count = 40 }) {
  const { scene: d1 } = useGLTF('/models/dead1.glb');
  const { scene: d2 } = useGLTF('/models/dead2.glb');
  const { scene: d3 } = useGLTF('/models/dead3.glb');
  const models = [d1, d2, d3];

  const instances = useMemo(() => {
    if (!terrainGeo) return [];
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 360; 
      const z = -(Math.random() * 380 + 10); 
      const y = getExactHeight(x, z, terrainGeo);
      
      const model = models[Math.floor(Math.random() * models.length)];
      arr.push({ x, y, z, model, scale: 3 + Math.random() * 2, rot: Math.random() * Math.PI * 2 });
    }
    return arr;
  }, [terrainGeo, count]);

  return (
    <group>
      {instances.map((inst, i) => (
        <Clone key={`deadtree-${i}`} object={inst.model} position={[inst.x, inst.y, inst.z]} scale={inst.scale} rotation={[0, inst.rot, 0]} />
      ))}
    </group>
  );
}

useGLTF.preload('/models/dead1.glb');
useGLTF.preload('/models/dead2.glb');
useGLTF.preload('/models/dead3.glb');