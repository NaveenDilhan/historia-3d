import React, { useRef, useEffect, useMemo, memo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

const _apatoHitboxGeo = new THREE.BoxGeometry(1, 1, 1);
const _hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const ApatosaurusModel = memo(function ApatosaurusModel({ terrainGeo, hasStarted, x = 20, z = -200, scale = 5.0 }) {
  const dinoRef = useRef();
  const { scene, animations } = useGLTF('/models/jurrasic/Apatosaurus.glb');
  const { actions } = useAnimations(animations, dinoRef);

  // FIXED: Synchronously calculate position before the RigidBody ever mounts
  const { yPos, rot } = useMemo(() => {
    if (!terrainGeo) return { yPos: 0, rot: [0, -Math.PI / 4, 0] };
    
    const angle = -Math.PI / 4;
    const yawEuler = new THREE.Euler(0, angle, 0);
    
    const localFL = new THREE.Vector3(0.55 * scale, 0, 1.3 * scale).applyEuler(yawEuler);
    const localFR = new THREE.Vector3(-0.55 * scale, 0, 1.3 * scale).applyEuler(yawEuler);
    const localBL = new THREE.Vector3(0.55 * scale, 0, -1.1 * scale).applyEuler(yawEuler);
    const localBR = new THREE.Vector3(-0.55 * scale, 0, -1.1 * scale).applyEuler(yawEuler);
    
    const hFL = getExactHeight(x + localFL.x, z + localFL.z, terrainGeo);
    const hFR = getExactHeight(x + localFR.x, z + localFR.z, terrainGeo);
    const hBL = getExactHeight(x + localBL.x, z + localBL.z, terrainGeo);
    const hBR = getExactHeight(x + localBR.x, z + localBR.z, terrainGeo);
    
    const pFL = new THREE.Vector3(x + localFL.x, hFL, z + localFL.z);
    const pFR = new THREE.Vector3(x + localFR.x, hFR, z + localFR.z);
    const pBL = new THREE.Vector3(x + localBL.x, hBL, z + localBL.z);
    const pBR = new THREE.Vector3(x + localBR.x, hBR, z + localBR.z);
    
    const avgH = (hFL + hFR + hBL + hBR) / 4;
    
    const diag1 = new THREE.Vector3().subVectors(pFL, pBR);
    const diag2 = new THREE.Vector3().subVectors(pFR, pBL);
    const normal = new THREE.Vector3().crossVectors(diag1, diag2).normalize();
    
    if (normal.y < 0) normal.negate();
    
    const alignQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    const baseQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    const dipQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.05);
    
    alignQuat.multiply(dipQuat);
    alignQuat.multiply(baseQuat);
    
    const finalEuler = new THREE.Euler().setFromQuaternion(alignQuat, 'YXZ');
    
    return { 
        yPos: avgH - 0.85, 
        rot: [finalEuler.x, finalEuler.y, finalEuler.z] 
    };
  }, [terrainGeo, x, z, scale]);

  useEffect(() => {
    if (!animations || animations.length === 0) return;
    
    scene.traverse((child) => {
      if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
    });

    if (hasStarted) {
      const idleClip = animations.find(clip => clip.name.toLowerCase().includes('idle'));
      if (idleClip && actions[idleClip.name]) {
        actions[idleClip.name].reset().fadeIn(0.8).play();
      }
    }
  }, [animations, actions, scene, hasStarted]);

  return (
    <RigidBody type="fixed" colliders={false} position={[x, yPos, z]} rotation={rot}>
      <CuboidCollider position={[0, 4.5 * scale, 0]} args={[0.7 * scale, 1.2 * scale, 2.4 * scale]} />
      <CylinderCollider position={[0.55 * scale, 1.5 * scale, 1.3 * scale]} args={[1.5 * scale, 0.35 * scale]} />
      <CylinderCollider position={[-0.55 * scale, 1.5 * scale, 1.3 * scale]} args={[1.5 * scale, 0.35 * scale]} />
      <CylinderCollider position={[0.55 * scale, 1.5 * scale, -1.1 * scale]} args={[1.5 * scale, 0.35 * scale]} />
      <CylinderCollider position={[-0.55 * scale, 1.5 * scale, -1.1 * scale]} args={[1.5 * scale, 0.35 * scale]} />
      <CylinderCollider position={[0, 6.0 * scale, 3.2 * scale]} args={[2.5 * scale, 0.5 * scale]} rotation={[Math.PI / 4, 0, 0]} />
      <CylinderCollider position={[0, 3.5 * scale, -4.0 * scale]} args={[3.0 * scale, 0.4 * scale]} rotation={[-Math.PI / 10, 0, 0]} />
      
      <primitive 
         ref={dinoRef} 
         object={scene} 
         scale={scale} 
         position={[0, -0.15, 0]} 
       />

      <mesh
        position={[0, 5 * scale, 0]} 
        scale={[scale * 6, scale * 15, scale * 25]} 
        geometry={_apatoHitboxGeo}
        material={_hitboxMat}
        onPointerOver={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: true } }));
        }}
        onPointerOut={(e) => {
            window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: false } }));
        }}
        onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'apatosaurus' } }));
        }}
      />
    </RigidBody>
  );
});

export default ApatosaurusModel;
useGLTF.preload('/models/jurrasic/Apatosaurus.glb');