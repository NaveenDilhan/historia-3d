import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ERAS = [
  { index: 0, id: 'hadean', name: 'Hadean Eon', time: '4.6 Billion Years Ago', threshold: 0.0 },
  { index: 1, id: 'archean', name: 'Archean Eon', time: '4.0 Billion Years Ago', threshold: 0.25 },
  { index: 2, id: 'proterozoic', name: 'Proterozoic Eon', time: '2.5 Billion Years Ago', threshold: 0.5 },
  { index: 3, id: 'mesozoic', name: 'Mesozoic Era (Pangea)', time: '250 Million Years Ago', threshold: 0.75 },
  { index: 4, id: 'present', name: 'Present Day', time: 'Today', threshold: 1.0 },
];

export default function useTimeScroll(hasStarted) {
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const [activeEra, setActiveEra] = useState(ERAS[0]);

  useEffect(() => {
    if (!hasStarted) return;

    const handleWheel = (e) => {
      // Adjust scroll speed multiplier as needed
      const scrollSpeed = 0.0005; 
      targetProgress.current += e.deltaY * scrollSpeed;
      
      // Clamp between 0 (Beginning) and 1 (Present)
      targetProgress.current = THREE.MathUtils.clamp(targetProgress.current, 0, 1);
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [hasStarted]);

  useFrame((state, delta) => {
    if (!hasStarted) return;

    // Smoothly interpolate current progress towards the target
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, targetProgress.current, delta * 2);

    // Determine current Era based on progress
    const matchedEra = ERAS.slice().reverse().find(era => currentProgress.current >= era.threshold - 0.05) || ERAS[0];
    
    if (matchedEra.id !== activeEra.id) {
      setActiveEra(matchedEra);
      window.dispatchEvent(new CustomEvent('era-change', { detail: { era: matchedEra } }));
    }

    // Broadcast precise progress for the globe rotation/blending
    window.dispatchEvent(new CustomEvent('timeline-progress', { detail: { progress: currentProgress.current } }));
  });

  return { currentProgress, activeEra };
}