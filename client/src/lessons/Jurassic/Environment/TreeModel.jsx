import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getExactHeight, getDistToRexPath } from './Terrain';

// Helper function to check if the new tree is too close to existing ones
const isPositionValid = (x, z, currentTrees, otherTrees, minDist) => {
  for (let t of currentTrees) {
    if (Math.hypot(t.x - x, t.z - z) < minDist) return false;
  }
  if (otherTrees) {
    for (let t of otherTrees) {
      if (Math.hypot(t.x - x, t.z - z) < minDist) return false;
    }
  }
  return true;
};

export default function TreeForest({ genericCount = 50, forestCount = 200, bounds, terrainGeo, treeScale = 1 }) {
  const genericModels = [useGLTF('/models/tree1.glb'), useGLTF('/models/tree2.glb'), useGLTF('/models/tree3.glb'), useGLTF('/models/tree4.glb'), useGLTF('/models/tree5.glb')];
  const pineModels = [useGLTF('/models/pine1.glb'), useGLTF('/models/pine2.glb'), useGLTF('/models/pine3.glb'), useGLTF('/models/pine4.glb')];
  const deadModels = [useGLTF('/models/dead1.glb'), useGLTF('/models/dead2.glb'), useGLTF('/models/dead3.glb'), useGLTF('/models/dead4.glb'), useGLTF('/models/dead5.glb')];

  const MIN_DIST = 10; // Minimum distance between any two trees
  const MAX_HEIGHT = 8.5; // Max terrain Y height to spawn trees (prevents mountain clipping)

  const genericTrees = useMemo(() => {
    const trees = [];
    let attempts = 0;
    while (trees.length < genericCount && attempts < genericCount * 10) {
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
      if (getDistToRexPath(x, z) < 14) continue;
      
      const y = getExactHeight(x, z, terrainGeo);
      if (y > MAX_HEIGHT) continue; // Skip steep mountain areas
      if (!isPositionValid(x, z, trees, null, MIN_DIST)) continue; // Spatial check

      const scale = (1.5 + Math.random() * 0.7) * treeScale; 
      trees.push({ x, y, z, scale, windOffset: Math.random() * Math.PI * 2, modelIndex: Math.floor(Math.random() * genericModels.length) });
    }
    return trees;
  }, [genericCount, bounds, terrainGeo, treeScale]);

  const forestTrees = useMemo(() => {
    const trees = [];
    let attempts = 0;
    while (trees.length < forestCount && attempts < forestCount * 10) {
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
      if (getDistToRexPath(x, z) < 14) continue;

      const y = getExactHeight(x, z, terrainGeo);
      if (y > MAX_HEIGHT) continue; // Skip steep mountain areas
      if (!isPositionValid(x, z, trees, genericTrees, MIN_DIST)) continue; // Check against both lists

      const rnd = Math.random();
      let type = rnd < 0.7 ? 'pine' : 'dead';
      let scale = (type === 'pine' ? 1.5 + Math.random() * 0.8 : 0.8 + Math.random() * 0.7) * treeScale;
      let modelListLength = type === 'pine' ? pineModels.length : deadModels.length;
      
      trees.push({ x, y, z, scale, windOffset: Math.random() * Math.PI * 2, modelIndex: Math.floor(Math.random() * modelListLength), type });
    }
    return trees;
  }, [forestCount, bounds, terrainGeo, treeScale, genericTrees]);

  const treeRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    treeRefs.current.forEach((tree, i) => {
      if (!tree) return;
      const treeData = i < genericTrees.length ? genericTrees[i] : forestTrees[i - genericTrees.length];
      if (treeData.type !== 'dead') {
        tree.rotation.z = Math.sin(t * 0.5 + treeData.windOffset) * 0.02;
        tree.rotation.x = Math.cos(t * 0.3 + treeData.windOffset) * 0.015;
      }
    });
  });

  return (
    <>
      {[...genericTrees, ...forestTrees].map((t, i) => {
        let modelList = t.type === 'pine' ? pineModels : t.type === 'dead' ? deadModels : genericModels;
        const model = modelList[t.modelIndex].scene.clone();

        const colliderHeight = t.scale * 5;
        const colliderRadius = t.scale * 0.5; 

        return (
          <RigidBody key={i} type="fixed" colliders={false} position={[t.x, t.y, t.z]}>
            <CuboidCollider position={[0, colliderHeight / 2, 0]} args={[colliderRadius, colliderHeight / 2, colliderRadius]} />
            <primitive ref={(el) => (treeRefs.current[i] = el)} object={model} scale={t.scale} rotation={[0, Math.random() * Math.PI * 2, 0]} />
          </RigidBody>
        );
      })}
    </>
  );
}