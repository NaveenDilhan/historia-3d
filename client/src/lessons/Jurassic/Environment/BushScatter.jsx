import React, { useMemo, memo } from 'react';
import InteractiveBush from '../Events/InteractiveBush';
import { getExactHeight, getDistToRexPath } from './Terrain';

const BushScatter = memo(function BushScatter({ count = 50, bounds, terrainGeo, obstacles = [] }) {
    const bushes = useMemo(() => {
        if (!terrainGeo) return [];
        
        const arr = [];
        let attempts = 0;
        

        const anchors = obstacles.filter(obs => obs.type === 'tree' || obs.type === 'rock');

        while (arr.length < count && attempts < count * 30) {
            attempts++;
            let x, z;


            if (anchors.length > 0 && Math.random() < 0.8) {
                const anchor = anchors[Math.floor(Math.random() * anchors.length)];
                const angle = Math.random() * Math.PI * 2;
                

                const distance = anchor.radius + 1.0 + Math.random() * 1.5;
                x = anchor.x + Math.cos(angle) * distance;
                z = anchor.z + Math.sin(angle) * distance;
            } else {
                x = bounds ? bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin) : (Math.random() - 0.5) * 350;
                z = bounds ? bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin) : (Math.random() - 0.5) * 350;
            }


            if (bounds) {
                if (x < bounds.xMin || x > bounds.xMax || z < bounds.zMin || z > bounds.zMax) continue;
            }

            if (getDistToRexPath(x, z) < 8) continue;
            
            const y = getExactHeight(x, z, terrainGeo);
            if (y > 14.0) continue; 

            const scale = 1.0 + Math.random() * 1.5;
            const bushRadius = scale * 0.8;


            let isClipping = false;
            for (let obs of obstacles) {
                if (Math.hypot(obs.x - x, obs.z - z) < (obs.radius + bushRadius)) {
                    isClipping = true;
                    break;
                }
            }
            if (isClipping) continue;


            const buriedY = y - (scale * 0.4);
            arr.push({ x, y: buriedY, z, scale, rotY: Math.random() * Math.PI * 2 });
            

            obstacles.push({ x, z, radius: bushRadius, type: 'bush' });
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