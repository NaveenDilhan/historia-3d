import React, { useState, useEffect, useRef } from 'react';
import useAI from '../../../hooks/useAI';
import DialogueBox from '../../Jurassic/UI/DialogueBox'; 
import TimelineHUD from './TimelineHUD';
import LessonCompleteOverlay from '../../../components/UI/LessonCompleteOverlay';
import MCQOverlay from './MCQOverlay';
import { ERAS } from '../hooks/useTimeScroll';

export default function EarthUI({ hasStarted }) {
  const [activeEra, setActiveEra] = useState(ERAS[0]);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // MCQ and Completion States
  const [mcqConfig, setMcqConfig] = useState(null); 
  const [perfectSections, setPerfectSections] = useState(0);
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
      getNarration("The user scanned the timeline.", e.detail.prompt, true);
    };

    const handleMcqStart = (e) => {
      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
      setMcqConfig({ eraId: e.detail.eraId, nextThreshold: e.detail.nextThreshold });
    };

    window.addEventListener('era-change', handleEraChange);
    window.addEventListener('timeline-progress', handleProgress);
    window.addEventListener('trigger-narration', handleDiscoveryNarration);
    window.addEventListener('start-mcq', handleMcqStart);

    return () => {
      window.removeEventListener('era-change', handleEraChange);
      window.removeEventListener('timeline-progress', handleProgress);
      window.removeEventListener('trigger-narration', handleDiscoveryNarration);
      window.removeEventListener('start-mcq', handleMcqStart);
    };
  }, [getNarration, showLessonComplete]);

  useEffect(() => {
    if (hasStarted) {
      setTimeout(() => {
        hasFinishedIntro.current = true;
        getNarration(
          "The Earth Formation simulation has begun.",
          "Welcome the user to the dawn of our planet. Instruct them simply: 'Use your scroll wheel to accelerate through time. When an anomaly is detected, hold the spacebar to gather data, and press E to undergo the assessment.' Speak directly to the user; do not use the phrase 'young traveler'.",
          true
        );
      }, 2000);
    }
  }, [hasStarted, getNarration]);

  const handleMcqComplete = (score) => {
    // SAFETY CHECK: Prevent double-execution from keyboard auto-repeat
    if (!mcqConfig) return;

    if (score === 5) {
      setPerfectSections(prev => prev + 1);
    }
    
    // Store threshold safely before nulling the config
    const nextThreshold = mcqConfig.nextThreshold;
    setMcqConfig(null);
    
    window.dispatchEvent(new CustomEvent('end-mcq')); 
    window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
    window.dispatchEvent(new CustomEvent('unlock-timeline', { detail: { nextThreshold: nextThreshold } }));
  };

  if (!hasStarted) return null;

  let finalMedal = "participant";
  if (perfectSections === 3) finalMedal = "gold";
  else if (perfectSections === 2) finalMedal = "silver";
  else if (perfectSections === 1) finalMedal = "bronze";

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {!mcqConfig && <TimelineHUD activeEra={activeEra} progress={scrollProgress} />}
      
      {!mcqConfig && (
        <div className="absolute w-full px-8 flex justify-center pointer-events-none z-[150] bottom-12 transition-all duration-500 ease-in-out">
          <DialogueBox currentBiome={activeEra.name} /> 
        </div>
      )}

      {mcqConfig && (
        <MCQOverlay 
          eraId={mcqConfig.eraId} 
          onComplete={handleMcqComplete} 
        />
      )}

      <LessonCompleteOverlay 
          show={showLessonComplete} 
          message={`Simulation complete. You achieved flawless data recovery in ${perfectSections} out of 3 eras.`}
          medal={finalMedal}
      />
    </div>
  );
}