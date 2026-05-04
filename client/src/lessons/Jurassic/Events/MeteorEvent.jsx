import React, { useRef, useState, useMemo } from 'react';
import { useFrame, extend, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial, PositionalAudio } from '@react-three/drei';

// Custom Procedural Shader for the fading, glowing Meteor Tail
const MeteorTrailMaterial = shaderMaterial(
    { uColor: new THREE.Color('#ff4500'), uGlow: new THREE.Color('#ffffff') },
    `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    `
    uniform vec3 uColor;
    uniform vec3 uGlow;
    varying vec2 vUv;
    void main() {
        float intensity = pow(vUv.y, 3.0); 
        vec3 col = mix(uColor, uGlow, intensity);
        float alpha = smoothstep(0.0, 0.2, vUv.y) * (vUv.y);
        gl_FragColor = vec4(col, alpha * 0.9);
    }
    `
);
extend({ MeteorTrailMaterial });

// HOISTED GEOMETRIES & MATERIALS: Eliminates 150 shader compilations
const _meteorCoreGeo = new THREE.SphereGeometry(2, 12, 12);
const _meteorCoreMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
const _meteorGlowGeo = new THREE.SphereGeometry(4, 12, 12);
const _meteorGlowMat = new THREE.MeshBasicMaterial({ color: "#ff5500", transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
const _meteorTailGeo = new THREE.CylinderGeometry(2, 0.1, 60, 12, 1, true);
const _meteorTailMat = new MeteorTrailMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
const _hitboxGeo = new THREE.SphereGeometry(1, 8, 8);
const _hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });


// Individual Meteor Component
const Meteor = ({ startPos, targetPos, delay, speed, scale, isHero, hasAudio }) => {
    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const progress = useRef(0);

    // Audio Refs & State
    const meteorSoundRef = useRef();
    const explosionSoundRef = useRef();
    const hasStartedSound = useRef(false);
    const hasExploded = useRef(false);

    useFrame((state, delta) => {
        if (delay === Infinity) return; // Optimization: Stay dormant until activated

        if (state.clock.elapsedTime > delay && progress.current < 1) {
            if (!visible) setVisible(true);
            
            // 1. Play the falling whoosh sound
            if (hasAudio && !hasStartedSound.current && meteorSoundRef.current && meteorSoundRef.current.buffer) {
                meteorSoundRef.current.setVolume(isHero ? 2.5 : 0.15);
                meteorSoundRef.current.setRefDistance(isHero ? 300 : 50);
                meteorSoundRef.current.play();
                hasStartedSound.current = true;
            }

            // Calculate movement step based on constant speed
            progress.current += (delta * speed) / startPos.distanceTo(targetPos);
            
            if (progress.current >= 1) {
                if (visible) setVisible(false); // Hide the visual meshes
                
                // 2. Play the impact explosion sound
                if (hasAudio && !hasExploded.current && explosionSoundRef.current && explosionSoundRef.current.buffer) {
                    if (meteorSoundRef.current?.isPlaying) meteorSoundRef.current.stop();
                    explosionSoundRef.current.setVolume(isHero ? 4.0 : 0.3);
                    explosionSoundRef.current.setRefDistance(isHero ? 400 : 80);
                    explosionSoundRef.current.play();
                    hasExploded.current = true;
                }
            } else {
                ref.current.position.lerpVectors(startPos, targetPos, progress.current);
                ref.current.lookAt(targetPos);
            }
        }
    });

    const handlePointerOver = (e) => {
        if(!isHero) return;
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: true } }));
    };

    const handlePointerOut = () => {
        if(!isHero) return;
        window.dispatchEvent(new CustomEvent('dino-hover', { detail: { isHovering: false } }));
    };

    const handleClick = (e) => {
        if(!isHero) return;
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'meteor' } }));
    };

    return (
        <group ref={ref} scale={scale}>
            <group visible={visible}>
                <mesh geometry={_meteorCoreGeo} material={_meteorCoreMat} />
                <mesh geometry={_meteorGlowGeo} material={_meteorGlowMat} />
                <mesh position={[0, 0, -30]} rotation={[-Math.PI / 2, 0, 0]} geometry={_meteorTailGeo} material={_meteorTailMat} />
                
                {isHero && (
                    <mesh
                        scale={[20, 20, 20]}
                        geometry={_hitboxGeo}
                        material={_hitboxMat}
                        onPointerOver={handlePointerOver}
                        onPointerOut={handlePointerOut}
                        onClick={handleClick}
                    />
                )}
            </group>
            
            {hasAudio && (
                <>
                    <PositionalAudio ref={meteorSoundRef} url="/sounds/jurrasic/meteor.mp3" loop autoplay={false} />
                    <PositionalAudio ref={explosionSoundRef} url="/sounds/jurrasic/explosion.mp3" loop={false} autoplay={false} />
                </>
            )}
        </group>
    );
};

export default function MeteorEvent({ active }) {
    const [startTime, setStartTime] = useState(0);
    const hasEmittedRef = useRef(false);

    useFrame((state) => {
        if (active && startTime === 0) {
            setStartTime(state.clock.elapsedTime);
        }
        
        if (startTime > 0 && !hasEmittedRef.current) {
            if (state.clock.elapsedTime > startTime + 30) {
                hasEmittedRef.current = true;
                window.dispatchEvent(new CustomEvent('meteor-shower-complete'));
            }
        }
    });

    const meteors = useMemo(() => {
        const arr = [];
        
        for(let i = 0; i < 150; i++) {
            const startX = (Math.random() - 0.5) * 3000;
            const startY = 800 + Math.random() * 600;
            const startZ = -1000 - Math.random() * 1500;
            const endX = startX + (Math.random() - 0.5) * 1000;
            const endY = -200; 
            const endZ = startZ + 1500 + Math.random() * 800; 

            arr.push({
                id: i,
                startPos: new THREE.Vector3(startX, startY, startZ),
                targetPos: new THREE.Vector3(endX, endY, endZ),
                delay: Math.random() * 25, 
                speed: 300 + Math.random() * 200,
                scale: 0.3 + Math.random() * 1.5,
                isHero: false,
                hasAudio: i % 7 === 0 
            });
        }
        
        arr.push({
            id: 'hero',
            startPos: new THREE.Vector3(0, 1200, -1800),
            targetPos: new THREE.Vector3(0, -100, -200),
            delay: 2.0, 
            speed: 250, 
            scale: 5,
            isHero: true,
            hasAudio: true
        });
        
        return arr;
    }, []);

    return (
        <group>
            {meteors.map((m) => (
                <Meteor
                    key={m.id}
                    startPos={m.startPos}
                    targetPos={m.targetPos}
                    delay={startTime > 0 ? startTime + m.delay : Infinity}
                    speed={m.speed}
                    scale={m.scale}
                    isHero={m.isHero}
                    hasAudio={m.hasAudio}
                />
            ))}
        </group>
    );
}

useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/meteor.mp3");
useLoader.preload(THREE.AudioLoader, "/sounds/jurrasic/explosion.mp3");