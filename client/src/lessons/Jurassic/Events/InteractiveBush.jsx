import React, { useRef, useState, memo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

// FLOWER FIX: Recalculated positions to wrap perfectly around the taller, 
// spherical shape of the new stylized bush.
const flowerArrangement = [
    // Top Center: Moved higher up (y: 0.95) to prevent clipping inside the core
    { p: [0, 0.825, 0], r: [0, 0, 0], s: 0.35 },                
    // Front Right: Pulled inward (x/z) and moved up (y) so it doesn't float
    { p: [0.4, 0.6, 0.4], r: [0.6, 0.8, -0.4], s: 0.3 },  
    // Front Left: Pulled inward and moved up
    { p: [-0.45, 0.55, 0.35], r: [0.5, -0.8, 0.4], s: 0.3 },    
    // Back Side: Pulled inward and moved up
    { p: [0.25, 0.6, -0.65], r: [-0.5, 3, 0.6], s: 0.3 }    
];

const InteractiveBush = memo(({ x, y, z, scale, rotY }) => {
    // 1. Load the models
    const { nodes, materials } = useGLTF('/models/Bush.glb');
    const flowerGLTF = useGLTF('/models/FlowerPetal1.glb');
    
    // 2. Fix the material transparency & shadow casting
    useEffect(() => {
        if (materials.stylized_bush) {
            materials.stylized_bush.side = THREE.DoubleSide; 
            materials.stylized_bush.depthWrite = true; 
            materials.stylized_bush.alphaTest = 0.05; 
            materials.stylized_bush.needsUpdate = true;
        }

        if (flowerGLTF.scene) {
            flowerGLTF.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        }
    }, [materials, flowerGLTF.scene]);

    // 3. Animation Refs
    const flowerGroupRef = useRef();
    const visualGroupRef = useRef();
    const [blooming, setBlooming] = useState(false);
    const [fullyBloomed, setFullyBloomed] = useState(false);

    // 4. Handle blooming and wind animations
    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;

        // WIND ANIMATION: Sway and Rustle
        if (visualGroupRef.current) {
            // Using x and z as an offset ensures all bushes don't sway in perfect sync
            const windOffset = x + z; 
            
            // Gentle side-to-side sway
            visualGroupRef.current.rotation.x = Math.sin(t * 1.5 + windOffset) * 0.02;
            visualGroupRef.current.rotation.z = Math.cos(t * 1.2 + windOffset) * 0.02;
            
            // Tiny, rapid up/down movement to simulate leaves rustling
            visualGroupRef.current.position.y = Math.sin(t * 8 + windOffset) * 0.005;
        }

        // BLOOMING ANIMATION
        if (blooming && flowerGroupRef.current) {
            if (flowerGroupRef.current.scale.x < 1) {
                const newScale = Math.min(1, flowerGroupRef.current.scale.x + delta * 0.4); 
                flowerGroupRef.current.scale.set(newScale, newScale, newScale);
            } else if (!fullyBloomed) {
                setFullyBloomed(true);
                window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'angiosperm' } }));
            }
        }
    });

    const handlePointerOver = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: true } }));
    };

    const handlePointerOut = () => {
        window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: false } }));
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (!blooming) {
            setBlooming(true);
        } else if (fullyBloomed) {
            window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'angiosperm' } }));
        }
    };

    return (
        <RigidBody type="fixed" colliders={false} position={[x, y, z]} rotation={[0, rotY, 0]}>
            {/* Physical collision block so the player can't walk directly through the bush */}
            <CuboidCollider position={[0, scale * 0.5, 0]} args={[scale * 0.8, scale * 0.5, scale * 0.8]} />
            
            <group
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                position={[0, scale * 0.25, 0]} // Lift bush slightly from the ground
            >
                {/* 
                  INTERACTION FIX: 
                  A large transparent sphere that safely catches your mouse from any angle.
                  Using opacity 0 with depthWrite false ensures it is perfectly invisible.
                */}
                <mesh position={[0, scale * 0.4, 0]} castShadow={false} receiveShadow={false}>
                    <sphereGeometry args={[scale * 1.1, 12, 12]} />
                    <meshBasicMaterial transparent={true} opacity={0} depthWrite={false} />
                </mesh>

                {/* WIND ANIMATION WRAPPER: groups the bush and flowers so they sway together */}
                <group ref={visualGroupRef}>
                    {/* The New Stylized Bush */}
                    <group scale={scale * 0.01}>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.stylized_bush_stylized_bush_0.geometry}
                            material={materials.stylized_bush}
                            rotation={[-Math.PI / 2, 0, 0]}
                            scale={[100, 108.967, 100]}
                        />
                    </group>
                    
                    {/* Petals Group (Starts at scale 0, grows to 1) */}
                    <group ref={flowerGroupRef} scale={0}>
                        {flowerArrangement.map((flower, index) => (
                            <Clone 
                                key={index}
                                object={flowerGLTF.scene} 
                                position={[flower.p[0] * scale, flower.p[1] * scale, flower.p[2] * scale]}
                                rotation={flower.r}
                                scale={scale * flower.s} 
                            />
                        ))}
                    </group>
                </group>
            </group>
        </RigidBody>
    );
});

export default InteractiveBush;

// Make sure these match your actual public folder paths
useGLTF.preload('/models/Bush.glb');
useGLTF.preload('/models/FlowerPetal1.glb');