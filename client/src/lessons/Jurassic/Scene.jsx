import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, Cloud, Sparkles, PositionalAudio } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import Terrain from './Environment/Terrain';
import Lighting from './Environment/Lighting';
import DinosaurEncounter from './Events/DinosaurEncounter';
import ApatosaurusModel from './Environment/ApatosaurusModel'; // <-- New Import
import Player from '../../hooks/Player';

// ==========================================
// 1. COMPONENT: Spatial Biome Audio
// ==========================================
function BiomeAudio({ hasStarted }) {
  // Audio Refs for active biomes
  const forestRef = useRef();
  const volcanoRef = useRef();
  const oceanRef = useRef();

  useEffect(() => {
    // Only configure and play once the user has clicked "Begin Journey"
    if (hasStarted) {
      const playAudioNode = (ref, refDist, maxDist, rolloff, vol) => {
        if (ref.current) {
          ref.current.setRefDistance(refDist);   // 100% volume inside this radius
          ref.current.setMaxDistance(maxDist);   // 0% volume outside this radius
          ref.current.setRolloffFactor(rolloff); // Fade curve steepness
          ref.current.setVolume(vol);
          
          // Browsers require audio contexts to be explicitly resumed after a user gesture
          if (ref.current.context.state === 'suspended') {
            ref.current.context.resume();
          }

          if (!ref.current.isPlaying) {
            ref.current.play();
          }
        }
      };

      // TUNING PARAMETERS (Mapped to Terrain.jsx Z-coordinates)
      // Center of map (Z: 0). Gentle fade so it acts as ambient background.
      playAudioNode(forestRef, 150, 450, 1.5, 0.4);
      
      // Deep negative coordinates (Z < -425). Steeper fade to isolate the rumbling.
      playAudioNode(volcanoRef, 120, 350, 2.0, 0.6);
      
      // Deep positive coordinates (Z > 375). 
      // Very steep rolloff so the waves are ONLY heard when walking out of the tree line.
      playAudioNode(oceanRef, 80, 200, 3.0, 0.6);
    }
  }, [hasStarted]);

  return (
    <group>
      {/* Mount the audio nodes immediately so they preload during the Suspense screen,
          but set autoplay={false} so they don't violate browser audio policies.
      */}
      <PositionalAudio
         ref={forestRef}
         url="/sounds/jurrasic/forest.mp3"
         loop
         position={[0, 10, 0]}
         autoplay={false}
      />
      
      <PositionalAudio
         ref={volcanoRef}
         url="/sounds/jurrasic/volcano.mp3"
         loop
         position={[0, 50, -600]}
         autoplay={false}
      />
      
      <PositionalAudio
         ref={oceanRef}
         url="/sounds/jurrasic/ocean.mp3"
         loop
         position={[0, 0, 450]}
         autoplay={false}
      />
    </group>
  );
}

// ==========================================
// 2. MAIN SCENE
// ==========================================
export default function Scene({ hasStarted }) {
  const [terrainGeo, setTerrainGeo] = useState(null);

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 60, far: 10000 }} gl={{ antialias: true, toneMappingExposure: 1.1 }}>
      <color attach="background" args={['#597a61']} />
      <fogExp2 attach="fog" args={['#597a61', 0.012]} />

      <Suspense fallback={null}>
        <Lighting />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Terrain setTerrainGeo={setTerrainGeo} />
          
          {terrainGeo && (
            <>
              {/* Pass down the hasStarted state so the events stay dormant during load */}
              <DinosaurEncounter terrainGeo={terrainGeo} hasStarted={hasStarted} />
              
              {/* NEW: Spawn Apatosaurus in the desert once the user hits 'Begin Journey' */}
              {hasStarted && (
                <Suspense fallback={null}>
                  <ApatosaurusModel 
                     terrainGeo={terrainGeo} 
                     hasStarted={hasStarted} 
                     x={20}       // Shifted slightly off dead-center
                     z={-200}     // Deep into the desert biome
                     scale={5.0}  // Significantly larger than T-Rex
                  />
                </Suspense>
              )}

              <Player terrainGeo={terrainGeo} />
            </>
          )}
        </Physics>

        {/* Injecting the Spatial Biome Audio, gated by the Start Button */}
        <BiomeAudio hasStarted={hasStarted} />

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
        sunPosition={[1500, 400, -500]}
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