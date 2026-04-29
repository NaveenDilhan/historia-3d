import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from './usePlayerControls';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { PositionalAudio } from '@react-three/drei';

export default function Player() {
  const playerRef = useRef();
  const { forward, backward, left, right, jump } = usePlayerControls();
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier(); 

  const speed = 18; 
  const jumpStrength = 8;

  // === Audio State ===
  const [audioIndex, setAudioIndex] = useState(1);
  const audioRefs = useRef([]);
  const lastStepTime = useRef(0);

  // === Pointer Lock ===
  useEffect(() => {
    const handleClick = () => gl.domElement.requestPointerLock();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [gl.domElement]);

  // === Mouse Look ===
  const pitch = useRef(0);
  const yaw = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === gl.domElement) {
        const sensitivity = 0.002;
        yaw.current -= e.movementX * sensitivity;
        pitch.current -= e.movementY * sensitivity;
        pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gl.domElement]);

  // === Main Physics & Audio Loop ===
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const linvel = playerRef.current.linvel();
    const pos = playerRef.current.translation();

    const direction = new THREE.Vector3(0, 0, 0);
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;
    direction.normalize();

    const rotMatrix = new THREE.Matrix4().makeRotationY(yaw.current);
    direction.applyMatrix4(rotMatrix);

    const targetX = direction.x * speed;
    const targetZ = direction.z * speed;
    
    const smoothX = THREE.MathUtils.lerp(linvel.x, targetX, 10 * delta);
    const smoothZ = THREE.MathUtils.lerp(linvel.z, targetZ, 10 * delta);

    playerRef.current.setLinvel({
      x: smoothX,
      y: linvel.y,
      z: smoothZ
    }, true);

    const rayOrigin = { x: pos.x, y: pos.y, z: pos.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(rayOrigin, rayDir);
    
    // Increased ray length slightly to ensure it detects uneven terrain
    const hit = world.castRay(ray, 2, true); 
    const isGrounded = hit && hit.toi < 1.2; 

    // --- Fixed Footstep Audio Logic ---
    const isMoving = (forward || backward || left || right);
    
    if (isMoving && isGrounded && state.clock.elapsedTime - lastStepTime.current > 0.4) {
      const currentAudio = audioRefs.current[audioIndex];
      
      // Ensure the audio component exists and its file buffer has finished loading
      if (currentAudio && currentAudio.buffer) {
        // Force the browser's audio context to wake up if it was suspended
        if (currentAudio.context.state === 'suspended') {
          currentAudio.context.resume();
        }
        
        if (!currentAudio.isPlaying) {
          currentAudio.setVolume(1.0);
          currentAudio.play();
        }
      }
      setAudioIndex((prev) => (prev % 6) + 1); 
      lastStepTime.current = state.clock.elapsedTime;
    }

    if (jump && isGrounded) {
      playerRef.current.setLinvel({ 
        x: smoothX, 
        y: jumpStrength, 
        z: smoothZ 
      }, true);
    }

    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
    
    camera.position.set(pos.x, pos.y + 0.8, pos.z);
  });

  return (
    <RigidBody
      ref={playerRef}
      position={[0, 20, 400]} // <-- CHANGED SPAWN POINT TO BEACH BIOME (Z: 400)
      colliders={false}
      mass={1}
      type="dynamic"
      enabledRotations={[false, false, false]} 
      friction={0} 
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      
      {/* Dynamic Player Footsteps */}
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <PositionalAudio
          key={num}
          ref={(el) => (audioRefs.current[num] = el)}
          url={`/sounds/jurrasic/0${num}-footstep.ogg`}
          distance={2} 
          loop={false}
        />
      ))}
    </RigidBody>
  );
}