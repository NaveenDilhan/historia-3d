import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, Cloud, Sparkles } from '@react-three/drei';
import { Physics } from '@react-three/rapier';

import Terrain from './Environment/Terrain';
import Lighting from './Environment/Lighting';
import DinosaurEncounter from './Events/DinosaurEncounter';
import Player from '../../hooks/Player';

export default function Scene() {
  // Use state instead of refs so Player/Dinosaur know EXACTLY when the ground is ready
  const [terrainGeo, setTerrainGeo] = useState(null);

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 60 }} gl={{ antialias: true, toneMappingExposure: 1.2 }}>
      <color attach="background" args={['#7fa38c']} />
      <fogExp2 attach="fog" args={['#7fa38c', 0.015]} />

      <Suspense fallback={null}>
        <Lighting />
        
        {/* Unified Physics World so Player, Terrain, and Trees all interact */}
        <Physics gravity={[0, -9.81, 0]}>
          <Terrain setTerrainGeo={setTerrainGeo} />
          
          {/* Only render entities once ground geometry exists */}
          {terrainGeo && (
            <>
              {/* Note: Pass terrainGeo down to your DinosaurModel inside this wrapper! */}
              <DinosaurEncounter terrainGeo={terrainGeo} />
              <Player terrainGeo={terrainGeo} />
            </>
          )}
        </Physics>

        <Sparkles count={2500} scale={250} size={3} speed={0.1} opacity={0.15} color="#ffd8a8" />
        <Cloud position={[-40, 50, -60]} speed={0.15} opacity={0.6} scale={2.5} color="#ffd8a8" />
        <Cloud position={[50, 60, 30]} speed={0.1} opacity={0.4} scale={3} color="#ffffff" />
        <Cloud position={[0, 45, 80]} speed={0.2} opacity={0.5} scale={2} color="#e0cda6" />
        
        <Environment preset="forest" background={false} />
      </Suspense>

      <Sky
        sunPosition={[150, 40, -50]}
        inclination={0.48}
        azimuth={0.25}
        turbidity={18}
        rayleigh={2.0}
        mieCoefficient={0.05}
        mieDirectionalG={0.85}
      />
    </Canvas>
  );
}