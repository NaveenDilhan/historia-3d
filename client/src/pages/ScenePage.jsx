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
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    // 1. If actively downloading, ensure the scene stays hidden.
    if (active) {
      setIsSceneReady(false);
      return; 
    }

    // 2. If finished loading and hit 100%
    if (!active && progress === 100) {
      // Add a 1.2-second buffer. This prevents flickering if another asset 
      // is requested late, and gives the GPU time to compile shaders smoothly.
      const timer = setTimeout(() => setIsSceneReady(true), 1200);
      return () => clearTimeout(timer);
    }

    // 3. Failsafe: If there are network errors, let the user read them, then proceed anyway
    if (!active && errors.length > 0) {
      const timer = setTimeout(() => setIsSceneReady(true), 3000);
      return () => clearTimeout(timer);
    }

    // 4. Failsafe: If a scene has literally 0 assets to load
    if (!active && total === 0) {
      const timer = setTimeout(() => setIsSceneReady(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [active, progress, total, errors.length]);

  return (
    <div className="scene-page relative w-full h-screen overflow-hidden bg-black">
      
      {/* Opaque Loading Barrier: 
        Because we control visibility via CSS overlapping (z-50) rather than unmounting 
        the Canvas, the 3D scene can silently render in the background while this covers it.
      */}
      {!isSceneReady && ActiveScene && (
        <div className="absolute inset-0 z-50 bg-[#1a120b]">
          <LoadingScreen />
        </div>
      )}

      {/* The 3D Component */}
      {ActiveScene ? (
        // Fallback is null because our custom overlay above handles the visual loading state
        <Suspense fallback={null}>
          <ActiveScene />
        </Suspense>
      ) : (
        <LessonNotFound />
      )}

      {/* Only reveal UI overlays when the scene is 100% prepared */}
      {ActiveScene && isSceneReady && (
        <div className="ui-overlay absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <DialogueBox />
        </div>
      )}
    </div>
  );
}