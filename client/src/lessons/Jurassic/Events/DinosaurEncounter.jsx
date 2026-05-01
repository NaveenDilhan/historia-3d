import React, { Suspense, useState, useRef, useEffect } from 'react';
import useAI from '../../../hooks/useAI';
import DinosaurModel from '../Environment/DinosaurModel';
import { rexCurve } from '../Environment/Terrain';
import { useGLTF } from '@react-three/drei';

export default function DinosaurEncounter({ terrainGeo, hasStarted }) {
  const { getNarration } = useAI();
  const timerRef = useRef(null);
  const [showDino, setShowDino] = useState(false);

  useEffect(() => {
    // CRITICAL: Wait for the user to press 'Begin Journey' before starting the event
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
        {/* 
           OPTIMIZATION: The DinosaurModel is now rendered immediately behind the loading screen
           to pre-compile shaders. We pass down visible={showDino} so it stays completely hidden
           until the encounter triggers.
        */}
        <DinosaurModel
          curve={rexCurve}
          speed={0.02}
          scale={2.8}
          animate={showDino}
          visible={showDino}
          terrainGeo={terrainGeo}
        />
      </Suspense>
    </group>
  );
}

useGLTF.preload('/models/T-Rex.glb');