import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export default function DinosaurModel({
  path = [ [40, 0, -40], [10, 0, -80], [-30, 0, -60], [-50, 0, -10], [-20, 0, 20], [20, 0, 10] ],
  speed = 0.03, 
  scale = 3.0,  
  animate = true,
  terrainGeo // Passed from Scene -> DinosaurEncounter -> DinosaurModel
}) {
  const dinoRef = useRef();
  const { scene, animations } = useGLTF('/models/T-Rex.glb');
  const { actions, mixer } = useAnimations(animations, dinoRef);

  const progressRef = useRef(0);
  const currentStateRef = useRef('idle');
  const idleTimerRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const animRefs = useRef({ idle: null, walk: null, run: null });

  const curve = useMemo(() => {
    const vectors = path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.CatmullRomCurve3(vectors, true, 'centripetal', 0.8);
  }, [path]);

  // Height lookup for the dinosaur
  const getHeight = (x, z) => {
    if (!terrainGeo) return 0;
    const size = 400; 
    const segments = 256;
    let ix = Math.floor(((x + size / 2) / size) * segments);
    let iz = Math.floor(((z + size / 2) / size) * segments);
    ix = Math.max(0, Math.min(segments, ix));
    iz = Math.max(0, Math.min(segments, iz));
    return terrainGeo.attributes.position.getZ(ix + iz * (segments + 1)) || 0;
  };

  useEffect(() => {
    if (!animations || animations.length === 0) return;
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
    idleTimerRef.current = 2 + Math.random() * 4;
    setLoaded(true);
  }, [animations, actions, scene]);

  const switchAnim = (next) => {
    const prev = currentStateRef.current;
    if (prev === next) return; 
    if (animRefs.current[next]) {
      if (animRefs.current[prev]) animRefs.current[prev].fadeOut(0.8);
      if (next === 'walk') animRefs.current[next].setEffectiveTimeScale(0.85);
      animRefs.current[next].reset().fadeIn(0.8).play();
      currentStateRef.current = next;
    }
  };

  useFrame((_, delta) => {
    if (!dinoRef.current || !animate || !loaded) return;

    idleTimerRef.current -= delta;
    if (idleTimerRef.current <= 0) {
      const current = currentStateRef.current;
      if (current === 'walk' && Math.random() < 0.25) {
        switchAnim('idle'); idleTimerRef.current = 4 + Math.random() * 5; 
      } else if (current === 'idle') {
        switchAnim('walk'); idleTimerRef.current = 6 + Math.random() * 8; 
      } else {
        idleTimerRef.current = 2 + Math.random() * 2;
      }
    }

    const state = currentStateRef.current;
    if (state === 'walk' || state === 'run') {
      progressRef.current += delta * speed;
      const t = progressRef.current % 1; 

      const position = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      
      // Calculate smooth ground height
      const targetY = getHeight(position.x, position.z);
      // Smoothly Lerp to ground to avoid harsh vertical snapping
      position.y = THREE.MathUtils.lerp(dinoRef.current.position.y, targetY, 0.1); 

      dinoRef.current.position.copy(position);

      const lookAtPos = position.clone().add(tangent);
      lookAtPos.y = getHeight(lookAtPos.x, lookAtPos.z); 
      
      const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(dinoRef.current.position, lookAtPos, new THREE.Vector3(0, 1, 0))
      );
      dinoRef.current.quaternion.slerp(targetQuaternion, 0.05);
    }
    mixer.update(delta);
  });

  return <primitive ref={dinoRef} object={scene} scale={scale} />;
}
useGLTF.preload('/models/T-Rex.glb');