import React, { useState, useEffect, useRef } from 'react';
import useEarthAI from '../hooks/useEarthAI';
import EarthDialogueBox from './EarthDialogueBox'; 
import TimelineHUD from './TimelineHUD';
import LessonCompleteOverlay from '../../../components/UI/LessonCompleteOverlay';
import MCQOverlay from './MCQOverlay';
import { ERAS } from '../hooks/useTimeScroll';

export default function EarthUI({ hasStarted }) {
  const [activeEra, setActiveEra] = useState(ERAS[0]);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Cinematic Intro State
  const [showCinematic, setShowCinematic] = useState(true);
  
  // Timeline locking and freezing
  const [lockThreshold, setLockThreshold] = useState(0.0);
  const [isFrozen, setIsFrozen] = useState(true); // Start frozen for the intro
  
  // MCQ and Completion States
  const [quizReadyConfig, setQuizReadyConfig] = useState(null);
  const [mcqConfig, setMcqConfig] = useState(null); 
  const [perfectSections, setPerfectSections] = useState(0);
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  
  const { getNarration } = useEarthAI();
  const hasFinishedIntro = useRef(false);

  useEffect(() => {
    const handleEraChange = (e) => {
      setActiveEra(e.detail.era);
      if (e.detail.era.id === 'present' && !showLessonComplete) {
        setTimeout(() => setShowLessonComplete(true), 15000); 
      }
    };

    const handleProgress = (e) => setScrollProgress(e.detail.progress);
    const handleUnlockUpdate = (e) => setLockThreshold(e.detail.nextThreshold);
    const handleFreeze = (e) => setIsFrozen(e.detail.frozen);

    const handleDiscoveryNarration = (e) => {
      getNarration("The user scanned an anomaly.", e.detail.prompt, true);
    };

    const handleQuizReady = (e) => {
      setQuizReadyConfig(e.detail);
    };

    window.addEventListener('era-change', handleEraChange);
    window.addEventListener('timeline-progress', handleProgress);
    window.addEventListener('unlock-timeline', handleUnlockUpdate);
    window.addEventListener('freeze-timeline', handleFreeze);
    window.addEventListener('trigger-narration', handleDiscoveryNarration);
    window.addEventListener('quiz-ready', handleQuizReady);

    return () => {
      window.removeEventListener('era-change', handleEraChange);
      window.removeEventListener('timeline-progress', handleProgress);
      window.removeEventListener('unlock-timeline', handleUnlockUpdate);
      window.removeEventListener('freeze-timeline', handleFreeze);
      window.removeEventListener('trigger-narration', handleDiscoveryNarration);
      window.removeEventListener('quiz-ready', handleQuizReady);
    };
  }, [getNarration, showLessonComplete]);

  // Global key listener for interacting with UI overlays
  useEffect(() => {
      const handleKey = (e) => {
          // 1. Dismiss Cinematic Intro
          if (e.code === 'Enter' && showCinematic) {
              setShowCinematic(false);
              window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
              window.dispatchEvent(new CustomEvent('cinematic-ended'));
              
              // Forcefully stop the poetic prologue if it's still playing
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              window.__isSpeaking = false;

              // Trigger the mechanical tutorial narration after a tiny delay
              setTimeout(() => {
                  getNarration(
                      "The cinematic intro finished.",
                      "Give the user a brief, warm mechanical instruction: 'Use your scroll wheel to journey forward through time and watch a world take shape. When an anomaly is detected, hold the spacebar to analyze it.'",
                      true
                  );
              }, 400);
          }
          
          // 2. Start Assessment
          if (e.code === 'KeyE' && quizReadyConfig && !mcqConfig && !showCinematic) {
              window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
              setMcqConfig(quizReadyConfig);
              setQuizReadyConfig(null);
          }
      };
      
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [quizReadyConfig, mcqConfig, showCinematic, getNarration]);

  // Initial Boot-up Narration
  useEffect(() => {
    if (hasStarted && !hasFinishedIntro.current) {
      hasFinishedIntro.current = true;
      
      // Ensure timeline is frozen during the intro
      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
      
      // Pre-warm the browser's TTS engine so voices are ready
      if ('speechSynthesis' in window) {
         window.speechSynthesis.getVoices();
      }
      
      setTimeout(() => {
        // Trigger a highly poetic, creative prologue. 
        getNarration(
          "The Earth Formation simulation has booted up into a cinematic prologue.",
          "Write a deeply poetic, cinematic prologue about Earth's 4.6 billion-year journey. Describe how a chaotic cloud of dead stardust will eventually transform into a vibrant, breathing oasis. Speak directly to the observer. Make it grand, awe-inspiring, and a maximum of 3 sentences.",
          true
        );
      }, 1000);
    }
  }, [hasStarted, getNarration]);

  const handleMcqComplete = (score) => {
    if (!mcqConfig) return;

    if (score === 5) {
      setPerfectSections(prev => prev + 1);
    }
    
    const nextThreshold = mcqConfig.nextThreshold;
    setMcqConfig(null);
    
    window.dispatchEvent(new CustomEvent('end-mcq')); 
    window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
    window.dispatchEvent(new CustomEvent('unlock-timeline', { detail: { nextThreshold: nextThreshold } }));
  };

  if (!hasStarted) return null;

  let finalMedal = "participant";
  if (perfectSections >= 4) finalMedal = "gold"; 
  else if (perfectSections >= 2) finalMedal = "silver";
  else if (perfectSections >= 1) finalMedal = "bronze";

  const isAtLock = Math.abs(lockThreshold - scrollProgress) < 0.02;
  const showTimelineHUD = !isAtLock && !isFrozen && !mcqConfig && !quizReadyConfig && !showCinematic;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      
      {/* Cinematic Title Screen */}
      <div 
        className={`absolute inset-0 z-[300] flex flex-col items-center justify-center bg-black/50 backdrop-blur-md transition-opacity duration-1000 ease-in-out ${
            showCinematic ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h1 className="text-6xl md:text-8xl font-thin tracking-[0.4em] text-white/90 drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] mb-12 text-center uppercase">
            Genesis
        </h1>
        <div className="text-cyan-200/80 font-mono tracking-widest uppercase text-sm animate-pulse border border-cyan-500/30 bg-black/40 px-6 py-3 rounded-full">
            Press [ENTER] to Initiate Simulation
        </div>
      </div>

      {/* Top Left Quiz Ready Prompt */}
      {quizReadyConfig && !mcqConfig && !showCinematic && (
        <div className="absolute top-8 left-8 z-[200] bg-black/80 border border-cyan-500/50 p-6 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.2)] animate-pulse transition-all duration-300">
           <div className="flex items-center text-cyan-400 font-mono text-sm tracking-widest uppercase mb-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 shadow-[0_0_8px_cyan]"></span>
              Era Data Compiled
           </div>
           <div className="text-white text-lg font-bold">
              Press <span className="text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded mx-1">[ E ]</span> to Start Assessment
           </div>
        </div>
      )}

      {/* Render unconditionally so the opacity transition works */}
      <TimelineHUD activeEra={activeEra} progress={scrollProgress} visible={showTimelineHUD} />
      
      {!mcqConfig && (
        <div className={`absolute w-full px-8 flex justify-center pointer-events-none transition-all duration-500 ease-in-out ${showCinematic ? 'bottom-24 z-[400]' : 'bottom-12 z-[150]'}`}>
          <EarthDialogueBox currentEra={activeEra.name} /> 
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
          message={`Simulation complete. You achieved flawless data recovery in ${perfectSections} eras.`}
          medal={finalMedal}
      />
    </div>
  );
}