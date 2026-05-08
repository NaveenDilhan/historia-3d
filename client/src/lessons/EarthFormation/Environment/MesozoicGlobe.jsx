import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { COMMON_VERTEX_SHADER, GLSL_NOISE } from './ShaderUtils';

const MesozoicMaterial = shaderMaterial(
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
      
      float landVal = getPangea(pos);
      float elevation = fbm(pos * 8.0);
      float isLand = step(0.52, landVal + elevation * 0.2);

      vec3 oceanColor = mix(vec3(0.01, 0.15, 0.4), vec3(0.0, 0.3, 0.6), smoothstep(0.4, 0.65, landVal));
      vec3 landColor = mix(vec3(0.1, 0.35, 0.15), vec3(0.7, 0.6, 0.4), smoothstep(0.65, 0.85, landVal + elevation*0.5));
      vec3 snowColor = mix(landColor, vec3(1.0), smoothstep(0.8, 1.0, abs(pos.y) + elevation*0.2));
      vec3 baseColor = mix(oceanColor, snowColor, isLand);

      float isCloud = smoothstep(0.6, 0.8, fbm(pos * 4.0 + vec3(uTime * 0.02)));
      baseColor = mix(baseColor, vec3(1.0), isCloud * 0.9);

      vec3 lightDir = normalize(uSunDirection);
      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 viewDir = normalize(cameraPosition - vLocalPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0) * (1.0 - isLand) * (1.0 - isCloud) * 0.6;
      
      gl_FragColor = vec4(baseColor * (diff + 0.1) + spec, uOpacity);
    }
  `
);
extend({ MesozoicMaterial });

export default function MesozoicGlobe({ radius, opacity }) {
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
      <mesozoicMaterial ref={matRef} transparent={true} />
    </mesh>
  );
}