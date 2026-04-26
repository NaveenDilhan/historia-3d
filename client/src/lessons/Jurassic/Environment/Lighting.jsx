import React from 'react';

export default function Lighting() {
  return (
    <group>
      {/* Cool sky reflections, dark green/brown bounce light from ground */}
      <hemisphereLight skyColor="#a2d5f2" groundColor="#2a3b25" intensity={0.6} />
      
      {/* Warm ambient fill */}
      <ambientLight color="#ffd8a8" intensity={0.25} />
      
      {/* Dramatic Golden Hour Sun */}
      <directionalLight
        position={[150, 40, -50]} // Matches the Sky sunPosition
        intensity={2.5}
        color="#ffebd6"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={600}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-bias={-0.0003} // Fine-tuned bias to eliminate shadow acne
      />
    </group>
  );
}