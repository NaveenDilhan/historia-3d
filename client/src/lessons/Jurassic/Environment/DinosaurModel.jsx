import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { getExactHeight } from './Terrain';

export default function DinosaurModel({
  curve,
  speed = 0.02, 
  scale = 3.0,  
  animate = true,
  terrainGeo
}) {
  const dinoRef = useRef();
  const { scene, animations } = useGLTF('/models/T-Rex.glb');
  const { actions, mixer } = useAnimations(animations, dinoRef);

  const progressRef = useRef(0);
  const currentStateRef = useRef('idle');
  const idleTimerRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const animRefs = useRef({ idle: null, walk: null, run: null });

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

    const idle = animRefs.current.idle;
    if (idle) { idle.reset().fadeIn(0.8).play(); currentStateRef.current = 'idle'; }
    idleTimerRef.current = 3 + Math.random() * 3; 
    setLoaded(true);
  }, [animations, actions, scene, curve]);

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

  useFrame((_, delta) => {
    if (!dinoRef.current || !animate || !loaded || !curve) return;

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

    const state = currentStateRef.current;
    if (state === 'walk' || state === 'run') {
      progressRef.current += delta * speed;
      const t = progressRef.current % 1; 

      const position = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      
      const targetY = getExactHeight(position.x, position.z, terrainGeo);
      position.y = THREE.MathUtils.lerp(dinoRef.current.position.y, targetY, 0.1); 
      dinoRef.current.position.copy(position);

      // FIX: The T-Rex model faces +Z natively. By subtracting the tangent, 
      // we point its back (-Z) away from the path, aiming the head (+Z) forward.
      const lookAtPos = position.clone().sub(tangent);
      lookAtPos.y = getExactHeight(lookAtPos.x, lookAtPos.z, terrainGeo); 
      
      const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(dinoRef.current.position, lookAtPos, new THREE.Vector3(0, 1, 0))
      );
      dinoRef.current.quaternion.slerp(targetQuaternion, 0.08);
    }
    mixer.update(delta);
  });

  return <primitive ref={dinoRef} object={scene} scale={scale} />;
}
useGLTF.preload('/models/T-Rex.glb');