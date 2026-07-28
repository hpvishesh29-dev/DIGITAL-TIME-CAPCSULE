import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createProceduralEarthTextures } from '../../utils/earthTextureGenerator';
import { scrollState } from '../../utils/scrollState';

// ──────────────────────────────────────────────────────────────────────────────
// Helper: Convert Lat / Long to 3D Coordinates on Sphere
// ──────────────────────────────────────────────────────────────────────────────
function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// ──────────────────────────────────────────────────────────────────────────────
// Geographic Memory Beacon Pins
// ──────────────────────────────────────────────────────────────────────────────
const MEMORY_PINS = [
  { name: 'Paris Vault', lat: 48.8566, lon: 2.3522, color: '#6366F1' },
  { name: 'Tokyo Dreams', lat: 35.6762, lon: 139.6503, color: '#38BDF8' },
  { name: 'New York Story', lat: 40.7128, lon: -74.006, color: '#C084FC' },
  { name: 'Sydney Horizon', lat: -33.8688, lon: 151.2093, color: '#F472B6' },
  { name: 'Cairo Echoes', lat: 30.0444, lon: 31.2357, color: '#10B981' },
  { name: 'Rio Memories', lat: -22.9068, lon: -43.1729, color: '#F59E0B' },
];

const SpatialMemoryPin = ({ pin, radius = 1.85 }) => {
  const pinRef = useRef();
  const beaconRef = useRef();
  const pos = useMemo(() => latLongToVector3(pin.lat, pin.lon, radius), [pin.lat, pin.lon, radius]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (beaconRef.current) {
      const pulse = 1.0 + Math.sin(time * 4 + pin.lat) * 0.35;
      beaconRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={[pos.x, pos.y, pos.z]} ref={pinRef}>
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={pin.color} />
      </mesh>
      <mesh ref={beaconRef}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial
          color={pin.color}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.006, 0.002, 0.16, 8]} />
        <meshBasicMaterial color={pin.color} transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

const ConnectingArc = ({ startLat, startLon, endLat, endLon, color, radius = 1.85 }) => {
  const lineMesh = useMemo(() => {
    const startVec = latLongToVector3(startLat, startLon, radius);
    const endVec = latLongToVector3(endLat, endLon, radius);
    const midVec = startVec.clone().add(endVec).multiplyScalar(0.5);

    const distance = startVec.distanceTo(endVec);
    midVec.normalize().multiplyScalar(radius + distance * 0.32);

    const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
    const points = curve.getPoints(36);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
    return new THREE.Line(geometry, material);
  }, [startLat, startLon, endLat, endLon, color, radius]);

  return <primitive object={lineMesh} />;
};

export const GlassGlobe = () => {
  const globeGroupRef = useRef();
  const earthMeshRef = useRef();
  const cloudsMeshRef = useRef();
  const outerGlassRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const pointLightRef = useRef();

  const [textures, setTextures] = useState(null);
  const [screenPos, setScreenPos] = useState([1.4, 0, 0]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScreenPos([0, 0.35, 0]);
      } else if (window.innerWidth < 1100) {
        setScreenPos([1.0, 0, 0]);
      } else {
        setScreenPos([1.4, 0, 0]);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const procedural = createProceduralEarthTextures();
    setTextures(procedural);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      (loadedMap) => {
        loadedMap.colorSpace = THREE.SRGBColorSpace;
        textureLoader.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
          (loadedSpec) => {
            textureLoader.load(
              'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
              (loadedClouds) => {
                setTextures({
                  earthMapTexture: loadedMap,
                  specularTexture: loadedSpec,
                  nightLightsTexture: procedural.nightLightsTexture,
                  cloudsTexture: loadedClouds,
                });
              }
            );
          }
        );
      },
      undefined,
      (err) => {
        console.log('Using high-res procedural Earth textures fallback');
      }
    );
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (earthMeshRef.current) {
      const targetY = time * 0.03 + scrollState.rotationY;
      earthMeshRef.current.rotation.y = THREE.MathUtils.lerp(
        earthMeshRef.current.rotation.y,
        targetY,
        delta * 4.0
      );
    }

    if (globeGroupRef.current) {
      const targetScale = scrollState.earthScale || 1.0;
      const currentScale = globeGroupRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3.5);
      globeGroupRef.current.scale.setScalar(nextScale);

      const basePosX = screenPos[0] + scrollState.cameraX;
      globeGroupRef.current.position.x = THREE.MathUtils.lerp(
        globeGroupRef.current.position.x,
        basePosX,
        delta * 3.5
      );

      const basePosY = screenPos[1] + scrollState.cameraY;
      globeGroupRef.current.position.y = THREE.MathUtils.lerp(
        globeGroupRef.current.position.y,
        basePosY,
        delta * 3.5
      );
    }

    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y = time * 0.068;
      cloudsMeshRef.current.rotation.x = Math.sin(time * 0.05) * 0.02;
    }

    if (outerGlassRef.current) {
      outerGlassRef.current.rotation.y = -time * 0.02;
      outerGlassRef.current.scale.setScalar(1.0);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 3.5 + Math.sin(time * 0.25) * 0.06;
      ring1Ref.current.rotation.y = time * 0.12;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = Math.PI / 4 + Math.cos(time * 0.2) * 0.06;
      ring2Ref.current.rotation.y = -time * 0.09;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -Math.PI / 5 + Math.sin(time * 0.18) * 0.04;
      ring3Ref.current.rotation.z = time * 0.07;
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = 7.5 + Math.sin(time * 0.8) * 2;
    }
  });

  return (
    <group ref={globeGroupRef} position={screenPos}>
      {/* Studio Key Lights */}
      <directionalLight position={[5, 3, 5]} intensity={1.8} color="#ffffff" />
      <ambientLight intensity={0.45} />
      <pointLight ref={pointLightRef} color="#38BDF8" intensity={8.5} distance={15} decay={2} />
      <pointLight color="#818CF8" intensity={5.5} distance={12} position={[-4, -2, -4]} />

      {/* 1. ENLARGED REAL 3D EARTH PLANET MESH */}
      <mesh ref={earthMeshRef} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[1.85, 64, 64]} />
        {textures ? (
          <meshPhongMaterial
            map={textures.earthMapTexture}
            specularMap={textures.specularTexture}
            specular="#335577"
            shininess={35}
            bumpMap={textures.earthMapTexture}
            bumpScale={0.022}
          />
        ) : (
          <meshStandardMaterial color="#0b1e36" roughness={0.6} />
        )}

        {/* Spatial Memory Pin Markers on Real Coordinates */}
        {MEMORY_PINS.map((pin) => (
          <SpatialMemoryPin key={pin.name} pin={pin} radius={1.85} />
        ))}

        {/* Connecting Arc Lines */}
        <ConnectingArc startLat={48.8566} startLon={2.3522} endLat={35.6762} endLon={139.6503} color="#6366F1" radius={1.85} />
        <ConnectingArc startLat={40.7128} startLon={-74.006} endLat={48.8566} endLon={2.3522} color="#38BDF8" radius={1.85} />
        <ConnectingArc startLat={-33.8688} startLon={151.2093} endLat={35.6762} endLon={139.6503} color="#F472B6" radius={1.85} />
      </mesh>

      {/* 2. ATMOSPHERIC CLOUDS LAYER */}
      <mesh ref={cloudsMeshRef}>
        <sphereGeometry args={[1.88, 64, 64]} />
        {textures && (
          <meshStandardMaterial
            map={textures.cloudsTexture}
            transparent
            opacity={0.38}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        )}
      </mesh>

      {/* 3. ATMOSPHERIC RAYLEIGH GLOW HALO */}
      <mesh>
        <sphereGeometry args={[1.95, 64, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. OUTER REFRACTIVE CRYSTAL GLASS DOME */}
      <mesh ref={outerGlassRef}>
        <sphereGeometry args={[2.08, 64, 64]} />
        <meshPhysicalMaterial
          transmission={0.93}
          roughness={0.04}
          metalness={0.05}
          thickness={2.2}
          ior={1.52}
          clearcoat={1}
          clearcoatRoughness={0.02}
          reflectivity={0.9}
          color="#ffffff"
          attenuationColor="#a5b4fc"
          attenuationDistance={3.5}
          transparent
          opacity={0.4}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 5. HOLOGRAPHIC ORBITAL SATELLITE RINGS */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3.5, 0, 0]}>
          <torusGeometry args={[2.28, 0.008, 16, 256]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
        </mesh>
      </group>

      <group ref={ring2Ref}>
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <torusGeometry args={[2.42, 0.007, 16, 256]} />
          <meshBasicMaterial color="#C084FC" transparent opacity={0.55} />
        </mesh>
      </group>

      <group ref={ring3Ref}>
        <mesh rotation={[Math.PI / 5, Math.PI / 3, 0]}>
          <torusGeometry args={[2.56, 0.006, 16, 256]} />
          <meshBasicMaterial color="#F472B6" transparent opacity={0.45} />
        </mesh>
      </group>
    </group>
  );
};