import React, { useRef, useState, memo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

// INCREASE THIS TO MAKE THE BUSH LARGER (1.5 = 50% larger)
const BUSH_SIZE_MULTIPLIER = 1.5;

// FLOWER ARRANGEMENT: Recalibrated to nestle perfectly into the leaves
// 'p' = Position (x, y, z) - Brought slightly inward to prevent floating
// 'r' = Rotation (x, y, z) - Softened angles for a natural resting look
// 's' = Scale (Petal size remains unchanged)
const flowerArrangement = [
    // Top Cluster
    { p: [0, 0.82, 0.05],       r: [0.1, 0, 0],          s: 0.35 },
    { p: [0.3, 0.75, -0.15],    r: [-0.3, 0.5, -0.3],    s: 0.3  },
    { p: [-0.3, 0.7, 0.15],     r: [0.3, -0.5, 0.3],     s: 0.3  },

    // Upper-Mid Ring
    { p: [0.45, 0.55, 0.35],    r: [0.6, 0.8, -0.3],     s: 0.32 },
    { p: [-0.45, 0.5, 0.4],     r: [0.6, -0.8, 0.3],     s: 0.3  },
    { p: [0.4, 0.55, -0.45],    r: [-0.6, 2.2, -0.3],    s: 0.32 },
    { p: [-0.4, 0.5, -0.45],    r: [-0.6, -2.2, 0.3],    s: 0.3  },

    // Lower Skirt
    { p: [0.25, 0.35, 0.6],     r: [0.8, 0.3, -0.1],     s: 0.28 },
    { p: [-0.25, 0.3, 0.6],     r: [0.8, -0.3, 0.1],     s: 0.28 }, 
    { p: [0.6, 0.35, -0.2],     r: [-0.2, 1.5, -0.8],    s: 0.28 },
    { p: [-0.6, 0.35, 0.15],    r: [0.2, -1.5, 0.8],     s: 0.28 },
    { p: [0, 0.4, -0.65],       r: [-0.8, 3.14, 0],      s: 0.28 }  
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
            {/* Physical collision block scales with the bush multiplier */}
            <CuboidCollider 
                position={[0, scale * 0.5 * BUSH_SIZE_MULTIPLIER, 0]} 
                args={[scale * 0.8 * BUSH_SIZE_MULTIPLIER, scale * 0.5 * BUSH_SIZE_MULTIPLIER, scale * 0.8 * BUSH_SIZE_MULTIPLIER]} 
            />
            
            <group
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                position={[0, scale * 0.25 * BUSH_SIZE_MULTIPLIER, 0]} // Lift bush slightly from the ground
            >
                {/* 
                  INTERACTION FIX: 
                  A large transparent sphere that safely catches your mouse from any angle.
                */}
                <mesh position={[0, scale * 0.4 * BUSH_SIZE_MULTIPLIER, 0]} castShadow={false} receiveShadow={false}>
                    <sphereGeometry args={[scale * 1.1 * BUSH_SIZE_MULTIPLIER, 12, 12]} />
                    <meshBasicMaterial transparent={true} opacity={0} depthWrite={false} />
                </mesh>

                {/* WIND ANIMATION WRAPPER: groups the bush and flowers so they sway together */}
                <group ref={visualGroupRef}>
                    {/* The New Stylized Bush - scaled by the multiplier */}
                    <group scale={scale * 0.01 * BUSH_SIZE_MULTIPLIER}>
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
                                // Multiply position so they stay on the outside of the larger bush
                                position={[
                                    flower.p[0] * scale * BUSH_SIZE_MULTIPLIER, 
                                    flower.p[1] * scale * BUSH_SIZE_MULTIPLIER, 
                                    flower.p[2] * scale * BUSH_SIZE_MULTIPLIER
                                ]}
                                rotation={flower.r}
                                // DO NOT multiply flower scale, so petals stay their original size
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