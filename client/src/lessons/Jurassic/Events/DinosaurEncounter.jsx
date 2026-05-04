import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useGLTF, Preload } from '@react-three/drei';
import useAI from '../../../hooks/useAI';
import DinosaurModel from '../Environment/DinosaurModel';
import { rexCurve } from '../Environment/Terrain';

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
  }, [hasStarted, getNarration]); // Added getNarration to satisfy React's exhaustive-deps rule

  return (
    <group>
      <Suspense fallback={null}>
        {/*
            OPTIMIZATION IMPROVED: 
            Instead of leaving a frozen T-Rex visible at the origin for 6 seconds, 
            we use the "Scale Trick". By setting scale to 0 when inactive, the renderer 
            still processes the mesh (pre-compiling the shader to prevent stutter), 
            but it remains completely invisible until `showDino` becomes true.
        */}
        <DinosaurModel
          curve={rexCurve}
          speed={0.02}
          scale={showDino ? 2.8 : 0} 
          animate={showDino}
          terrainGeo={terrainGeo}
        />
        
        {/* Forces Three.js to pre-compile all shaders in this Suspense boundary */}
        <Preload all />
      </Suspense>
    </group>
  );
}

useGLTF.preload('/models/jurrasic/T-Rex.glb');