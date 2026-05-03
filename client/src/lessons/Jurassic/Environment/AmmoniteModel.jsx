import React, { useMemo, memo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { getExactHeight } from './Terrain';

const AmmoniteModel = memo(function AmmoniteModel({ count = 25, terrainGeo, obstacles = [] }) {
  // Make sure you have an ammonite.glb in your public/models folder
  const { scene } = useGLTF('/models/Ammonite.glb');

  const ammonites = useMemo(() => {
    const data = [];
    let attempts = 0;
    
    while (data.length < count && attempts < count * 5) {
      // Beach biome is located roughly at worldZ > 375
      const x = (Math.random() - 0.5) * 350;
      const z = 385 + Math.random() * 90; // Constrain to beach area
      attempts++;

      let y = getExactHeight(x, z, terrainGeo);
      
      // Prevent them from spawning on high cliffs near the beach
      if (y > 4.0) continue; 

      // Varying sizes
      const scale = 0.5 + Math.random() * 1.2;
      const rotY = Math.random() * Math.PI * 2;
      const rotX = (Math.random() - 0.5) * 0.4; // Slightly tilt them into the sand

      data.push({ x, y: y - 0.1, z, scale, rotX, rotY });
      obstacles.push({ x, z, radius: scale * 0.6, type: 'ammonite' });
    }
    return data;
  }, [count, terrainGeo, obstacles]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: true } }));
  };

  const handlePointerOut = () => {
    window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: false } }));
  };

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'ammonite' } }));
  };

  return (
    <group>
      {ammonites.map((a, i) => (
        <RigidBody key={`ammonite-${i}`} type="fixed" colliders="hull" position={[a.x, a.y, a.z]} rotation={[a.rotX, a.rotY, 0]}>
          <group
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            {/* An invisible, slightly larger hitbox to make clicking easier on small fossils */}
            <mesh visible={false} scale={[a.scale * 2, a.scale * 2, a.scale * 2]}>
              <sphereGeometry args={[1, 8, 8]} />
            </mesh>
            
            <Clone object={scene} scale={a.scale} dispose={null} />
          </group>
        </RigidBody>
      ))}
    </group>
  );
});

export default AmmoniteModel;
useGLTF.preload('/models/Ammonite.glb');