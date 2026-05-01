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
            OPTIMIZATION: Removed `visible={showDino}`. 
            By keeping the model natively visible to the renderer (but un-animated), 
            we force Three.js to pre-compile the shader during the loading screen. 
            This completely eliminates the 6-second stutter.
        */}
        <DinosaurModel
          curve={rexCurve}
          speed={0.02}
          scale={2.8}
          animate={showDino}
          terrainGeo={terrainGeo}
        />
      </Suspense>
    </group>
  );
}

useGLTF.preload('/models/T-Rex.glb');