import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DialogueBox from '../components/UI/DialogueBox';
import LoadingScreen from '../components/UI/LoadingScreen';
import { ChevronLeft } from 'lucide-react';
import { useProgress } from '@react-three/drei';

// 1. Define lazy imports for your isolated scenes.
const SceneMap = {
  'earth-formation': lazy(() => import('../lessons/EarthFormation/Scene')),
  'jurassic': lazy(() => import('../lessons/Jurassic/Scene')),
  // Add future lessons here matching the database 'slug'...
};

// 2. The Fallback UI for missing lessons
const LessonNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#1a120b] text-amber-50">
      <h1 className="text-4xl md:text-6xl font-heading font-bold text-amber-500 mb-6 tracking-widest drop-shadow-lg">
        SCROLL MISSING
      </h1>
      <p className="text-amber-200/60 mb-8 max-w-md text-center leading-relaxed">
        The scribes have not yet documented this era, or the scrolls have been lost to time. The 3D scene you are looking for does not exist.
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
  
  // Two distinct states: one for loading completion, one for user initiating the scene
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // 1. Once we hit 100% and set it to loaded, freeze the state. 
    // This prevents the screen from flashing if a background asset loads later.
    if (hasLoaded) return;

    // 2. If finished loading and hit 100%
    if (!active && progress === 100) {
      // Add a small buffer to let the GPU compile shaders smoothly before showing the button
      const timer = setTimeout(() => setHasLoaded(true), 800);
      return () => clearTimeout(timer);
    }

    // 3. Failsafe: If there are network errors, let the user read them, then proceed
    if (!active && errors.length > 0) {
      const timer = setTimeout(() => setHasLoaded(true), 3000);
      return () => clearTimeout(timer);
    }

    // 4. Failsafe: If a scene has literally 0 assets to load
    if (!active && total === 0) {
      const timer = setTimeout(() => setHasLoaded(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [active, progress, total, errors.length, hasLoaded]);

  // Handler for the "Start" button
  const handleStart = () => {
    setHasStarted(true);
  };

  return (
    <div className="scene-page relative w-full h-screen overflow-hidden bg-black">
      
      {/* Opaque Loading Barrier: 
        Stays visible until the user explicitly clicks the Start button.
        This gives the browser the "user interaction" needed to play audio reliably.
      */}
      {!hasStarted && ActiveScene && (
        <div className="absolute inset-0 z-50 bg-[#1a120b]">
          <LoadingScreen hasLoaded={hasLoaded} onStart={handleStart} />
        </div>
      )}

      {/* The 3D Component */}
      {ActiveScene ? (
        <Suspense fallback={null}>
          {/* Pass the hasStarted state down to the scene so it knows when to trigger events */}
          <ActiveScene hasStarted={hasStarted} />
        </Suspense>
      ) : (
        <LessonNotFound />
      )}

      {/* Only reveal UI overlays when the scene is active and the user has pressed start */}
      {ActiveScene && hasStarted && (
        <div className="ui-overlay absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <DialogueBox />
        </div>
      )}
    </div>
  );
}