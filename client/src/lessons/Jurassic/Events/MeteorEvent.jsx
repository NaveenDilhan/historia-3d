import React, { useRef, useState, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
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
        // UV.y represents length of cylinder (0 is tail end, 1 is head)
        float intensity = pow(vUv.y, 3.0); // Extreme white hot core at the head
        vec3 col = mix(uColor, uGlow, intensity);
        
        // Smoothly fade out the tail 
        float alpha = smoothstep(0.0, 0.2, vUv.y) * (vUv.y);
        
        gl_FragColor = vec4(col, alpha * 0.9);
    }
    `
);
extend({ MeteorTrailMaterial });

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
        if (state.clock.elapsedTime > delay && progress.current < 1) {
            if (!visible) setVisible(true);
            
            // 1. Play the falling whoosh sound
            if (hasAudio && !hasStartedSound.current && meteorSoundRef.current && meteorSoundRef.current.buffer) {
                meteorSoundRef.current.setVolume(isHero ? 2.5 : 0.15); // Hero is deafening, background is ambient
                meteorSoundRef.current.setRefDistance(isHero ? 300 : 50);
                meteorSoundRef.current.play();
                hasStartedSound.current = true;
            }

            // Calculate movement step based on constant speed
            progress.current += (delta * speed) / startPos.distanceTo(targetPos);
            
            if (progress.current >= 1) {
                setVisible(false); // Hide the visual meshes
                
                // 2. Play the impact explosion sound
                if (hasAudio && !hasExploded.current && explosionSoundRef.current && explosionSoundRef.current.buffer) {
                    // Cut the falling sound immediately upon impact
                    if (meteorSoundRef.current?.isPlaying) meteorSoundRef.current.stop();
                    
                    explosionSoundRef.current.setVolume(isHero ? 4.0 : 0.3);
                    explosionSoundRef.current.setRefDistance(isHero ? 400 : 80);
                    explosionSoundRef.current.play();
                    hasExploded.current = true;
                }
            } else {
                // Animate position and rotation
                ref.current.position.lerpVectors(startPos, targetPos, progress.current);
                ref.current.lookAt(targetPos); // Point the meteor forward
            }
        }
    });

    // Interaction handlers ONLY applied to the main Hero meteor to read the archive
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
            {/* 
                Group visuals separately so we can set visible={false} upon impact 
                WITHOUT unmounting/hiding the PositionalAudio nodes, letting the explosion ring out.
            */}
            <group visible={visible}>
                <mesh>
                    <sphereGeometry args={[2, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                
                <mesh>
                    <sphereGeometry args={[4, 16, 16]} />
                    <meshBasicMaterial color="#ff5500" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
                </mesh>
                
                <mesh position={[0, 0, -30]} rotation={[-Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[2, 0.1, 60, 16, 1, true]} />
                    <meteorTrailMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>

                {isHero && (
                    <mesh
                        scale={[20, 20, 20]}
                        onPointerOver={handlePointerOver}
                        onPointerOut={handlePointerOut}
                        onClick={handleClick}
                    >
                        <sphereGeometry args={[1, 8, 8]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                )}
            </group>

            {/* Spatial Audio Attachments */}
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

    // Record precisely when the strike starts to base all delays off of it
    useFrame((state) => {
        if (active && startTime === 0) {
            setStartTime(state.clock.elapsedTime);
        }

        // Trigger the end of the shower
        if (startTime > 0 && !hasEmittedRef.current) {
            // Shower duration is 25s + 5s buffer for the final meteors to hit the ground
            if (state.clock.elapsedTime > startTime + 30) {
                hasEmittedRef.current = true;
                window.dispatchEvent(new CustomEvent('meteor-shower-complete'));
            }
        }
    });

    const meteors = useMemo(() => {
        const arr = [];
        
        // 1. Generate 150 Background Showers
        for(let i = 0; i < 150; i++) {
            const startX = (Math.random() - 0.5) * 3000;
            const startY = 800 + Math.random() * 600;
            const startZ = -1000 - Math.random() * 1500; 

            const endX = startX + (Math.random() - 0.5) * 1000;
            const endY = -200; // Bury beneath terrain
            const endZ = startZ + 1500 + Math.random() * 800; // Streaking towards the camera

            arr.push({
                id: i,
                startPos: new THREE.Vector3(startX, startY, startZ),
                targetPos: new THREE.Vector3(endX, endY, endZ),
                delay: Math.random() * 25, // Stagger over 25 massive seconds
                speed: 300 + Math.random() * 200,
                scale: 0.3 + Math.random() * 1.5,
                isHero: false,
                hasAudio: i % 7 === 0 // Optimization: Only ~14% of background meteors emit sound to prevent WebAudio limits crashing
            });
        }
        
        // 2. The Hero Meteor (Massive, comes directly over the volcano early on)
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

    // Do not render anything until the countdown is over
    if (startTime === 0) return null;

    return (
        <group>
            {meteors.map((m) => (
                <Meteor
                    key={m.id}
                    startPos={m.startPos}
                    targetPos={m.targetPos}
                    delay={startTime + m.delay}
                    speed={m.speed}
                    scale={m.scale}
                    isHero={m.isHero}
                    hasAudio={m.hasAudio}
                />
            ))}
        </group>
    );
}