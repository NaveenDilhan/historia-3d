import React, { useRef, useEffect, useState } from 'react';
import useAI from '../../hooks/useAI';
import DinosaurModel from '../Environment/DinosaurModel';

export default function DinosaurEncounter() {
  const { getNarration } = useAI();
  const timerRef = useRef(null);
  const [showDino, setShowDino] = useState(false);

  useEffect(() => {
    // Trigger narration and show dinosaur after 6 seconds
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
          path={[
            [10, 0, -30],
            [0, 0, -50],
            [-10, 0, -30],
            [0, 0, -10], // optional loop path
          ]}
          speed={0.8}
          scale={2.5}
          animate={true}
        />
      )}
    </group>
  );
}
