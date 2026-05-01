import React, { useMemo, memo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

const BorderMountains = memo(function BorderMountains({ obstacles = [] }) {
  const { scene: mountainScene } = useGLTF('/models/mountain1.glb');
  const { scene: volcanoScene } = useGLTF('/models/volcano.glb');

  const borderElements = useMemo(() => {
    const elements = [];
    const step = 25;

    const addEdge = (startX, startZ, endX, endZ, type = 'mountain', skipChance = 0) => {
      const dist = Math.hypot(endX - startX, endZ - startZ);
      const steps = Math.floor(dist / step);
      
      for (let i = 0; i <= steps; i++) {
        if (Math.random() < skipChance) continue;
        
        const t = i / steps;
        const x = startX + (endX - startX) * t;
        const z = startZ + (endZ - startZ) * t;
        
        let jx = x;
        let jz = z;

        if (type !== 'volcano') {
           if (x >= 240) jx += Math.random() * 12;
           else if (x <= -240) jx -= Math.random() * 12;
           
           if (z <= -790) jz -= Math.random() * 12;
           else if (z >= 540) jz += Math.random() * 12;
        }
        
        const y = -35 + Math.random() * 10;
        const elementScale = type === 'volcano'
          ? 300 + Math.random() * 75
          : 55 + Math.random() * 25;
        
        elements.push({
          pos: [jx, y, jz],
          rot: [0, Math.random() * Math.PI, 0],
          scale: elementScale,
          type: type
        });
        
        obstacles.push({
            x: jx,
            z: jz,
            radius: elementScale * 0.45
        });
      }
    };

    addEdge(245, 550, 245, 400, 'mountain', 0.85);
    addEdge(245, 400, 245, -400, 'mountain', 0);
    addEdge(245, -400, 245, -795, 'mountain', 0);
    
    addEdge(-245, 550, -245, 400, 'mountain', 0.85);
    addEdge(-245, 400, -245, -400, 'mountain', 0);
    addEdge(-245, -400, -245, -795, 'mountain', 0);

    addEdge(-250, -795, 250, -795, 'volcano', 0);

    return elements;
  }, [obstacles]);

  return (
    <group>
      {borderElements.map((el, index) => (
        <RigidBody
            key={`border-${index}`}
            type="fixed"
            colliders="trimesh"
            position={el.pos}
            rotation={el.rot}
        >
          <Clone
            object={el.type === 'volcano' ? volcanoScene : mountainScene}
            scale={el.scale}
            dispose={null}
          />
        </RigidBody>
      ))}
    </group>
  );
});

export default BorderMountains;

useGLTF.preload('/models/mountain1.glb');
useGLTF.preload('/models/volcano.glb');
