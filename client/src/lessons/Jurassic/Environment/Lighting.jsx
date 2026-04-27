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
        position={[150, 40, -50]} 
        intensity={3.0} // Boosted for stronger highlights through the bloom pass
        color="#ffebd6"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={10}
        shadow-camera-far={400}
        shadow-camera-left={-250}
        shadow-camera-right={250}
        shadow-camera-top={250}
        shadow-camera-bottom={-250}
        shadow-bias={-0.0001} 
        shadow-normalBias={0.02} // Fixes surface acne without requiring heavier shadow maps
      />
    </group>
  );
}