import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DialogueBox from '../components/UI/DialogueBox';
import LoadingScreen from '../components/UI/LoadingScreen';
import { ChevronLeft } from 'lucide-react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';

// 1. Lazy load isolated scenes to chunk JS bundles
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
  const ActiveScene = SceneMap[lessonId];
  
  // Track 3D asset loading progress globally
  const { active, progress, total, errors } = useProgress();
  
  // State Management
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // Refs for GSAP Animation
  const overlayRef = useRef(null);
  const canvasWrapperRef = useRef(null);

  // Optimization: Monitor loading progress
  useEffect(() => {
    if (hasLoaded) return;

    // When everything is downloaded (progress === 100) and we actually had items to load
    if (!active && progress === 100 && total > 0) {
      // CRITICAL OPTIMIZATION: Wait an extra 800ms. 
      // Even though files are downloaded, WebGL needs a few frames to compile shaders.
      // This prevents the screen from freezing the moment the curtain lifts.
      const timer = setTimeout(() => setHasLoaded(true), 800);
      return () => clearTimeout(timer);
    }

    // Failsafe: If files fail to load, let the user proceed after a delay anyway
    if (!active && errors.length > 0) {
      const timer = setTimeout(() => setHasLoaded(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [active, progress, total, errors.length, hasLoaded]);

  // Handler for the "Start" button - Triggers GSAP Transition
  const handleStart = () => {
    setIsRevealing(true); // Fades out the text/buttons on the loading screen

    const tl = gsap.timeline({
      onComplete: () => {
        setHasStarted(true); // Unmounts overlay completely to free DOM memory
      }
    });

    // 1. Slide the dark overlay up like a theater curtain
    tl.to(overlayRef.current, {
      y: '-100%',
      duration: 1.6,
      ease: 'power4.inOut',
      delay: 0.3 // Pause to let the UI text fade out first
    }, 0);

    // 2. Cinematic "falling into the world" effect
    tl.fromTo(canvasWrapperRef.current, 
      {
        scale: 1.15,
        filter: 'blur(10px)',
      }, 
      {
        scale: 1,
        filter: 'blur(0px)',
        duration: 2.2,
        ease: 'power3.out'
      }, 0.2 // Starts slightly after the curtain begins rising
    );
  };

  return (
    <div className="scene-page relative w-full h-screen overflow-hidden bg-black">
      
      {/* 
        Opaque Loading Barrier
        The Canvas renders BEHIND this barrier. This forces all 3D models to visually 
        render and compile into the GPU invisibly, guaranteeing zero stutter on reveal.
      */}
      {!hasStarted && ActiveScene && (
        <div ref={overlayRef} className="absolute inset-0 z-50 bg-[#1a120b] shadow-[0_20px_50px_rgba(0,0,0,1)] flex items-center justify-center">
          <LoadingScreen hasLoaded={hasLoaded} onStart={handleStart} isRevealing={isRevealing} />
        </div>
      )}

      {/* The 3D Component Wrapper - Targeted by GSAP */}
      <div ref={canvasWrapperRef} className="w-full h-full absolute inset-0 z-10">
        {ActiveScene ? (
          <Suspense fallback={null}>
            {/* Pass `hasStarted` down so logic/audio/AI ONLY fires AFTER the visual reveal */}
            <ActiveScene hasStarted={hasStarted} />
          </Suspense>
        ) : (
          <LessonNotFound />
        )}
      </div>

      {/* UI Overlays (Dialogue, UI controls) - Only mount when the scene is active */}
      {ActiveScene && hasStarted && (
        <div className="ui-overlay absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <DialogueBox />
        </div>
      )}
    </div>
  );
}