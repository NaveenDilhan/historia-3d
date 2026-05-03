// src/lessons/Jurassic/Events/MeteorEvent.jsx
import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export default function MeteorEvent({ hasStarted }) {
    const meteorRef = useRef();
    const { camera } = useThree();
    
    const [hasEnteredBiome, setHasEnteredBiome] = useState(false);
    const [isFalling, setIsFalling] = useState(false);

    useFrame((state, delta) => {
        if (!hasStarted) return;

        // 1. Detect biome entry (Z < -350 is roughly entering the volcano zone)
        if (!hasEnteredBiome && camera.position.z < -350) {
            setHasEnteredBiome(true);
            // Wait 4 seconds after entering before dropping the meteor
            setTimeout(() => setIsFalling(true), 4000);
        }

        // 2. Animate the falling meteor
        if (isFalling && meteorRef.current) {
            meteorRef.current.position.x -= delta * 120;
            meteorRef.current.position.y -= delta * 180;
            meteorRef.current.position.z -= delta * 80;

            // Hide/Reset after it falls out of view
            if (meteorRef.current.position.y < -100) {
                setIsFalling(false); 
            }
        }
    });

    if (!isFalling) return null;

    const handlePointerOver = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: true } }));
    };

    const handlePointerOut = () => {
        window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: false } }));
    };

    const handleClick = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'meteor' } }));
    };

    return (
        // Start high up in the sky, oriented towards the volcanic area
        <group ref={meteorRef} position={[200, 400, -200]}>
            {/* The Meteor Visual */}
            <mesh>
                <sphereGeometry args={[6, 16, 16]} />
                <meshBasicMaterial color="#ff4500" />
            </mesh>
            
            {/* The Meteor Tail */}
            <mesh position={[12, 18, 8]} rotation={[0, 0, -Math.PI / 4]}>
                 <coneGeometry args={[1, 6, 40, 8]} />
                 <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
            </mesh>

            {/* Massive Hitbox to make clicking it in the sky easier */}
            <mesh
                scale={[40, 40, 40]}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            >
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
        </group>
    );
}