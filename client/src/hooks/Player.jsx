import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from './usePlayerControls';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';

export default function Player() {
  const playerRef = useRef();
  const { forward, backward, left, right, jump } = usePlayerControls();
  const { camera, gl } = useThree();

  const speed = 12; // Slightly tuned for physics movement
  const jumpStrength = 8;

  // === Pointer Lock (click to look around) ===
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

  // === Main Physics Loop ===
  useFrame(() => {
    if (!playerRef.current) return;

    // 1. Get current physical velocity and position from Rapier
    const linvel = playerRef.current.linvel();
    const pos = playerRef.current.translation();

    // 2. Calculate intended movement direction
    const direction = new THREE.Vector3(0, 0, 0);
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;
    direction.normalize();

    // 3. Apply camera yaw rotation to movement so we walk where we look
    const rotMatrix = new THREE.Matrix4().makeRotationY(yaw.current);
    direction.applyMatrix4(rotMatrix);

    // 4. Apply physical velocity (preserving Y velocity for gravity/falling)
    playerRef.current.setLinvel({
      x: direction.x * speed,
      y: linvel.y,
      z: direction.z * speed
    }, true);

    // 5. Jump logic (Only allow jump if vertical velocity is near zero to prevent double jumps)
    const isGrounded = Math.abs(linvel.y) < 0.5;
    if (jump && isGrounded) {
      playerRef.current.setLinvel({ 
        x: direction.x * speed, 
        y: jumpStrength, 
        z: direction.z * speed 
      }, true);
    }

    // 6. Camera follows the player's physical capsule
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
    
    // Position camera at "eye level" (Capsule is total 2 units tall, center is 0, so +0.8 is head level)
    camera.position.set(pos.x, pos.y + 0.8, pos.z);
  });

  return (
    <RigidBody
      ref={playerRef}
      position={[0, 20, 0]} // Spawn high so the player safely drops onto the ground
      colliders={false}
      mass={1}
      type="dynamic"
      enabledRotations={[false, false, false]} // Locks rotation so the player doesn't tip over like a ragdoll
    >
      {/* Capsule Collider provides smooth sliding against rocks and trees. 
        Args: [halfHeight, radius] -> 0.5 + 0.5 = 2 total units tall
      */}
      <CapsuleCollider args={[0.5, 0.5]} />
    </RigidBody>
  );
}