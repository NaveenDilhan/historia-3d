import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ERAS } from '../hooks/useTimeScroll';
import { ANOMALY_DATA, getLockedEraKey, getNextThreshold } from '../Data/anomalyData';

import VoidGlobe from './VoidGlobe';
import HadeanGlobe from './HadeanGlobe';
import ArcheanGlobe from './ArcheanGlobe';
import ProterozoicGlobe from './ProterozoicGlobe';
import MesozoicGlobe from './MesozoicGlobe';
import PresentGlobe from './PresentGlobe';

function AnomalyMarker({ position, active, title, onScan }) {
  const [scanLevel, setScanLevel] = useState(0);
  const isScanning = useRef(false);
  
  const markerGroupRef = useRef();
  const crystalRef = useRef();
  const auraRef = useRef();

  useEffect(() => {
    if (!active) { setScanLevel(0); return; }
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); isScanning.current = true; }
    };
    const handleKeyUp = (e) => { if (e.code === 'Space' || e.code === 'Enter') isScanning.current = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let frame;
    const updateScan = () => {
      setScanLevel((prev) => {
        let next = isScanning.current ? prev + 1.5 : prev - 2; 
        next = Math.max(0, Math.min(100, next));
        if (next >= 100) {
          isScanning.current = false; 
          onScan(); 
          return 0; 
        }
        return next;
      });
      frame = requestAnimationFrame(updateScan);
    };
    frame = requestAnimationFrame(updateScan);
    return () => cancelAnimationFrame(frame);
  }, [active, onScan]);

  useFrame((state) => {
      if (markerGroupRef.current && crystalRef.current && auraRef.current && active) {
          markerGroupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
          crystalRef.current.rotation.y += 0.02;
          crystalRef.current.rotation.x += 0.01;
          const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5;
          auraRef.current.scale.setScalar(1 + pulse * 0.5);
          auraRef.current.material.opacity = 0.1 + pulse * 0.4;
      }
  });

  if (!active) return null;

  return (
    <group position={position} ref={markerGroupRef}>
      <mesh ref={crystalRef}>
          <octahedronGeometry args={[0.25, 0]} />
          <meshBasicMaterial color="#00ffff" wireframe />
      </mesh>
      <mesh ref={auraRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>
      <Html center position={[0, 0.8, 0]} zIndexRange={[100, 0]}>
        <div className="pointer-events-none flex flex-col items-center justify-center w-64 bg-black/70 backdrop-blur-md p-3 rounded-lg border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <div className="text-cyan-400 font-mono text-xs tracking-widest mb-2 uppercase text-center">
            Anomaly Detected:<br/>{title}
          </div>
          <div className="w-full h-2 bg-black border border-cyan-500/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-75" style={{ width: `${scanLevel}%` }} />
          </div>
          <div className="flex flex-col items-center w-full mt-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <span>Hold [SPACE] to Analyze</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function EarthGlobe() {
  const globeGroupRef = useRef();
  const atmosphereRef = useRef();
  
  const [progress, setProgress] = useState(0);
  const [lockThreshold, setLockThreshold] = useState(0.00); 
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  const [isCinematicDone, setIsCinematicDone] = useState(false);
  const [anomalyRevealed, setAnomalyRevealed] = useState(false); // Controls when the marker actually pops in
  
  const [scanCounts, setScanCounts] = useState({ void: 0, hadean: 0, archean: 0, proterozoic: 0, mesozoic: 0 });
  
  const { camera } = useThree();
  const defaultCameraPos = new THREE.Vector3(0, 0, 15);
  const zoomCameraPos = new THREE.Vector3(2, 0, 8); 

  const [opacities, setOpacities] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const handleProgress = (e) => setProgress(e.detail.progress);
    const handleUnlockUpdate = (e) => setLockThreshold(e.detail.nextThreshold);
    const handleMcqStart = () => setIsQuizActive(true);
    const handleMcqEnd = () => setIsQuizActive(false);
    const handleCinematicEnded = () => setIsCinematicDone(true);
    const handleRevealAnomaly = () => setAnomalyRevealed(true);
    const handleEraChange = () => setAnomalyRevealed(false); // Hide the next era's anomaly until requested

    window.addEventListener('timeline-progress', handleProgress);
    window.addEventListener('unlock-timeline', handleUnlockUpdate);
    window.addEventListener('start-mcq', handleMcqStart);
    window.addEventListener('end-mcq', handleMcqEnd);
    window.addEventListener('cinematic-ended', handleCinematicEnded);
    window.addEventListener('reveal-anomaly', handleRevealAnomaly);
    window.addEventListener('era-change', handleEraChange);
    
    return () => {
      window.removeEventListener('timeline-progress', handleProgress);
      window.removeEventListener('unlock-timeline', handleUnlockUpdate);
      window.removeEventListener('start-mcq', handleMcqStart);
      window.removeEventListener('end-mcq', handleMcqEnd);
      window.removeEventListener('cinematic-ended', handleCinematicEnded);
      window.removeEventListener('reveal-anomaly', handleRevealAnomaly);
      window.removeEventListener('era-change', handleEraChange);
    };
  }, []);

  const triggerScanLesson = (narrationPrompt, eraKey) => {
    setIsLessonActive(true);
    setAnomalyRevealed(false); // Hide immediately for the next one
    
    window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
    window.dispatchEvent(new CustomEvent('trigger-narration', { detail: { prompt: narrationPrompt } }));

    setScanCounts(prev => {
        const nextCount = prev[eraKey] + 1;
        if (nextCount >= ANOMALY_DATA[eraKey].length) {
            const nextThreshold = getNextThreshold(eraKey);
            window.dispatchEvent(new CustomEvent('quiz-ready', { detail: { eraId: eraKey, nextThreshold } }));
        }
        return { ...prev, [eraKey]: nextCount };
    });

    setTimeout(() => {
      setIsLessonActive(false);
      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
    }, 15000); 
  };

  useFrame(() => {
    camera.position.lerp(isLessonActive ? zoomCameraPos : defaultCameraPos, 0.02);

    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = progress * Math.PI * 2; 
    }

    const newOpacities = [0, 0, 0, 0, 0]; 
    const blendWindow = 0.05; 

    for (let i = 1; i < ERAS.length; i++) {
      const prevThreshold = ERAS[i-1].threshold;
      if (progress <= prevThreshold) newOpacities[i-1] = 0;
      else if (progress >= prevThreshold + blendWindow) newOpacities[i-1] = 1;
      else newOpacities[i-1] = (progress - prevThreshold) / blendWindow;
    }
    setOpacities(newOpacities);

    if (atmosphereRef.current) {
      const colorVoid = new THREE.Color('#000000');
      const colorHadean = new THREE.Color('#ff2200'); 
      const colorPresent = new THREE.Color('#2288ff'); 
      
      if (progress < 0.2) {
          atmosphereRef.current.material.color.lerpColors(colorVoid, colorHadean, progress / 0.2);
          atmosphereRef.current.material.opacity = (progress / 0.2) * 0.25;
      } else {
          atmosphereRef.current.material.color.lerpColors(colorHadean, colorPresent, (progress - 0.2) / 0.8);
          atmosphereRef.current.material.opacity = 0.25 - ((progress - 0.2) * 0.1);
      }
    }
  });

  const activeEraKey = getLockedEraKey(lockThreshold);
  const isAtLock = (threshold) => Math.abs(progress - threshold) < 0.02 && lockThreshold === threshold && !isLessonActive && !isQuizActive;
  
  const renderActiveAnomaly = () => {
      // Must wait for UI to command the reveal of the marker
      if (!isCinematicDone || !activeEraKey || !isAtLock(lockThreshold) || !anomalyRevealed) return null;
      
      const eraAnomalies = ANOMALY_DATA[activeEraKey];
      const currentIndex = scanCounts[activeEraKey];
      
      if (currentIndex >= eraAnomalies.length) return null;
      const currentAnomaly = eraAnomalies[currentIndex];

      return (
        <AnomalyMarker
           key={currentAnomaly.id}
           position={currentAnomaly.position}
           active={true}
           title={currentAnomaly.title}
           onScan={() => triggerScanLesson(currentAnomaly.prompt, activeEraKey)}
        />
      );
  };

  const hadeanCooling = THREE.MathUtils.clamp((progress - 0.2) / 0.2, 0, 1);
  const tectonicDrift = THREE.MathUtils.clamp((progress - 0.8) / 0.2, 0, 1);

  return (
    <group>
      <group ref={globeGroupRef}>
        <VoidGlobe progress={progress} />
        <HadeanGlobe radius={5.000} opacity={opacities[0]} cooling={hadeanCooling} />
        <ArcheanGlobe radius={5.002} opacity={opacities[1]} />
        <ProterozoicGlobe radius={5.004} opacity={opacities[2]} />
        <MesozoicGlobe radius={5.006} opacity={opacities[3]} />
        <PresentGlobe radius={5.008} opacity={opacities[4]} drift={tectonicDrift} />
        
        {renderActiveAnomaly()}
      </group>

      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[5.2, 64, 64]} />
        <meshStandardMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} roughness={1} />
      </mesh>
    </group>
  );
}