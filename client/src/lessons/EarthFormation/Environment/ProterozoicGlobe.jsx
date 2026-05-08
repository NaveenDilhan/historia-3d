import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { COMMON_VERTEX_SHADER, GLSL_NOISE } from './ShaderUtils';

const ProterozoicMaterial = shaderMaterial(
  { uTime: 0, uOpacity: 0, uSunDirection: new THREE.Vector3(15, 5, 5).normalize() },
  COMMON_VERTEX_SHADER,
  `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uSunDirection;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;

    ${GLSL_NOISE}

    void main() {
      vec3 pos = normalize(vLocalPosition);
      float noise = fbm(pos * 3.5);
      
      vec3 oceanColor = vec3(0.05, 0.2, 0.5); 
      vec3 landColor = vec3(0.25, 0.22, 0.2); 
      
      float isLand = smoothstep(0.45, 0.5, noise);
      vec3 baseColor = mix(oceanColor, landColor, isLand);

      // Deep Glaciers
      float iceNoise = fbm(pos * 8.0) * 0.2;
      float iceCap = smoothstep(0.35, 0.6, abs(pos.y) + iceNoise);
      baseColor = mix(baseColor, vec3(0.85, 0.95, 1.0), iceCap);

      vec3 lightDir = normalize(uSunDirection);
      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 viewDir = normalize(cameraPosition - vLocalPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      
      // Ice is extremely glossy, rock is dull
      float specPower = mix(32.0, 256.0, iceCap); 
      float spec = pow(max(dot(vNormal, halfDir), 0.0), specPower) * mix(1.0 - isLand, 1.0, iceCap) * 0.8;
      
      gl_FragColor = vec4(baseColor * (diff + 0.1) + spec, uOpacity);
    }
  `
);
extend({ ProterozoicMaterial });

export default function ProterozoicGlobe({ radius, opacity }) {
  const matRef = useRef();
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uTime = state.clock.elapsedTime;
      matRef.current.uOpacity = opacity;
    }
  });
  return (
    <mesh>
      <sphereGeometry args={[radius, 128, 128]} />
      <proterozoicMaterial ref={matRef} transparent={true} />
    </mesh>
  );
}