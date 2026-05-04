import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
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

// Event Imports
import GeothermalVent from './Events/GeothermalVent';
import MeteorEvent from './Events/MeteorEvent';

// UI Wrapper Import
import JurassicUI from './UI/JurassicUI';

// Preload Assets
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/forest.mp3");
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/volcano.mp3");
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/ocean.mp3");

const VENT_LOCATIONS = [
  { x: -50, y: 15, z: -450, scale: 1.2 },
  { x: 120, y: 22, z: -520, scale: 1.8 },
  { x: -160, y: 18, z: -610, scale: 1.5 },
  { x: 40, y: 28, z: -680, scale: 2.2 },
  { x: -80, y: 35, z: -740, scale: 1.0 },
  { x: 180, y: 20, z: -580, scale: 1.4 },
];

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

function BiomeTracker() {
  const { camera } = useThree();
  const lastBiome = useRef('dense forest');

  useFrame(() => {
    const z = camera.position.z;
    let currentBiome = 'dense forest';
    
    if (z >= 360) currentBiome = 'coastal beach';
    else if (z >= -50 && z < 360) currentBiome = 'dense forest';
    else if (z >= -400 && z < -50) currentBiome = 'arid desert';
    else if (z < -400) currentBiome = 'active volcanic';

    if (currentBiome !== lastBiome.current) {
      lastBiome.current = currentBiome;
      window.dispatchEvent(new CustomEvent('biome-change', { detail: { biome: currentBiome } }));
    }
  });

  return null;
}

function AtmosphereTransition({ active }) {
  const { scene } = useThree();
  const targetColor = new THREE.Color(active ? '#300800' : '#597a61');
  const targetDensity = active ? 0.028 : 0.012; 

  useFrame((state, delta) => {
    if (scene.background) scene.background.lerp(targetColor, delta * 0.5);
    if (scene.fog) {
      scene.fog.color.lerp(targetColor, delta * 0.5);
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, targetDensity, delta * 0.5);
    }
  });
  return null;
}

export default function Scene({ hasStarted }) {
  const [terrainGeo, setTerrainGeo] = useState(null);
  const [meteorStrikeActive, setMeteorStrikeActive] = useState(false);

  // CORE SEQUENCE FIX: 10 seconds AFTER the Geothermal modal is CLOSED
  useEffect(() => {
    const handleGeothermalClosed = () => {
      setTimeout(() => {
        setMeteorStrikeActive(true);
        // Alert the UI that the strike is visually starting right now
        window.dispatchEvent(new CustomEvent('meteor-strike-started'));
      }, 10000); 
    };

    window.addEventListener('geothermal-modal-closed', handleGeothermalClosed);
    return () => window.removeEventListener('geothermal-modal-closed', handleGeothermalClosed);
  }, []);

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 60, far: 10000 }} gl={{ antialias: true, toneMappingExposure: 1.1 }}>
        <color attach="background" args={['#597a61']} />
        <fogExp2 attach="fog" args={['#597a61', 0.012]} />
        
        <AtmosphereTransition active={meteorStrikeActive} />
        <BiomeTracker />
        
        <Suspense fallback={null}>
          <Lighting meteorStrikeActive={meteorStrikeActive} />
          
          <Physics gravity={[0, -9.81, 0]}>
            <Terrain setTerrainGeo={setTerrainGeo} />
            
            {terrainGeo && (
              <>
                <DinosaurEncounter terrainGeo={terrainGeo} hasStarted={hasStarted} />
                
                {VENT_LOCATIONS.map((pos, index) => (
                    <GeothermalVent key={`vent-${index}`} x={pos.x} y={pos.y} z={pos.z} scale={pos.scale} />
                ))}

                <MeteorEvent hasStarted={hasStarted} active={meteorStrikeActive} />
                
                <Suspense fallback={null}>
                  <ApatosaurusModel terrainGeo={terrainGeo} hasStarted={hasStarted} x={20} z={-200} scale={5.0} />
                </Suspense>
                
                <Suspense fallback={null}>
                  <TriceratopsModel terrainGeo={terrainGeo} hasStarted={hasStarted} x={-100} z={80} scale={2} rotationY={Math.PI / 4} />
                </Suspense>

                <Suspense fallback={null}>
                  <Player hasStarted={hasStarted} />
                </Suspense>
              </>
            )}
          </Physics>

          <BiomeAudio hasStarted={hasStarted} />
          
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

        <Sky distance={450000} sunPosition={[1500, 400, -500]} inclination={0.48} azimuth={0.25} turbidity={20} rayleigh={2.5} mieCoefficient={0.06} mieDirectionalG={0.85} />
      </Canvas>
      
      <JurassicUI hasStarted={hasStarted} />
    </>
  );
}