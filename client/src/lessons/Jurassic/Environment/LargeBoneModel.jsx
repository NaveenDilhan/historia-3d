import React, { useMemo, memo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

const _boneHitboxGeo = new THREE.BoxGeometry(1, 1, 1);
const _hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const LargeBoneModel = memo(function LargeBoneModel({ count = 1, terrainGeo, obstacles = [] }) {
  const { scene } = useGLTF('/models/jurrasic/Largebone.glb');

  const bones = useMemo(() => {
    const data = [];
    let attempts = 0;
    
    while (data.length < count && attempts < count * 50) {
      const x = (Math.random() - 0.5) * 350;
      const z = 385 + Math.random() * 80;
      attempts++;
      
      const y = getExactHeight(x, z, terrainGeo);
      if (y > 4.0) continue;

      const scale = 3.0 + Math.random() * 2.0;
      const radius = scale * 2.5;

      let isClipping = false;
      for (let obs of obstacles) {
        if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius + radius)) {
          isClipping = true;
          break;
        }
      }
      if (isClipping) continue;

      const rotY = Math.random() * Math.PI * 2;
      const rotX = (Math.random() - 0.5) * 0.2; 
      
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
            <mesh 
              scale={[b.scale * 3, b.scale * 1.5, b.scale * 3]} 
              geometry={_boneHitboxGeo} 
              material={_hitboxMat} 
            />
            <Clone object={scene} scale={b.scale} dispose={null} />
          </group>
        </RigidBody>
      ))}
    </group>
  );
});

export default LargeBoneModel;
useGLTF.preload('/models/jurrasic/Largebone.glb');