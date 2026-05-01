import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useAnimations, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

// Preload heavy audio files to prevent late Suspense fallbacks
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
    
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });
    
    animations.forEach((clip) => {
      const name = clip.name.toLowerCase();
      if (name.includes('idle')) animRefs.current.idle = actions[clip.name];
      if (name.includes('walk')) animRefs.current.walk = actions[clip.name];
      if (name.includes('run')) animRefs.current.run = actions[clip.name];
    });

    if (animate) {
      const idle = animRefs.current.idle;
      if (idle) { idle.reset().fadeIn(0.8).play(); currentStateRef.current = 'idle'; }
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

      if (state.clock.elapsedTime - lastStompTime.current > 1.2) {
        if (footstepAudioRef.current && !footstepAudioRef.current.isPlaying) {
          footstepAudioRef.current.setVolume(2.0);
          footstepAudioRef.current.play();
        }
        lastStompTime.current = state.clock.elapsedTime;
      }
    }

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
      <primitive 
        ref={dinoRef} 
        object={scene} 
        scale={scale} 
        dispose={null} 
        // NEW: Interactivity Dispatchers
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
      />
      <PositionalAudio ref={footstepAudioRef} url="/sounds/jurrasic/footstep.ogg" loop={false} autoplay={false} />
      <PositionalAudio ref={roarAudioRef} url="/sounds/jurrasic/roar.mp3" loop={false} autoplay={false} />
    </group>
  );
}

useGLTF.preload('/models/T-Rex.glb');