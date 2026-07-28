import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useMemory } from '../../context/MemoryContext';

// ──────────────────────────────────────────────────────────────────────────────
// Helper: Get Responsive Globe Center Position
// ──────────────────────────────────────────────────────────────────────────────
const getGlobeCenter = () => {
  if (typeof window === 'undefined') return [1.4, 0, 0];
  if (window.innerWidth < 768) return [0, 0.35, 0];
  if (window.innerWidth < 1100) return [1.0, 0, 0];
  return [1.4, 0, 0];
};

// ──────────────────────────────────────────────────────────────────────────────
// Particle halo surrounding floating card
// ──────────────────────────────────────────────────────────────────────────────

const CardParticles = React.memo(({ color, count = 8 }) => {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 1.1;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.025}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

CardParticles.displayName = 'CardParticles';

// ──────────────────────────────────────────────────────────────────────────────
// Empty revolving glass template frames (revolves around larger Earth Globe)
// ──────────────────────────────────────────────────────────────────────────────

const EMPTY_TEMPLATES = [
  { id: 'tmpl-1', orbitRadius: 2.65, orbitSpeed:  0.08, initialAngle: 0,    yOffset:  0.35, glowColor: '#6366F1' },
  { id: 'tmpl-2', orbitRadius: 2.85, orbitSpeed: -0.07, initialAngle: 1.05, yOffset: -0.4,  glowColor: '#A855F7' },
  { id: 'tmpl-3', orbitRadius: 2.75, orbitSpeed:  0.09, initialAngle: 2.09, yOffset:  0.15, glowColor: '#2563EB' },
  { id: 'tmpl-4', orbitRadius: 2.90, orbitSpeed: -0.06, initialAngle: 3.14, yOffset:  0.45, glowColor: '#F43F5E' },
  { id: 'tmpl-5', orbitRadius: 2.70, orbitSpeed:  0.08, initialAngle: 4.19, yOffset: -0.2,  glowColor: '#06B6D4' },
  { id: 'tmpl-6', orbitRadius: 2.80, orbitSpeed: -0.07, initialAngle: 5.24, yOffset: -0.45, glowColor: '#6366F1' },
];

const EmptyTemplateCard = React.memo(({ template, index }) => {
  const groupRef = useRef();
  const matRef = useRef();

  const { orbitRadius, orbitSpeed, initialAngle, yOffset, glowColor } = template;

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    const center = getGlobeCenter();
    const currentAngle = initialAngle + time * orbitSpeed;
    const x = center[0] + Math.cos(currentAngle) * orbitRadius;
    const z = center[2] + Math.sin(currentAngle) * orbitRadius;
    const floatY = center[1] + yOffset + Math.sin(time * 0.8 + index * 0.9) * 0.08;

    groupRef.current.position.set(x, floatY, z);
    groupRef.current.lookAt(state.camera.position);

    const breathe = 1 + Math.sin(time * 0.5 + index * 0.6) * 0.015;
    groupRef.current.scale.setScalar(breathe);

    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, 0.6, 0.02);
    }
  });

  return (
    <group ref={groupRef}>
      <CardParticles color={glowColor} count={6} />
      <RoundedBox args={[0.95, 1.15, 0.06]} radius={0.08} smoothness={6}>
        <meshPhysicalMaterial
          ref={matRef}
          color="#0d1322"
          transmission={0.65}
          roughness={0.12}
          metalness={0.05}
          ior={1.5}
          thickness={0.5}
          clearcoat={0.9}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.8}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.04]}
        fontSize={0.07}
        color="#94A3B8"
        anchorX="center"
        anchorY="middle"
      >
        + Add Memory
      </Text>
    </group>
  );
});

EmptyTemplateCard.displayName = 'EmptyTemplateCard';

// ──────────────────────────────────────────────────────────────────────────────
// Luminous Floating Memory Card Item (revolves around larger 3D Earth Globe)
// ──────────────────────────────────────────────────────────────────────────────

const ACCENT_COLORS = ['#6366F1', '#A855F7', '#38BDF8', '#F43F5E', '#10B981'];

const getMemoryImageUrl = (memory) => {
  if (!memory) return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';
  if (memory.image) return memory.image;
  if (typeof memory.photo === 'string') return memory.photo;
  if (memory.photo?.url) return memory.photo.url;
  if (memory.imageUrl) return memory.imageUrl;
  return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';
};

const CardItem = React.memo(({ memory, index, onSelect, onClose, isFocused }) => {
  const groupRef = useRef();
  const matRef = useRef();
  const borderRef = useRef();
  const imageRef = useRef();
  const [hovered, setHovered] = useState(false);
  const hoverT = useRef(0);
  const scaleVec = useRef(new THREE.Vector3(1, 1, 1));
  const camDir = useRef(new THREE.Vector3());
  const camTarget = useRef(new THREE.Vector3());

  // Locked capsules = Blue (#38BDF8), Unlocked = Gold (#F59E0B)
  const isLocked = memory.unlockDate && new Date(memory.unlockDate) > new Date() && !memory.isUnlocked;
  const accent = isLocked ? '#38BDF8' : '#F59E0B';
  const imageUrl = useMemo(() => getMemoryImageUrl(memory), [memory]);

  const orbit = useMemo(() => ({
    radius: memory.orbitRadius || (2.65 + (index % 4) * 0.1),
    speed: memory.orbitSpeed || ((index % 2 === 0 ? 1 : -1) * (0.05 + (index % 3) * 0.012)),
    angle: memory.initialAngle || ((index / Math.max(1, 6)) * Math.PI * 2 + index * 0.9),
    yOffset: memory.yOffset || (((index % 3) - 1) * 0.38),
  }), [memory, index]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    hoverT.current = THREE.MathUtils.lerp(hoverT.current, hovered ? 1 : 0, delta * 6);

    if (isFocused) {
      state.camera.getWorldDirection(camDir.current);
      camTarget.current.copy(state.camera.position).addScaledVector(camDir.current, 2.4);
      groupRef.current.position.lerp(camTarget.current, delta * 4.5);
      groupRef.current.quaternion.slerp(state.camera.quaternion, delta * 5);

      // Pulse animation when selected
      const pulse = 1.6 + Math.sin(time * 3) * 0.04;
      scaleVec.current.set(pulse, pulse, pulse);
      groupRef.current.scale.lerp(scaleVec.current, delta * 6);
    } else {
      const center = getGlobeCenter();
      const currentAngle = orbit.angle + time * orbit.speed;
      const x = center[0] + Math.cos(currentAngle) * orbit.radius;
      const z = center[2] + Math.sin(currentAngle) * orbit.radius;
      const floatY = center[1] + orbit.yOffset + Math.sin(time * 1.2 + index) * 0.08;

      groupRef.current.position.set(x, floatY, z);
      groupRef.current.lookAt(state.camera.position);

      const breathe = 1 + Math.sin(time * 1 + index * 0.9) * 0.015;
      const targetScale = (hovered ? 1.18 : 1.0) * breathe;
      scaleVec.current.set(targetScale, targetScale, targetScale);
      groupRef.current.scale.lerp(scaleVec.current, delta * 8);
    }

    if (matRef.current) {
      matRef.current.transmission = THREE.MathUtils.lerp(0.65, 0.88, hoverT.current);
      matRef.current.roughness = THREE.MathUtils.lerp(0.12, 0.03, hoverT.current);
      matRef.current.clearcoat = THREE.MathUtils.lerp(0.9, 1, hoverT.current);
      matRef.current.opacity = THREE.MathUtils.lerp(0.85, 0.96, hoverT.current);
    }

    if (borderRef.current) {
      borderRef.current.opacity = THREE.MathUtils.lerp(0.35, 0.95, hoverT.current);
    }

    if (imageRef.current && imageRef.current.material) {
      const brightness = THREE.MathUtils.lerp(0.85, 1.1, hoverT.current);
      imageRef.current.material.color.setScalar(brightness);
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isFocused) {
          if (onClose) onClose();
        } else {
          onSelect(memory);
        }
      }}
    >
      <CardParticles color={accent} count={isLocked ? 6 : 12} />

      {/* Golden Orbital Trail / Ring for Unlocked Memory */}
      {!isLocked && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.65, 32]} />
          <meshBasicMaterial color="#FBBF24" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Glowing Border Backing */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.0, 1.22]} />
        <meshBasicMaterial
          ref={borderRef}
          color={hovered ? '#FBBF24' : accent}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Glass Card Body */}
      <RoundedBox args={[0.95, 1.16, 0.06]} radius={0.08} smoothness={6} position={[0, 0, -0.015]}>
        <meshPhysicalMaterial
          ref={matRef}
          color={isLocked ? '#0b101d' : '#1e1b4b'}
          transmission={0.65}
          roughness={0.12}
          metalness={0.02}
          ior={1.52}
          thickness={0.5}
          clearcoat={0.9}
          clearcoatRoughness={0.04}
          transparent
          opacity={0.85}
          reflectivity={0.7}
        />
      </RoundedBox>

      {/* Top Neon Accent Line */}
      <mesh position={[0, 0.56, 0.025]}>
        <planeGeometry args={[0.86, 0.012]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={hovered ? 0.95 : 0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>


      {/* Memory Photo */}
      <React.Suspense
        fallback={
          <mesh position={[0, 0.12, 0.025]}>
            <planeGeometry args={[0.82, 0.74]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
          </mesh>
        }
      >
        <Image
          ref={imageRef}
          url={imageUrl}
          scale={[0.82, 0.74]}
          position={[0, 0.12, 0.025]}
          radius={0.06}
          toneMapped={false}
        />
      </React.Suspense>

      {/* Memory Title */}
      <Text
        position={[0, -0.34, 0.035]}
        fontSize={0.065}
        color="#FFFFFF"
        font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.8}
      >
        {memory.title}
      </Text>

      {/* Category Pill Subtext */}
      <Text
        position={[0, -0.45, 0.035]}
        fontSize={0.042}
        color={hovered ? '#38BDF8' : accent}
        anchorX="center"
        anchorY="middle"
      >
        {memory.category ? memory.category.toUpperCase() : 'MEMORY'}
      </Text>
    </group>
  );
});

CardItem.displayName = 'CardItem';

// ──────────────────────────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────────────────────────

export const FloatingCards = () => {
  const { filteredMemories, setSelectedMemory, selectedMemory } = useMemory();

  const handleClose = () => setSelectedMemory(null);

  if (!filteredMemories || filteredMemories.length === 0) {
    return (
      <group>
        {EMPTY_TEMPLATES.map((template, idx) => (
          <EmptyTemplateCard key={template.id} template={template} index={idx} />
        ))}
      </group>
    );
  }

  return (
    <group>
      {filteredMemories.map((memory, idx) => (
        <CardItem
          key={memory.id}
          memory={memory}
          index={idx}
          onSelect={setSelectedMemory}
          onClose={handleClose}
          isFocused={selectedMemory ? selectedMemory.id === memory.id : false}
        />
      ))}
    </group>
  );
};