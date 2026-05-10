import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Components
import MoonLandingUI from './UI/MoonLandingUI';
import RocketModel from './Environment/RocketModel';
import Terrain from './Environment/Terrain'; 

// Hooks
import { useLaunchControls } from './hooks/useLaunchControls';

export default function Scene({ hasStarted }) {
  const [phase, setPhase] = useState('video'); 
  const launchProgress = useLaunchControls(phase, setPhase);

  return (
    <>
      {/* 1. Camera position updated based on your console logs */}
      <Canvas shadows dpr={[1, 2]} camera={{ position: [68.59, 40.72, 102.89], fov: 40 }}>
        
        {/* Sunset fog coloring */}
        <fog attach="fog" args={['#8a705e', 100, 1200]} />
        
        {/* Sunset Sky */}
        <Sky sunPosition={[0, 0.01, -1]} turbidity={0.6} rayleigh={1.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <Stars radius={100} depth={50} count={2000} factor={2} saturation={0} fade speed={0.5} />
        
        {/* Warm ambient lighting */}
        <ambientLight intensity={0.3} color="#ffecd1" />
        <directionalLight position={[100, 20, -50]} castShadow intensity={2} color="#ffb77a" />

        <Suspense fallback={null}>
          <Environment preset="sunset" />
          
          {/* Natural Environment + Your GLB Models */}
          <Terrain />
          
          {/* The Saturn V */}
          <RocketModel phase={phase} launchProgress={launchProgress} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.0} />
          </EffectComposer>
        </Suspense>

        {/* 2. Locked Camera Controls: Target set, user interaction disabled */}
        <OrbitControls 
          target={[0.00, 15.00, 0.00]} 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false} 
        />
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