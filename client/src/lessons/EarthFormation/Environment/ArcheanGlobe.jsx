import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { COMMON_VERTEX_SHADER, GLSL_NOISE } from './ShaderUtils';

const ArcheanMaterial = shaderMaterial(
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
      float noise = fbm(pos * 4.0);
      
      vec3 oceanColor = mix(vec3(0.02, 0.2, 0.05), vec3(0.05, 0.4, 0.15), noise); 
      vec3 landColor = vec3(0.15, 0.1, 0.1); 
      
      float isLand = smoothstep(0.5, 0.55, noise);
      vec3 baseColor = mix(oceanColor, landColor, isLand);

      vec3 lightDir = normalize(uSunDirection);
      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 viewDir = normalize(cameraPosition - vLocalPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      
      // Intense specular reflection specifically over the green ocean
      float spec = pow(max(dot(vNormal, halfDir), 0.0), 128.0) * (1.0 - isLand) * 1.5;
      
      gl_FragColor = vec4(baseColor * (diff + 0.1) + spec, uOpacity);
    }
  `
);
extend({ ArcheanMaterial });

export default function ArcheanGlobe({ radius, opacity }) {
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
      <archeanMaterial ref={matRef} transparent={true} />
    </mesh>
  );
}