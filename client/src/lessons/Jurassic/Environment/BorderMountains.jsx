import React, { useMemo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function BorderMountains() {
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
        
        const jx = x + (Math.random() - 0.5) * 15;
        const jz = z + (Math.random() - 0.5) * 15;
        const y = -35 + Math.random() * 10; 

        // Scale updated: Volcano is ~3-4x bigger (Base 300 instead of 85)
        const elementScale = type === 'volcano' 
          ? 300 + Math.random() * 75 
          : 55 + Math.random() * 25;

        elements.push({
          pos: [jx, y, jz],
          rot: [0, Math.random() * Math.PI, 0],
          scale: elementScale,
          type: type
        });
      }
    };

    // Right Edge Walls (X = 230: Off the 200-playable bounds, perfectly on the terrain edge)
    addEdge(230, 550, 230, 400, 'mountain', 0.85); // Beach (sparse)
    addEdge(230, 400, 230, -400, 'mountain', 0);   // Forest & Desert
    addEdge(230, -400, 230, -820, 'mountain', 0);  // Volcano

    // Left Edge Walls (X = -230: Off the 200-playable bounds, perfectly on the terrain edge)
    addEdge(-230, 550, -230, 400, 'mountain', 0.85); // Beach (sparse)
    addEdge(-230, 400, -230, -400, 'mountain', 0);   // Forest & Desert
    addEdge(-230, -400, -230, -820, 'mountain', 0);  // Volcano

    // Front Edge Wall (Volcano End Z = -820)
    addEdge(-240, -820, 240, -820, 'volcano', 0); 

    return elements;
  }, []);

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
          />
        </RigidBody>
      ))}
    </group>
  );
}

useGLTF.preload('/models/mountain1.glb');
useGLTF.preload('/models/volcano.glb');