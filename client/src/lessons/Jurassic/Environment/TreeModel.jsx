import React, { useMemo, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getExactHeight, getDistToRexPath } from './Terrain';

const isPositionValid = (x, z, obstacles, minDist) => {
  for (let obs of obstacles) {
    if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius + minDist)) return false;
  }
  return true;
};

const TreeForest = memo(function TreeForest({ genericCount = 50, forestCount = 200, bounds, terrainGeo, treeScale = 1, obstacles = [] }) {
  const genericModels = [useGLTF('/models/jurrasic/tree1.glb'), useGLTF('/models/jurrasic/tree2.glb'), useGLTF('/models/jurrasic/tree3.glb'), useGLTF('/models/jurrasic/tree4.glb'), useGLTF('/models/jurrasic/tree5.glb')];
  const pineModels = [useGLTF('/models/jurrasic/pine1.glb'), useGLTF('/models/jurrasic/pine2.glb'), useGLTF('/models/jurrasic/pine3.glb'), useGLTF('/models/jurrasic/pine4.glb')];
  const deadModels = [useGLTF('/models/jurrasic/dead1.glb'), useGLTF('/models/jurrasic/dead2.glb'), useGLTF('/models/jurrasic/dead3.glb'), useGLTF('/models/jurrasic/dead4.glb'), useGLTF('/models/jurrasic/dead5.glb')];

  const MAX_HEIGHT = 8.5;

  const genericTrees = useMemo(() => {
    const trees = [];
    let attempts = 0;
    while (trees.length < genericCount && attempts < genericCount * 10) {
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
      if (getDistToRexPath(x, z) < 14) continue;
      
      const y = getExactHeight(x, z, terrainGeo);
      if (y > MAX_HEIGHT) continue;
      
      const slopeX = Math.abs(y - getExactHeight(x + 2, z, terrainGeo));
      const slopeZ = Math.abs(y - getExactHeight(x, z + 2, terrainGeo));
      if (slopeX > 1.2 || slopeZ > 1.2) continue;

      if (!isPositionValid(x, z, obstacles, 2.5)) continue;
      
      const scale = (1.5 + Math.random() * 0.7) * treeScale;
      trees.push({ x, y, z, scale, rotY: Math.random() * Math.PI * 2, windOffset: Math.random() * Math.PI * 2, modelIndex: Math.floor(Math.random() * genericModels.length) });
      
      // Increased safety radius to prevent rock/bush clipping
      obstacles.push({ x, z, radius: scale * 1.8, type: 'tree' });
    }
    return trees;
  }, [genericCount, bounds, terrainGeo, treeScale, obstacles]);

  const forestTrees = useMemo(() => {
    const trees = [];
    let attempts = 0;
    while (trees.length < forestCount && attempts < forestCount * 10) {
      const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
      const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
      attempts++;
      
      if (getDistToRexPath(x, z) < 14) continue;
      
      const y = getExactHeight(x, z, terrainGeo);
      if (y > MAX_HEIGHT) continue;
      
      const slopeX = Math.abs(y - getExactHeight(x + 2, z, terrainGeo));
      const slopeZ = Math.abs(y - getExactHeight(x, z + 2, terrainGeo));
      if (slopeX > 1.2 || slopeZ > 1.2) continue;

      if (!isPositionValid(x, z, obstacles, 2.5)) continue;
      
      const rnd = Math.random();
      let type = rnd < 0.7 ? 'pine' : 'dead';
      let scale = (type === 'pine' ? 1.5 + Math.random() * 0.8 : 0.8 + Math.random() * 0.7) * treeScale;
      let modelListLength = type === 'pine' ? pineModels.length : deadModels.length;
      
      trees.push({ x, y, z, scale, rotY: Math.random() * Math.PI * 2, windOffset: Math.random() * Math.PI * 2, modelIndex: Math.floor(Math.random() * modelListLength), type });
      
      obstacles.push({ x, z, radius: scale * 1.8, type: 'tree' });
    }
    return trees;
  }, [forestCount, bounds, terrainGeo, treeScale, obstacles]);

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
        const modelScene = modelList[t.modelIndex].scene;
        const colliderHeight = t.scale * 5;
        const colliderRadius = t.scale * 0.5;
        
        return (
          <RigidBody key={i} type="fixed" colliders={false} position={[t.x, t.y, t.z]}>
            <CuboidCollider position={[0, colliderHeight / 2, 0]} args={[colliderRadius, colliderHeight / 2, colliderRadius]} />
            <Clone ref={(el) => (treeRefs.current[i] = el)} object={modelScene} scale={t.scale} rotation={[0, t.rotY, 0]} dispose={null} />
          </RigidBody>
        );
      })}
    </>
  );
});

export default TreeForest;

useGLTF.preload('/models/jurrasic/tree1.glb');
useGLTF.preload('/models/jurrasic/tree2.glb');
useGLTF.preload('/models/jurrasic/tree3.glb');
useGLTF.preload('/models/jurrasic/tree4.glb');
useGLTF.preload('/models/jurrasic/tree5.glb');
useGLTF.preload('/models/jurrasic/pine1.glb');
useGLTF.preload('/models/jurrasic/pine2.glb');
useGLTF.preload('/models/jurrasic/pine3.glb');
useGLTF.preload('/models/jurrasic/pine4.glb');
useGLTF.preload('/models/jurrasic/dead1.glb');
useGLTF.preload('/models/jurrasic/dead2.glb');
useGLTF.preload('/models/jurrasic/dead3.glb');
useGLTF.preload('/models/jurrasic/dead4.glb');
useGLTF.preload('/models/jurrasic/dead5.glb');