import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

export default function ApatosaurusModel({ terrainGeo, hasStarted, x = 20, z = -200, scale = 5.0 }) {
  const dinoRef = useRef();
  const { scene, animations } = useGLTF('/models/Apatosaurus.glb');
  const { actions } = useAnimations(animations, dinoRef);
  
  // State for dynamic terrain alignment
  const [yPos, setYPos] = useState(0);
  const [rot, setRot] = useState([0, -Math.PI / 4, 0]);

  // 1. Terrain Height & Slope Calculation
  useEffect(() => {
    if (terrainGeo && scene) {
      const angle = -Math.PI / 4;
      const yawEuler = new THREE.Euler(0, angle, 0);

      // Local foot offsets (based on the physical colliders)
      const localFL = new THREE.Vector3(0.5 * scale, 0, 1.3 * scale).applyEuler(yawEuler);
      const localFR = new THREE.Vector3(-0.5 * scale, 0, 1.3 * scale).applyEuler(yawEuler);
      const localBL = new THREE.Vector3(0.5 * scale, 0, -1.0 * scale).applyEuler(yawEuler);
      const localBR = new THREE.Vector3(-0.5 * scale, 0, -1.0 * scale).applyEuler(yawEuler);

      // Sample terrain height at the EXACT global rotated foot positions
      const hFL = getExactHeight(x + localFL.x, z + localFL.z, terrainGeo);
      const hFR = getExactHeight(x + localFR.x, z + localFR.z, terrainGeo);
      const hBL = getExactHeight(x + localBL.x, z + localBL.z, terrainGeo);
      const hBR = getExactHeight(x + localBR.x, z + localBR.z, terrainGeo);

      // Create 3D world coordinates for the feet
      const pFL = new THREE.Vector3(x + localFL.x, hFL, z + localFL.z);
      const pFR = new THREE.Vector3(x + localFR.x, hFR, z + localFR.z);
      const pBL = new THREE.Vector3(x + localBL.x, hBL, z + localBL.z);
      const pBR = new THREE.Vector3(x + localBR.x, hBR, z + localBR.z);

      // Calculate the average plane height to plant the origin
      const avgH = (hFL + hFR + hBL + hBR) / 4;
      setYPos(avgH + 0.15); // +0.15 buffer so toes rest visibly on the grass

      // Calculate the surface slope (Normal Vector) using crossing diagonals
      const diag1 = new THREE.Vector3().subVectors(pFL, pBR);
      const diag2 = new THREE.Vector3().subVectors(pFR, pBL);
      const normal = new THREE.Vector3().crossVectors(diag1, diag2).normalize();
      
      // Ensure the normal always points UP, not into the ground
      if (normal.y < 0) normal.negate();

      // Align the dinosaur's UP vector (0,1,0) to the terrain's slope
      const alignQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      
      // Combine the slope tilt with the base -45 degree Y-axis rotation
      const baseQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      alignQuat.multiply(baseQuat);

      // Convert the final quaternion into an Euler array for the Rapier RigidBody
      const finalEuler = new THREE.Euler().setFromQuaternion(alignQuat, 'YXZ');
      setRot([finalEuler.x, finalEuler.y, finalEuler.z]);
    }
  }, [terrainGeo, x, z, scale, scene]);

  // 2. Animations & Shadows
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
    // We now pass our calculated slope rotation directly to the RigidBody
    <RigidBody type="fixed" colliders={false} position={[x, yPos, z]} rotation={rot}>
      
      {/* 1. Raised Torso */}
      <CuboidCollider position={[0, 4.0 * scale, 0]} args={[0.6 * scale, 1.2 * scale, 2.0 * scale]} />
      
      {/* 2. Four Individual Legs 
          Radius increased to 0.35 * scale to prevent high-speed player phasing
      */}
      {/* Front Left */}
      <CylinderCollider position={[0.5 * scale, 1.5 * scale, 1.3 * scale]} args={[1.5 * scale, 0.35 * scale]} />
      {/* Front Right */}
      <CylinderCollider position={[-0.5 * scale, 1.5 * scale, 1.3 * scale]} args={[1.5 * scale, 0.35 * scale]} />
      {/* Back Left */}
      <CylinderCollider position={[0.5 * scale, 1.5 * scale, -1.0 * scale]} args={[1.5 * scale, 0.35 * scale]} />
      {/* Back Right */}
      <CylinderCollider position={[-0.5 * scale, 1.5 * scale, -1.0 * scale]} args={[1.5 * scale, 0.35 * scale]} />

      {/* 3. Neck Collider (Angled Upward) */}
      <CylinderCollider position={[0, 6.0 * scale, 3.2 * scale]} args={[2.5 * scale, 0.3 * scale]} rotation={[Math.PI / 4, 0, 0]} />
      
      {/* 4. Tail Collider (Angled Downward) */}
      <CylinderCollider position={[0, 3.5 * scale, -4.0 * scale]} args={[3.0 * scale, 0.3 * scale]} rotation={[-Math.PI / 10, 0, 0]} />

      <primitive ref={dinoRef} object={scene} scale={scale} />
    </RigidBody>
  );
}

useGLTF.preload('/models/Apatosaurus.glb');