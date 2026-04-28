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
        
        // Jitter logic pushes mountains slightly OUTWARDS, never inward into playable space
        let jx = x;
        let jz = z;

        if (type !== 'volcano') {
           if (x >= 240) jx += Math.random() * 12; // push right
           else if (x <= -240) jx -= Math.random() * 12; // push left
           
           if (z <= -790) jz -= Math.random() * 12; // push back
           else if (z >= 540) jz += Math.random() * 12; // push front
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
      }
    };

    // Adjusted to ±245. Terrain is 500 wide (-250 to 250).
    // Placing exactly at 245 makes it mesh perfectly at the edge without eating into playable space (-190 to 190).

    // Right Edge Walls
    addEdge(245, 550, 245, 400, 'mountain', 0.85); // Beach (sparse)
    addEdge(245, 400, 245, -400, 'mountain', 0);   // Forest & Desert
    addEdge(245, -400, 245, -795, 'mountain', 0);  // Volcano edge

    // Left Edge Walls
    addEdge(-245, 550, -245, 400, 'mountain', 0.85); // Beach (sparse)
    addEdge(-245, 400, -245, -400, 'mountain', 0);   // Forest & Desert
    addEdge(-245, -400, -245, -795, 'mountain', 0);  // Volcano edge

    // Front Edge Wall (Volcano End Z = -795 to match Terrain bounds at -800)
    addEdge(-250, -795, 250, -795, 'volcano', 0); 

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