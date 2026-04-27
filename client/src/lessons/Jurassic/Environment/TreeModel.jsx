import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

// ADDED: treeScale prop with a default of 1 (but it will receive 4.5 from Terrain.jsx)
export default function TreeForest({ genericCount = 50, forestCount = 200, areaSize = 350, terrainGeo, treeScale = 1 }) {
  const genericModels = [useGLTF('/models/tree1.glb'), useGLTF('/models/tree2.glb'), useGLTF('/models/tree3.glb'), useGLTF('/models/tree4.glb'), useGLTF('/models/tree5.glb')];
  const pineModels = [useGLTF('/models/pine1.glb'), useGLTF('/models/pine2.glb'), useGLTF('/models/pine3.glb'), useGLTF('/models/pine4.glb')];
  const twistedModels = [useGLTF('/models/twisted1.glb'), useGLTF('/models/twisted2.glb'), useGLTF('/models/twisted3.glb'), useGLTF('/models/twisted4.glb'), useGLTF('/models/twisted5.glb')];
  const deadModels = [useGLTF('/models/dead1.glb'), useGLTF('/models/dead2.glb'), useGLTF('/models/dead3.glb'), useGLTF('/models/dead4.glb'), useGLTF('/models/dead5.glb')];

  const getHeight = (x, z) => {
    if (!terrainGeo) return 0;
    const size = 400; // Matches new terrain map size
    const segments = 256;
    let ix = Math.floor(((x + size / 2) / size) * segments);
    let iz = Math.floor(((z + size / 2) / size) * segments);
    
    // Clamp to prevent edge array boundary crashes
    ix = Math.max(0, Math.min(segments, ix));
    iz = Math.max(0, Math.min(segments, iz));
    return terrainGeo.attributes.position.getZ(ix + iz * (segments + 1)) || 0;
  };

  const genericTrees = useMemo(() => {
    return Array.from({ length: genericCount }, () => {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      // MULTIPLY base scale by treeScale prop
      const scale = (1.5 + Math.random() * 0.7) * treeScale; 
      return { x, y: getHeight(x, z), z, scale, windOffset: Math.random() * Math.PI * 2, modelIndex: Math.floor(Math.random() * genericModels.length) };
    });
  }, [genericCount, areaSize, terrainGeo, treeScale]); // Added treeScale to dependencies

  const forestTrees = useMemo(() => {
    return Array.from({ length: forestCount }, () => {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      const rnd = Math.random();
      let type = rnd < 0.5 ? 'pine' : rnd < 0.85 ? 'twisted' : 'dead';
      // MULTIPLY base scale by treeScale prop
      let scale = (type === 'pine' ? 1.5 + Math.random() * 0.8 : 0.8 + Math.random() * 0.7) * treeScale;
      let modelListLength = type === 'pine' ? pineModels.length : type === 'twisted' ? twistedModels.length : deadModels.length;
      return { x, y: getHeight(x, z), z, scale, windOffset: Math.random() * Math.PI * 2, modelIndex: Math.floor(Math.random() * modelListLength), type };
    });
  }, [forestCount, areaSize, terrainGeo, treeScale]); // Added treeScale to dependencies

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
        let modelList = t.type === 'pine' ? pineModels : t.type === 'twisted' ? twistedModels : t.type === 'dead' ? deadModels : genericModels;
        const model = modelList[t.modelIndex].scene.clone();

        // Collider scales automatically with t.scale
        const colliderHeight = t.scale * 5;
        // TIGHTENED trunk radius from 0.5 to 0.25 to prevent massive invisible walls around the huge trees
        const colliderRadius = t.scale * 0.25; 

        return (
          <RigidBody key={i} type="fixed" colliders={false} position={[t.x, t.y, t.z]}>
            {/* Offset the collider Y by half-height so it sits ON the ground, preventing player clipping */}
            <CuboidCollider position={[0, colliderHeight / 2, 0]} args={[colliderRadius, colliderHeight / 2, colliderRadius]} />
            <primitive ref={(el) => (treeRefs.current[i] = el)} object={model} scale={t.scale} rotation={[0, Math.random() * Math.PI * 2, 0]} />
          </RigidBody>
        );
      })}
    </>
  );
}