import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { getExactHeight } from './Terrain';

export default function ApatosaurusModel({ terrainGeo, hasStarted, x = 20, z = -200, scale = 5.0 }) {
  const groupRef = useRef();
  const dinoRef = useRef();
  
  const { scene, animations } = useGLTF('/models/Apatosaurus.glb');
  const { actions } = useAnimations(animations, dinoRef);
  
  const [yPos, setYPos] = useState(0);

  // Calculate the exact ground height so its feet plant perfectly
  useEffect(() => {
    if (terrainGeo) {
      setYPos(getExactHeight(x, z, terrainGeo));
    }
  }, [terrainGeo, x, z]);

  useEffect(() => {
    if (!animations || animations.length === 0) return;

    // Enable shadows on the model
    scene.traverse((child) => {
      if (child.isMesh) {
         child.castShadow = true;
         child.receiveShadow = true;
       }
    });

    // Fix: Dynamically find the idle animation just like the T-Rex formula
    if (hasStarted) {
      const idleClip = animations.find(clip => clip.name.toLowerCase().includes('idle'));
      
      if (idleClip && actions[idleClip.name]) {
        actions[idleClip.name].reset().fadeIn(0.8).play();
      }
    }
  }, [animations, actions, scene, hasStarted]);

  return (
    <group ref={groupRef} position={[x, yPos, z]} rotation={[0, -Math.PI / 4, 0]}>
      <primitive ref={dinoRef} object={scene} scale={scale} />
    </group>
  );
}

useGLTF.preload('/models/Apatosaurus.glb');