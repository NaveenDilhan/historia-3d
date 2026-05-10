import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Components
import MoonLandingUI from './UI/MoonLandingUI';
import RocketModel from './Environment/RocketModel';
import Launchpad from './Environment/Launchpad';

// Hooks
import { useLaunchControls } from './hooks/useLaunchControls';

export default function Scene({ hasStarted }) {
  // Lesson Chapters/Phases: 'video' -> 'title' -> 'launch' -> 'liftoff' -> 'orbit'
  const [phase, setPhase] = useState('video'); 
  
  // Custom hook manages all the spacebar holding mechanics
  const launchProgress = useLaunchControls(phase, setPhase);

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 40], fov: 60 }}>
        <fog attach="fog" args={['#87ceeb', 10, 200]} />
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} castShadow intensity={2} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <Launchpad />
          <RocketModel phase={phase} launchProgress={launchProgress} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.5} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      <MoonLandingUI 
        hasStarted={hasStarted} 
        phase={phase} 
        setPhase={setPhase} 
        launchProgress={launchProgress} 
      />
    </>
  );
}