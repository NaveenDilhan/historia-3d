import React, { useState, useEffect, useRef } from 'react';
import useAI from '../../../hooks/useAI';
import DialogueBox from '../../Jurassic/UI/DialogueBox'; 
import TimelineHUD from './TimelineHUD';
import LessonCompleteOverlay from '../../../components/UI/LessonCompleteOverlay';
import { ERAS } from '../hooks/useTimeScroll';

export default function EarthUI({ hasStarted }) {
  const [activeEra, setActiveEra] = useState(ERAS[0]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  
  const { getNarration } = useAI();
  const hasFinishedIntro = useRef(false);

  useEffect(() => {
    const handleEraChange = (e) => {
      setActiveEra(e.detail.era);
      if (e.detail.era.id === 'present' && !showLessonComplete) {
        setTimeout(() => setShowLessonComplete(true), 15000); 
      }
    };

    const handleProgress = (e) => setScrollProgress(e.detail.progress);

    const handleDiscoveryNarration = (e) => {
      getNarration(
        "The user successfully scanned a timeline anomaly.",
        e.detail.prompt,
        true 
      );
    };

    window.addEventListener('era-change', handleEraChange);
    window.addEventListener('timeline-progress', handleProgress);
    window.addEventListener('trigger-narration', handleDiscoveryNarration);

    return () => {
      window.removeEventListener('era-change', handleEraChange);
      window.removeEventListener('timeline-progress', handleProgress);
      window.removeEventListener('trigger-narration', handleDiscoveryNarration);
    };
  }, [getNarration, showLessonComplete]);

  useEffect(() => {
    if (hasStarted) {
      setTimeout(() => {
        hasFinishedIntro.current = true;
        getNarration(
          "The Earth Formation simulation has begun.",
          "Welcome the user to the dawn of our planet. Instruct them simply: 'Use your scroll wheel to accelerate through time. When an anomaly is detected and the timeline locks, hold the spacebar to scan and analyze the event.' Speak directly to the user; do not use the phrase 'young traveler'.",
          true
        );
      }, 2000);
    }
  }, [hasStarted, getNarration]);

  if (!hasStarted) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <TimelineHUD activeEra={activeEra} progress={scrollProgress} />
      
      <div className="absolute w-full px-8 flex justify-center pointer-events-none z-[150] bottom-12 transition-all duration-500 ease-in-out">
        <DialogueBox currentBiome={activeEra.name} /> 
      </div>

      <LessonCompleteOverlay 
          show={showLessonComplete} 
          message="You have witnessed the birth and evolution of our planet. The Earth Formation sequence is complete."
          medal="gold"
      />
    </div>
  );
}