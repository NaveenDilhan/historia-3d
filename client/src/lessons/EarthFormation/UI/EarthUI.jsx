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
  const [showEnterPrompt, setShowEnterPrompt] = useState(false); 
  
  // Timeline locking and freezing
  const [lockThreshold, setLockThreshold] = useState(0.0);
  const [isFrozen, setIsFrozen] = useState(true); 
  
  // MCQ and Completion States
  const [quizReadyConfig, setQuizReadyConfig] = useState(null);
  const [mcqConfig, setMcqConfig] = useState(null); 
  const [perfectSections, setPerfectSections] = useState(0);
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  
  const { getNarration } = useEarthAI();
  const hasFinishedIntro = useRef(false);
  const isCinematicActive = useRef(true); 
  const introPromptTimeoutRef = useRef(null);

  useEffect(() => {
    isCinematicActive.current = showCinematic;
  }, [showCinematic]);

  useEffect(() => {
    const handleEraChange = (e) => {
      const newEra = e.detail.era;
      setActiveEra(newEra);
      
      if (newEra.id === 'present' && !showLessonComplete) {
        setTimeout(() => setShowLessonComplete(true), 15000); 
      }

      if (!isCinematicActive.current && newEra.id !== 'void') {
          getNarration(
              `The timeline just shifted to the ${newEra.name} (${newEra.time}).`,
              `Provide a fresh, highly visual description of what the planet looks like right now in this new era. Take your time to paint a vivid picture with simple words in 2 to 4 sentences.`,
              true 
          );
      }
    };

    const handleProgress = (e) => setScrollProgress(e.detail.progress);
    const handleUnlockUpdate = (e) => setLockThreshold(e.detail.nextThreshold);
    const handleFreeze = (e) => setIsFrozen(e.detail.frozen);

    const handleDiscoveryNarration = (e) => {
      getNarration("The user scanned a geological anomaly.", e.detail.prompt, true);
    };

    const handleQuizReady = (e) => setQuizReadyConfig(e.detail);

    const handleNarrationEnded = () => {
      if (isCinematicActive.current) {
        introPromptTimeoutRef.current = setTimeout(() => {
           if (isCinematicActive.current) {
               setShowEnterPrompt(true);
           }
        }, 3000);
      }
    };

    window.addEventListener('era-change', handleEraChange);
    window.addEventListener('timeline-progress', handleProgress);
    window.addEventListener('unlock-timeline', handleUnlockUpdate);
    window.addEventListener('freeze-timeline', handleFreeze);
    window.addEventListener('trigger-narration', handleDiscoveryNarration);
    window.addEventListener('quiz-ready', handleQuizReady);
    window.addEventListener('narration-ended', handleNarrationEnded);

    return () => {
      window.removeEventListener('era-change', handleEraChange);
      window.removeEventListener('timeline-progress', handleProgress);
      window.removeEventListener('unlock-timeline', handleUnlockUpdate);
      window.removeEventListener('freeze-timeline', handleFreeze);
      window.removeEventListener('trigger-narration', handleDiscoveryNarration);
      window.removeEventListener('quiz-ready', handleQuizReady);
      window.removeEventListener('narration-ended', handleNarrationEnded);
      
      if (introPromptTimeoutRef.current) clearTimeout(introPromptTimeoutRef.current);
    };
  }, [getNarration, showLessonComplete]);

  // Global key listener
  useEffect(() => {
      const handleKey = (e) => {
          // Dismiss Intro
          if (e.code === 'Enter' && showCinematic && showEnterPrompt) {
              setShowCinematic(false);
              window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
              window.dispatchEvent(new CustomEvent('cinematic-ended'));
              
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              window.__isSpeaking = false;

              // Mechanical Instruction
              setTimeout(() => {
                  getNarration(
                      "The intro is finished.",
                      "Briefly tell the user: 'Use your scroll wheel to journey forward through time. When you spot a glowing anomaly, hold the spacebar to analyze it.'",
                      true
                  );
              }, 400);
          }
          
          // Start Assessment
          if (e.code === 'KeyE' && quizReadyConfig && !mcqConfig && !showCinematic) {
              window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
              setMcqConfig(quizReadyConfig);
              setQuizReadyConfig(null);
          }
      };
      
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [quizReadyConfig, mcqConfig, showCinematic, showEnterPrompt, getNarration]);

  // Initial Boot-up Narration
  useEffect(() => {
    if (hasStarted && !hasFinishedIntro.current) {
      hasFinishedIntro.current = true;
      
      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
      if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
      
      // FIX: Reduced delay from 3.5s to 1.5s so the narration starts much faster on boot
      setTimeout(() => {
        getNarration(
          "The user is viewing the welcome screen showing cosmic void.",
          "Give a warm, creative welcome to the dawn of time. Explain what 'Earth formation' means using very simple, everyday language—like dust and rocks slowly clumping together over billions of years to build our home. Mention the quiet floating stardust they see right now. Do this in 2 to 4 sentences.",
          true
        );
      }, 1500); 
    }
  }, [hasStarted, getNarration]);

  // Handle assessment completion and unlocking the next timeline phase
  const handleMcqComplete = (score) => {
      if (!mcqConfig) return;

      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
      
      if (score === 5) {
          setPerfectSections(p => p + 1);
      }
      
      window.dispatchEvent(new CustomEvent('unlock-timeline', { detail: { nextThreshold: mcqConfig.nextThreshold } }));
      window.dispatchEvent(new CustomEvent('end-mcq'));
      
      setMcqConfig(null);
  };

  let finalMedal = "participant";
  if (perfectSections >= 4) finalMedal = "gold"; 
  else if (perfectSections >= 2) finalMedal = "silver";
  else if (perfectSections >= 1) finalMedal = "bronze";

  const isAtLock = Math.abs(lockThreshold - scrollProgress) < 0.02;
  const showTimelineHUD = !isAtLock && !isFrozen && !mcqConfig && !quizReadyConfig && !showCinematic;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      
      {/* Cinematic Title Screen - Always mounted to hide raw 3D scene immediately */}
      <div 
        className={`absolute inset-0 z-[300] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-1000 ease-in-out ${
            showCinematic ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h1 className="text-6xl md:text-8xl font-thin tracking-[0.4em] text-white/90 drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] mb-12 text-center uppercase">
            Genesis
        </h1>
        
        {showEnterPrompt && hasStarted && (
          <div className="text-cyan-200/80 font-mono tracking-widest uppercase text-sm animate-pulse border border-cyan-500/30 bg-black/40 px-6 py-3 rounded-full transition-opacity duration-1000 opacity-100">
              Press [ENTER] to Initiate Genesis
          </div>
        )}
      </div>

      {/* Only render HUD elements once the experience has officially started */}
      {hasStarted && (
        <>
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
              message={`Journey complete. You achieved flawless data recovery in ${perfectSections} eras.`}
              medal={finalMedal}
          />
        </>
      )}
    </div>
  );
}