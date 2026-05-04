import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Lighting({ meteorStrikeActive }) {
  const dirLightRef = useRef();
  const hemiLightRef = useRef();

  useFrame((state, delta) => {
    if (meteorStrikeActive) {
      // Transition to intense apocalyptic lighting
      const targetDirColor = new THREE.Color('#ff2200');
      const targetHemiGround = new THREE.Color('#1a0500');
      const targetHemiSky = new THREE.Color('#4a0a00');

      if (dirLightRef.current) {
        dirLightRef.current.color.lerp(targetDirColor, delta * 0.5);
        // Ramp up intensity for dramatic shadows
        dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, 5.0, delta * 0.5); 
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.lerp(targetHemiSky, delta * 0.5);
        hemiLightRef.current.groundColor.lerp(targetHemiGround, delta * 0.5);
      }
    }
  });

  return (
    <group>
      <hemisphereLight ref={hemiLightRef} skyColor="#b4e4ff" groundColor="#162b12" intensity={0.7} />
      <ambientLight color="#ffcfa3" intensity={0.3} />
      
      <directionalLight
        ref={dirLightRef}
        position={[1500, 400, -500]}
        intensity={3.0}
        color="#ffebd6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={100}
        shadow-camera-far={5000}
        shadow-camera-left={-1000}
        shadow-camera-right={1000}
        shadow-camera-top={1000}
        shadow-camera-bottom={-1000}
        shadow-bias={-0.0005}
        shadow-normalBias={0.05}
      />
    </group>
  );
}