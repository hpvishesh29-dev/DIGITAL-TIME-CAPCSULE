import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Starfield = () => {
  const particlesRef = useRef();

  const particles = useMemo(() => {
    const count = 140;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }

    return positions;
  }, []);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.003;
      particlesRef.current.rotation.x += delta * 0.001;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#818CF8"
        size={0.075}
        sizeAttenuation
        transparent
        opacity={0.25}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};