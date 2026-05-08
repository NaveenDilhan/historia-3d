import React, { useState, useEffect, useRef } from 'react';
import useAI from '../../../hooks/useAI';
import DialogueBox from '../../Jurassic/UI/DialogueBox'; // Reusing your existing dialogue UI
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
      const newEra = e.detail.era;
      setActiveEra(newEra);

      if (hasFinishedIntro.current && !showLessonComplete) {
        getNarration(
          `The user scrolled the timeline to the ${newEra.name} (${newEra.time}).`,
          `As an immersive historical guide, vividly describe what the earth looks like from space during this specific period. Mention atmosphere, landmasses, and early life if applicable. Keep it scientifically accurate but awe-inspiring.`,
          true 
        );
      }

      if (newEra.id === 'present' && !showLessonComplete) {
        setTimeout(() => setShowLessonComplete(true), 15000); // Conclude shortly after reaching present
      }
    };

    const handleProgress = (e) => setScrollProgress(e.detail.progress);

    window.addEventListener('era-change', handleEraChange);
    window.addEventListener('timeline-progress', handleProgress);

    return () => {
      window.removeEventListener('era-change', handleEraChange);
      window.removeEventListener('timeline-progress', handleProgress);
    };
  }, [getNarration, showLessonComplete]);

  useEffect(() => {
    if (hasStarted) {
      setTimeout(() => {
        hasFinishedIntro.current = true;
        getNarration(
          "The Earth Formation simulation has begun. The user is looking at the Hadean Eon.",
          "Welcome the user to the dawn of our planet. Instruct them simply: 'Use your mouse wheel to spin the globe and accelerate through billions of years of history.'",
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
        {/* Reusing your existing DialogueBox, passing the era description dynamically */}
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