import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import useAI from '../../../hooks/useAI';
import DinosaurModel from '../Environment/DinosaurModel';
import { rexCurve } from '../Environment/Terrain';

export default function DinosaurEncounter({ terrainGeo, hasStarted }) {
  const { getNarration } = useAI();
  const timerRef = useRef(null);
  const [showDino, setShowDino] = useState(false);

  // === Audio Refs ===
  const trexStepAudioRef = useRef();
  const roarAudioRef = useRef();
  
  // === Timing Refs ===
  const lastStompTime = useRef(0);
  const nextRoarTime = useRef(0);
  const isInitialized = useRef(false);

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

  // Handle the audio loops and spatial settings safely
  useFrame((state) => {
    if (!showDino) return;

    // Initialize precise audio properties and timers on the very first active frame
    if (!isInitialized.current) {
      // 1. Setup precise spatial audio drop-offs for FOOTSTEPS
      if (trexStepAudioRef.current) {
        trexStepAudioRef.current.setRefDistance(5); // Starts dropping volume outside 5 units
        trexStepAudioRef.current.setMaxDistance(35); // Completely silent after 35 units
        trexStepAudioRef.current.setRolloffFactor(2.5); // Steep fade so it doesn't bleed out
      }
      
      // 2. Setup precise spatial audio drop-offs for ROARS
      if (roarAudioRef.current) {
        roarAudioRef.current.setRefDistance(20); // Roars are loud, carry further
        roarAudioRef.current.setMaxDistance(120); // Stops bleeding across the whole map
        roarAudioRef.current.setRolloffFactor(1.5); // Smoother, wider fade
        
        // Play initial spawn roar
        roarAudioRef.current.setVolume(3.0);
        roarAudioRef.current.play();
      }

      lastStompTime.current = state.clock.elapsedTime;
      
      // Schedule the next occasional roar (randomly between 15 and 30 seconds from now)
      nextRoarTime.current = state.clock.elapsedTime + 15 + Math.random() * 15;
      isInitialized.current = true;
    }

    // --- Audio Loops ---

    // A. Footsteps: Heavy walking sound loop (Only heard up close)
    if (state.clock.elapsedTime - lastStompTime.current > 1.2) {
      if (trexStepAudioRef.current && !trexStepAudioRef.current.isPlaying) {
        trexStepAudioRef.current.setVolume(2.0); 
        trexStepAudioRef.current.play();
      }
      lastStompTime.current = state.clock.elapsedTime;
    }

    // B. Roar: Occasional roaring loop (Less frequent, random intervals)
    if (state.clock.elapsedTime > nextRoarTime.current) {
      if (roarAudioRef.current && !roarAudioRef.current.isPlaying) {
        roarAudioRef.current.setVolume(3.0);
        roarAudioRef.current.play();
      }
      // Schedule the next roar randomly between 15 and 30 seconds again
      nextRoarTime.current = state.clock.elapsedTime + 15 + Math.random() * 15;
    }
  });

  return (
    <group>
      {/* Audio Nodes - Parameters managed natively via refs in useFrame */}
      <PositionalAudio
        ref={trexStepAudioRef}
        url="/sounds/jurrasic/footstep.ogg"
        loop={false}
      />
      <PositionalAudio
        ref={roarAudioRef}
        url="/sounds/jurrasic/roar.mp3" 
        loop={false}
      />

      {/* 3D Model */}
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