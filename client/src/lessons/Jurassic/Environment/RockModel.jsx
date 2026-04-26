import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function RockModel({ count = 100, areaSize = 350, terrainGeo }) {
  const rockModels = [
    useGLTF('/models/rock1.glb'),
    useGLTF('/models/rock2.glb'),
    useGLTF('/models/rock3.glb'),
  ];

  const rocks = useMemo(() => {
    return Array.from({ length: count }, () => {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      
      let y = 0;
      if (terrainGeo) {
        const size = 400; 
        const segments = 256;
        let ix = Math.floor(((x + size / 2) / size) * segments);
        let iz = Math.floor(((z + size / 2) / size) * segments);
        ix = Math.max(0, Math.min(segments, ix));
        iz = Math.max(0, Math.min(segments, iz));
        y = terrainGeo.attributes.position.getZ(ix + iz * (segments + 1));
      }

      const scale = 1.0 + Math.random() * 2.5;
      const modelIndex = Math.floor(Math.random() * rockModels.length);
      const rotY = Math.random() * Math.PI * 2;
      // Slight -0.5 Y offset ensures rocks look beautifully embedded into the hill
      return { x, y: y - 0.5, z, scale, modelIndex, rotY }; 
    });
  }, [count, areaSize, terrainGeo]);

  return (
    <group>
      {rocks.map((r, i) => {
        const model = rockModels[r.modelIndex].scene.clone();
        return (
          // Hull wraps the mesh tightly so the player bumps into it dynamically
          <RigidBody key={`rock-${i}`} type="fixed" colliders="hull" position={[r.x, r.y, r.z]}>
            <primitive object={model} scale={r.scale} rotation={[0, r.rotY, 0]} />
          </RigidBody>
        );
      })}
    </group>
  );
}