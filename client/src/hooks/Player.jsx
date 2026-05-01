import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from './usePlayerControls';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { PositionalAudio } from '@react-three/drei';

// Hoisted out of useFrame to prevent GC stuttering
const _direction = new THREE.Vector3();
const _rotMatrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

export default function Player() {
  const playerRef = useRef();
  const { forward, backward, left, right, jump } = usePlayerControls();
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier(); 
  
  const speed = 18; 
  const jumpStrength = 8;
  const [audioIndex, setAudioIndex] = useState(1);
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
        yaw.current -= e.movementX * sensitivity;
        pitch.current -= e.movementY * sensitivity;
        pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gl.domElement]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    const linvel = playerRef.current.linvel();
    const pos = playerRef.current.translation();
    
    _direction.set(0, 0, 0);
    if (forward) _direction.z -= 1;
    if (backward) _direction.z += 1;
    if (left) _direction.x -= 1;
    if (right) _direction.x += 1;
    _direction.normalize();

    _rotMatrix.makeRotationY(yaw.current);
    _direction.applyMatrix4(_rotMatrix);

    const targetX = _direction.x * speed;
    const targetZ = _direction.z * speed;
    
    const smoothX = THREE.MathUtils.lerp(linvel.x, targetX, 10 * delta);
    const smoothZ = THREE.MathUtils.lerp(linvel.z, targetZ, 10 * delta);

    playerRef.current.setLinvel({ x: smoothX, y: linvel.y, z: smoothZ }, true);

    const rayOrigin = { x: pos.x, y: pos.y, z: pos.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, 2, true);
    const isGrounded = hit && hit.toi < 1.2;

    const isMoving = (forward || backward || left || right);
    if (isMoving && isGrounded && state.clock.elapsedTime - lastStepTime.current > 0.4) {
      const currentAudio = audioRefs.current[audioIndex];
      if (currentAudio && currentAudio.buffer) {
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
      playerRef.current.setLinvel({ x: smoothX, y: jumpStrength, z: smoothZ }, true);
    }

    _euler.set(pitch.current, yaw.current, 0, 'YXZ');
    _quaternion.setFromEuler(_euler);
    camera.quaternion.copy(_quaternion);
    camera.position.set(pos.x, pos.y + 0.8, pos.z);
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