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
  
  const [showCinematic, setShowCinematic] = useState(true);
  const [showEnterPrompt, setShowEnterPrompt] = useState(false); 
  
  const [lockThreshold, setLockThreshold] = useState(0.0);
  const [isFrozen, setIsFrozen] = useState(true); 
  
  const [quizReadyConfig, setQuizReadyConfig] = useState(null);
  const pendingQuizReadyRef = useRef(null); 
  
  const [mcqConfig, setMcqConfig] = useState(null); 
  const [perfectSections, setPerfectSections] = useState(0);
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  
  const { getNarration } = useEarthAI();
  const hasFinishedIntro = useRef(false);
  const isCinematicActive = useRef(true); 
  const introPromptTimeoutRef = useRef(null);
  const nextAnnouncementTimeout = useRef(null);
  
  const narrationContext = useRef('welcome');
  const hasTaughtScanRef = useRef(false);

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
          narrationContext.current = 'era-intro';
          getNarration(
              `The user entered the ${newEra.name} era.`,
              `Introduce this specific era. Explain the core scientific concept of what this era was actually like in reality. Explain it in a fun, simple narrative way for a younger audience. Do not describe the screen or UI. Keep it to exactly 2 short sentences. Do not add any instructions.`,
              true 
          );
      }
    };

    const handleProgress = (e) => setScrollProgress(e.detail.progress);
    const handleUnlockUpdate = (e) => setLockThreshold(e.detail.nextThreshold);
    const handleFreeze = (e) => setIsFrozen(e.detail.frozen);

    const handleDiscoveryNarration = (e) => {
      narrationContext.current = 'anomaly-fact';
      getNarration(
          `The user scanned the anomaly named: ${e.detail.title}.`, 
          `Explain this specific concept based on this fact: "${e.detail.prompt}". You MUST talk ONLY about the concept of ${e.detail.title} and nothing else. Explain the real-world science or history behind it in a very simple, fun narrative way for a young audience. Keep it to exactly 2 short sentences.`, 
          true
      );
    };

    const handleQuizReady = (e) => {
      pendingQuizReadyRef.current = e.detail;
    };

    const handleNarrationEnded = () => {
      if (isCinematicActive.current) {
        if (narrationContext.current === 'welcome') {
            introPromptTimeoutRef.current = setTimeout(() => {
               if (isCinematicActive.current) {
                   setShowEnterPrompt(true);
               }
            }, 1000); // reduced from 3000
        }
        return;
      }

      if (narrationContext.current === 'era-intro') {
          // FIX: drastically reduced announcement gap
          nextAnnouncementTimeout.current = setTimeout(() => {
              narrationContext.current = 'anomaly-announcement';
              
              const promptText = hasTaughtScanRef.current
                  ? "Write exactly one simple sentence saying: 'Look, a new anomaly is here!' Do not add anything else."
                  : "Write exactly one simple sentence saying: 'Look, an anomaly has appeared! Press and hold the spacebar to scan it.' Do not add anything else.";
              
              hasTaughtScanRef.current = true;

              getNarration("An anomaly appeared.", promptText, true);
          }, 800);

      } else if (narrationContext.current === 'anomaly-announcement') {
          setTimeout(() => {
              window.dispatchEvent(new CustomEvent('reveal-anomaly'));
          }, 300);

      } else if (narrationContext.current === 'anomaly-fact') {
          if (pendingQuizReadyRef.current) {
              setQuizReadyConfig(pendingQuizReadyRef.current);
              pendingQuizReadyRef.current = null;
          } else {
              nextAnnouncementTimeout.current = setTimeout(() => {
                  narrationContext.current = 'anomaly-announcement';
                  const promptText = hasTaughtScanRef.current
                      ? "Write exactly one simple sentence saying: 'Wow, a new anomaly is here!' Do not add anything else."
                      : "Write exactly one simple sentence saying: 'Wow, another anomaly has appeared! Press and hold the spacebar to scan it.' Do not add anything else.";
                  
                  getNarration("Another anomaly appeared.", promptText, true);
              }, 800); // reduced from 4000
          }
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
      if (nextAnnouncementTimeout.current) clearTimeout(nextAnnouncementTimeout.current);
    };
  }, [getNarration, showLessonComplete]);

  useEffect(() => {
      const handleKey = (e) => {
          if (e.code === 'Enter' && showCinematic && showEnterPrompt) {
              setShowCinematic(false);
              window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
              window.dispatchEvent(new CustomEvent('cinematic-ended'));
              
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              window.__isSpeaking = false;

              // Reduced from 400 to 100 for instant start
              setTimeout(() => {
                  narrationContext.current = 'era-intro';
                  getNarration(
                      "The user just entered the Cosmic Void era.",
                      "Introduce the Cosmic Void era. Explain the concept that Earth doesn't exist yet and is just floating space dust waiting to form. Do not describe the screen or UI. Explain it in a fun, simple narrative way for a younger audience. Keep it to exactly 2 short sentences. Do not add any instructions.",
                      true
                  );
              }, 100);
          }
          
          if (e.code === 'KeyE' && quizReadyConfig && !mcqConfig && !showCinematic) {
              window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
              setMcqConfig(quizReadyConfig);
              setQuizReadyConfig(null);
          }
      };
      
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [quizReadyConfig, mcqConfig, showCinematic, showEnterPrompt, getNarration]);

  useEffect(() => {
    if (hasStarted && !hasFinishedIntro.current) {
      hasFinishedIntro.current = true;
      narrationContext.current = 'welcome';
      
      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
      if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
      
      // FIX: Reduced artificial start delay from 1500ms to 300ms
      setTimeout(() => {
        getNarration(
          "Welcome the user to the journey of the universe.",
          "CRITICAL: Do NOT teach any specific scientific facts or mention specific events like nebulas or planets here. Write a purely creative, emotional intro (about 4 sentences). Welcome the user and talk about how incredibly amazing it is that life exists at all, and how breathtaking the journey of a living world forming in the cosmos is. Make it a magical and awe-inspiring storybook opening.",
          true
        );
      }, 300); 
    }
  }, [hasStarted, getNarration]);

  const handleMcqComplete = (score) => {
      if (!mcqConfig) return;

      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
      
      if (score === 5) {
          setPerfectSections(p => p + 1);
      }
      
      window.dispatchEvent(new CustomEvent('unlock-timeline', { detail: { nextThreshold: mcqConfig.nextThreshold } }));
      window.dispatchEvent(new CustomEvent('end-mcq'));
      
      setMcqConfig(null);

      narrationContext.current = 'era-outro';
      getNarration(
          "User completed gathering all data for this era.",
          "Say exactly one simple sentence: 'Great job, now use your scroll wheel to travel forward in time!'",
          true
      );
  };

  let finalMedal = "participant";
  if (perfectSections >= 4) finalMedal = "gold"; 
  else if (perfectSections >= 2) finalMedal = "silver";
  else if (perfectSections >= 1) finalMedal = "bronze";

  const isAtLock = Math.abs(lockThreshold - scrollProgress) < 0.02;
  const showTimelineHUD = !isAtLock && !isFrozen && !mcqConfig && !quizReadyConfig && !showCinematic;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      
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

      {hasStarted && (
        <>
          {quizReadyConfig && !mcqConfig && !showCinematic && (
            <div className="absolute top-8 left-8 z-[200] bg-black/80 border border-cyan-500/50 p-6 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.2)] animate-pulse transition-all duration-300 pointer-events-auto">
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