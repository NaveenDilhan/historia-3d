import React, { useRef, useEffect, useState } from 'react';
import useAI from '../../../hooks/useAI';
import DinosaurModel from '../Environment/DinosaurModel';
import { rexCurve } from '../Environment/Terrain';

export default function DinosaurEncounter({ terrainGeo }) {
  const { getNarration } = useAI();
  const timerRef = useRef(null);
  const [showDino, setShowDino] = useState(false);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      getNarration(
        'A large dinosaur appears at the tree line.',
        'The forest shakes and distant roars are heard.'
      );
      setShowDino(true);
    }, 6000);

    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <group>
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