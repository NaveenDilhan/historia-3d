import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture, Html, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ERAS } from '../hooks/useTimeScroll';

// ==========================================
// CUSTOM SHADER: Procedural Tectonic Drift
// ==========================================
const DriftMaterial = shaderMaterial(
  {
    uTime: 0,
    uDrift: 0, // 0.0 = Pangea Supercontinent, 1.0 = Separated Continents
    uOpacity: 0,
    uSunDirection: new THREE.Vector3(15, 5, 5).normalize(),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vLocalPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vLocalPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uDrift;
    uniform float uOpacity;
    uniform vec3 uSunDirection;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vLocalPosition;
    varying vec3 vWorldPosition;

    // GLSL 3D Simplex Noise (Ashima Arts)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    // Fractal Brownian Motion for terrain detail
    float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
        v += a * snoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 pos = normalize(vLocalPosition); 
      
      // 1. TECTONIC DISPLACEMENT (The Continents Breaking)
      // We generate a low-frequency noise vector to act as tectonic plates
      vec3 tectonicOffset = vec3(
          snoise(pos * 1.5),
          snoise(pos * 1.5 + vec3(10.0)),
          snoise(pos * 1.5 + vec3(20.0))
      );
      // Displace the sample position based on how far timeline has progressed
      vec3 samplePos = normalize(pos + tectonicOffset * uDrift * 0.8);

      // 2. GENERATE TERRAIN
      float elevation = fbm(samplePos * 3.5) * 0.5 + 0.5; // Base land shapes

      // 3. PANGEA MASK (Forces land to clump together on one side of globe)
      float pangeaDist = distance(pos, vec3(0.0, 0.0, 1.0));
      float pangeaMask = smoothstep(1.5, 0.2, pangeaDist); 

      // As uDrift increases, we reduce the Pangea mask, letting continents spread globally
      float activeMask = mix(pangeaMask * 1.2 + 0.1, 1.0, uDrift);
      float finalLand = elevation * activeMask;

      // 4. BIOME COLORS
      float isLand = step(0.55, finalLand);
      vec3 waterColor = mix(vec3(0.01, 0.1, 0.3), vec3(0.0, 0.4, 0.7), smoothstep(0.4, 0.55, finalLand));
      vec3 landColor = mix(vec3(0.1, 0.4, 0.15), vec3(0.8, 0.7, 0.5), smoothstep(0.55, 0.75, finalLand));
      vec3 snowColor = mix(landColor, vec3(1.0), smoothstep(0.8, 1.0, finalLand));
      
      vec3 baseColor = mix(waterColor, snowColor, isLand);

      // 5. DYNAMIC CLOUDS
      float cloudNoise = fbm(pos * 4.0 + vec3(uTime * 0.02)) * 0.5 + 0.5;
      float isCloud = smoothstep(0.6, 0.8, cloudNoise);
      baseColor = mix(baseColor, vec3(1.0), isCloud * 0.9);

      // 6. CINEMATIC LIGHTING
      vec3 lightDir = normalize(uSunDirection);
      float diff = max(dot(vNormal, lightDir), 0.0);
      float ambient = 0.05;

      // Specular Highlight (Only on water, blocked by clouds)
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0) * (1.0 - isLand) * (1.0 - isCloud);

      vec3 litColor = baseColor * (diff + ambient) + spec * 0.6;

      // Atmospheric Rim Light (Fresnel)
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      litColor += vec3(0.2, 0.5, 1.0) * fresnel * 0.5;

      gl_FragColor = vec4(litColor, uOpacity);
    }
  `
);
extend({ DriftMaterial });

// ==========================================
// UI COMPONENTS
// ==========================================
function ScanningEvent({ active, title, onScan, onQuiz }) {
  const [scanLevel, setScanLevel] = useState(0);
  const isScanning = useRef(false);

  useEffect(() => {
    if (!active) { setScanLevel(0); return; }

    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        isScanning.current = true;
      }
      if (e.code === 'KeyE') {
        e.preventDefault();
        onQuiz();
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
  }, [active, onQuiz]);

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

  if (!active) return null;

  return (
    <Html position={[0, -3.5, 0]} center zIndexRange={[100, 0]}>
      <div className="pointer-events-none flex flex-col items-center justify-center animate-pulse mt-8 w-80">
        <div className="text-cyan-400 font-mono text-sm tracking-widest mb-2 uppercase drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
          Anomaly: {title}
        </div>
        <div className="w-full h-3 bg-black/80 border border-cyan-500/50 rounded-full overflow-hidden p-[1px] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-75 shadow-[0_0_10px_cyan]" 
            style={{ width: `${scanLevel}%` }}
          />
        </div>
        <div className="flex justify-between w-full mt-3 text-gray-400 text-xs font-bold uppercase tracking-widest px-2">
          <span>Hold [SPACE] to Analyze</span>
          <span className="text-emerald-400">Press [E] to Quiz</span>
        </div>
      </div>
    </Html>
  );
}

// ==========================================
// MAIN GLOBE COMPONENT
// ==========================================
export default function EarthGlobe() {
  const globeRef = useRef();
  const atmosphereRef = useRef();
  const hadeanMaterialRef = useRef();
  const driftShaderRef = useRef(); // Ref for our new procedural material
  
  const [progress, setProgress] = useState(0);
  const [lockThreshold, setLockThreshold] = useState(0.25); 
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  const { camera } = useThree();
  const defaultCameraPos = new THREE.Vector3(0, 0, 15);
  const zoomCameraPos = new THREE.Vector3(2, 0, 8); 

  // We ONLY load the first three textures now. 
  // Mesozoic and Present are handled entirely by the GPU Shader.
  const earlyTextures = useTexture([
    '/textures/earth/hadean.jpg',
    '/textures/earth/archean.jpg',
    '/textures/earth/proterozoic.jpg',
  ]);
  const materialsRef = useRef([]);

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

  useFrame((state) => {
    const targetPos = isLessonActive ? zoomCameraPos : defaultCameraPos;
    camera.position.lerp(targetPos, 0.02);

    if (globeRef.current) {
      globeRef.current.rotation.y = progress * Math.PI * 2; 
      
      // Update Early Textures (Hadean, Archean, Proterozoic)
      materialsRef.current.forEach((mat, index) => {
        if (!mat) return;
        const era = ERAS[index];
        const blendWindow = 0.08; 
        if (index === 0) {
          mat.opacity = 1; 
        } else {
          if (progress <= era.threshold - blendWindow) mat.opacity = 0;
          else if (progress >= era.threshold) mat.opacity = 1;
          else mat.opacity = (progress - (era.threshold - blendWindow)) / blendWindow;
        }
      });
      
      if (hadeanMaterialRef.current) {
        const emissiveIntensity = THREE.MathUtils.clamp(1.0 - (progress * 6.6), 0, 1.2);
        hadeanMaterialRef.current.emissiveIntensity = emissiveIntensity;
      }
    }

    // UPDATE TECTONIC SHADER
    if (driftShaderRef.current) {
      driftShaderRef.current.uTime = state.clock.elapsedTime;
      
      // Fade the procedural layer in smoothly as we leave the Proterozoic eon (0.50)
      if (progress < 0.50) {
        driftShaderRef.current.uOpacity = 0;
      } else if (progress < 0.75) {
        driftShaderRef.current.uOpacity = (progress - 0.50) / 0.25;
      } else {
        driftShaderRef.current.uOpacity = 1;
      }

      // Animate the tectonic drift tearing continents apart after Pangea (0.75)
      if (progress < 0.75) {
        driftShaderRef.current.uDrift = 0; // Solid Supercontinent
      } else {
        driftShaderRef.current.uDrift = (progress - 0.75) / 0.25; // Drifting to Present
      }
    }

    if (atmosphereRef.current) {
      const colorHadean = new THREE.Color('#ff4400'); 
      const colorPresent = new THREE.Color('#2288ff'); 
      atmosphereRef.current.material.color.lerpColors(colorHadean, colorPresent, progress);
      atmosphereRef.current.material.opacity = 0.15 + (progress * 0.15);
    }
  });

  const isAtLock = (threshold) => Math.abs(progress - threshold) < 0.02 && lockThreshold === threshold && !isLessonActive && !isQuizActive;

  return (
    <group>
      <group ref={globeRef}>
        {/* Layer 0-2: The Static Early Earth Textures */}
        {earlyTextures.map((texture, index) => (
          <mesh key={`earth-layer-${index}`} radius={5}>
            <sphereGeometry args={[5 + (index * 0.002), 64, 64]} />
            <meshStandardMaterial 
              ref={(el) => {
                materialsRef.current[index] = el;
                if (index === 0) hadeanMaterialRef.current = el;
              }}
              map={texture} 
              transparent={index !== 0}
              roughness={index === 0 ? 0.4 : 0.7}
              emissive={index === 0 ? new THREE.Color('#ff3300') : new THREE.Color('#000000')}
              emissiveMap={index === 0 ? texture : null} 
            />
          </mesh>
        ))}

        {/* Layer 3: The Beautiful Procedural Tectonic Shader */}
        <mesh>
          <sphereGeometry args={[5.008, 64, 64]} />
          <driftMaterial ref={driftShaderRef} transparent={true} />
        </mesh>
      </group>

      {/* Atmospheric Outer Glow */}
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

// Remove the Mesozoic and Present preloads
useTexture.preload([
  '/textures/earth/hadean.jpg',
  '/textures/earth/archean.jpg',
  '/textures/earth/proterozoic.jpg',
]);