import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export default function TreeForest({ genericCount = 50, forestCount = 200, areaSize = 200, terrainGeo }) {
  // Load tree models
  const genericModels = [
    useGLTF('/models/tree1.glb'),
    useGLTF('/models/tree2.glb'),
    useGLTF('/models/tree3.glb'),
    useGLTF('/models/tree4.glb'),
    useGLTF('/models/tree5.glb'),
  ];

  const pineModels = [
    useGLTF('/models/pine1.glb'),
    useGLTF('/models/pine2.glb'),
    useGLTF('/models/pine3.glb'),
    useGLTF('/models/pine4.glb'),
  ];

  const twistedModels = [
    useGLTF('/models/twisted1.glb'),
    useGLTF('/models/twisted2.glb'),
    useGLTF('/models/twisted3.glb'),
    useGLTF('/models/twisted4.glb'),
    useGLTF('/models/twisted5.glb'),
  ];

  const deadModels = [
    useGLTF('/models/dead1.glb'),
    useGLTF('/models/dead2.glb'),
    useGLTF('/models/dead3.glb'),
    useGLTF('/models/dead4.glb'),
    useGLTF('/models/dead5.glb'),
  ];

  // Terrain height lookup
  const getHeight = (x, z) => {
    if (!terrainGeo) return 0;
    const size = 200;
    const segments = 256;
    const ix = Math.floor(((x + size / 2) / size) * segments);
    const iz = Math.floor(((z + size / 2) / size) * segments);
    const idx = ix + iz * (segments + 1);
    return terrainGeo.attributes.position.getZ(idx) || 0;
  };

  // Generic trees
  const genericTrees = useMemo(() => {
    return Array.from({ length: genericCount }, () => {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      const y = getHeight(x, z);
      const scale = 1.5 + Math.random() * 0.7;
      const windOffset = Math.random() * Math.PI * 2;
      const modelIndex = Math.floor(Math.random() * genericModels.length);
      return { x, y, z, scale, windOffset, modelIndex };
    });
  }, [genericCount, areaSize, terrainGeo]);

  // Forest trees
  const forestTrees = useMemo(() => {
    return Array.from({ length: forestCount }, () => {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      const y = getHeight(x, z);

      const rnd = Math.random();
      let type, models;
      if (rnd < 0.5) {
        type = 'pine';
        models = pineModels;
      } else if (rnd < 0.85) {
        type = 'twisted';
        models = twistedModels;
      } else {
        type = 'dead';
        models = deadModels;
      }

      const modelIndex = Math.floor(Math.random() * models.length);
      let scale = 0.8 + Math.random() * 0.7;
      if (type === 'pine') scale = 1.5 + Math.random() * 0.8;
      const windOffset = Math.random() * Math.PI * 2;

      return { x, y, z, scale, windOffset, modelIndex, type };
    });
  }, [forestCount, areaSize, terrainGeo]);

  const treeRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    treeRefs.current.forEach((tree, i) => {
      if (!tree) return;
      const allTrees = [...genericTrees, ...forestTrees];
      const treeData = allTrees[i];
      if (treeData.type === 'dead') {
        tree.rotation.z = 0;
        tree.rotation.x = 0;
      } else {
        const sway = Math.sin(t * 0.5 + treeData.windOffset) * 0.02;
        const tilt = Math.cos(t * 0.3 + treeData.windOffset) * 0.015;
        tree.rotation.z = sway;
        tree.rotation.x = tilt;
      }
    });
  });

  return (
    <>
      {[...genericTrees, ...forestTrees].map((t, i) => {
        let modelList;
        if (t.type === 'pine') modelList = pineModels;
        else if (t.type === 'twisted') modelList = twistedModels;
        else if (t.type === 'dead') modelList = deadModels;
        else modelList = genericModels;

        const model = modelList[t.modelIndex].scene.clone();

        const colliderHeight = t.scale * 5;
        const colliderRadius = t.scale * 0.5;

        return (
          <RigidBody
            key={i}
            type="fixed"
            position={[t.x, t.y, t.z]}
          >
            <CuboidCollider args={[colliderRadius, colliderHeight / 2, colliderRadius]} />
            <primitive
              ref={(el) => (treeRefs.current[i] = el)}
              object={model}
              scale={t.scale}
              rotation={[0, Math.random() * Math.PI * 2, 0]}
            />
          </RigidBody>
        );
      })}
    </>
  );
}
