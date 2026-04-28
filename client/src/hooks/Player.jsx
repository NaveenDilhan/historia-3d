import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from './usePlayerControls';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';

export default function Player() {
  const playerRef = useRef();
  const { forward, backward, left, right, jump } = usePlayerControls();
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier(); // Import rapier physics tools for raycasting

  const speed = 18; // Increased from 12 for brisker walking
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
  useFrame((state, delta) => {
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

    // 4. Apply physical velocity smoothly using lerp (adds momentum/smooth stops)
    const targetX = direction.x * speed;
    const targetZ = direction.z * speed;
    
    // Lerp factor (10 * delta) dictates how slippery or snappy the movement is
    const smoothX = THREE.MathUtils.lerp(linvel.x, targetX, 10 * delta);
    const smoothZ = THREE.MathUtils.lerp(linvel.z, targetZ, 10 * delta);

    playerRef.current.setLinvel({
      x: smoothX,
      y: linvel.y,
      z: smoothZ
    }, true);

    // 5. Jump logic: Use a Raycast to accurately check if the player is touching the ground
    const rayOrigin = { x: pos.x, y: pos.y, z: pos.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(rayOrigin, rayDir);
    
    // castRay(ray, maxDistance, solid)
    const hit = world.castRay(ray, 10, true);
    
    // The capsule is 1 unit from center to bottom (halfHeight 0.5 + radius 0.5 = 1.0)
    // A hit time of impact (toi) < 1.1 means we are very close to or on the ground
    const isGrounded = hit && hit.toi < 1.1; 

    if (jump && isGrounded) {
      playerRef.current.setLinvel({ 
        x: smoothX, 
        y: jumpStrength, 
        z: smoothZ 
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
      position={[0, 20, 0]} 
      colliders={false}
      mass={1}
      type="dynamic"
      enabledRotations={[false, false, false]} 
      friction={0} // Prevents the player from sticking to walls or rough terrain
    >
      <CapsuleCollider args={[0.5, 0.5]} />
    </RigidBody>
  );
}