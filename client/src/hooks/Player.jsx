import { useRef, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { usePlayerControls } from './usePlayerControls';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { PositionalAudio } from '@react-three/drei';

// PRELOAD AUDIO to prevent mid-scene Suspense cascading
[1, 2, 3, 4, 5, 6].forEach((num) => {
  useLoader.preload(THREE.AudioLoader, `/sounds/jurrasic/0${num}-footstep.ogg`);
});

// HOISTED VARIABLES: Prevents GC stuttering
const _direction = new THREE.Vector3();
const _rotMatrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _linvelTarget = { x: 0, y: 0, z: 0 };

export default function Player() {
  const playerRef = useRef();
  const keys = usePlayerControls();
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();
  
  const speed = 18;
  const jumpStrength = 8;
  const audioIndexRef = useRef(1);
  const audioRefs = useRef([]);
  const lastStepTime = useRef(0);

  useEffect(() => {
    const handleClick = () => gl.domElement.requestPointerLock();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [gl.domElement]);

  const pitch = useRef(0);
  const yaw = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === gl.domElement) {
        const sensitivity = 0.002;
        const movX = e.movementX || 0;
        const movY = e.movementY || 0;
        
        yaw.current -= movX * sensitivity;
        pitch.current -= movY * sensitivity;
        pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gl.domElement]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    // Safely supports both useState and useRef control hooks without crashing
    const controls = keys.current || keys || {};
    const forward = controls.forward || false;
    const backward = controls.backward || false;
    const left = controls.left || false;
    const right = controls.right || false;
    const jump = controls.jump || false;

    const linvel = playerRef.current.linvel();
    const pos = playerRef.current.translation();
    
    _direction.set(0, 0, 0);
    if (forward) _direction.z -= 1;
    if (backward) _direction.z += 1;
    if (left) _direction.x -= 1;
    if (right) _direction.x += 1;

    // Safely normalize only if the player is pressing keys to prevent NaN math explosions
    if (_direction.lengthSq() > 0) {
      _direction.normalize();
      _rotMatrix.makeRotationY(yaw.current);
      _direction.applyMatrix4(_rotMatrix);
    }

    const targetX = _direction.x * speed;
    const targetZ = _direction.z * speed;
    
    const currentVelX = linvel.x || 0;
    const currentVelZ = linvel.z || 0;

    const safeLerpFactor = 1.0 - Math.exp(-15 * delta);
    const smoothX = THREE.MathUtils.lerp(currentVelX, targetX, safeLerpFactor);
    const smoothZ = THREE.MathUtils.lerp(currentVelZ, targetZ, safeLerpFactor);

    _linvelTarget.x = smoothX;
    _linvelTarget.y = linvel.y || 0;
    _linvelTarget.z = smoothZ;

    // CRITICAL FIX: Lower the raycast origin to the bottom of the capsule and set solid to false
    // so the raycast doesn't hit the player's own internal geometry.
    const rayOrigin = { x: pos.x || 0, y: (pos.y || 0) - 0.9, z: pos.z || 0 };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(rayOrigin, rayDir);
    
    const hit = world.castRay(ray, 0.5, false);
    const isGrounded = hit && hit.toi < 0.3;

    const isMoving = (forward || backward || left || right);

    if (isMoving && isGrounded && state.clock.elapsedTime - lastStepTime.current > 0.4) {
      const currentAudio = audioRefs.current[audioIndexRef.current];
      if (currentAudio && currentAudio.buffer) {
        if (currentAudio.context.state === 'suspended') {
          currentAudio.context.resume();
        }
        if (!currentAudio.isPlaying) {
          currentAudio.setVolume(1.0);
          currentAudio.play();
        }
      }
      audioIndexRef.current = (audioIndexRef.current % 6) + 1;
      lastStepTime.current = state.clock.elapsedTime;
    }

    if (jump && isGrounded) {
      _linvelTarget.y = jumpStrength;
    }

    // Apply the physics velocities
    playerRef.current.setLinvel(_linvelTarget, true);

    // Apply the camera rotations and positions
    if (typeof pitch.current === 'number' && typeof yaw.current === 'number') {
      _euler.set(pitch.current, yaw.current, 0, 'YXZ');
      _quaternion.setFromEuler(_euler);
      camera.quaternion.copy(_quaternion);
    }
    
    if (pos && typeof pos.x === 'number') {
       camera.position.set(pos.x, pos.y + 0.8, pos.z);
    }
  });

  return (
    <RigidBody
      ref={playerRef}
      position={[0, 20, 400]}
      colliders={false}
      mass={1}
      type="dynamic"
      enabledRotations={[false, false, false]}
      friction={0}
      ccd={true} // CRITICAL FIX: Prevents the player from piercing deeply into the trimesh
    >
      <CapsuleCollider args={[0.5, 0.5]} />
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