import React from 'react';

export default function Ocean() {
  return (
    <mesh position={[0, -4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2000, 3000, 64, 64]} />
      <meshPhysicalMaterial 
        color="#002b1f" 
        transmission={0.8} 
        opacity={1} 
        transparent 
        roughness={0.2} 
        metalness={0.5} 
        ior={1.33} 
        thickness={10} 
      />
    </mesh>
  );
}