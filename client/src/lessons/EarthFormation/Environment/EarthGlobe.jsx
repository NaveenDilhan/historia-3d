import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ERAS } from '../hooks/useTimeScroll';

function ScanningEvent({ active, title, onComplete }) {
  const [scanLevel, setScanLevel] = useState(0);
  const isScanning = useRef(false);

  useEffect(() => {
    if (!active) {
      setScanLevel(0);
      return;
    }

    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        isScanning.current = true;
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        isScanning.current = false;
      }
    };

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
          onComplete();
          return 0; 
        }
        return next;
      });
      frame = requestAnimationFrame(updateScan);
    };
    frame = requestAnimationFrame(updateScan);
    return () => cancelAnimationFrame(frame);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <Html position={[0, -3.5, 0]} center zIndexRange={[100, 0]}>
      <div className="pointer-events-none flex flex-col items-center justify-center animate-pulse mt-8">
        <div className="text-cyan-400 font-mono text-sm tracking-widest mb-2 uppercase drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">Anomaly Detected: {title}</div>
        <div className="w-64 h-3 bg-black/80 border border-cyan-500/50 rounded-full overflow-hidden p-[1px] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-75 shadow-[0_0_10px_cyan]" 
            style={{ width: `${scanLevel}%` }}
          />
        </div>
        <div className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-widest">Hold [SPACE] to Analyze</div>
      </div>
    </Html>
  );
}

export default function EarthGlobe() {
  const globeRef = useRef();
  const atmosphereRef = useRef();
  const hadeanMaterialRef = useRef();
  
  const [progress, setProgress] = useState(0);
  const [lockThreshold, setLockThreshold] = useState(0.25); 
  const [isLessonActive, setIsLessonActive] = useState(false);
  
  const { camera } = useThree();
  const defaultCameraPos = new THREE.Vector3(0, 0, 15);
  const zoomCameraPos = new THREE.Vector3(2, 0, 8); // Slightly offset for a better cinematic angle

  const textures = useTexture([
    '/textures/earth/hadean.jpg',
    '/textures/earth/archean.jpg',
    '/textures/earth/proterozoic.jpg',
    '/textures/earth/pangea.jpg',
    '/textures/earth/present.jpg'
  ]);
  
  const materialsRef = useRef([]);

  useEffect(() => {
    const handleProgress = (e) => setProgress(e.detail.progress);
    const handleUnlockUpdate = (e) => setLockThreshold(e.detail.nextThreshold);

    window.addEventListener('timeline-progress', handleProgress);
    window.addEventListener('unlock-timeline', handleUnlockUpdate);
    return () => {
      window.removeEventListener('timeline-progress', handleProgress);
      window.removeEventListener('unlock-timeline', handleUnlockUpdate);
    };
  }, []);

  const triggerLesson = (nextEraThreshold, narrationPrompt) => {
    setIsLessonActive(true);
    window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: true } }));
    window.dispatchEvent(new CustomEvent('trigger-narration', { detail: { prompt: narrationPrompt } }));

    setTimeout(() => {
      setIsLessonActive(false);
      window.dispatchEvent(new CustomEvent('freeze-timeline', { detail: { frozen: false } }));
      window.dispatchEvent(new CustomEvent('unlock-timeline', { detail: { nextThreshold: nextEraThreshold } }));
    }, 20000); 
  };

  useFrame(() => {
    // Cinematic camera lerp
    const targetPos = isLessonActive ? zoomCameraPos : defaultCameraPos;
    camera.position.lerp(targetPos, 0.02);

    if (globeRef.current) {
      globeRef.current.rotation.y = progress * Math.PI * 2; 
      
      // FIXED: Overlap blending logic to prevent transparency bugs
      materialsRef.current.forEach((mat, index) => {
        if (!mat) return;
        const era = ERAS[index];
        const blendWindow = 0.08; // 8% window where the next layer fades in
        
        if (index === 0) {
          mat.opacity = 1; // The core Hadean layer is ALWAYS solid, preventing ghosting
        } else {
          // Fade IN the outer layers over the inner layers
          if (progress <= era.threshold - blendWindow) {
            mat.opacity = 0;
          } else if (progress >= era.threshold) {
            mat.opacity = 1;
          } else {
            mat.opacity = (progress - (era.threshold - blendWindow)) / blendWindow;
          }
        }
      });
      
      // Dynamic Lava Cooling Effect
      if (hadeanMaterialRef.current) {
        // Hadean magma glows brightly at progress 0, cools down entirely by 0.15
        const emissiveIntensity = THREE.MathUtils.clamp(1.0 - (progress * 6.6), 0, 1.2);
        hadeanMaterialRef.current.emissiveIntensity = emissiveIntensity;
      }
    }

    if (atmosphereRef.current) {
      // Atmosphere color transitions from toxic orange to breathable blue
      const colorHadean = new THREE.Color('#ff4400'); 
      const colorPresent = new THREE.Color('#2288ff'); 
      atmosphereRef.current.material.color.lerpColors(colorHadean, colorPresent, progress);
      
      // Atmosphere thickens as the planet cools
      atmosphereRef.current.material.opacity = 0.15 + (progress * 0.15);
    }
  });

  const isAtLock = (threshold) => Math.abs(progress - threshold) < 0.02 && lockThreshold === threshold && !isLessonActive;

  return (
    <group>
      <group ref={globeRef}>
        {textures.map((texture, index) => (
          <mesh key={`earth-layer-${index}`} radius={5}>
            {/* Increasing radii strictly ensures outer layers cover inner ones */}
            <sphereGeometry args={[5 + (index * 0.002), 64, 64]} />
            <meshStandardMaterial 
              ref={(el) => {
                materialsRef.current[index] = el;
                if (index === 0) hadeanMaterialRef.current = el;
              }}
              map={texture} 
              transparent={index !== 0} // Base layer is solid, others are transparent
              roughness={index === 0 ? 0.4 : 0.7} // Water reflects more light later
              emissive={index === 0 ? new THREE.Color('#ff3300') : new THREE.Color('#000000')}
              emissiveMap={index === 0 ? texture : null} // Uses texture for glowing lava cracks
            />
          </mesh>
        ))}
      </group>

      {/* Atmospheric Halo */}
      <mesh scale={1.03} ref={atmosphereRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial 
          transparent 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          roughness={1}
        />
      </mesh>

      <ScanningEvent
         active={isAtLock(0.25)}
         title="Geothermal Activity & Early Life"
         onComplete={() => triggerLesson(0.5, "The user has scanned the Archean eon. Provide a detailed historical lesson about the first cyanobacteria. Ensure that you deactivate any ambient random fact giving after this geothermal event modal closes. Speak directly to the user as a historical observer; do not use the phrase 'young traveler'.")}
      />

      <ScanningEvent
         active={isAtLock(0.50)}
         title="Atmospheric Shift"
         onComplete={() => triggerLesson(0.75, "The user has scanned the Proterozoic eon. Deliver a lesson on the Great Oxidation Event. Speak directly to the user; do not use the phrase 'young traveler'. Focus on the historical and geological shift.")}
      />

      <ScanningEvent
         active={isAtLock(0.75)}
         title="Tectonic Fracture"
         onComplete={() => triggerLesson(1.0, "The user has scanned the Mesozoic era. Deliver a lesson on the supercontinent of Pangea breaking apart. Speak directly to the user; do not use the phrase 'young traveler'.")}
      />
    </group>
  );
}

useTexture.preload([
  '/textures/earth/hadean.jpg',
  '/textures/earth/archean.jpg',
  '/textures/earth/proterozoic.jpg',
  '/textures/earth/pangea.jpg',
  '/textures/earth/present.jpg'
]);