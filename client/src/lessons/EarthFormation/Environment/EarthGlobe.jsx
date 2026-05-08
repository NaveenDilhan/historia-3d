import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ERAS } from '../hooks/useTimeScroll';

export default function EarthGlobe() {
  const globeRef = useRef();
  const [progress, setProgress] = useState(0);

  // Load all era textures
  const textures = useTexture([
    '/textures/earth/hadean.jpg',
    '/textures/earth/archean.jpg',
    '/textures/earth/proterozoic.jpg',
    '/textures/earth/pangea.jpg',
    '/textures/earth/present.jpg'
  ]);

  // Material refs for opacity blending
  const materialsRef = useRef([]);

  useEffect(() => {
    const handleProgress = (e) => setProgress(e.detail.progress);
    window.addEventListener('timeline-progress', handleProgress);
    return () => window.removeEventListener('timeline-progress', handleProgress);
  }, []);

  useFrame(() => {
    if (globeRef.current) {
      // Physical rotation maps directly to timeline progress
      globeRef.current.rotation.y = progress * Math.PI * 15; 
      
      // Calculate opacity for crossfading textures based on thresholds
      materialsRef.current.forEach((mat, index) => {
        if (!mat) return;
        const era = ERAS[index];
        const nextEra = ERAS[index + 1];
        
        if (!nextEra) {
          mat.opacity = progress >= era.threshold ? 1 : 0;
        } else {
           // Blend out current texture as we approach the next threshold
           const range = nextEra.threshold - era.threshold;
           const localProgress = (progress - era.threshold) / range;
           
           if (progress < era.threshold) mat.opacity = 0;
           else if (progress >= nextEra.threshold) mat.opacity = 0;
           else mat.opacity = 1 - localProgress; 
        }
      });
    }
  });

  return (
    <group ref={globeRef}>
      {textures.map((texture, index) => (
        <mesh key={`earth-layer-${index}`} radius={5}>
          {/* Slightly increase scale of outer spheres to prevent z-fighting */}
          <sphereGeometry args={[5 + (index * 0.001), 64, 64]} />
          <meshStandardMaterial 
            ref={(el) => (materialsRef.current[index] = el)}
            map={texture} 
            transparent={true}
            roughness={index === 0 ? 0.2 : 0.6} // Make lava shinier
          />
        </mesh>
      ))}
    </group>
  );
}

useTexture.preload([
  '/textures/earth/hadean.jpg',
  '/textures/earth/archean.jpg',
  '/textures/earth/proterozoic.jpg',
  '/textures/earth/pangea.jpg',
  '/textures/earth/present.jpg'
]);