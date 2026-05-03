import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Sky, Environment, Cloud, Sparkles, PositionalAudio, Preload } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Environment Imports
import Terrain from './Environment/Terrain';
import Lighting from './Environment/Lighting';
import DinosaurEncounter from './Events/DinosaurEncounter';
import ApatosaurusModel from './Environment/ApatosaurusModel';
import Player from './Player/Player';
import TriceratopsModel from './Environment/TriceratopsModel';

// UI Wrapper Import
import JurassicUI from './UI/JurassicUI';

// Preload Assets
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/forest.mp3");
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/volcano.mp3");
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/ocean.mp3");

function BiomeAudio({ hasStarted }) {
  const forestRef = useRef();
  const volcanoRef = useRef();
  const oceanRef = useRef();

  useEffect(() => {
    if (hasStarted) {
      const playAudioNode = (ref, refDist, maxDist, rolloff, vol) => {
        if (ref.current) {
          ref.current.setRefDistance(refDist);
          ref.current.setMaxDistance(maxDist);
          ref.current.setRolloffFactor(rolloff);
          ref.current.setVolume(vol);
          
          if (ref.current.context.state === 'suspended') {
            ref.current.context.resume();
          }
          if (!ref.current.isPlaying) {
            ref.current.play();
          }
        }
      };

      playAudioNode(forestRef, 150, 450, 1.5, 0.4);
      playAudioNode(volcanoRef, 120, 350, 2.0, 0.6);
      playAudioNode(oceanRef, 80, 200, 3.0, 0.6);
    }
  }, [hasStarted]);

  return (
    <group>
      <PositionalAudio ref={forestRef} url="/sounds/jurrasic/forest.mp3" loop position={[0, 10, 0]} autoplay={false} />
      <PositionalAudio ref={volcanoRef} url="/sounds/jurrasic/volcano.mp3" loop position={[0, 50, -600]} autoplay={false} />
      <PositionalAudio ref={oceanRef} url="/sounds/jurrasic/ocean.mp3" loop position={[0, 0, 450]} autoplay={false} />
    </group>
  );
}

export default function Scene({ hasStarted }) {
  const [terrainGeo, setTerrainGeo] = useState(null);

  return (
    <>
      {/* 3D Scene Layer */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 60, far: 10000 }} gl={{ antialias: true, toneMappingExposure: 1.1 }}>
        <color attach="background" args={['#597a61']} />
        <fogExp2 attach="fog" args={['#597a61', 0.012]} />
        
        <Suspense fallback={null}>
          <Lighting />
          
          {/* Rapier Physics Engine */}
          <Physics gravity={[0, -9.81, 0]}>
            <Terrain setTerrainGeo={setTerrainGeo} />
            
            {terrainGeo && (
              <>
                <DinosaurEncounter terrainGeo={terrainGeo} hasStarted={hasStarted} />
                
                <Suspense fallback={null}>
                  <ApatosaurusModel 
                      terrainGeo={terrainGeo} 
                      hasStarted={hasStarted} 
                      x={20} 
                      z={-200} 
                      scale={5.0} 
                  />
                </Suspense>
                
                {/* TRICERATOPS - Placed at the far left edge of the forest */}
                <Suspense fallback={null}>
                  <TriceratopsModel
                      terrainGeo={terrainGeo}
                      hasStarted={hasStarted}
                      x={-100}          // Far left edge of the map
                      z={80}             // Center forest biome
                      scale={2}       // Bit smaller than T-Rex (2.8)
                      rotationY={Math.PI / 4} // Rotated slightly towards the center
                  />
                </Suspense>

                <Suspense fallback={null}>
                  {/* FIXED: Passing hasStarted to the Player */}
                  <Player hasStarted={hasStarted} />
                </Suspense>
              </>
            )}
          </Physics>

          <BiomeAudio hasStarted={hasStarted} />
          
          {/* Atmosphere & Environment */}
          <Sparkles count={1500} scale={300} size={4} speed={0.2} opacity={0.2} color="#ffddaa" />
          <Cloud position={[-40, 50, -60]} speed={0.15} opacity={0.6} scale={2.5} color="#ffd8a8" />
          <Cloud position={[50, 60, 30]} speed={0.1} opacity={0.4} scale={3} color="#ffebd6" />
          <Cloud position={[0, 45, 80]} speed={0.2} opacity={0.5} scale={2} color="#e0cda6" />
          
          <Environment preset="forest" background={false} />
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.5} />
          </EffectComposer>
          
          <Preload all />
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

      {/* 2D UI Layer */}
      <JurassicUI hasStarted={hasStarted} />
    </>
  );
}