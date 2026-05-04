import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Billboard, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const SteamShaderMaterial = shaderMaterial(
  { 
    uTime: 0, 
    uOpacity: 0.5, 
    uColor: new THREE.Color('#ffffff'),
    fogColor: new THREE.Color('#597a61'),
    fogDensity: 0.012,
    fogNear: 1,
    fogFar: 1000
  },
  `
    varying vec2 vUv;
    #include <fog_pars_vertex>
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex> 
    }
  `,
  `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColor;
    varying vec2 vUv;
    #include <fog_pars_fragment>
    
    float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
    float noise (vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i); float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    float fbm (vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }
    void main() {
        vec2 st = vUv * 3.0;
        st.y -= uTime * 0.4;
        st.x += uTime * 0.1;
        float n = fbm(st);
        float dist = distance(vUv, vec2(0.5));
        float mask = smoothstep(0.5, 0.1, dist);
        float alpha = n * mask * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
        #include <fog_fragment>
    }
  `
);
extend({ SteamShaderMaterial });

// HOISTED GEOMETRY
const _ventGeo1 = new THREE.PlaneGeometry(20, 20);
const _ventGeo2 = new THREE.PlaneGeometry(16, 16);
const _ventGeo3 = new THREE.PlaneGeometry(24, 24);
const _ventHitboxGeo = new THREE.CylinderGeometry(1, 1, 1);
const _hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

export default function GeothermalVent({ x, y, z, scale = 1 }) {
    const matRef1 = useRef();
    const matRef2 = useRef();
    const matRef3 = useRef();

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (matRef1.current) matRef1.current.uTime = time;
        if (matRef2.current) matRef2.current.uTime = time * 0.8 + 10;
        if (matRef3.current) matRef3.current.uTime = time * 1.2 + 20;
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
        window.dispatchEvent(new CustomEvent('dino-click', { detail: { type: 'geothermal' } }));
    };

    return (
        <group position={[x, y, z]} scale={scale}>
            <Billboard position={[0, 8, 0]}>
                <mesh position={[0, 0, 0.1]} geometry={_ventGeo1}>
                    <steamShaderMaterial ref={matRef1} fog={true} transparent depthWrite={false} uOpacity={0.6} />
                </mesh>
                <mesh position={[2, -2, 0]} geometry={_ventGeo2}>
                    <steamShaderMaterial ref={matRef2} fog={true} transparent depthWrite={false} uOpacity={0.4} />
                </mesh>
                <mesh position={[-2, 3, -0.1]} geometry={_ventGeo3}>
                    <steamShaderMaterial ref={matRef3} fog={true} transparent depthWrite={false} uOpacity={0.5} />
                </mesh>
            </Billboard>
            <mesh
                position={[0, 6, 0]}
                scale={[10, 15, 10]}
                geometry={_ventHitboxGeo}
                material={_hitboxMat}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            />
        </group>
    );
}