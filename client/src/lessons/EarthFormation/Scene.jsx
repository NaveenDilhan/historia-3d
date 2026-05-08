import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars, Sparkles, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import EarthGlobe from './Environment/EarthGlobe';
import EarthUI from './UI/EarthUI';
import useTimeScroll from './hooks/useTimeScroll';

function TimeScrollController({ hasStarted }) {
  useTimeScroll(hasStarted);
  return null; 
}

export default function Scene({ hasStarted }) {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#020203']} />
        
        {/* Very low ambient light to keep the dark side of the planet actually dark */}
        <ambientLight intensity={0.05} />
        
        {/* Strong, angled directional light to create a cinematic Day/Night terminator line */}
        <directionalLight position={[15, 5, 5]} intensity={2.5} color="#ffffff" />
        {/* Soft blue rim light from the opposite side to simulate distant starlight */}
        <directionalLight position={[-15, -5, -5]} intensity={0.2} color="#4488ff" />
        
        <TimeScrollController hasStarted={hasStarted} />
        
        <Suspense fallback={null}>
           {hasStarted && <EarthGlobe />}
        </Suspense>

        <Stars radius={100} depth={50} count={6000} factor={3} saturation={0.5} fade speed={1.5} />
        <Sparkles count={150} scale={25} size={1.5} speed={0.2} opacity={0.2} color="#ffffff" />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false} 
        />

        <EffectComposer>
          {/* Enhanced Bloom to make the lava and UI beautifully glow */}
          <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.8} height={300} intensity={1.5} />
          <Vignette eskil={false} offset={0.15} darkness={1.2} />
          <Noise opacity={0.025} />
        </EffectComposer>
      </Canvas>
      
      <EarthUI hasStarted={hasStarted} />
    </>
  );
}