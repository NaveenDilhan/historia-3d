import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getExactHeight, getDistToRexPath } from './Terrain';

export default function ForestFlora({ count = 300, bounds, terrainGeo, obstacles = [] }) {
  const fernModel = useGLTF('/models/Fern.glb');
  const clover1Model = useGLTF('/models/Clover1.glb');
  const clover2Model = useGLTF('/models/Clover2.glb');
  const mushroomModel = useGLTF('/models/Mushroom.glb');

  const models = [
    { scene: fernModel.scene, type: 'fern', scaleFactor: 1.5, sway: true, radius: 1.0 },
    { scene: clover1Model.scene, type: 'clover', scaleFactor: 0.8, sway: true, radius: 0.5 },
    { scene: clover2Model.scene, type: 'clover', scaleFactor: 0.8, sway: true, radius: 0.5 },
    { scene: mushroomModel.scene, type: 'mushroom', scaleFactor: 1.2, sway: false, radius: 0.8 }
  ];

  const instances = useMemo(() => {
    const data = [];
    let attempts = 0;
    
    while (data.length < count && attempts < count * 4) {
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
      // Keep away from the T-Rex path
      if (getDistToRexPath(x, z) < 5) continue;
      
      const y = getExactHeight(x, z, terrainGeo);
      
      // Only spawn below a certain height to keep them in the forest, not on steep mountains
      if (y > 8.0) continue;

      // Prevent clipping by checking the unified obstacles array (Rocks, Trees)
      let isClipping = false;
      for (let obs of obstacles) {
         if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius + 0.8)) {
             isClipping = true;
             break;
         }
      }
      if (isClipping) continue;

      const modelObj = models[Math.floor(Math.random() * models.length)];
      const scale = (0.5 + Math.random() * 1.5) * modelObj.scaleFactor;
      const rotY = Math.random() * Math.PI * 2;
      const windOffset = Math.random() * Math.PI * 2;

      data.push({ x, y, z, scale, rotY, windOffset, ...modelObj });
      
      // Register this flora into the obstacles array so subsequent items avoid it
      obstacles.push({ x, z, radius: modelObj.radius * scale });
    }
    return data;
  }, [count, bounds, terrainGeo, models, obstacles]);

  const floraRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    floraRefs.current.forEach((mesh, i) => {
      if (mesh && instances[i].sway) {
        mesh.rotation.z = Math.sin(t * 0.5 + instances[i].windOffset) * 0.02;
        mesh.rotation.x = Math.cos(t * 0.3 + instances[i].windOffset) * 0.015;
      }
    });
  });

  return (
    <group>
      {instances.map((inst, i) => {
        const model = inst.scene.clone();

        // ONLY apply Physics and Colliders to the Fern
        if (inst.type === 'fern') {
          const colliderHeight = inst.scale * 2.0;
          const colliderRadius = inst.scale * 0.5;

          return (
            <RigidBody key={`flora-${i}`} type="fixed" colliders={false} position={[inst.x, inst.y, inst.z]}>
              <CuboidCollider position={[0, colliderHeight / 2, 0]} args={[colliderRadius, colliderHeight / 2, colliderRadius]} />
              <primitive
                ref={(el) => (floraRefs.current[i] = el)}
                object={model}
                scale={inst.scale}
                rotation={[0, inst.rotY, 0]}
              />
            </RigidBody>
          );
        }

        // Standard mesh rendering for clovers and mushrooms (No Physics)
        return (
          <primitive
            key={`flora-${i}`}
            ref={(el) => (floraRefs.current[i] = el)}
            object={model}
            position={[inst.x, inst.y, inst.z]}
            scale={inst.scale}
            rotation={[0, inst.rotY, 0]}
          />
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/Fern.glb');
useGLTF.preload('/models/Clover1.glb');
useGLTF.preload('/models/Clover2.glb');
useGLTF.preload('/models/Mushroom.glb');