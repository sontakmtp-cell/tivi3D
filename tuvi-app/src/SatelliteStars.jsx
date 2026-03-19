import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { isChinhTinh, isTuHoa, isSatTinh } from './data/starsDatabase';
import { findActiveCombos } from './data/starRelationships';

/**
 * Lấy visual config dựa trên loại sao
 */
function getStarVisualConfig(starName, index, total, elementColor) {
  if (isChinhTinh(starName)) {
    return {
      baseRadius: 2.8,
      speed: 1.2,
      size: 0.35,
      emissiveIntensity: 2.5,
      color: '#FFFFFF',
      emissive: '#FFD700',
      label: `★ ${starName}`,
      labelColor: '#FFD700',
      labelSize: 0.28,
      hasGlow: true,
      hasLight: true,
      segments: 24,
    };
  }

  if (isTuHoa(starName)) {
    // Tứ Hóa: hiển thị đặc biệt — sáng, glow riêng
    const tuHoaColors = {
      "Hóa Lộc": { color: '#00FF7F', emissive: '#00FF7F' },  // Xanh lá
      "Hóa Quyền": { color: '#FF6347', emissive: '#FF6347' }, // Đỏ cam
      "Hóa Khoa": { color: '#87CEEB', emissive: '#87CEEB' },  // Xanh dương nhạt
      "Hóa Kỵ": { color: '#9400D3', emissive: '#9400D3' },    // Tím đậm
    };
    const thc = tuHoaColors[starName] || { color: '#FFFFFF', emissive: '#FFFFFF' };
    return {
      baseRadius: 3.0 + index * 0.3,
      speed: 0.8 + (index * 0.1),
      size: 0.25,
      emissiveIntensity: 2.0,
      color: thc.color,
      emissive: thc.emissive,
      label: `✦ ${starName}`,
      labelColor: thc.color,
      labelSize: 0.22,
      hasGlow: true,
      hasLight: false,
      segments: 20,
    };
  }

  if (isSatTinh(starName)) {
    // Sát tinh: đỏ tối, nhỏ hơn
    return {
      baseRadius: 3.5 + index * 0.3,
      speed: 0.6 + (index * 0.12),
      size: 0.15,
      emissiveIntensity: 1.5,
      color: '#FF4444',
      emissive: '#FF0000',
      label: `⚠ ${starName}`,
      labelColor: '#FF6666',
      labelSize: 0.16,
      hasGlow: false,
      hasLight: false,
      segments: 12,
    };
  }

  // Phụ tinh thường: nhỏ, mờ
  return {
    baseRadius: 3.2 + index * 0.35,
    speed: 0.5 + (index * 0.15),
    size: 0.12 + Math.random() * 0.08,
    emissiveIntensity: 0.8,
    color: elementColor,
    emissive: elementColor,
    label: starName,
    labelColor: elementColor,
    labelSize: 0.18,
    hasGlow: false,
    hasLight: false,
    segments: 12,
  };
}

/**
 * A single satellite (moon) orbiting around a planet.
 * Visual appearance varies by star type.
 */
const Satellite = ({ name, config, index, total, visible }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const scaleRef = useRef(0);

  const orbitConfig = useMemo(() => {
    const tiltX = (Math.random() - 0.5) * 0.8;
    const tiltZ = (Math.random() - 0.5) * 0.6;
    const phase = (index / total) * Math.PI * 2;
    return { tiltX, tiltZ, phase };
  }, [index, total]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const targetScale = visible ? 1 : 0;
    scaleRef.current += (targetScale - scaleRef.current) * 0.06;

    if (scaleRef.current < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    const angle = orbitConfig.phase + t * config.speed;
    const r = config.baseRadius * scaleRef.current;
    groupRef.current.position.x = Math.cos(angle) * r;
    groupRef.current.position.y = Math.sin(angle) * r * Math.sin(orbitConfig.tiltX);
    groupRef.current.position.z = Math.sin(angle) * r * Math.cos(orbitConfig.tiltZ);

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const s = config.size * scaleRef.current;
      meshRef.current.scale.set(s / config.size, s / config.size, s / config.size);
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.size, config.segments, config.segments]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity}
          roughness={config.hasGlow ? 0.2 : 0.5}
          metalness={config.hasGlow ? 0.6 : 0.2}
        />
      </mesh>

      {/* Glow cho chính tinh / tứ hóa */}
      {config.hasGlow && (
        <mesh>
          <sphereGeometry args={[config.size * 1.6, 16, 16]} />
          <meshStandardMaterial
            color={config.emissive}
            emissive={config.emissive}
            emissiveIntensity={0.5}
            transparent
            opacity={0.1 * scaleRef.current}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Point light cho chính tinh */}
      {config.hasLight && <pointLight color={config.emissive} intensity={1.5} distance={5} />}

      {/* Name label */}
      <Billboard>
        <Text
          position={[0, config.hasGlow ? -0.6 : -0.35, 0]}
          fontSize={config.labelSize}
          color={config.labelColor}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.015}
          outlineColor="#000000"
          fillOpacity={scaleRef.current}
        >
          {config.label}
        </Text>
      </Billboard>
    </group>
  );
};

/**
 * Orbital ring showing satellite path (only for main star)
 */
const SatelliteOrbitRing = ({ radius, visible, color = '#FFD700' }) => {
  const meshRef = useRef();
  const scaleRef = useRef(0);

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = visible ? 1 : 0;
    scaleRef.current += (target - scaleRef.current) * 0.06;
    meshRef.current.visible = scaleRef.current > 0.01;
    meshRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <line ref={meshRef} geometry={geometry} visible={false}>
      <lineBasicMaterial color={color} transparent opacity={0.08} />
    </line>
  );
};

/**
 * Combo connection line — kết nối 2 sao có combo trong cung
 * (hiển thị khi focus vào cung)
 */
const ComboLine = ({ starAIndex, starBIndex, totalStars, color, visible }) => {
  const lineRef = useRef();
  const scaleRef = useRef(0);
  
  useFrame((state) => {
    if (!lineRef.current) return;
    const target = visible ? 1 : 0;
    scaleRef.current += (target - scaleRef.current) * 0.06;
    lineRef.current.visible = scaleRef.current > 0.01;
  });

  // Tạo geometry đơn giản nối 2 điểm (sẽ update vị trí mỗi frame)
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <line ref={lineRef} geometry={geometry} visible={false}>
      <lineBasicMaterial color={color} transparent opacity={0.4} />
    </line>
  );
};

/**
 * SatelliteStars - renders all satellites for a planet
 * Now supports structured star data (chinhTinh/phuTinh/tuHoa)
 * 
 * @param {string[]} stars - flat array (backward-compatible)
 * @param {string[]} chinhTinh - chính tinh array (new format)
 * @param {string[]} phuTinh - phụ tinh array (new format)
 * @param {string[]} tuHoa - tứ hóa array (new format)
 * @param {boolean} isFocused - whether this planet is selected
 * @param {string} elementColor - color from the planet's element
 */
export default function SatelliteStars({ stars, chinhTinh, phuTinh, tuHoa, isFocused, elementColor }) {
  // Build unified star list — preferring structured format, fallback to flat
  const allStars = useMemo(() => {
    if (chinhTinh || phuTinh || tuHoa) {
      return [
        ...(chinhTinh || []),
        ...(tuHoa || []),
        ...(phuTinh || []),
      ];
    }
    return stars || [];
  }, [stars, chinhTinh, phuTinh, tuHoa]);

  // Compute visual configs for each star
  const starConfigs = useMemo(() => {
    return allStars.map((name, i) => ({
      name,
      config: getStarVisualConfig(name, i, allStars.length, elementColor),
    }));
  }, [allStars, elementColor]);

  // Find active combos for display
  const combos = useMemo(() => findActiveCombos(allStars), [allStars]);

  if (!allStars || allStars.length === 0) return null;

  // Find first chính tinh for orbit ring
  const firstChinhTinh = starConfigs.find(s => isChinhTinh(s.name));

  return (
    <group>
      {/* Main star orbit ring */}
      <SatelliteOrbitRing radius={2.8} visible={isFocused} />
      
      {/* Tứ Hóa orbit ring (separate layer) */}
      {tuHoa && tuHoa.length > 0 && (
        <SatelliteOrbitRing radius={3.0} visible={isFocused} color="#9370DB" />
      )}

      {/* All satellites */}
      {starConfigs.map(({ name, config }, i) => (
        <Satellite
          key={name}
          name={name}
          config={config}
          index={i}
          total={allStars.length}
          visible={isFocused}
        />
      ))}
    </group>
  );
}
