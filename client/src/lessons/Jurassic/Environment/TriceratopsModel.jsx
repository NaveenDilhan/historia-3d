import React, { useRef, useEffect, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Clone } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

const TriceratopsModel = memo(function TriceratopsModel({ terrainGeo, hasStarted, x = -100, z = 80, scale = 2, rotationY = 4 }) {
  const groupRef = useRef();

  // Load Models
  const { scene, animations } = useGLTF('/models/jurrasic/Triceratops.glb');
  const { scene: fernScene } = useGLTF('/models/jurrasic/Fern.glb');
  const { actions, mixer } = useAnimations(animations, groupRef);

  // State
  const [yPos, setYPos] = useState(0);
  const [rot, setRot] = useState([0, rotationY, 0]);
  const [fernY, setFernY] = useState(0);
  const [action, setAction] = useState('idle'); // 'idle', 'eating', 'attack'
  const neckBone = useRef(null);

  // Calculate the exact offset for the Fern using Trig so it sits safely in front of the mouth
  const fernDist = 4.0 * scale;
  const fernX = x + Math.sin(rotationY) * fernDist;
  const fernZ = z + Math.cos(rotationY) * fernDist;

  // 1. Terrain Height & Slope Alignment (Fixes floating legs)
  useEffect(() => {
    if (terrainGeo && scene) {
      const yawEuler = new THREE.Euler(0, rotationY, 0);

      // Approximate spacing for the Triceratops legs
      const width = 0.5 * scale;
      const lengthFront = 0.9 * scale;
      const lengthBack = -1.1 * scale;

      // Map local feet positions
      const localFL = new THREE.Vector3(width, 0, lengthFront).applyEuler(yawEuler);
      const localFR = new THREE.Vector3(-width, 0, lengthFront).applyEuler(yawEuler);
      const localBL = new THREE.Vector3(width, 0, lengthBack).applyEuler(yawEuler);
      const localBR = new THREE.Vector3(-width, 0, lengthBack).applyEuler(yawEuler);

      // Get exact terrain height at all 4 feet
      const hFL = getExactHeight(x + localFL.x, z + localFL.z, terrainGeo);
      const hFR = getExactHeight(x + localFR.x, z + localFR.z, terrainGeo);
      const hBL = getExactHeight(x + localBL.x, z + localBL.z, terrainGeo);
      const hBR = getExactHeight(x + localBR.x, z + localBR.z, terrainGeo);

      const pFL = new THREE.Vector3(x + localFL.x, hFL, z + localFL.z);
      const pFR = new THREE.Vector3(x + localFR.x, hFR, z + localFR.z);
      const pBL = new THREE.Vector3(x + localBL.x, hBL, z + localBL.z);
      const pBR = new THREE.Vector3(x + localBR.x, hBR, z + localBR.z);

      // Calculate average height for the body center
      const avgH = (hFL + hFR + hBL + hBR) / 4;

      // Calculate the surface normal (the slope)
      const diag1 = new THREE.Vector3().subVectors(pFL, pBR);
      const diag2 = new THREE.Vector3().subVectors(pFR, pBL);
      const normal = new THREE.Vector3().crossVectors(diag1, diag2).normalize();

      if (normal.y < 0) normal.negate();

      const alignQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      const baseQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);

      // Manual pitch offset to lift the back legs up slightly, making sure they touch the surface
      // Positive X rotation dips the head down and lifts the back/tail up.
      const pitchOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.12); 

      alignQuat.multiply(pitchOffset);
      alignQuat.multiply(baseQuat);

      const finalEuler = new THREE.Euler().setFromQuaternion(alignQuat, 'YXZ');

      setRot([finalEuler.x, finalEuler.y, finalEuler.z]);
      setYPos(avgH + (scale * 0.15)); // Adjusted base offset to prevent clipping after rotating

      // Sink the fern roots slightly into the soil
      setFernY(getExactHeight(fernX, fernZ, terrainGeo) - 0.2);
    }
  }, [terrainGeo, x, z, fernX, fernZ, scene, scale, rotationY]);

  // 2. Bone Discovery
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

  // 3. Robust Animation State Machine
  useEffect(() => {
    if (!hasStarted || animations.length === 0) return;
    const idleName = animations.find(a => a.name.toLowerCase().includes('idle'))?.name || animations[0]?.name;
    
    // Strictly search ONLY for "attack"
    const attackName = animations.find(a => a.name.toLowerCase().includes('attack'))?.name || (animations.length > 1 ? animations[1].name : animations[0].name);

    if (action === 'attack') {
      if (actions[idleName]) actions[idleName].fadeOut(0.2);
      if (actions[attackName]) {
        actions[attackName].reset().fadeIn(0.2).play();
        actions[attackName].setLoop(THREE.LoopOnce); // Only play once
        actions[attackName].clampWhenFinished = true;
      }
    } else {
      if (actions[attackName]) actions[attackName].fadeOut(0.4);
      if (actions[idleName]) actions[idleName].reset().fadeIn(0.4).play();
    }
  }, [action, actions, animations, hasStarted]);

  // 4. Return to Idle after Attack finishes
  useEffect(() => {
    const handleFinished = () => {
      setAction('idle'); 
    };
    mixer.addEventListener('finished', handleFinished);
    return () => mixer.removeEventListener('finished', handleFinished);
  }, [mixer]);

  // 5. Automated AI Life Loop
  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => {
      setAction((prev) => {
        if (prev === 'attack') return prev; // Don't interrupt an attack
        return Math.random() > 0.5 ? 'eating' : 'idle'; 
      });
    }, 5000 + Math.random() * 4000); 

    return () => clearInterval(interval);
  }, [hasStarted]);

  // 6. Procedural Neck Bending
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
        // Snap neck back to normal immediately during an attack so the raw animation plays cleanly
        neckBone.current.rotation.x = THREE.MathUtils.lerp(neckBone.current.rotation.x, 0, delta * 8);
      }
    }
  });

  return (
    <group>
      {/* TRICERATOPS */}
      <RigidBody type="fixed" colliders={false} position={[x, yPos, z]} rotation={rot}>
        
        {/* Physics Hitbox: Made much thicker/longer to completely prevent walking through it */}
        <CuboidCollider position={[0, 1.5 * scale, 0]} args={[scale * 1.5, scale * 1.8, scale * 3.5]} />
        
        <group ref={groupRef}>
          <primitive object={scene} scale={scale} />
          
          {/* Interaction Hitbox: Centered perfectly to catch the mouse */}
          <mesh
            position={[0, 1.5 * scale, 0]} 
            scale={[scale * 4, scale * 3, scale * 6]} 
            onClick={(e) => {
              e.stopPropagation();
              if (action === 'attack') return; // Prevent spam clicking
              
              // 1. Trigger the attack animation immediately
              setAction('attack'); 
              
              // 2. Wait 3.5 seconds for the animation to play out BEFORE showing the UI modal
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
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </RigidBody>

      {/* DEDICATED FERN */}
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