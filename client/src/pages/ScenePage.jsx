import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/UI/LoadingScreen';
import PauseMenu from '../components/UI/PauseMenu'; 
import { ChevronLeft } from 'lucide-react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

// Lazy load isolated scenes to chunk JS bundles
const SceneMap = {
  'earth-formation': lazy(() => import('../lessons/EarthFormation/Scene')),
  'jurassic': lazy(() => import('../lessons/Jurassic/Scene')),
};

const LessonNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#1a120b] text-amber-50">
      <h1 className="text-4xl md:text-6xl font-heading font-bold text-amber-500 mb-6 tracking-widest drop-shadow-lg">
        SCROLL MISSING
      </h1>
      <p className="text-amber-200/60 mb-8 max-w-md text-center leading-relaxed">
        The scribes have not yet documented this era, or the scrolls have been lost to time.
      </p>
      <button 
        onClick={() => navigate('/explore')}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 px-6 py-3 rounded-lg font-medium hover:brightness-110 shadow-lg border border-amber-600/30 transition-all active:scale-95"
      >
        <ChevronLeft size={20} />
        Return to Library
      </button>
    </div>
  );
};

export default function ScenePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const ActiveScene = SceneMap[lessonId];
  const { active, progress, total, errors } = useProgress();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // --- PAUSE MENU STATE ---
  const [isPaused, setIsPaused] = useState(false);
  const [soundMuted, setSoundMuted] = useState(window.__soundMuted || false);
  const [subsMuted, setSubsMuted] = useState(window.__subtitlesMuted || false);
  
  const overlayRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Monitor loading progress
  useEffect(() => {
    if (hasLoaded) return;
    if (!active && progress === 100 && total > 0) {
      const timer = setTimeout(() => setHasLoaded(true), 1500);
      return () => clearTimeout(timer);
    }
    if (!active && errors.length > 0) {
      const timer = setTimeout(() => setHasLoaded(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [active, progress, total, errors.length, hasLoaded]);

  // Keep track of started state for the event listeners safely
  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  // --- PREVENT BROWSER BACK BUTTON ---
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = (event) => {
      window.history.pushState(null, '', window.location.pathname);
      if (hasStartedRef.current) { 
        document.exitPointerLock(); 
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- PAUSE LOGIC (ESC KEY DETECTION) ---
  useEffect(() => {
    const handlePointerLockChange = () => {
      if (!document.pointerLockElement && hasStartedRef.current) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, []);

  // --- AUDIO & VOICE SUSPENSION LOGIC ---
  useEffect(() => {
    const ctx = THREE.AudioContext.getContext();
    if (isPaused) {
      // Pause environment audio
      if (ctx.state === 'running') ctx.suspend();
      // Pause voice narration mid-sentence
      if ('speechSynthesis' in window) window.speechSynthesis.pause(); 
    } else {
      // Only resume if sound is not explicitly muted
      if (!soundMuted && ctx.state === 'suspended') ctx.resume();
      if (!soundMuted && 'speechSynthesis' in window) window.speechSynthesis.resume();
    }
    
    // Hard cancel if muted
    if (soundMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isPaused, soundMuted]);

  const handleStart = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) canvas.requestPointerLock();
    
    setIsRevealing(true);
    const tl = gsap.timeline({
      onComplete: () => {
        setHasStarted(true);
      }
    });

    tl.to(overlayRef.current, {
      y: '-100%',
      duration: 1.6,
      ease: 'power4.inOut',
      delay: 0.3 
    }, 0);

    tl.fromTo(canvasWrapperRef.current, 
      { scale: 1.15, filter: 'blur(10px)' },
      { scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'power3.out' },
      0.2
    );
  };

  // --- MENU ACTIONS ---
  const handleResume = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) canvas.requestPointerLock(); 
  };

  const toggleSound = () => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    window.__soundMuted = newMuted;
    if (newMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleSubs = () => {
    const newSubs = !subsMuted;
    setSubsMuted(newSubs);
    window.__subtitlesMuted = newSubs;
    window.dispatchEvent(new Event('subtitles-toggled'));
  };

  const handleQuit = () => {
    const ctx = THREE.AudioContext.getContext();
    if (ctx.state === 'suspended') ctx.resume(); 
    window.__isSpeaking = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.exitPointerLock();
    navigate('/explore', { replace: true });
  };

  return (
    <div className="scene-page relative w-full h-screen overflow-hidden bg-black">
      {/* Intro Loading Screen */}
      {!hasStarted && ActiveScene && (
        <div ref={overlayRef} className="absolute inset-0 z-50 bg-[#1a120b] shadow-[0_20px_50px_rgba(0,0,0,1)] flex items-center justify-center">
          <LoadingScreen hasLoaded={hasLoaded} onStart={handleStart} isRevealing={isRevealing} />
        </div>
      )}

      {/* R3F Canvas */}
      <div ref={canvasWrapperRef} className="w-full h-full absolute inset-0 z-10">
        {ActiveScene ? (
          <Suspense fallback={null}>
            <ActiveScene hasStarted={hasStarted} />
          </Suspense>
        ) : (
          <LessonNotFound />
        )}
      </div>

      {/* GAME PAUSE MENU */}
      <PauseMenu 
        isPaused={isPaused}
        handleResume={handleResume}
        soundMuted={soundMuted}
        toggleSound={toggleSound}
        subsMuted={subsMuted}
        toggleSubs={toggleSubs}
        handleQuit={handleQuit}
      />
    </div>
  );
}