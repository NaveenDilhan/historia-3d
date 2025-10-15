import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export default function DinosaurModel({
  path = [
    [10, 0, -30],
    [0, 0, -50],
    [-10, 0, -30],
    [0, 0, 0],
  ],
  speed = 0.5,
  scale = 2.5,
  animate = true,
}) {
  const dinoRef = useRef();
  const { scene, animations } = useGLTF('/models/T-Rex.glb');
  const { actions, mixer } = useAnimations(animations, dinoRef);

  const progressRef = useRef(0);
  const currentStateRef = useRef('idle'); // Track active animation safely
  const idleTimerRef = useRef(0);

  const [loaded, setLoaded] = useState(false);

  const animRefs = useRef({ idle: null, walk: null, run: null });

  const pathVectors = path.map(([x, y, z]) => new THREE.Vector3(x, y, z));

  // Detect animation clips automatically
  useEffect(() => {
    if (!animations || animations.length === 0) return;

    animations.forEach((clip) => {
      const name = clip.name.toLowerCase();
      if (name.includes('idle')) animRefs.current.idle = actions[clip.name];
      if (name.includes('walk')) animRefs.current.walk = actions[clip.name];
      if (name.includes('run')) animRefs.current.run = actions[clip.name];
    });

    console.log('Detected animations:', {
      idle: animRefs.current.idle?.getClip().name,
      walk: animRefs.current.walk?.getClip().name,
      run: animRefs.current.run?.getClip().name,
    });

    // Start with idle
    const idle = animRefs.current.idle;
    if (idle) {
      idle.reset().fadeIn(0.3).play();
      currentStateRef.current = 'idle';
    }

    idleTimerRef.current = 2 + Math.random() * 3;
    setLoaded(true);
  }, [animations, actions]);

  // Switch animation once per transition
  const switchAnim = (next) => {
    const prev = currentStateRef.current;
    if (prev === next) return; // no change, do nothing

    const prevAction = animRefs.current[prev];
    const nextAction = animRefs.current[next];

    if (nextAction) {
      if (prevAction) prevAction.fadeOut(0.3);
      nextAction.reset().fadeIn(0.3).play();
      currentStateRef.current = next;
    }
  };

  // Idle logic with random behavior
  const handleIdleBehavior = (delta) => {
    idleTimerRef.current -= delta;
    if (idleTimerRef.current <= 0) {
      const current = currentStateRef.current;

      if (current === 'walk' && Math.random() < 0.1) {
        switchAnim('idle');
        idleTimerRef.current = 2 + Math.random() * 3;
      } else if (current === 'idle') {
        switchAnim('walk');
        idleTimerRef.current = 3 + Math.random() * 4;
      } else {
        idleTimerRef.current = 1 + Math.random() * 2;
      }
    }
  };

  useFrame((_, delta) => {
    if (!dinoRef.current || !animate || !loaded) return;

    handleIdleBehavior(delta);

    // Move only when walking or running
    const state = currentStateRef.current;
    if (state === 'walk' || state === 'run') {
      progressRef.current += delta * speed;
      const pathLength = pathVectors.length;
      const currentIndex = Math.floor(progressRef.current) % pathLength;
      const nextIndex = (currentIndex + 1) % pathLength;
      const t = progressRef.current % 1;

      const currentPos = pathVectors[currentIndex];
      const nextPos = pathVectors[nextIndex];
      dinoRef.current.position.lerpVectors(currentPos, nextPos, t);

      const lookAtVec = nextPos.clone();
      lookAtVec.y = dinoRef.current.position.y;
      dinoRef.current.lookAt(lookAtVec);
    }

    mixer.update(delta);
  });

  return (
    <primitive
      ref={dinoRef}
      object={scene.clone()}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}

useGLTF.preload('/models/T-Rex.glb');
