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
   
      nodes.Rocket.position.x = initialPos.current.x;
      nodes.Rocket.position.z = initialPos.current.z;
    }

  
    if (fireRef.current) {

      fireRef.current.position.copy(nodes.Rocket.position);
      
    
      fireRef.current.position.y -= 4; 
    }
  });

  return (

    <group position={[0, 25.75, 0]}> 
      

      <primitive object={scene} />
      

      {(launchProgress > 0 || phase === 'liftoff') && (
        <mesh ref={fireRef}>

          <coneGeometry args={[3.5, 8, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
        </mesh>
      )}
      
    </group>
  );
}


useGLTF.preload('/models/moon/saturnv.glb');