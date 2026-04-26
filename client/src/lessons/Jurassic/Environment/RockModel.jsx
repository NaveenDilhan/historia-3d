import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function RockModel({ count = 100, areaSize = 200, terrainGeo }) {
  const rockModels = [
    useGLTF('/models/rock1.glb'),
    useGLTF('/models/rock2.glb'),
    useGLTF('/models/rock3.glb'),
  ];

    // Function to get terrain height at (x, z)
    const getHeight = (x, z) => {
        if (!terrainGeo) return 0;
        const size = areaSize; // terrain width/height
        const segments = terrainGeo.attributes.position.count ** 0.5 - 1;
        const ix = Math.floor(((x + size / 2) / size) * segments);
        const iz = Math.floor(((z + size / 2) / size) * segments);
        const idx = ix + iz * (segments + 1);
        return terrainGeo.attributes.position.getZ(idx) || 0;
    }
    const rocks = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * areaSize - areaSize / 2;
            const z = Math.random() * areaSize - areaSize / 2;
            const y = getHeight(x, z);
            const scale = 0.5 + Math.random() * 1.5;
            const rotationY = Math.random() * Math.PI * 2;
            const modelIndex = Math.floor(Math.random() * rockModels.length);
            data.push({ x, y, z, scale, rotationY, modelIndex });
        }
        return data;
    }, [count, areaSize, terrainGeo]);
    return (
        <>
            {rocks.map((r, i) => (
                <primitive
                    key={i}
                    object={rockModels[r.modelIndex].scene.clone()}
                    position={[r.x, r.y, r.z]}
                    scale={[r.scale, r.scale, r.scale]}
                    rotation={[0, r.rotationY, 0]}
                    castShadow
                    receiveShadow
                />
            ))}
        </>
    );
}   