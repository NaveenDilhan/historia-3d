import React from 'react';

export default function Lighting() {
  return (
    <group>
      {/* Richer contrast: warmer sky, deeper jungle-green bounce light from the ground */}
      <hemisphereLight skyColor="#b4e4ff" groundColor="#162b12" intensity={0.7} />
      
      {/* Warmer ambient fill */}
      <ambientLight color="#ffcfa3" intensity={0.3} />
      
      {/* Dramatic Golden Hour Sun */}
      <directionalLight
        // 1. FIXED: Moved the light drastically further back and up so the 
        // shadow camera doesn't sit inside the terrain.
        position={[1500, 400, -500]} 
        intensity={3.0}
        color="#ffebd6"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        // 2. FIXED: Adjusted clipping planes for the new distance
        shadow-camera-near={100}
        shadow-camera-far={5000} 
        shadow-camera-left={-1000}
        shadow-camera-right={1000}
        shadow-camera-top={1000}
        shadow-camera-bottom={-1000}
        // 3. FIXED: Tweaked biases to stop the micro-stuttering/flickering of shadows on surfaces
        shadow-bias={-0.0005} 
        shadow-normalBias={0.05} 
      />
    </group>
  );
}