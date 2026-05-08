import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars, Sparkles, OrbitControls } from '@react-three/drei';
import EarthGlobe from './Environment/EarthGlobe';
import EarthUI from './UI/EarthUI';
import useTimeScroll from './hooks/useTimeScroll';

// 1. Create a headless helper component to run the hook
function TimeScrollController({ hasStarted }) {
  useTimeScroll(hasStarted);
  return null; // It doesn't render any 3D objects, just manages logic
}

export default function Scene({ hasStarted }) {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        {/* 2. Mount the controller INSIDE the Canvas context */}
        <TimeScrollController hasStarted={hasStarted} />
        
        <Suspense fallback={null}>
           {hasStarted && <EarthGlobe />}
        </Suspense>

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={20} size={2} speed={0.4} opacity={0.3} color="#ffffff" />
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
      
      <EarthUI hasStarted={hasStarted} />
    </>
  );
}