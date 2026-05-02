import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useAnimations, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

// Preload heavy audio files
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/footstep.ogg");
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/roar.mp3");

const _lookAtPos = new THREE.Vector3();
const _targetQuat = new THREE.Quaternion();
const _mat4 = new THREE.Matrix4();
const _up = new THREE.Vector3(0, 1, 0);

export default function DinosaurModel({ curve, speed = 0.02, scale = 3.0, animate = true, visible = true, terrainGeo }) {
  const groupRef = useRef();
  const dinoRef = useRef();
  const { scene, animations } = useGLTF('/models/T-Rex.glb');
  const { actions, mixer } = useAnimations(animations, dinoRef);
  
  const progressRef = useRef(0);
  const currentStateRef = useRef('idle');
  const idleTimerRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const animRefs = useRef({ idle: null, walk: null, run: null });
  const footstepAudioRef = useRef();
  const roarAudioRef = useRef();
  
  const lastStompTime = useRef(0);
  const nextRoarTime = useRef(0);
  const isAudioInit = useRef(false);

  useEffect(() => {
    if (!animations || animations.length === 0 || !curve) return;
    
    // Enable shadows
    scene.traverse((child) => {
      if (child.isMesh) { 
        child.castShadow = true; 
        child.receiveShadow = true; 
      }
    });
    
    // Map animations
    animations.forEach((clip) => {
      const name = clip.name.toLowerCase();
      if (name.includes('idle')) animRefs.current.idle = actions[clip.name];
      if (name.includes('walk')) animRefs.current.walk = actions[clip.name];
      if (name.includes('run')) animRefs.current.run = actions[clip.name];
    });

    if (animate) {
      const idle = animRefs.current.idle;
      if (idle) { 
        idle.reset().fadeIn(0.8).play(); 
        currentStateRef.current = 'idle'; 
      }
      idleTimerRef.current = 3 + Math.random() * 3;
    }
    setLoaded(true);
  }, [animations, actions, scene, curve, animate]);

  const switchAnim = (next) => {
    const prev = currentStateRef.current;
    if (prev === next) return;
    if (animRefs.current[next]) {
      if (animRefs.current[prev]) animRefs.current[prev].fadeOut(0.8);
      if (next === 'walk') animRefs.current[next].setEffectiveTimeScale(0.7);
      if (next === 'idle') animRefs.current[next].setEffectiveTimeScale(1.0);
      animRefs.current[next].reset().fadeIn(0.8).play();
      currentStateRef.current = next;
    }
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !dinoRef.current || !animate || !loaded || !curve) return;

    // Audio Initialization Loop
    if (!isAudioInit.current) {
      if (footstepAudioRef.current) {
        footstepAudioRef.current.setRefDistance(5);
        footstepAudioRef.current.setMaxDistance(40);
        footstepAudioRef.current.setRolloffFactor(2.5);
      }
      if (roarAudioRef.current) {
        roarAudioRef.current.setRefDistance(20);
        roarAudioRef.current.setMaxDistance(120);
        roarAudioRef.current.setRolloffFactor(1.5);
        roarAudioRef.current.setVolume(3.0);
        if (roarAudioRef.current.context.state === 'suspended') {
          roarAudioRef.current.context.resume();
        }
        roarAudioRef.current.play();
      }
      lastStompTime.current = state.clock.elapsedTime;
      nextRoarTime.current = state.clock.elapsedTime + 15 + Math.random() * 15;
      isAudioInit.current = true;
    }

    // Animation Logic
    idleTimerRef.current -= delta;
    if (idleTimerRef.current <= 0) {
      const current = currentStateRef.current;
      if (current === 'walk' && Math.random() < 0.35) {
        switchAnim('idle');
        idleTimerRef.current = 4 + Math.random() * 4;
      } else if (current === 'idle') {
        switchAnim('walk');
        idleTimerRef.current = 8 + Math.random() * 10;
      } else {
        idleTimerRef.current = 2;
      }
    }

    // Movement & Rotation Logic
    const animState = currentStateRef.current;
    if (animState === 'walk' || animState === 'run') {
      progressRef.current += delta * speed;
      const t = progressRef.current % 1;
      const position = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      
      const targetY = getExactHeight(position.x, position.z, terrainGeo);
      position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
      
      groupRef.current.position.copy(position);
      
      _lookAtPos.copy(position).sub(tangent);
      _lookAtPos.y = getExactHeight(_lookAtPos.x, _lookAtPos.z, terrainGeo);
      
      _mat4.lookAt(groupRef.current.position, _lookAtPos, _up);
      _targetQuat.setFromRotationMatrix(_mat4);
      groupRef.current.quaternion.slerp(_targetQuat, 0.08);

      // Footstep audio logic
      if (state.clock.elapsedTime - lastStompTime.current > 1.2) {
        if (footstepAudioRef.current && !footstepAudioRef.current.isPlaying) {
          footstepAudioRef.current.setVolume(2.0);
          footstepAudioRef.current.play();
        }
        lastStompTime.current = state.clock.elapsedTime;
      }
    }

    // Roar audio logic
    if (state.clock.elapsedTime > nextRoarTime.current) {
      if (roarAudioRef.current && !roarAudioRef.current.isPlaying) {
        roarAudioRef.current.setVolume(3.0);
        roarAudioRef.current.play();
      }
      nextRoarTime.current = state.clock.elapsedTime + 15 + Math.random() * 15;
    }

    mixer.update(delta);
  });

  return (
    <group ref={groupRef} visible={visible}>
      {/* The visual T-Rex mesh. */}
      <primitive 
        ref={dinoRef} 
        object={scene} 
        scale={scale} 
        dispose={null} 
      />

      {/* 
        THE HITBOX (UPDATED)
        We have drastically increased the vertical position and scale of this box 
        so it engulfs the entire T-Rex, not just the feet.
      */}
      <mesh
        // Positioned way up at the body core, not ground level.
        position={[0, 4.5 * scale, 0]} 
        
        // Scaled to be very tall and long to cover the entire model.
        scale={[scale * 10, scale * 10, scale * 10]} 
        
        onPointerOver={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: true } }));
        }}
        onPointerOut={(e) => {
          window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: false } }));
        }}
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'trex' } }));
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        {/* 
          CURRENTLY IN DEBUG MODE: Semi-transparent red.
          Change opacity={0.5} to opacity={0} and color="red" to something else (or remove) 
          when you are happy with the size and the interaction works.
        */}
        <meshBasicMaterial transparent opacity={0} color="red" depthWrite={false} />
      </mesh>

      <PositionalAudio ref={footstepAudioRef} url="/sounds/jurrasic/footstep.ogg" loop={false} autoplay={false} />
      <PositionalAudio ref={roarAudioRef} url="/sounds/jurrasic/roar.mp3" loop={false} autoplay={false} />
    </group>
  );
}

useGLTF.preload('/models/T-Rex.glb');