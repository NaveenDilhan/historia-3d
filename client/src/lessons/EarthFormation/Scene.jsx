import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars, Sparkles, OrbitControls, Preload } from '@react-three/drei';
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
        <color attach="background" args={['#010102']} />
        
        {/* Very low ambient light for high contrast */}
        <ambientLight intensity={0.03} />
        
        {/* Strong, angled directional light to create a cinematic Day/Night terminator line */}
        <directionalLight position={[15, 5, 5]} intensity={3.5} color="#ffffff" />
        {/* Soft blue rim light from the opposite side to simulate distant starlight */}
        <directionalLight position={[-15, -5, -5]} intensity={0.3} color="#4488ff" />
        
        <TimeScrollController hasStarted={hasStarted} />
        
        <Suspense fallback={null}>
           <EarthGlobe />
           <Preload all />
        </Suspense>

        {/* Enhanced stellar background for the 'Void' impression */}
        <Stars radius={120} depth={60} count={8000} factor={4} saturation={0.8} fade speed={1.0} />
        <Sparkles count={300} scale={35} size={2} speed={0.4} opacity={0.3} color="#aaddff" />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false} 
        />

        <EffectComposer>
          {/* Enhanced Bloom to make the emerging planet and lava beautifully glow */}
          <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.9} height={300} intensity={2.0} />
          <Vignette eskil={false} offset={0.2} darkness={1.3} />
          <Noise opacity={0.03} />
        </EffectComposer>
      </Canvas>
      
      <EarthUI hasStarted={hasStarted} />
    </>
  );
}