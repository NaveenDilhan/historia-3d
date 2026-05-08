import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { COMMON_VERTEX_SHADER, GLSL_NOISE } from './ShaderUtils';

const HadeanMaterial = shaderMaterial(
  { uTime: 0, uOpacity: 1, uCooling: 0 },
  COMMON_VERTEX_SHADER,
  `
    uniform float uTime;
    uniform float uOpacity;
    uniform float uCooling;
    varying vec3 vLocalPosition;

    ${GLSL_NOISE}

    void main() {
      vec3 pos = normalize(vLocalPosition);
      
      // Ridge noise creates sharp, vein-like lava canals
      float noise = fbm(pos * 3.0 + uTime * 0.05);
      float ridge = 1.0 - abs(snoise(pos * 5.0 + uTime * 0.02));
      ridge = pow(ridge, 4.0); 

      // Deep red, highly emissive lava
      vec3 magmaColor = vec3(1.0, 0.2, 0.0) * (1.5 - uCooling) * 4.0; 
      vec3 crustColor = vec3(0.04, 0.01, 0.01) + (noise * 0.05);
      
      float threshold = mix(0.1, 0.95, uCooling);
      float isMagma = smoothstep(threshold, threshold + 0.1, ridge);
      
      vec3 finalColor = mix(crustColor, magmaColor, isMagma);
      gl_FragColor = vec4(finalColor, uOpacity);
    }
  `
);
extend({ HadeanMaterial });

export default function HadeanGlobe({ radius, opacity, cooling }) {
  const matRef = useRef();
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uTime = state.clock.elapsedTime;
      matRef.current.uOpacity = opacity;
      matRef.current.uCooling = cooling;
    }
  });
  return (
    <mesh>
      <sphereGeometry args={[radius, 128, 128]} />
      <hadeanMaterial ref={matRef} transparent={true} />
    </mesh>
  );
}