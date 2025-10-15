import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function TreeForest({ 
  genericCount = 50, 
  forestCount = 200, 
  areaSize = 200, 
  terrainGeo 
}) {
  // Original generic trees (keep 5 models)
  const genericModels = [
    useGLTF('/models/tree1.glb'),
    useGLTF('/models/tree2.glb'),
    useGLTF('/models/tree3.glb'),
    useGLTF('/models/tree4.glb'),
    useGLTF('/models/tree5.glb'),
  ];

  // Forest trees
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

  // Function to get terrain height at (x, z)
  const getHeight = (x, z) => {
    if (!terrainGeo) return 0;
    const size = 200;
    const segments = 256;
    const ix = Math.floor(((x + size / 2) / size) * segments);
    const iz = Math.floor(((z + size / 2) / size) * segments);
    const idx = ix + iz * (segments + 1);
    return terrainGeo.attributes.position.getZ(idx) || 0;
  };

  // Generate generic trees
  const genericTrees = useMemo(() => {
    const data = [];
    for (let i = 0; i < genericCount; i++) {
      const x = Math.random() * areaSize - areaSize / 2;
      const z = Math.random() * areaSize - areaSize / 2;
      const y = getHeight(x, z);
      const scale = 1.5 + Math.random() * 0.7; // increased scale for bigger generic trees
      const windOffset = Math.random() * Math.PI * 2;
      const modelIndex = Math.floor(Math.random() * genericModels.length);
      data.push({ x, y, z, scale, windOffset, modelIndex });
    }
    return data;
  }, [genericCount, areaSize, terrainGeo]);

  // Generate forest trees
  const forestTrees = useMemo(() => {
    const data = [];
    for (let i = 0; i < forestCount; i++) {
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
      if (type === 'pine') scale = 1.5 + Math.random() * 0.8; // bigger pine trees

      const windOffset = Math.random() * Math.PI * 2;

      data.push({ x, y, z, scale, windOffset, modelIndex, type });
    }
    return data;
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

        return (
          <primitive
            key={i}
            ref={(el) => (treeRefs.current[i] = el)}
            object={modelList[t.modelIndex].scene.clone()}
            position={[t.x, t.y, t.z]}
            scale={t.scale}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
          />
        );
      })}
    </>
  );
}
