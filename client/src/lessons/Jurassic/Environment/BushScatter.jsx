import React, { useMemo, memo } from 'react';
import InteractiveBush from '../Events/InteractiveBush';
import { getExactHeight, getDistToRexPath } from './Terrain';

const BushScatter = memo(function BushScatter({ count = 50, bounds, terrainGeo, obstacles = [] }) {
    const bushes = useMemo(() => {
        if (!terrainGeo) return [];
        
        const arr = [];
        let attempts = 0;
        
        // Increased attempts drastically to ensure all bushes spawn
        while (arr.length < count && attempts < count * 20) {
            attempts++;
            const x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
            const z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;

            // Keep them slightly away from the T-Rex path
            if (getDistToRexPath(x, z) < 8) continue;

            const y = getExactHeight(x, z, terrainGeo);
            
            // Allow bushes to spawn slightly higher up the hillsides
            if (y > 14.0) continue; 

            // RELAXED COLLISION: Allow bushes to grow close to trees/rocks. 
            // We only reject if they spawn exactly inside the dead-center trunk of a tree.
            let isClipping = false;
            for (let obs of obstacles) {
                if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius * 0.4)) {
                    isClipping = true;
                    break;
                }
            }
            if (isClipping) continue;

            const scale = 1.0 + Math.random() * 1.5;
            
            // VISUAL FIX: Sink the bush into the ground based on its scale
            const buriedY = y - (scale * 0.4); 

            arr.push({ x, y: buriedY, z, scale, rotY: Math.random() * Math.PI * 2 });

            // Only register a tiny obstacle footprint for the bush
            obstacles.push({ x, z, radius: scale * 0.5 });
        }
        return arr;
    }, [count, bounds, terrainGeo, obstacles]);

    return (
        <group>
            {bushes.map((bush, i) => (
                <InteractiveBush key={`bush-${i}`} {...bush} />
            ))}
        </group>
    );
});

export default BushScatter;