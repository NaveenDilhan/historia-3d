import React, { useMemo, memo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { getExactHeight } from './Terrain';

const LargeBoneModel = memo(function LargeBoneModel({ count = 1, terrainGeo, obstacles = [] }) {
  const { scene } = useGLTF('/models/Largebone.glb');

  const bones = useMemo(() => {
    const data = [];
    let attempts = 0;

    // Increased attempts because finding a large open space is harder
    while (data.length < count && attempts < count * 50) {
      // Beach biome is roughly at worldZ > 375
      const x = (Math.random() - 0.5) * 350;
      const z = 385 + Math.random() * 80; 
      attempts++;

      const y = getExactHeight(x, z, terrainGeo);
      
      // Prevent spawning on steep cliffs
      if (y > 4.0) continue;

      // Make it rather big
      const scale = 3.0 + Math.random() * 2.0;
      // Large collision radius to prevent ammonites or other items from clipping
      const radius = scale * 2.5;

      // STRICT COLLISION: Ensure it doesn't spawn on top of existing ammonites
      let isClipping = false;
      for (let obs of obstacles) {
        if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius + radius)) {
          isClipping = true;
          break;
        }
      }
      if (isClipping) continue;

      const rotY = Math.random() * Math.PI * 2;
      const rotX = (Math.random() - 0.5) * 0.2; // Slight tilt into the sand

      // Sink it into the ground slightly
      data.push({ x, y: y - 0.8, z, scale, rotX, rotY });
      obstacles.push({ x, z, radius, type: 'largebone' });
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
    window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'largebone' } }));
  };

  return (
    <group>
      {bones.map((b, i) => (
        <RigidBody key={`largebone-${i}`} type="fixed" colliders="hull" position={[b.x, b.y, b.z]} rotation={[b.rotX, b.rotY, 0]}>
          <group
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            {/* Invisible, larger hitbox to make clicking easier */}
            <mesh visible={false} scale={[b.scale * 3, b.scale * 1.5, b.scale * 3]}>
              <boxGeometry args={[1, 1, 1]} />
            </mesh>
            
            <Clone object={scene} scale={b.scale} dispose={null} />
          </group>
        </RigidBody>
      ))}
    </group>
  );
});

export default LargeBoneModel;

useGLTF.preload('/models/Largebone.glb');