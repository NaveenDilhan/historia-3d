import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment } from '@react-three/drei';
import Terrain from './Environment/Terrain';
import Lighting from './Environment/Lighting';
import DinosaurEncounter from './Events/DinosaurEncounter';
import Player from '../hooks/Player';

export default function Scene() {
  const terrainRef = useRef();

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 60 }} gl={{ antialias: true }}>
      <color attach="background" args={['#a0c4a8']} />
      <fog attach="fog" args={['#a0c4a8', 10, 250]} />

      <ambientLight intensity={0.4} />

      <Suspense fallback={null}>
        <Lighting />
        <Terrain ref={terrainRef} />
        <DinosaurEncounter />
        <Environment preset="forest" background={false} />
      </Suspense>

      <Player terrainGeo={terrainRef.current?.children[0]?.geometry} />

      <Sky
        sunPosition={[100, 20, 100]}
        inclination={0.5}
        azimuth={0.25}
        turbidity={8}
        rayleigh={0.5}
        mieCoefficient={0.02}
        mieDirectionalG={0.8}
      />
    </Canvas>
  );
}
