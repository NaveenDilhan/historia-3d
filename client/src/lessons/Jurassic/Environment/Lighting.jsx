import React from 'react';

export default function Lighting() {
  return (
    <group>
      <hemisphereLight skyColor="#b4e4ff" groundColor="#162b12" intensity={0.7} />
      
      <ambientLight color="#ffcfa3" intensity={0.3} />
      
      <directionalLight
        position={[1500, 400, -500]} 
        intensity={3.0}
        color="#ffebd6"
        castShadow
        // CRITICAL FIX: Halved to prevent GPU Memory Timeouts on sweeping views
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
