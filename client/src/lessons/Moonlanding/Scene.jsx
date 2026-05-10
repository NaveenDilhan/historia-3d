import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Components
import MoonLandingUI from './UI/MoonLandingUI';
import RocketModel from './Environment/RocketModel';
import Terrain from './Environment/Terrain'; // <--- Imported new Terrain

// Hooks
import { useLaunchControls } from './hooks/useLaunchControls';

export default function Scene({ hasStarted }) {
  const [phase, setPhase] = useState('video'); 
  const launchProgress = useLaunchControls(phase, setPhase);

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 60], fov: 60 }}>
        <fog attach="fog" args={['#c89b7b', 50, 600]} />
        <Sky sunPosition={[0, 2, -100]} turbidity={0.3} rayleigh={1.2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} color="#ffecd1" />
        <directionalLight position={[0, 10, -50]} castShadow intensity={1.5} color="#ffb77a" />

        <Suspense fallback={null}>
          <Environment preset="city" />
          
          {/* New Setup */}
          <Terrain />
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