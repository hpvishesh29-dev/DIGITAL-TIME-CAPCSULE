import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Starfield } from './Starfield';
import { GlassGlobe } from './GlassGlobe';
import { FloatingCards } from './FloatingCards';
import { scrollState } from '../../utils/scrollState';
import { useMemory } from '../../context/MemoryContext';

// ──────────────────────────────────────────────────────────────────────────────
// Cinematic Parallax Camera Controller
// ──────────────────────────────────────────────────────────────────────────────

const ParallaxCameraController = () => {
  const { camera } = useThree();
  const { cameraTarget } = useMemory();
  const mousePos = useRef({ x: 0, y: 0 });
  const smoothedMouse = useRef({ x: 0, y: 0 });
  const orbitAngle = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    smoothedMouse.current.x = THREE.MathUtils.lerp(smoothedMouse.current.x, mousePos.current.x, delta * 2.5);
    smoothedMouse.current.y = THREE.MathUtils.lerp(smoothedMouse.current.y, mousePos.current.y, delta * 2.5);

    const parallaxX = smoothedMouse.current.x * 0.65;
    const parallaxY = -smoothedMouse.current.y * 0.35;

    orbitAngle.current += delta * 0.04;
    const orbitX = Math.sin(orbitAngle.current) * 0.35;
    const idleFloat = Math.sin(time * 0.22) * 0.12;

    const baseZ = cameraTarget ? 6.5 : (scrollState.cameraZ || 8.8);
    const baseX = cameraTarget ? cameraTarget[0] * 0.6 : (scrollState.cameraX || 0);
    const baseY = cameraTarget ? cameraTarget[1] * 0.6 : (scrollState.cameraY || 0);

    let baseTarget = new THREE.Vector3(
      baseX + parallaxX * 0.5 + orbitX,
      baseY + parallaxY * 0.5 + idleFloat,
      baseZ
    );

    camera.position.lerp(baseTarget, delta * 2.5);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ──────────────────────────────────────────────────────────────────────────────
// Luminous Studio Lighting
// ──────────────────────────────────────────────────────────────────────────────

const LuminousLights = () => {
  const indigoLightRef = useRef();
  const violetLightRef = useRef();
  const cyanLightRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (indigoLightRef.current) {
      indigoLightRef.current.intensity = 1.4 + Math.sin(time * 0.5) * 0.25;
    }
    if (violetLightRef.current) {
      violetLightRef.current.intensity = 1.1 + Math.cos(time * 0.4) * 0.2;
    }
    if (cyanLightRef.current) {
      cyanLightRef.current.intensity = 1.0 + Math.sin(time * 0.35 + 2.0) * 0.2;
    }
  });

  return (
    <>
      <directionalLight
        ref={indigoLightRef}
        position={[10, 12, 10]}
        intensity={1.4}
        color="#6366F1"
      />
      <directionalLight
        ref={violetLightRef}
        position={[-10, 8, -6]}
        intensity={1.1}
        color="#A855F7"
      />
      <pointLight
        ref={cyanLightRef}
        position={[-6, -6, -8]}
        intensity={1.0}
        distance={25}
        color="#06B6D4"
      />
    </>
  );
};

export const Scene = () => {
  const { qualityMode } = useMemory();

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 48 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <fog attach="fog" args={['#070B14', 12, 38]} />

        <ambientLight intensity={0.6} />
        <hemisphereLight args={['#6366F1', '#070B14', 0.5]} />
        <LuminousLights />

        <ParallaxCameraController />

        <Starfield />
        <GlassGlobe />
        <FloatingCards />

        {qualityMode !== 'performance' && (
          <EffectComposer disableNormalPass multisampling={2}>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.85}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.6} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};