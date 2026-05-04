import React, { useMemo, memo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

const _ammoniteHitboxGeo = new THREE.SphereGeometry(1, 8, 8);
const _hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const AmmoniteModel = memo(function AmmoniteModel({ count = 25, terrainGeo, obstacles = [] }) {
  const { scene } = useGLTF('/models/jurrasic/Ammonite.glb');

  const ammonites = useMemo(() => {
    const data = [];
    let attempts = 0;
    
    while (data.length < count && attempts < count * 5) {
      const x = (Math.random() - 0.5) * 350;
      const z = 385 + Math.random() * 90; 
      attempts++;
      
      let y = getExactHeight(x, z, terrainGeo);
      if (y > 4.0) continue; 

      const scale = 0.5 + Math.random() * 1.2;
      const rotY = Math.random() * Math.PI * 2;
      const rotX = (Math.random() - 0.5) * 0.4; 
      
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
            <mesh 
              scale={[a.scale * 2, a.scale * 2, a.scale * 2]} 
              geometry={_ammoniteHitboxGeo} 
              material={_hitboxMat} 
            />
            <Clone object={scene} scale={a.scale} dispose={null} />
          </group>
        </RigidBody>
      ))}
    </group>
  );
});

export default AmmoniteModel;
useGLTF.preload('/models/jurrasic/Ammonite.glb');