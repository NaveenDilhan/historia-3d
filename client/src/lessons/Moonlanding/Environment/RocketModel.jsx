import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function RocketModel({ phase, launchProgress }) {
  const { scene, nodes } = useGLTF('/models/moon/saturnv.glb');
  
  const fireRef = useRef();
  const initialPos = useRef(new THREE.Vector3());
  const isInitialized = useRef(false);

  // Store the initial position of the rocket so we can shake it and reset it properly
  useEffect(() => {
    if (nodes.Rocket && !isInitialized.current) {
      initialPos.current.copy(nodes.Rocket.position);
      isInitialized.current = true;
    }
  }, [nodes.Rocket]);

  useFrame((state, delta) => {
    if (!nodes.Rocket || !isInitialized.current) return;

    // 1. Handle Rocket Animation
    if (phase === 'liftoff') {
      // Rocket launching up smoothly
      nodes.Rocket.position.y += delta * 80; 
    } else if (phase === 'launch' && launchProgress > 0) {
      // Shaking logic before launch
      const intensity = (launchProgress / 100) * 0.15;
      nodes.Rocket.position.x = initialPos.current.x + (Math.random() - 0.5) * intensity;
      nodes.Rocket.position.z = initialPos.current.z + (Math.random() - 0.5) * intensity;
    } else if (phase !== 'liftoff') {
      // Lock to initial position when not launching/shaking
      nodes.Rocket.position.x = initialPos.current.x;
      nodes.Rocket.position.z = initialPos.current.z;
    }

    // 2. Sync Fire to Rocket's exact position
    if (fireRef.current) {
      // Copy the rocket's current position
      fireRef.current.position.copy(nodes.Rocket.position);
      
      // Since a cone's origin is in its center, and the cone is 8 units tall, 
      // shifting it down by 4 puts the very top tip of the fire EXACTLY at the rocket's combustion origin.
      fireRef.current.position.y -= 4; 
    }
  });

  return (
    // Lift the entire 3D model up by 25.75 units to match the newly raised launchpad
    <group position={[0, 25.75, 0]}> 
      
      {/* Renders the entire scene (Tower, Pad, and Rocket) */}
      <primitive object={scene} />
      
      {/* Exhaust Fire */}
      {(launchProgress > 0 || phase === 'liftoff') && (
        <mesh ref={fireRef}>
          {/* A cone tapering upwards to the engine nozzle */}
          <coneGeometry args={[3.5, 8, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
        </mesh>
      )}
      
    </group>
  );
}

// Preload the model so it doesn't pop in late
useGLTF.preload('/models/moon/saturnv.glb');