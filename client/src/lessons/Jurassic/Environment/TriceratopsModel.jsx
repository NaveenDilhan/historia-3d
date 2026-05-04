import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Clone } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

const _trikeHitboxGeo = new THREE.BoxGeometry(1, 1, 1);
const _hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const TriceratopsModel = memo(function TriceratopsModel({ terrainGeo, hasStarted, x = -100, z = 80, scale = 2, rotationY = 4 }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF('/models/jurrasic/Triceratops.glb');
  const { scene: fernScene } = useGLTF('/models/jurrasic/Fern.glb');
  const { actions, mixer } = useAnimations(animations, groupRef);
  const [action, setAction] = useState('idle');
  const neckBone = useRef(null);

  // FIXED: Synchronously calculate position before the RigidBody ever mounts
  const { yPos, rot, fernY, fernX, fernZ } = useMemo(() => {
    const fernDist = 4.0 * scale;
    const fX = x + Math.sin(rotationY) * fernDist;
    const fZ = z + Math.cos(rotationY) * fernDist;

    if (!terrainGeo) return { yPos: 0, rot: [0, rotationY, 0], fernY: 0, fernX: fX, fernZ: fZ };

    const yawEuler = new THREE.Euler(0, rotationY, 0);
    const width = 0.5 * scale;
    const lengthFront = 0.9 * scale;
    const lengthBack = -1.1 * scale;
    
    const localFL = new THREE.Vector3(width, 0, lengthFront).applyEuler(yawEuler);
    const localFR = new THREE.Vector3(-width, 0, lengthFront).applyEuler(yawEuler);
    const localBL = new THREE.Vector3(width, 0, lengthBack).applyEuler(yawEuler);
    const localBR = new THREE.Vector3(-width, 0, lengthBack).applyEuler(yawEuler);
    
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
    const baseQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
    
    // Pitch offset to keep the tail down properly
    const pitchOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.15);
    
    // NEW: Severely reduced the roll offset so it doesn't seesaw the right legs into the air
    const rollOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.05);
    
    alignQuat.multiply(pitchOffset);
    alignQuat.multiply(rollOffset); 
    alignQuat.multiply(baseQuat);
    
    const finalEuler = new THREE.Euler().setFromQuaternion(alignQuat, 'YXZ');
    
    return {
        // NEW: Bumped height multiplier slightly up from 0.05 to 0.08 to pull the left foot out of the dirt
        yPos: avgH + (scale * 0.08),
        rot: [finalEuler.x, finalEuler.y, finalEuler.z],
        fernY: getExactHeight(fX, fZ, terrainGeo) + 0.3,
        fernX: fX,
        fernZ: fZ
    };
  }, [terrainGeo, x, z, scale, rotationY]);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.isBone && !neckBone.current) {
        const name = child.name.toLowerCase();
        if (name.includes('neck') || name.includes('head') || name.includes('spine2') || name.includes('bone')) {
          neckBone.current = child;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!hasStarted || animations.length === 0) return;
    
    const idleName = animations.find(a => a.name.toLowerCase().includes('idle'))?.name || animations[0]?.name;
    const attackName = animations.find(a => a.name.toLowerCase().includes('attack'))?.name || (animations.length > 1 ? animations[1].name : animations[0].name);
    
    if (action === 'attack') {
      if (actions[idleName]) actions[idleName].fadeOut(0.2);
      if (actions[attackName]) {
        actions[attackName].reset().fadeIn(0.2).play();
        actions[attackName].setLoop(THREE.LoopOnce);
        actions[attackName].clampWhenFinished = true;
      }
    } else {
      if (actions[attackName]) actions[attackName].fadeOut(0.4);
      if (actions[idleName]) actions[idleName].reset().fadeIn(0.4).play();
    }
  }, [action, actions, animations, hasStarted]);

  useEffect(() => {
    const handleFinished = () => {
      setAction('idle'); 
    };
    mixer.addEventListener('finished', handleFinished);
    return () => mixer.removeEventListener('finished', handleFinished);
  }, [mixer]);

  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => {
      setAction((prev) => {
        if (prev === 'attack') return prev; 
        return Math.random() > 0.5 ? 'eating' : 'idle'; 
      });
    }, 5000 + Math.random() * 4000); 
    return () => clearInterval(interval);
  }, [hasStarted]);

  useFrame((state, delta) => {
    if (neckBone.current) {
      if (action !== 'attack') {
        const targetPitch = action === 'eating' ? 0.8 : 0.0;
        neckBone.current.rotation.x = THREE.MathUtils.lerp(
          neckBone.current.rotation.x,
          targetPitch,
          delta * 3 
        );
      } else {
        neckBone.current.rotation.x = THREE.MathUtils.lerp(neckBone.current.rotation.x, 0, delta * 8);
      }
    }
  });

  return (
    <group>
      <RigidBody type="fixed" colliders={false} position={[x, yPos, z]} rotation={rot}>
        <CuboidCollider position={[0, 1.5 * scale, 0]} args={[scale * 1.5, scale * 1.8, scale * 3.5]} />
        
        <group ref={groupRef}>
          <primitive object={scene} scale={scale} />
          <mesh
            position={[0, 1.5 * scale, 0]} 
            scale={[scale * 4, scale * 3, scale * 6]} 
            geometry={_trikeHitboxGeo}
            material={_hitboxMat}
            onClick={(e) => {
              e.stopPropagation();
              if (action === 'attack') return;
              
              setAction('attack'); 
              setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'triceratops' } }));
              }, 3500); 
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: true } }));
            }}
            onPointerOut={() => {
              window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: false } }));
            }}
          />
        </group>
      </RigidBody>

      <RigidBody type="fixed" colliders={false} position={[fernX, fernY, fernZ]}>
        <CuboidCollider position={[0, 1.5, 0]} args={[1.0, 1.5, 1.0]} />
        <Clone object={fernScene} scale={2.5} dispose={null} />
      </RigidBody>
    </group>
  );
});

export default TriceratopsModel;

useGLTF.preload('/models/jurrasic/Triceratops.glb');
useGLTF.preload('/models/jurrasic/Fern.glb');