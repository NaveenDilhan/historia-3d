import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, Cloud, Sparkles } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import Terrain from './Environment/Terrain';
import Lighting from './Environment/Lighting';
import DinosaurEncounter from './Events/DinosaurEncounter';
import Player from '../../hooks/Player';

export default function Scene() {
  const [terrainGeo, setTerrainGeo] = useState(null);

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 60, far: 10000 }} gl={{ antialias: true, toneMappingExposure: 1.1 }}>
      {/* Humid prehistoric green/amber fog */}
      <color attach="background" args={['#597a61']} />
      <fogExp2 attach="fog" args={['#597a61', 0.012]} />

      <Suspense fallback={null}>
        <Lighting />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Terrain setTerrainGeo={setTerrainGeo} />
          
          {terrainGeo && (
            <>
              <DinosaurEncounter terrainGeo={terrainGeo} />
              <Player terrainGeo={terrainGeo} />
            </>
          )}
        </Physics>

        {/* Ambient dust and clouds */}
        <Sparkles count={3500} scale={300} size={4} speed={0.2} opacity={0.2} color="#ffddaa" />
        <Cloud position={[-40, 50, -60]} speed={0.15} opacity={0.6} scale={2.5} color="#ffd8a8" />
        <Cloud position={[50, 60, 30]} speed={0.1} opacity={0.4} scale={3} color="#ffebd6" />
        <Cloud position={[0, 45, 80]} speed={0.2} opacity={0.5} scale={2} color="#e0cda6" />
        
        <Environment preset="forest" background={false} />

        {/* Clean Post-Processing Pipeline: Only Bloom for highlights */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.5} />
        </EffectComposer>
      </Suspense>

      <Sky
        distance={450000}
        sunPosition={[1500, 400, -500]} // Synced with the new directionalLight position
        inclination={0.48}
        azimuth={0.25}
        turbidity={20}
        rayleigh={2.5}
        mieCoefficient={0.06}
        mieDirectionalG={0.85}
      />
    </Canvas>
  );
}