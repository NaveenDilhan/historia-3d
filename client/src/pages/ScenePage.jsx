import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/UI/LoadingScreen';
import { ChevronLeft, Play, Volume2, VolumeX, MessageSquare, LogOut } from 'lucide-react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
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
    // Push an initial state to hijack the back button
    window.history.pushState(null, '', window.location.pathname);

    const handlePopState = (event) => {
      // Push state again so they remain on this page
      window.history.pushState(null, '', window.location.pathname);
      
      // Force the game to pause when they attempt to leave via browser back button
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
      // If the browser loses pointer lock (ESC pressed) and the game has started -> PAUSE
      if (!document.pointerLockElement && hasStartedRef.current) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, []);

  // --- AUDIO SUSPENSION LOGIC ---
  useEffect(() => {
    const ctx = THREE.AudioContext.getContext();
    if (isPaused || soundMuted) {
      if (ctx.state === 'running') ctx.suspend();
    } else {
      if (ctx.state === 'suspended') ctx.resume();
    }
  }, [isPaused, soundMuted]);

  const handleStart = () => {
    // CRITICAL FIX: Instantly request pointer lock exactly on click to satisfy browser security
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
    if (canvas) canvas.requestPointerLock(); // requesting pointer lock auto-closes menu via event listener
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
    if (ctx.state === 'suspended') ctx.resume(); // Ensure audio runs for other pages
    window.__isSpeaking = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.exitPointerLock();
    // Using { replace: true } prevents them from going "forward" back into the hijacked state
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
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Bumped Z-index to 110 to ensure it always overlays Modals (which are 100)
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a130e]/90 border border-amber-900/50 p-10 rounded-3xl max-w-sm w-full flex flex-col items-center shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden"
            >
              {/* Decorative Header */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-80"></div>
              
              <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-3xl font-bold text-amber-100 mb-2 tracking-[0.2em] drop-shadow-md">
                PAUSED
              </h2>
              <div className="w-16 h-px bg-amber-700/50 mb-8"></div>

              {/* Menu Buttons */}
              <div className="flex flex-col gap-4 w-full">
                <MenuButton 
                  icon={<Play size={18} />} 
                  label="Resume Simulation" 
                  onClick={handleResume} 
                  highlight
                />
                <MenuButton 
                  icon={soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />} 
                  label={`Sound: ${soundMuted ? 'OFF' : 'ON'}`} 
                  onClick={toggleSound} 
                />
                <MenuButton 
                  icon={<MessageSquare size={18} />} 
                  label={`Subtitles: ${subsMuted ? 'OFF' : 'ON'}`} 
                  onClick={toggleSubs} 
                />
                
                <div className="h-px w-full bg-amber-900/30 my-2"></div>
                
                <MenuButton 
                  icon={<LogOut size={18} />} 
                  label="Abandon Quest" 
                  onClick={handleQuit} 
                  isDanger
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Reusable Pause Menu Button Component
function MenuButton({ icon, label, onClick, highlight, isDanger }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300
        ${highlight 
          ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-500/30' 
          : isDanger 
            ? 'bg-red-950/20 text-red-400 hover:bg-red-900/40 border border-red-900/30'
            : 'bg-black/40 text-amber-200/80 hover:bg-amber-900/40 hover:text-amber-100 border border-amber-900/40'}
        hover:scale-[1.02] active:scale-95
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}