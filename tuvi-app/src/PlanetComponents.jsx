import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── colour palette per element ── */
export const elementColors = {
  "Kim": "#F5C842",
  "Mộc": "#2ECC71",
  "Thủy": "#3498DB",
  "Hỏa": "#E74C3C",
  "Thổ": "#D4A574"
};

export const elementEmissive = {
  "Kim": "#FFD700",
  "Mộc": "#00FF7F",
  "Thủy": "#00BFFF",
  "Hỏa": "#FF4444",
  "Thổ": "#CD853F"
};

/* ── Planet Material helpers ── */
export const getPlanetProps = (element, isFocused, activeTheme) => {
  const base = {
    color: elementColors[element] || "#ffffff",
    emissive: elementEmissive[element] || "#ffffff",
    roughness: 0.5,
    metalness: 0.3,
    emissiveIntensity: isFocused ? 1.2 : 0.35,
    wireframe: activeTheme === 'scifi'
  };

  if (activeTheme === 'mystical') {
    base.emissiveIntensity = isFocused ? 2.5 : 0.9;
  } else if (activeTheme === 'asian') {
    base.roughness = 0.9;
    base.metalness = 0.2;
    base.emissiveIntensity = isFocused ? 0.9 : 0.3;
  } else if (activeTheme === 'scifi') {
    base.emissiveIntensity = isFocused ? 2.0 : 0.6;
  }

  switch (element) {
    case "Kim":
      return { ...base, metalness: activeTheme === 'asian' ? 0.4 : 0.9, roughness: activeTheme === 'asian' ? 0.6 : 0.15 };
    case "Mộc":
      return { ...base, metalness: 0.1, roughness: 0.8 };
    case "Thủy":
      return { ...base, metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.88 };
    case "Hỏa":
      return { ...base, metalness: 0.2, roughness: 0.6, emissiveIntensity: isFocused ? (activeTheme === 'mystical' ? 3.0 : 2.0) : (activeTheme === 'mystical' ? 1.2 : 0.7) };
    case "Thổ":
      return { ...base, metalness: 0.15, roughness: 0.85 };
    default:
      return base;
  }
};

/* ── Orbit Ring (individual, elliptical) ── */
export const OrbitRing = ({ radiusX, radiusZ, color }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radiusX, 0, Math.sin(a) * radiusZ));
    }
    return pts;
  }, [radiusX, radiusZ]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.12} />
    </line>
  );
};

/* ── Planetary Ring (Saturn-style) ── */
export const PlanetaryRing = ({ color, radius = 2.2 }) => {
  return (
    <mesh rotation={[-Math.PI / 2 + 0.2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.6, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        side={THREE.DoubleSide}
        transparent
        opacity={0.25}
      />
    </mesh>
  );
};

/* ── Atmosphere Glow Shell ── */
export const AtmosphereGlow = ({ color, radius = 1.7 }) => {
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

/* ── Volumetric Star Field ── */
export const VolumetricStarField = React.memo(({ theme }) => {
  const config = useMemo(() => {
    switch (theme) {
      case 'mystical': return { count: 24000, size: 0.4, color: '#e0f0ff', opacity: 0.8, range: 600, speed: 0.02 };
      case 'asian': return { count: 9000, size: 0.25, color: '#fff5e6', opacity: 0.5, range: 400, speed: 0.005 };
      case 'scifi': return { count: 15000, size: 0.3, color: '#cceeff', opacity: 0.7, range: 800, speed: 0.01 };
      default: return { count: 12000, size: 0.3, color: '#ffffff', opacity: 0.6, range: 500, speed: 0.01 };
    }
  }, [theme]);

  const points = useMemo(() => {
    const positions = new Float32Array(config.count * 3);
    for (let i = 0; i < config.count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * config.range;
      positions[i * 3 + 1] = (Math.random() - 0.5) * config.range;
      positions[i * 3 + 2] = (Math.random() - 0.5) * config.range;
    }
    return positions;
  }, [config.count, config.range]);

  const pointsRef = useRef();

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * config.speed;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={config.count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={config.size} 
        color={config.color} 
        sizeAttenuation 
        transparent 
        opacity={config.opacity} 
      />
    </points>
  );
});
