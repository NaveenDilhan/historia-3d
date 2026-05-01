import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DialogueBox from '../components/UI/DialogueBox';
import LoadingScreen from '../components/UI/LoadingScreen';
import InteractHint from '../components/UI/InteractHint'; // NEW
import DinoModal from '../components/UI/DinoModal';       // NEW
import { ChevronLeft } from 'lucide-react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';

// Lazy load isolated scenes to chunk JS bundles
const SceneMap = {
  'earth-formation': lazy(() => import('../lessons/EarthFormation/Scene')),
  'jurassic': lazy(() => import('../lessons/Jurassic/Scene')),
}

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
}

export default function ScenePage() {
  const { lessonId } = useParams();
  const ActiveScene = SceneMap[lessonId];
  
  const { active, progress, total, errors } = useProgress();
  
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // NEW: UI State
  const [hoveredDino, setHoveredDino] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const overlayRef = useRef(null);
  const canvasWrapperRef = useRef(null);

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

  // NEW: Listen for Raycast events from the 3D models
  useEffect(() => {
    const handleHover = (e) => setHoveredDino(e.detail.isHovering);
    const handleClick = (e) => setActiveModal(e.detail.type);

    window.addEventListener('dino-hover', handleHover);
    window.addEventListener('dino-click', handleClick);
    return () => {
        window.removeEventListener('dino-hover', handleHover);
        window.removeEventListener('dino-click', handleClick);
    };
  }, []);

  // NEW: Trigger Tutorial Modal when scene begins
  useEffect(() => {
    if (hasStarted) {
        // Slight delay so the GSAP curtain effect finishes before popping the modal
        const timer = setTimeout(() => setActiveModal('tutorial'), 2000);
        return () => clearTimeout(timer);
    }
  }, [hasStarted]);

  const handleStart = () => {
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

  return (
    <div className="scene-page relative w-full h-screen overflow-hidden bg-black">
      
      {!hasStarted && ActiveScene && (
        <div ref={overlayRef} className="absolute inset-0 z-50 bg-[#1a120b] shadow-[0_20px_50px_rgba(0,0,0,1)] flex items-center justify-center">
          <LoadingScreen hasLoaded={hasLoaded} onStart={handleStart} isRevealing={isRevealing} />
        </div>
      )}

      <div ref={canvasWrapperRef} className="w-full h-full absolute inset-0 z-10">
        {ActiveScene ? (
          <Suspense fallback={null}>
            <ActiveScene hasStarted={hasStarted} />
          </Suspense>
        ) : (
          <LessonNotFound />
        )}
      </div>

      {/* UI Overlays */}
      {ActiveScene && hasStarted && (
        <div className="ui-overlay absolute inset-0 z-20 pointer-events-none">
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <DialogueBox />
          </div>

          {/* NEW: Interaction Crosshair Hint */}
          <InteractHint visible={hoveredDino && !activeModal} />

          {/* NEW: Archival Info Modal (pointer-events-auto re-enables clicking) */}
          <div className="pointer-events-auto">
             <DinoModal type={activeModal} onClose={() => setActiveModal(null)} />
          </div>
          
        </div>
      )}
    </div>
  );
}