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

// HOISTED VARIABLES: Prevents extreme GC stuttering during physics checks
const _direction = new THREE.Vector3();
const _rotMatrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _linvelTarget = { x: 0, y: 0, z: 0 };
const _rayOrigin = { x: 0, y: 0, z: 0 };
const _rayDir = { x: 0, y: -1, z: 0 };

export default function Player({ hasStarted }) {
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
    const handleClick = () => {
      if (hasStarted) {
        gl.domElement.requestPointerLock();
      }
    };
    
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [gl.domElement, hasStarted]);

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
    
    const isLocked = document.pointerLockElement === gl.domElement;
    const controls = keys.current || keys || {};
    
    const forward = isLocked && (controls.forward || false);
    const backward = isLocked && (controls.backward || false);
    const left = isLocked && (controls.left || false);
    const right = isLocked && (controls.right || false);
    const jump = isLocked && (controls.jump || false);

    const linvel = playerRef.current.linvel();
    const pos = playerRef.current.translation();
    
    _direction.set(0, 0, 0);
    if (forward) _direction.z -= 1;
    if (backward) _direction.z += 1;
    if (left) _direction.x -= 1;
    if (right) _direction.x += 1;

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

    // Utilize hoisted objects to heavily reduce memory footprint
    _rayOrigin.x = pos.x || 0;
    _rayOrigin.y = (pos.y || 0) - 0.9;
    _rayOrigin.z = pos.z || 0;
    
    const ray = new rapier.Ray(_rayOrigin, _rayDir);
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

    playerRef.current.setLinvel(_linvelTarget, true);

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
      ccd={true} 
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