import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DialogueBox from '../components/UI/DialogueBox';
import LoadingScreen from '../components/UI/LoadingScreen';
import { ChevronLeft } from 'lucide-react';

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
  // Grab the lessonId (which is the slug) from the URL
  const { lessonId } = useParams();

  // Select the correct scene based on the URL parameter
  const ActiveScene = SceneMap[lessonId];

  return (
    <div className="scene-page relative w-full h-screen overflow-hidden bg-black">
      
      {/* If the scene exists in our map, render it. Otherwise, show the Not Found page */}
      {ActiveScene ? (
        <Suspense fallback={<LoadingScreen />}>
          <ActiveScene />
        </Suspense>
      ) : (
        <LessonNotFound />
      )}

      {/* Only render the DialogueBox if an ActiveScene is actually running */}
      {ActiveScene && (
        <div className="ui-overlay absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <DialogueBox />
        </div>
      )}
    </div>
  );
}