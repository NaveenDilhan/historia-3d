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
      {/* 
        Wrap the dynamically loaded model in its own Suspense boundary.
        This prevents the suspension from bubbling up to Scene.jsx 
        and wiping out the terrain. 
      */}
      {showDino && (
        <Suspense fallback={null}>
          <DinosaurModel
            curve={rexCurve}
            speed={0.02}
            scale={2.8}
            animate={true}
            terrainGeo={terrainGeo}
          />
        </Suspense>
      )}
    </group>
  );
}

// Preload at the module level to ensure the browser fetches it as early as possible
useGLTF.preload('/models/T-Rex.glb');