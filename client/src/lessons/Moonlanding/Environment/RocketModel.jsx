import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function RocketModel({ phase, launchProgress }) {
  const rocketRef = useRef();

  useFrame((state, delta) => {
    if (!rocketRef.current) return;

    if (phase === 'liftoff') {
      // Rocket launching up smoothly
      rocketRef.current.position.y += delta * 80; 
    } else if (phase === 'launch' && launchProgress > 0) {
      // Shaking logic before launch based on spacebar progress
      const intensity = (launchProgress / 100) * 0.15;
      rocketRef.current.position.x = (Math.random() - 0.5) * intensity;
      rocketRef.current.position.z = (Math.random() - 0.5) * intensity;
    } else {
      rocketRef.current.position.x = 0;
      rocketRef.current.position.z = 0;
    }
  });

  return (
    <group ref={rocketRef} position={[0, 10, 0]}>
      {/* Main Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2, 2, 20, 32]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>
      {/* Nose Cone */}
      <mesh position={[0, 12, 0]}>
        <coneGeometry args={[2, 4, 32]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>
      {/* Thrusters */}
      <mesh position={[0, -11, 0]}>
        <cylinderGeometry args={[2, 2.5, 2, 32]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Exhaust Fire */}
      {(launchProgress > 0 || phase === 'liftoff') && (
        <mesh position={[0, -14, 0]}>
          <coneGeometry args={[2.5, 8, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}