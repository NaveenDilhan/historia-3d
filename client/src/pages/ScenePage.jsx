import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import DialogueBox from '../components/UI/DialogueBox';
import LoadingScreen from '../components/UI/LoadingScreen';

// 1. Define lazy imports for your isolated scenes.
// The browser will ONLY fetch these files when they are rendered.
const SceneMap = {
  'earth-formation': lazy(() => import('../lessons/EarthFormation/Scene')),
  'jurassic': lazy(() => import('../lessons/Jurassic/Scene')),
  // Add future lessons here...
};

export default function ScenePage() {
  // 2. Grab the lessonId from the URL (e.g., /scene/earth-formation)
  const { lessonId } = useParams();

  // 3. Select the correct scene, or default to a fallback if it doesn't exist
  const ActiveScene = SceneMap[lessonId] || SceneMap['earth-formation'];

  return (
    <div className="scene-page relative w-full h-screen overflow-hidden bg-black">
      {/* 4. Wrap the lazy component in Suspense and provide the LoadingScreen */}
      <Suspense fallback={<LoadingScreen />}>
        <ActiveScene />
      </Suspense>

      <div className="ui-overlay absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <DialogueBox />
      </div>
    </div>
  );
}