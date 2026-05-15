import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function VoidGlobe({ progress }) {
  const pointsRef = useRef();
  const count = 12000; 
  const globeRadius = 5.0;
  
 
  const [initialPositions, targetPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    
    for(let i = 0; i < count; i++) {
       
       pos[i*3] = (Math.random() - 0.5) * 60;
       pos[i*3+1] = (Math.random() - 0.5) * 60;
       pos[i*3+2] = (Math.random() - 0.5) * 60;
       
       
       const phi = Math.acos(-1 + (2 * i) / count);
       const theta = Math.sqrt(count * Math.PI) * phi;
       
       target[i*3] = globeRadius * Math.cos(theta) * Math.sin(phi);
       target[i*3+1] = globeRadius * Math.sin(theta) * Math.sin(phi);
       target[i*3+2] = globeRadius * Math.cos(phi);
    }
    return [pos, target];
  }, [count, globeRadius]);

  useFrame(() => {
     if(!pointsRef.current) return;
     
     
     const gatherProgress = THREE.MathUtils.clamp(progress / 0.2, 0, 1);
     
    
     const ease = gatherProgress < 0.5 ? 2 * gatherProgress * gatherProgress : 1 - Math.pow(-2 * gatherProgress + 2, 2) / 2;
     
     const positionsAttr = pointsRef.current.geometry.attributes.position;
     
     for(let i = 0; i < count; i++) {
       
        positionsAttr.array[i*3] = THREE.MathUtils.lerp(initialPositions[i*3], targetPositions[i*3], ease);
        positionsAttr.array[i*3+1] = THREE.MathUtils.lerp(initialPositions[i*3+1], targetPositions[i*3+1], ease);
        positionsAttr.array[i*3+2] = THREE.MathUtils.lerp(initialPositions[i*3+2], targetPositions[i*3+2], ease);
     }
     
     positionsAttr.needsUpdate = true;
     
     // Slowly rotate the gathering dust cloud
     pointsRef.current.rotation.y += 0.001;
     pointsRef.current.rotation.z += 0.0005;

     
     pointsRef.current.material.opacity = 1.0 - Math.pow(gatherProgress, 4);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={initialPositions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.06} 
        color="#ff7733" 
        transparent 
        opacity={1} 
        sizeAttenuation 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
}