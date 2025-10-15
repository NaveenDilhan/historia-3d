import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from './usePlayerControls';
import * as THREE from 'three';

export default function Player({ terrainGeo }) {
  const ref = useRef();
  const { forward, backward, left, right, jump } = usePlayerControls();
  const { camera, gl } = useThree();

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const speed = 8; // slightly faster movement
  const gravity = 9.8;
  const jumpStrength = 5;
  const playerHeight = 2; // keeps camera above ground
  const upVector = new THREE.Vector3(0, 1, 0);

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

  // === Improved Terrain Height Sampling (bilinear interpolation) ===
  const getHeight = (x, z) => {
    if (!terrainGeo) return 0;

    const size = 200;
    const segments = 256;
    const positions = terrainGeo.attributes.position;

    const ix = ((x + size / 2) / size) * segments;
    const iz = ((z + size / 2) / size) * segments;
    const ixi = Math.floor(ix);
    const izi = Math.floor(iz);
    const fractX = ix - ixi;
    const fractZ = iz - izi;

    const getZ = (xIndex, zIndex) => {
      const idx = xIndex + zIndex * (segments + 1);
      return positions.getZ(idx) || 0;
    };

    const h00 = getZ(ixi, izi);
    const h10 = getZ(ixi + 1, izi);
    const h01 = getZ(ixi, izi + 1);
    const h11 = getZ(ixi + 1, izi + 1);

    // Bilinear interpolation for smooth transition
    const h0 = h00 * (1 - fractX) + h10 * fractX;
    const h1 = h01 * (1 - fractX) + h11 * fractX;
    const height = h0 * (1 - fractZ) + h1 * fractZ;

    return height;
  };

  // === Main Frame Loop ===
  useFrame((_, delta) => {
    if (!ref.current) return;

    // Reset direction each frame
    direction.current.set(0, 0, 0);
    if (forward) direction.current.z -= 1;
    if (backward) direction.current.z += 1;
    if (left) direction.current.x -= 1;
    if (right) direction.current.x += 1;
    direction.current.normalize();

    // Apply yaw rotation to movement
    const rotMatrix = new THREE.Matrix4().makeRotationY(yaw.current);
    direction.current.applyMatrix4(rotMatrix);

    // Horizontal movement
    velocity.current.x = direction.current.x * speed;
    velocity.current.z = direction.current.z * speed;

    // Apply gravity
    velocity.current.y -= gravity * delta;

    // Determine terrain height below player
    const terrainHeight = getHeight(ref.current.position.x, ref.current.position.z) + playerHeight;

    // Ground collision
    if (ref.current.position.y <= terrainHeight) {
      velocity.current.y = 0;
      ref.current.position.y = terrainHeight;
      if (jump) velocity.current.y = jumpStrength; // allow jump when grounded
    }

    // Apply movement
    ref.current.position.addScaledVector(velocity.current, delta);

    // Camera follows player
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
    camera.position.copy(ref.current.position);
  });

  return <mesh ref={ref} position={[0, 5, 0]} />;
}
