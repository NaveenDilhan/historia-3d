import React, { useRef, useState, memo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

const BUSH_SIZE_MULTIPLIER = 1.5;

const flowerArrangement = [
    { p: [0, 0.82, 0.05],       r: [0.1, 0, 0],          s: 0.35 },
    { p: [0.3, 0.75, -0.15],    r: [-0.3, 0.5, -0.3],    s: 0.3  },
    { p: [-0.3, 0.7, 0.15],     r: [0.3, -0.5, 0.3],     s: 0.3  },
    { p: [0.45, 0.55, 0.35],    r: [0.6, 0.8, -0.3],     s: 0.32 },
    { p: [-0.45, 0.5, 0.4],     r: [0.6, -0.8, 0.3],     s: 0.3  },
    { p: [0.4, 0.55, -0.45],    r: [-0.6, 2.2, -0.3],    s: 0.32 },
    { p: [-0.4, 0.5, -0.45],    r: [-0.6, -2.2, 0.3],    s: 0.3  },
    { p: [0.25, 0.35, 0.6],     r: [0.8, 0.3, -0.1],     s: 0.28 },
    { p: [-0.25, 0.3, 0.6],     r: [0.8, -0.3, 0.1],     s: 0.28 }, 
    { p: [0.6, 0.35, -0.2],     r: [-0.2, 1.5, -0.8],    s: 0.28 },
    { p: [-0.6, 0.35, 0.15],    r: [0.2, -1.5, 0.8],     s: 0.28 },
    { p: [0, 0.4, -0.65],       r: [-0.8, 3.14, 0],      s: 0.28 }
];


const _bushHitboxGeo = new THREE.SphereGeometry(1, 12, 12);
const _hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const InteractiveBush = memo(({ x, y, z, scale, rotY }) => {
    const { nodes, materials } = useGLTF('/models/jurrasic/Bush.glb');
    const flowerGLTF = useGLTF('/models/jurrasic/FlowerPetal1.glb');
    
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

    const flowerGroupRef = useRef();
    const visualGroupRef = useRef();
    const [blooming, setBlooming] = useState(false);
    const [fullyBloomed, setFullyBloomed] = useState(false);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        if (visualGroupRef.current) {
            const windOffset = x + z;
            visualGroupRef.current.rotation.x = Math.sin(t * 1.5 + windOffset) * 0.02;
            visualGroupRef.current.rotation.z = Math.cos(t * 1.2 + windOffset) * 0.02;
            visualGroupRef.current.position.y = Math.sin(t * 8 + windOffset) * 0.005;
        }

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

    const finalHitboxScale = scale * 1.1 * BUSH_SIZE_MULTIPLIER;

    return (
        <RigidBody type="fixed" colliders={false} position={[x, y, z]} rotation={[0, rotY, 0]}>
            <CuboidCollider 
                position={[0, scale * 0.5 * BUSH_SIZE_MULTIPLIER, 0]} 
                args={[scale * 0.8 * BUSH_SIZE_MULTIPLIER, scale * 0.5 * BUSH_SIZE_MULTIPLIER, scale * 0.8 * BUSH_SIZE_MULTIPLIER]} 
            />
            
            <group
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                position={[0, scale * 0.25 * BUSH_SIZE_MULTIPLIER, 0]}
            >
                <mesh 
                    position={[0, scale * 0.4 * BUSH_SIZE_MULTIPLIER, 0]} 
                    scale={[finalHitboxScale, finalHitboxScale, finalHitboxScale]}
                    geometry={_bushHitboxGeo}
                    material={_hitboxMat}
                    castShadow={false} 
                    receiveShadow={false} 
                />

                <group ref={visualGroupRef}>
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
                    
                    <group ref={flowerGroupRef} scale={0}>
                        {flowerArrangement.map((flower, index) => (
                            <Clone 
                                key={index}
                                object={flowerGLTF.scene} 
                                position={[
                                    flower.p[0] * scale * BUSH_SIZE_MULTIPLIER, 
                                    flower.p[1] * scale * BUSH_SIZE_MULTIPLIER, 
                                    flower.p[2] * scale * BUSH_SIZE_MULTIPLIER
                                ]}
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

useGLTF.preload('/models/jurrasic/Bush.glb');
useGLTF.preload('/models/jurrasic/FlowerPetal1.glb');