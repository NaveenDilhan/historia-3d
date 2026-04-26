import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// --- Configuration Constants ---
const PHASES = {
  VOID: 0,
  FORMATION: 1,
  HADEAN: 2,
  COOLING: 3,
  OCEANS: 4
};

const TEXT_CONTENT = {
  [PHASES.VOID]: {
    title: "Chapter 1 – The Beginning",
    text: "Welcome, traveler. Over 4.6 billion years ago, there was only silence and stardust. Watch as gravity weaves chaos into a world."
  },
  [PHASES.FORMATION]: {
    title: "Accretion",
    text: "Dust and primordial gas collide, fusing together in a violent dance. The newborn Earth is forming from the debris of dead stars."
  },
  [PHASES.HADEAN]: {
    title: "The Hadean Eon",
    text: "A hellscape of molten rock. Temperatures exceed 2,000°C. Comets bombard the surface, delivering the very water that will one day sustain us."
  },
  [PHASES.COOLING]: {
    title: "The Great Cooling",
    text: "The bombardment slows. The crust begins to harden. Steam rises from the cooling rocks, forming thick clouds that will rain for centuries."
  },
  [PHASES.OCEANS]: {
    title: "The Blue Planet",
    text: "The deluge has ended. The first global oceans have formed. Hidden within these waters, the first spark of life is about to ignite."
  }
};

const Scene1 = () => {
  const mountRef = useRef(null);
  
  // React State for UI
  const [phase, setPhase] = useState(PHASES.VOID);
  const [interactionReady, setInteractionReady] = useState(false);

  // Refs for Three.js objects (to manipulate them without re-renders)
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const earthRef = useRef(null);
  const oceanRef = useRef(null);
  const atmosRef = useRef(null);
  const animationRef = useRef(null);
  
  // We use a ref for phase inside the loop to avoid dependency staleness
  const phaseRef = useRef(PHASES.VOID);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    // Add simple fog for depth
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffaa00, 1.5, 100);
    sunLight.position.set(-15, 10, 5);
    scene.add(sunLight);
    
    // Rim light for dramatic effect
    const rimLight = new THREE.SpotLight(0x4455ff, 2);
    rimLight.position.set(10, 0, 5);
    rimLight.lookAt(0,0,0);
    scene.add(rimLight);

    // 3. Objects Construction
    
    // Starfield Background
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const posArray = new Float32Array(starCount * 3);
    for(let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.8 });
    const starMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starMesh);

    // Earth Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Earth Core
    const earthGeo = new THREE.IcosahedronGeometry(2, 4); // High poly for aesthetics
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0xff2200,      // Start red
      emissive: 0xaa0000,   // Glowing hot
      emissiveIntensity: 0.8,
      flatShading: true,
      shininess: 5
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);
    earthRef.current = earth;

    // Ocean Layer (Initially invisible)
    const oceanGeo = new THREE.IcosahedronGeometry(2.05, 4);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x1166aa,
      emissive: 0x002244,
      transparent: true,
      opacity: 0,
      shininess: 80
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    earthGroup.add(ocean);
    oceanRef.current = ocean;

    // Atmosphere Glow (Simple backside mesh)
    const atmosGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmos = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmos);
    atmosRef.current = atmos;

    // Particles: Dust/Debris
    const dustCount = 100;
    const dustGroup = new THREE.Group();
    const dustGeo = new THREE.TetrahedronGeometry(0.08, 0);
    const dustMat = new THREE.MeshLambertMaterial({ color: 0x885522 });
    
    const dustParticles = [];
    for (let i = 0; i < dustCount; i++) {
      const mesh = new THREE.Mesh(dustGeo, dustMat);
      const dist = 3.5 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2;
      
      mesh.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
      mesh.userData = { 
        angle, 
        dist, 
        speed: 0.005 + Math.random() * 0.01,
        wobble: Math.random() * 0.02
      };
      dustGroup.add(mesh);
      dustParticles.push(mesh);
    }
    scene.add(dustGroup);

    // Particles: Steam/Clouds
    const steamParticles = [];
    const steamGeo = new THREE.SphereGeometry(0.1, 4, 4);
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    for(let i=0; i<40; i++) {
        const p = new THREE.Mesh(steamGeo, steamMat);
        p.position.set((Math.random()-0.5)*3, (Math.random()-0.5)*3, (Math.random()-0.5)*3);
        p.userData = { speed: 0.01 + Math.random() * 0.02, initialY: p.position.y };
        earthGroup.add(p);
        steamParticles.push(p);
    }

    // 4. Animation Loop
    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;
      const currentPhase = phaseRef.current;

      // Global Rotation
      earthGroup.rotation.y += 0.05 * delta;
      starMesh.rotation.y -= 0.01 * delta;

      // Gentle Camera Drift
      camera.position.x = Math.sin(time * 0.1) * 0.5;
      camera.position.y = Math.cos(time * 0.1) * 0.5;
      camera.lookAt(0,0,0);

      // --- PHASE LOGIC ---

      // Phase 1: Dust Swirling (Formation)
      if (currentPhase === PHASES.FORMATION || currentPhase === PHASES.VOID) {
        dustGroup.visible = true;
        dustParticles.forEach(p => {
          p.userData.angle += p.userData.speed;
          // Spiral in logic
          if (currentPhase === PHASES.FORMATION) {
             p.userData.dist = THREE.MathUtils.lerp(p.userData.dist, 2, delta * 0.5);
             if(p.userData.dist < 2.2) p.visible = false; // "Absorbed"
          }
          p.position.x = Math.cos(p.userData.angle) * p.userData.dist;
          p.position.z = Math.sin(p.userData.angle) * p.userData.dist;
          p.rotation.x += p.userData.wobble;
        });
      } else {
        dustGroup.visible = false;
      }

      // Phase 2: Hadean (Magma Pulse)
      if (currentPhase >= PHASES.HADEAN) {
        // Pulse the emissive heat
        const pulse = 0.8 + Math.sin(time * 3) * 0.2;
        
        // If we are NOT in the cooling/ocean phase yet, keep it hot red
        if (currentPhase === PHASES.HADEAN) {
            earth.material.emissive.setHex(0xaa0000);
            earth.material.color.setHex(0xff2200);
            earth.material.emissiveIntensity = pulse;
        }
      }

      // Phase 3 & 4: Cooling and Oceans (Material Transition)
      if (currentPhase >= PHASES.COOLING) {
        // 1. Cool down the Earth color (Interpolate from Red to Brownish/Grey)
        const targetColor = new THREE.Color(currentPhase === PHASES.OCEANS ? 0x4b3621 : 0x553311); // Dark earth color
        const targetEmissive = new THREE.Color(0x000000); // No glow
        
        earth.material.color.lerp(targetColor, delta * 0.5);
        earth.material.emissive.lerp(targetEmissive, delta * 0.5);
        earth.material.emissiveIntensity = THREE.MathUtils.lerp(earth.material.emissiveIntensity, 0, delta);

        // 2. Handle Steam
        steamParticles.forEach(p => {
            p.material.opacity = THREE.MathUtils.lerp(p.material.opacity, currentPhase === PHASES.OCEANS ? 0 : 0.4, delta);
            p.position.y += p.userData.speed;
            if(p.position.length() > 3.5) {
                p.position.setLength(2.1); // Recycle
            }
        });
      }

      // Phase 4: Oceans rising
      if (currentPhase === PHASES.OCEANS) {
        // Raise opacity of water
        ocean.material.opacity = THREE.MathUtils.lerp(ocean.material.opacity, 0.85, delta * 0.5);
        // Show Atmosphere
        atmos.material.opacity = THREE.MathUtils.lerp(atmos.material.opacity, 0.3, delta * 0.5);
        // Spin clouds separately
        steamParticles.forEach(p => p.visible = false); // Hide steam, maybe enable clouds later
      }

      renderer.render(scene, camera);
    };

    animate();

    // 5. Cleanup
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose Resources
      renderer.dispose();
      earthGeo.dispose(); earthMat.dispose();
      oceanGeo.dispose(); oceanMat.dispose();
      dustGeo.dispose(); dustMat.dispose();
      atmosGeo.dispose(); atmosMat.dispose();
      starsGeometry.dispose(); starsMaterial.dispose();
    };
  }, []); // Run once on mount

  // --- Logic Timer ---
  useEffect(() => {
    // Automated sequencing
    const timings = [
      { p: PHASES.FORMATION, t: 1500 },
      { p: PHASES.HADEAN, t: 6000 },
      { p: PHASES.COOLING, t: 11000 },
    ];

    const timers = timings.map(step => 
      setTimeout(() => setPhase(step.p), step.t)
    );

    // Enable button interaction after cooling starts
    const interactTimer = setTimeout(() => {
        setInteractionReady(true);
    }, 12000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(interactTimer);
    };
  }, []);

  const handleCoolEarth = () => {
    setInteractionReady(false);
    setPhase(PHASES.OCEANS);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'black' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* UI Overlay - Glassmorphism Style */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        width: '90%',
        maxWidth: '600px',
        pointerEvents: 'none' // Let clicks pass through to 3D scene if needed
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.5s ease'
        }}>
           <h2 style={{ 
             margin: '0 0 15px 0', 
             color: '#ffaa00', 
             fontSize: '2rem',
             textShadow: '0 2px 10px rgba(255, 170, 0, 0.3)',
             fontFamily: "'Orbitron', sans-serif" // Assuming standard font, but nice fallback
           }}>
             {TEXT_CONTENT[phase].title}
           </h2>
           <p style={{ 
             color: '#e0e0e0', 
             fontSize: '1.1rem', 
             lineHeight: '1.6', 
             fontFamily: 'sans-serif' 
           }}>
             {TEXT_CONTENT[phase].text}
           </p>
        </div>
      </div>

      {/* Interactive Button */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'opacity 1s ease',
        opacity: interactionReady && phase === PHASES.COOLING ? 1 : 0,
        pointerEvents: interactionReady && phase === PHASES.COOLING ? 'auto' : 'none'
      }}>
        <button
          onClick={handleCoolEarth}
          style={{
            padding: '18px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 114, 255, 0.6)',
            transition: 'transform 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🌧️ Trigger Rain Age
        </button>
      </div>

      {/* Phase Indicator (Bottom Right) */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'monospace'
      }}>
        PHASE: {Object.keys(PHASES)[phase]}
      </div>
    </div>
  );
};

export default Scene1;