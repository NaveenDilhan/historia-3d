import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Environment, Cloud, Sparkles, PositionalAudio } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import Terrain from './Environment/Terrain';
import Lighting from './Environment/Lighting';
import DinosaurEncounter from './Events/DinosaurEncounter';
import Player from '../../hooks/Player';

// ==========================================
// 1. COMPONENT: Spatial Biome Audio
// ==========================================
function BiomeAudio({ hasStarted }) {
  // Audio Refs for active biomes
  const forestRef = useRef();
  const volcanoRef = useRef();
  const oceanRef = useRef();
  const isInitialized = useRef(false);

  // Initialize spatial boundaries on the first active frame AFTER user starts the journey
  useFrame(() => {
    if (hasStarted && !isInitialized.current) {
      
      const setupAudioNode = (ref, refDist, maxDist, rolloff, vol) => {
        if (ref.current) {
          ref.current.setRefDistance(refDist);   // 100% volume inside this radius
          ref.current.setMaxDistance(maxDist);   // 0% volume outside this radius
          ref.current.setRolloffFactor(rolloff); // Fade curve steepness
          ref.current.setVolume(vol);
          
          if (ref.current.context.state === 'suspended') {
            ref.current.context.resume();
          }
          if (!ref.current.isPlaying) ref.current.play();
        }
      };

      // TUNING PARAMETERS: Adjust these to fit the exact scale of your map
      // setupAudioNode(ref, refDistance, maxDistance, rolloffFactor, volume)
      setupAudioNode(forestRef,  100, 300, 1.5, 0.4); // Wide, gentle fade (will be heard slightly in the nearby desert)
      setupAudioNode(volcanoRef,  80, 250, 2.0, 0.6); // Slightly steeper fade to isolate the rumbling
      setupAudioNode(oceanRef,   150, 450, 1.0, 0.5); // Massive spread for a long coastline
      
      isInitialized.current = true;
    }
  });

  // Don't mount the audio nodes to the scene until the user actually starts the experience
  if (!hasStarted) return null;

  return (
    <group>
      {/* POSITIONING: Update the [X, Y, Z] arrays below to match the exact 
        coordinates of your actual models on the map.
      */}
      
      {/* Center of the Forest */}
      <PositionalAudio 
        ref={forestRef} 
        url="/sounds/jurrasic/forest.mp3" 
        loop 
        position={[0, 0, 0]} 
      />
      
      {/* Deep inside the Volcano crater */}
      <PositionalAudio 
        ref={volcanoRef} 
        url="/sounds/jurrasic/volcano.mp3" 
        loop 
        position={[-200, 50, -200]} 
      />
      
      {/* At the edge of the Ocean coastline */}
      <PositionalAudio 
        ref={oceanRef} 
        url="/sounds/jurrasic/ocean.mp3" 
        loop 
        position={[300, 0, 100]} 
      />
    </group>
  );
}

// ==========================================
// 2. MAIN SCENE
// ==========================================
// Accept hasStarted from ScenePage.jsx
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