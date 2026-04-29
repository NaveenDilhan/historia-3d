import React, { useRef, useEffect, useState } from 'react';
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
  }, [hasStarted, getNarration]);

  return (
    <group>
      {/* 3D Model - Audio is now handled natively inside this component so it tracks location */}
      {showDino && (
        <DinosaurModel
          curve={rexCurve}
          speed={0.02}
          scale={2.8}
          animate={true}
          terrainGeo={terrainGeo}
        />
      )}
    </group>
  );
}