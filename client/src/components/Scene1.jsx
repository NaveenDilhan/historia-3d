import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const Scene1 = () => {
  const mountRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0: void, 1: formation, 2: hadean, 3: cooling, 4: oceans
  const [interactionReady, setInteractionReady] = useState(false);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffaa00, 1, 100);
    sunLight.position.set(-20, 10, -10);
    scene.add(sunLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(3, 8, 8);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(-20, 10, -10);
    scene.add(sun);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(2, 12, 12);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 0.5,
      flatShading: true
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Dust particles
    const dustParticles = [];
    const dustGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    const dustMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    
    for (let i = 0; i < 50; i++) {
      const particle = new THREE.Mesh(dustGeometry, dustMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 3;
      particle.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      );
      particle.userData = { angle, radius, speed: 0.001 + Math.random() * 0.002 };
      scene.add(particle);
      dustParticles.push(particle);
    }

    // Asteroids
    const asteroids = [];
    const asteroidGeometry = new THREE.DodecahedronGeometry(0.2, 0);
    const asteroidMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x666666,
      flatShading: true
    });

    for (let i = 0; i < 15; i++) {
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      asteroid.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      asteroid.userData = { 
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        visible: false
      };
      asteroid.visible = false;
      scene.add(asteroid);
      asteroids.push(asteroid);
    }

    // Steam/Cloud particles
    const steamParticles = [];
    const steamGeometry = new THREE.SphereGeometry(0.15, 6, 6);
    const steamMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < 30; i++) {
      const steam = new THREE.Mesh(steamGeometry, steamMaterial.clone());
      steam.position.set(
        (Math.random() - 0.5) * 5,
        2 + Math.random() * 2,
        (Math.random() - 0.5) * 5
      );
      steam.userData = { rising: true, speed: 0.02 + Math.random() * 0.02 };
      steam.visible = false;
      scene.add(steam);
      steamParticles.push(steam);
    }

    // Ocean layer
    const oceanGeometry = new THREE.SphereGeometry(2.05, 12, 12);
    const oceanMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1166aa,
      transparent: true,
      opacity: 0,
      flatShading: true
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    scene.add(ocean);

    camera.position.z = 8;

    // Animation loop
    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate earth
      earth.rotation.y += 0.005;
      ocean.rotation.y += 0.005;

      // Phase 0-1: Dust swirling
      if (phase <= 1) {
        dustParticles.forEach(particle => {
          particle.userData.angle += particle.userData.speed;
          particle.position.x = Math.cos(particle.userData.angle) * particle.userData.radius;
          particle.position.z = Math.sin(particle.userData.angle) * particle.userData.radius;
          
          if (phase === 1) {
            particle.userData.radius -= 0.02;
            if (particle.userData.radius < 2.5) {
              particle.visible = false;
            }
          }
        });
      }

      // Phase 2: Hadean bombardment
      if (phase === 2) {
        asteroids.forEach(asteroid => {
          if (asteroid.userData.visible) {
            asteroid.position.add(asteroid.userData.velocity);
            asteroid.rotation.x += 0.05;
            asteroid.rotation.y += 0.05;

            const distToEarth = asteroid.position.distanceTo(earth.position);
            if (distToEarth < 2.5) {
              asteroid.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
              );
              asteroid.userData.velocity.set(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
              ).normalize().multiplyScalar(0.1);
            }
          }
        });

        // Pulse earth emissive
        earthMaterial.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.2;
      }

      // Phase 3: Steam rising
      if (phase === 3) {
        steamParticles.forEach(steam => {
          if (steam.visible) {
            if (steam.userData.rising) {
              steam.position.y += steam.userData.speed;
              if (steam.position.y > 6) {
                steam.position.y = 2;
              }
            }
          }
        });
      }

      // Phase 4: Ocean forming
      if (phase === 4) {
        if (oceanMaterial.opacity < 0.8) {
          oceanMaterial.opacity += 0.01;
        }
        steamParticles.forEach(steam => {
          if (steam.visible && steam.userData.rising) {
            steam.position.y -= steam.userData.speed * 2;
            steam.material.opacity -= 0.01;
            if (steam.material.opacity <= 0) {
              steam.visible = false;
            }
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Phase progression
    const phaseTimings = [2000, 5000, 8000, 11000];
    const timers = [];

    timers.push(setTimeout(() => setPhase(1), phaseTimings[0]));
    timers.push(setTimeout(() => {
      setPhase(2);
      dustParticles.forEach(p => p.visible = false);
      asteroids.forEach(a => {
        a.visible = true;
        a.userData.visible = true;
      });
      earthMaterial.color.setHex(0xff2200);
      earthMaterial.emissive.setHex(0xff4400);
    }, phaseTimings[1]));
    
    timers.push(setTimeout(() => {
      setPhase(3);
      asteroids.forEach(a => a.visible = false);
      steamParticles.forEach(s => s.visible = true);
      earthMaterial.emissiveIntensity = 0.3;
      setInteractionReady(true);
    }, phaseTimings[2]));

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      timers.forEach(t => clearTimeout(t));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [phase]);

  const handleCoolEarth = () => {
    if (interactionReady && phase === 3) {
      setPhase(4);
      setInteractionReady(false);
      
      if (sceneRef.current) {
        const earth = sceneRef.current.children.find(c => c.geometry?.type === 'SphereGeometry' && c.material?.emissive);
        if (earth) {
          earth.material.color.setHex(0x4488ff);
          earth.material.emissive.setHex(0x002244);
          earth.material.emissiveIntensity = 0.1;
        }
      }
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Narration overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        maxWidth: '600px'
      }}>
        {phase === 0 && (
          <div>
            <h2 style={{ margin: '0 0 10px 0', color: '#ffaa00' }}>Chapter 1 – The Beginning</h2>
            <p>"Welcome, traveler… to the very beginning of our planet's story. Over 4.6 billion years ago, the Earth was born — not from peace, but from chaos."</p>
          </div>
        )}
        {phase === 1 && (
          <p>"Dust and gas swirling around the young Sun collided and fused, forming a newborn world of fire and fury."</p>
        )}
        {phase === 2 && (
          <div>
            <p>"In this era, called the Hadean, the surface was a molten wasteland, hammered by asteroids day and night."</p>
            <p style={{ marginTop: '10px' }}>"The air was thick with carbon dioxide, methane, and ammonia. No oxygen. No life. Yet… something was changing."</p>
          </div>
        )}
        {phase === 3 && (
          <p>"As the planet cooled, rain fell for centuries, forming the first oceans — the cradle of all future life."</p>
        )}
        {phase === 4 && (
          <div>
            <p style={{ color: '#4488ff' }}>"The first oceans have formed. Life's journey is about to begin..."</p>
          </div>
        )}
      </div>

      {/* Interactive button */}
      {interactionReady && (
        <button
          onClick={handleCoolEarth}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
          }}
        >
          🌧️ Tap to Cool the Earth
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Scene1;