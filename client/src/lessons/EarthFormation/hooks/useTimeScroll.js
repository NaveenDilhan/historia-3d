import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ERAS = [
  { index: 0, id: 'void', name: 'The Cosmic Void', time: 'Before 4.6 Billion Years Ago', threshold: 0.0 },
  { index: 1, id: 'hadean', name: 'Hadean Eon', time: '4.6 Billion Years Ago', threshold: 0.20 },
  { index: 2, id: 'archean', name: 'Archean Eon', time: '4.0 Billion Years Ago', threshold: 0.40 },
  { index: 3, id: 'proterozoic', name: 'Proterozoic Eon', time: '2.5 Billion Years Ago', threshold: 0.60 },
  { index: 4, id: 'mesozoic', name: 'Mesozoic Era', time: '250 Million Years Ago', threshold: 0.80 },
  { index: 5, id: 'present', name: 'Present Day', time: 'Today', threshold: 1.0 },
];

export default function useTimeScroll(hasStarted) {
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const [activeEra, setActiveEra] = useState(ERAS[0]);
  
  // Lock at the first scanning anomaly (Archean)
  const currentLockRef = useRef(ERAS[2].threshold);
  
  const isFrozenRef = useRef(false);

  useEffect(() => {
    const handleUnlock = (e) => { currentLockRef.current = e.detail.nextThreshold; };
    const handleFreeze = (e) => { isFrozenRef.current = e.detail.frozen; };
    
    window.addEventListener('unlock-timeline', handleUnlock);
    window.addEventListener('freeze-timeline', handleFreeze);
    
    return () => {
      window.removeEventListener('unlock-timeline', handleUnlock);
      window.removeEventListener('freeze-timeline', handleFreeze);
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const handleWheel = (e) => {
      if (isFrozenRef.current) return; 

      const scrollSpeed = 0.0001; 
      let newTarget = targetProgress.current + e.deltaY * scrollSpeed;
      
      targetProgress.current = THREE.MathUtils.clamp(newTarget, 0, currentLockRef.current);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [hasStarted]);

  useFrame((state, delta) => {
    if (!hasStarted) return;

    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, targetProgress.current, delta * 2);

    const matchedEra = ERAS.slice().reverse().find(era => currentProgress.current >= era.threshold - 0.05) || ERAS[0];
    
    if (matchedEra.id !== activeEra.id) {
      setActiveEra(matchedEra);
      window.dispatchEvent(new CustomEvent('era-change', { detail: { era: matchedEra } }));
    }

    window.dispatchEvent(new CustomEvent('timeline-progress', { detail: { progress: currentProgress.current } }));
  });

  return { currentProgress, activeEra };
}