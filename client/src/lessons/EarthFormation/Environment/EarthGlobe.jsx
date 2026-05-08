import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ERAS } from '../hooks/useTimeScroll';

import HadeanGlobe from './HadeanGlobe';
import ArcheanGlobe from './ArcheanGlobe';
import ProterozoicGlobe from './ProterozoicGlobe';
import MesozoicGlobe from './MesozoicGlobe';
import PresentGlobe from './PresentGlobe';

function ScanningEvent({ active, title, onScan, onQuiz }) {
  const [scanLevel, setScanLevel] = useState(0);
  const isScanning = useRef(false);

  useEffect(() => {
    if (!active) { setScanLevel(0); return; }
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); isScanning.current = true; }
      if (e.code === 'KeyE') { e.preventDefault(); onQuiz(); }
    };
    const handleKeyUp = (e) => { if (e.code === 'Space' || e.code === 'Enter') isScanning.current = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [active, onQuiz]);

  useEffect(() => {
    if (!active) return;
    let frame;
    const updateScan = () => {
      setScanLevel((prev) => {
        let next = isScanning.current ? prev + 1.5 : prev - 2; 
        next = Math.max(0, Math.min(100, next));
        if (next >= 100) {
          isScanning.current = false; onScan(); return 0; 
        }
        return next;
      });
      frame = requestAnimationFrame(updateScan);
    };
    frame = requestAnimationFrame(updateScan);
    return () => cancelAnimationFrame(frame);
  }, [active, onScan]);

  if (!active) return null;

  return (
    <Html position={[0, -3.5, 0]} center zIndexRange={[100, 0]}>
      <div className="pointer-events-none flex flex-col items-center justify-center animate-pulse mt-8 w-80">
        <div className="text-cyan-400 font-mono text-sm tracking-widest mb-2 uppercase drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
          Anomaly: {title}
        </div>
        <div className="w-full h-3 bg-black/80 border border-cyan-500/50 rounded-full overflow-hidden p-[1px] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-75 shadow-[0_0_10px_cyan]" style={{ width: `${scanLevel}%` }} />
        </div>
        <div className="flex justify-between w-full mt-3 text-gray-400 text-xs font-bold uppercase tracking-widest px-2">
          <span>Hold [SPACE] to Analyze</span>
          <span className="text-emerald-400">Press [E] to Quiz</span>
        </div>
      </div>
    </Html>
  );
}

export default function EarthGlobe() {
  const globeRef = useRef();
  const atmosphereRef = useRef();
  
  const [progress, setProgress] = useState(0);
  const [lockThreshold, setLockThreshold] = useState(0.25); 
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  const { camera } = useThree();
  const defaultCameraPos = new THREE.Vector3(0, 0, 15);
  const zoomCameraPos = new THREE.Vector3(2, 0, 8); 

  const [opacities, setOpacities] = useState([1, 0, 0, 0, 0]);

  useEffect(() => {
    const handleProgress = (e) => setProgress(e.detail.progress);
    const handleUnlockUpdate = (e) => setLockThreshold(e.detail.nextThreshold);
    const handleMcqStart = () => setIsQuizActive(true);
    const handleMcqEnd = () => setIsQuizActive(false);

    window.addEventListener('timeline-progress', handleProgress);
    window.addEventListener('unlock-timeline', handleUnlockUpdate);
    window.addEventListener('start-mcq', handleMcqStart);
    window.addEventListener('end-mcq', handleMcqEnd);
    
    return () => {
      window.removeEventListener('timeline-progress', handleProgress);
      window.removeEventListener('unlock-timeline', handleUnlockUpdate);
      window.removeEventListener('start-mcq', handleMcqStart);
      window.removeEventListener('end-mcq', handleMcqEnd);
    };
  }, []);

  const triggerScanLesson = (narrationPrompt) => {
    setIsLessonActive(true);
    window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
    window.dispatchEvent(new CustomEvent('trigger-narration', { detail: { prompt: narrationPrompt } }));

    setTimeout(() => {
      setIsLessonActive(false);
      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
    }, 15000); 
  };

  const triggerQuiz = (eraKey, nextEraThreshold) => {
    window.dispatchEvent(new CustomEvent('start-mcq', { detail: { eraId: eraKey, nextThreshold: nextEraThreshold } }));
  };

  useFrame(() => {
    camera.position.lerp(isLessonActive ? zoomCameraPos : defaultCameraPos, 0.02);

    if (globeRef.current) {
      globeRef.current.rotation.y = progress * Math.PI * 2; 
    }

    const newOpacities = [1, 0, 0, 0, 0]; 
    const blendWindow = 0.05; 

    for (let i = 1; i < ERAS.length; i++) {
      const prevThreshold = ERAS[i-1].threshold;
      if (progress <= prevThreshold) newOpacities[i] = 0;
      else if (progress >= prevThreshold + blendWindow) newOpacities[i] = 1;
      else newOpacities[i] = (progress - prevThreshold) / blendWindow;
    }
    setOpacities(newOpacities);

    if (atmosphereRef.current) {
      const colorHadean = new THREE.Color('#ff2200'); 
      const colorPresent = new THREE.Color('#2288ff'); 
      atmosphereRef.current.material.color.lerpColors(colorHadean, colorPresent, progress);
      atmosphereRef.current.material.opacity = 0.25 - (progress * 0.1);
    }
  });

  const isAtLock = (threshold) => Math.abs(progress - threshold) < 0.02 && lockThreshold === threshold && !isLessonActive && !isQuizActive;
  
  const hadeanCooling = THREE.MathUtils.clamp(progress / 0.15, 0, 1);
  // Ensures drift strictly runs between Mesozoic (0.75) and Present (1.0)
  const tectonicDrift = THREE.MathUtils.clamp((progress - 0.75) / 0.25, 0, 1);

  return (
    <group>
      <group ref={globeRef}>
        <HadeanGlobe radius={5.000} opacity={opacities[0]} cooling={hadeanCooling} />
        <ArcheanGlobe radius={5.002} opacity={opacities[1]} />
        <ProterozoicGlobe radius={5.004} opacity={opacities[2]} />
        <MesozoicGlobe radius={5.006} opacity={opacities[3]} />
        <PresentGlobe radius={5.008} opacity={opacities[4]} drift={tectonicDrift} />
      </group>

      <mesh scale={1.03} ref={atmosphereRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} roughness={1} />
      </mesh>

      <ScanningEvent
         active={isAtLock(0.25)}
         title="Early Oceans & Cyanobacteria"
         onScan={() => triggerScanLesson("Provide a new, distinct historical fact about cyanobacteria or the early ocean environment. Address the user directly as a historical observer; do not use the phrase 'young traveler'. Ensure you do not repeat facts if this is triggered multiple times.")}
         onQuiz={() => triggerQuiz('archean', 0.50)}
      />
      <ScanningEvent
         active={isAtLock(0.50)}
         title="The Great Oxidation Event"
         onScan={() => triggerScanLesson("Provide a new, distinct historical fact about the Great Oxidation Event or early eukaryotic life. Address the user directly; do not use the phrase 'young traveler'. Do not repeat facts.")}
         onQuiz={() => triggerQuiz('proterozoic', 0.75)}
      />
      <ScanningEvent
         active={isAtLock(0.75)}
         title="Supercontinent Pangea"
         onScan={() => triggerScanLesson("Provide a new, distinct historical fact about Pangea or the Mesozoic climate. Speak directly to the user; do not use the phrase 'young traveler'. Do not repeat facts.")}
         onQuiz={() => triggerQuiz('mesozoic', 1.0)}
      />
    </group>
  );
}