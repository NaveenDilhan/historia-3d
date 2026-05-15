import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useGLTF, Preload } from '@react-three/drei';
import useAI from '../hooks/useAI';
import DinosaurModel from '../Environment/DinosaurModel';
import { rexCurve } from '../Environment/Terrain';

export default function DinosaurEncounter({ terrainGeo, hasStarted }) {
  const { getNarration } = useAI();
  const timerRef = useRef(null);
  const [showDino, setShowDino] = useState(false);

  useEffect(() => {

    if (!hasStarted) return;

    timerRef.current = setTimeout(() => {
      getNarration(
        'A large dinosaur appears at the tree line.',
        'The forest shakes and distant roars are heard.'
      );
      setShowDino(true);
    }, 6000);

    return () => clearTimeout(timerRef.current);
  }, [hasStarted, getNarration]); 

  return (
    <group>
      <Suspense fallback={null}>

        <DinosaurModel
          curve={rexCurve}
          speed={0.02}
          scale={showDino ? 2.8 : 0} 
          animate={showDino}
          terrainGeo={terrainGeo}
        />
        
        <Preload all />
      </Suspense>
    </group>
  );
}

useGLTF.preload('/models/jurrasic/T-Rex.glb');