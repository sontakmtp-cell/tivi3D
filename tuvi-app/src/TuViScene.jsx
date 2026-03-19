import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MapControls, Html, Stars, Billboard, Text, Sphere, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import PalaceNav from './PalaceNav';
import ConnectionLines from './ConnectionLines';
import { getTamHopForPalace, getXungChieuForPalace, getNhiHopForPalace } from './relationships';
import SatelliteStars from './SatelliteStars';
import { getOrbitTime, updateOrbitTime } from './orbitTime';
import { calculateExtendedPalaceScore } from './starScores';
import { useTheme } from './ThemeContext';
import { getAllStars } from './data/dataAdapter';

import {
  elementColors,
  elementEmissive,
  getPlanetProps,
  OrbitRing,
  PlanetaryRing,
  AtmosphereGlow,
  VolumetricStarField
} from './PlanetComponents';
/* ── Orbit Time Manager (single source of truth) ── */
const OrbitTimeManager = ({ paused }) => {
  useFrame((state) => {
    updateOrbitTime(state.clock.elapsedTime, paused);
  });
  return null;
};

/* ── Planet component ── */
const Planet = ({ data, index, total, isFocused, paused, onClick, orbitSpeed = 0.05, activeTheme, palaceScore }) => {
  const meshRef = useRef();
  const groupRef = useRef();

  // each planet gets its own orbit radius & base speed
  const orbitRadius = 8 + index * 2.8;
  
  // Use palaceScore to influence speed and size.
  let speedMultiplier = 1;
  let sizeMultiplier = 1;
  if (typeof palaceScore === 'number') {
    // Speed mapping: faster based on absolute value of score
    let absScore = Math.abs(palaceScore);
    speedMultiplier = 1 + (absScore / 15);
    speedMultiplier = Math.max(0.05, Math.min(speedMultiplier, 6.0));
    
    // Direction: negative score orbits counter-clockwise
    if (palaceScore < 0) {
      speedMultiplier *= -1;
    }
    
    // Size mapping: -30 -> ~0.5, +30 -> ~1.5
    sizeMultiplier = 1 + (palaceScore / 60);
    sizeMultiplier = Math.max(0.6, Math.min(sizeMultiplier, 1.8));
  }
  
  const speed = (orbitSpeed * speedMultiplier) / (0.6 + index * 0.12);
  const baseSize = 1.5 * sizeMultiplier;

  const initialAngle = (index / total) * Math.PI * 2;
  const color = elementColors[data.element] || "#ffffff";
  const matProps = getPlanetProps(data.element, isFocused, activeTheme);

  // show ring for every 3rd planet or Kim/Thổ elements
  const hasRing = data.element === "Kim" || data.element === "Thổ" || index % 4 === 0;

  useFrame(() => {
    if (!groupRef.current) return;
    const t = getOrbitTime();
    const angle = initialAngle + t * speed;
    groupRef.current.position.x = Math.cos(angle) * orbitRadius;
    groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    groupRef.current.position.y = Math.sin(t * 1.5 + index) * 0.35;

    if (meshRef.current) {
      meshRef.current.rotation.y += paused ? 0 : 0.008;
      if (isFocused) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.6, 1.6, 1.6), 0.08);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
      }
    }
  });

  return (
    <>
      {/* orbit ring */}
      <OrbitRing
        radiusX={orbitRadius}
        radiusZ={orbitRadius}
        color={color}
      />

      <group ref={groupRef}>
        {/* planet sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(data.id); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[baseSize, 48, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>

        {/* atmosphere */}
        <AtmosphereGlow color={color} radius={baseSize * 1.23} />

        {/* optional Saturn ring */}
        {hasRing && <PlanetaryRing color={color} radius={baseSize * 1.33} />}

        {/* point light on focused planet */}
        {isFocused && <pointLight color={color} intensity={3} distance={12} />}

        {/* satellite stars (chính tinh, phụ tinh, tứ hóa) */}
        <SatelliteStars
          stars={getAllStars(data)}
          chinhTinh={data.chinhTinh}
          phuTinh={data.phuTinh}
          tuHoa={data.tuHoa}
          isFocused={isFocused}
          elementColor={color}
        />

        {/* label */}
        <Billboard>
          <Text
            position={[0, -(baseSize + 1.0), 0]}
            fontSize={isFocused ? 0.75 : 0.5}
            color={isFocused ? "#ffffff" : color}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {data.name}
          </Text>
        </Billboard>
      </group>
    </>
  );
};

/* ── Cung Mệnh (Central body – replaces Sun) ── */
const MENH_ID = 1;
const CungMenh = ({ data, isFocused, onClick, activeTheme }) => {
  const meshRef = useRef();
  const coronaRef = useRef();
  const color = elementColors[data.element] || "#3498DB";
  const emissive = elementEmissive[data.element] || "#00BFFF";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
      if (isFocused) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.08);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
      }
    }
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
      coronaRef.current.rotation.z = t * 0.02;
    }
  });

  return (
    <group>
      {/* core */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(data.id); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isFocused ? (activeTheme === 'mystical' ? 4.0 : 3.0) : (activeTheme === 'mystical' ? 3.0 : 2.2)}
          roughness={activeTheme === 'asian' ? 0.7 : 0.25}
          metalness={activeTheme === 'asian' ? 0.2 : 0.4}
          transparent
          opacity={0.92}
          wireframe={activeTheme === 'scifi'}
        />
      </mesh>

      {/* corona glow */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshStandardMaterial
          color={emissive}
          emissive={color}
          emissiveIntensity={1.0}
          transparent
          opacity={0.14}
          side={THREE.BackSide}
        />
      </mesh>

      {/* outer glow */}
      <mesh>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshStandardMaterial
          color={emissive}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* main light */}
      <pointLight position={[0, 0, 0]} intensity={4} distance={80} color={emissive} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={120} color={color} />

      {/* focused point light */}
      {isFocused && <pointLight color={color} intensity={5} distance={15} />}

      {/* satellite stars */}
      <SatelliteStars
        stars={getAllStars(data)}
        chinhTinh={data.chinhTinh}
        phuTinh={data.phuTinh}
        tuHoa={data.tuHoa}
        isFocused={isFocused}
        elementColor={color}
      />

      {/* title */}
      <Billboard>
        <Text
          position={[0, -4.2, 0]}
          fontSize={isFocused ? 1.0 : 0.8}
          color={isFocused ? "#ffffff" : emissive}
          letterSpacing={0.15}
          font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6xpmIyXjU1pg.ttf"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          CUNG MỆNH
        </Text>
      </Billboard>
    </group>
  );
};

/* ── Camera Controller (no auto-zoom, user controls freely) ── */
const CameraController = () => {
  return null;
};

/* ── Collapsible Description Components ── */
const CollapsibleSection = ({ title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="collapsible-section">
      <div className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span className={`collapsible-icon ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div className={`collapsible-content ${isOpen ? 'open' : ''}`}>
        {content}
      </div>
    </div>
  );
};

const ParsedDescription = ({ text }) => {
  if (!text) return null;
  
  // Try to find the splitting point: "Lời giải cho cung..." or "Luận giải:"
  const splitRegex = /(?:\n\s*)(?:Lời giải|Luận giải)[^\n]*(?:\n|$)/i;
  const match = text.match(splitRegex);
  
  let part1 = "";
  let part2 = "";
  
  if (match) {
    const splitIndex = match.index;
    part1 = text.substring(0, splitIndex).trim();
    part2 = text.substring(splitIndex + match[0].length).trim();
  } else {
    // If no clear split, just put everything as "Lời giải cho cung"
    part2 = text.trim();
  }
  
  return (
    <div className="collapsible-container">
      {part1 && (
        <CollapsibleSection
          title="Cách xem cung"
          content={part1}
          defaultOpen={true}
        />
      )}
      {part2 && (
        <CollapsibleSection
          title="Lời giải cho cung"
          content={part2}
          defaultOpen={!part1}
        />
      )}
    </div>
  );
};

/* ── Info Panel (HTML overlay, right side) ── */
const InfoPanel = ({ data, onClose, allPalacesData, metaData, onUpdateDescription }) => {
  const [isInterpreting, setIsInterpreting] = useState(false);

  if (!data) return null;

  const handleInterpretPalace = async () => {
    if (!metaData || !data) return;
    setIsInterpreting(true);
    try {
      const res = await fetch('http://localhost:8000/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palaces: [data], meta: metaData, mode: 'each' })
      });
      if (!res.ok) throw new Error("API Error");
      const result = await res.json();
      if (result.interpretations && result.interpretations.length > 0) {
        onUpdateDescription(data.id, result.interpretations[0].interpretation);
      }
    } catch (err) {
      alert("Lỗi luận giải: " + err.message);
    } finally {
      setIsInterpreting(false);
    }
  };

  const color = elementColors[data.element] || "#ffffff";
  const tamHopGroups = getTamHopForPalace(data.id);
  const xungChieuPairs = getXungChieuForPalace(data.id);
  const nhiHopPairsArr = getNhiHopForPalace(data.id);
  
  const scoreInfo = calculateExtendedPalaceScore(data.id, allPalacesData);

  return (
    <div id="info-panel" className="info-panel" style={{ '--accent': color }}>
      <button className="info-close" onClick={onClose}>✕</button>

      <h2 className="info-title">
        <span className="info-element-dot" style={{ background: color }} />
        Cung {data.name}
      </h2>

      <div className="info-row">
        <span className="info-label">Hành:</span>
        <span className="info-value" style={{ color }}>{data.element}</span>
      </div>

      {/* Relationship section */}
      <div className="info-relationships">
        <div className="info-rel-group">
          <span className="info-rel-icon" style={{ color: '#FFD700' }}>▲</span>
          <span className="info-rel-label">Tam Hợp:</span>
          {tamHopGroups.map(g => (
            <span key={g.name} className="info-rel-badge" style={{
              borderColor: g.color, color: g.color
            }}>{g.name}</span>
          ))}
        </div>
        <div className="info-rel-group">
          <span className="info-rel-icon" style={{ color: '#FF4444' }}>⟷</span>
          <span className="info-rel-label">Xung Chiếu:</span>
          {xungChieuPairs.map(p => (
            <span key={p.name} className="info-rel-badge" style={{
              borderColor: '#FF4444', color: '#FF6666'
            }}>{p.name}</span>
          ))}
        </div>
        <div className="info-rel-group">
          <span className="info-rel-icon" style={{ color: '#9370DB' }}>⚄</span>
          <span className="info-rel-label">Nhị Hợp:</span>
          {nhiHopPairsArr.map(p => (
            <span key={p.name} className="info-rel-badge" style={{
              borderColor: '#9370DB', color: '#B19CD9'
            }}>{p.name}</span>
          ))}
        </div>
      </div>

      <div className="info-row" style={{ marginTop: '10px', marginBottom: '5px' }}>
        <span className="info-label">Độ Cát/Hung (Tính cả Tam hợp, Xung chiếu, Nhị hợp):</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85em', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Bản Cung:</span>
          <span>{scoreInfo.base.total > 0 ? `+${scoreInfo.base.total}` : scoreInfo.base.total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Tam Hợp:</span>
          <span>{scoreInfo.tamHop.total > 0 ? `+${Number(scoreInfo.tamHop.total.toFixed(1))}` : Number(scoreInfo.tamHop.total.toFixed(1))}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Xung Chiếu:</span>
          <span>{scoreInfo.xungChieu.total > 0 ? `+${Number(scoreInfo.xungChieu.total.toFixed(1))}` : Number(scoreInfo.xungChieu.total.toFixed(1))}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Nhị Hợp:</span>
          <span>{Math.round(scoreInfo.nhiHop.total) > 0 ? `+${Math.round(scoreInfo.nhiHop.total)}` : Math.round(scoreInfo.nhiHop.total)}</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '4px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
          <strong>Tổng Điểm:</strong>
          <strong style={{ color: scoreInfo.final.total >= 0 ? '#00FF7F' : '#FF4444' }}>
            {scoreInfo.final.total > 0 ? `+${Number(scoreInfo.final.total.toFixed(1))}` : Number(scoreInfo.final.total.toFixed(1))}
          </strong>
        </div>
      </div>

      {/* Star combos */}
      {scoreInfo.activeCombos && scoreInfo.activeCombos.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div className="info-row">
            <span className="info-label">Bộ sao trong cung:</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85em', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
            {scoreInfo.activeCombos.map(combo => (
              <div key={combo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: combo.color }}>
                  {combo.type === 'synergy' ? '✦' : combo.type === 'conflict' ? '⚠' : '◆'} {combo.name}
                </span>
                <span style={{ color: combo.bonusScore >= 0 ? '#00FF7F' : '#FF4444', fontSize: '0.9em' }}>
                  {combo.bonusScore > 0 ? `+${combo.bonusScore}` : combo.bonusScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-row" style={{ marginTop: '15px' }}>
        <span className="info-label">Chính tinh:</span>
      </div>
      <div className="info-stars">
        {(data.chinhTinh || []).map(star => (
          <span key={star} className="info-star-badge" style={{
            background: '#FFD70020',
            border: '1px solid #FFD70080',
            color: '#FFD700'
          }}>
            ★ {star}
          </span>
        ))}
        {(!data.chinhTinh || data.chinhTinh.length === 0) && (
          <span style={{ opacity: 0.5, fontSize: '0.85em' }}>Không có</span>
        )}
      </div>

      {data.tuHoa && data.tuHoa.length > 0 && (
        <>
          <div className="info-row" style={{ marginTop: '8px' }}>
            <span className="info-label">Tứ Hóa:</span>
          </div>
          <div className="info-stars">
            {data.tuHoa.map(star => (
              <span key={star} className="info-star-badge" style={{
                background: '#9370DB20',
                border: '1px solid #9370DB80',
                color: '#9370DB'
              }}>
                ✦ {star}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="info-row" style={{ marginTop: '8px' }}>
        <span className="info-label">Phụ tinh:</span>
      </div>
      <div className="info-stars">
        {(data.phuTinh || getAllStars(data).filter(s => !(data.chinhTinh || []).includes(s) && !(data.tuHoa || []).includes(s))).map(star => (
          <span key={star} className="info-star-badge" style={{
            background: `${color}18`,
            border: `1px solid ${color}55`
          }}>
            {star}
          </span>
        ))}
      </div>

      <div className="info-description">
        {data.description}
      </div>

      {data.detailedDescription ? (
        <div className="info-detailed">
          <ParsedDescription text={data.detailedDescription} />
        </div>
      ) : (
        metaData && (
          <button 
            className="submit-btn" 
            onClick={handleInterpretPalace} 
            disabled={isInterpreting}
            style={{ marginTop: '20px', background: 'rgba(147, 112, 219, 0.2)', borderColor: 'rgba(147, 112, 219, 0.5)' }}
          >
            {isInterpreting ? 'Đang luận giải...' : '✨ Luận Giải Cung Này Bằng AI'}
          </button>
        )
      )}
    </div>
  );
};

/* ── Connection Toggle Controls ── */
const ConnectionToggle = ({ showTamHop, showXungChieu, onToggleTamHop, onToggleXungChieu, hasFocused }) => {
  return (
    <div className={`connection-toggle ${hasFocused ? 'toggle-visible' : ''}`}>
      <button
        className={`toggle-btn ${showTamHop ? 'toggle-active' : ''}`}
        onClick={onToggleTamHop}
        style={{ '--toggle-color': '#FFD700' }}
      >
        <span className="toggle-icon">▲</span>
        Tam Hợp
      </button>
      <button
        className={`toggle-btn ${showXungChieu ? 'toggle-active' : ''}`}
        onClick={onToggleXungChieu}
        style={{ '--toggle-color': '#FF4444' }}
      >
        <span className="toggle-icon">⟷</span>
        Xung Chiếu
      </button>
    </div>
  );
};

/* ── Main Scene ── */
export default function TuViScene({ data, metaData, onUpdateDescription }) {
  const [focusedId, setFocusedId] = useState(null);
  const [showTamHop, setShowTamHop] = useState(true);
  const [showXungChieu, setShowXungChieu] = useState(true);
  const { activeTheme } = useTheme();

  const handlePalaceClick = useCallback((id) => {
    setFocusedId(prev => prev === id ? null : id);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setFocusedId(null);
  }, []);

  const menhData = data.find(p => p.id === MENH_ID);
  const orbitingPalaces = data.filter(p => p.id !== MENH_ID);

  const focusedData = focusedId ? data.find(p => p.id === focusedId) : null;
  const focusedIndex = focusedId ? data.findIndex(p => p.id === focusedId) : null;

  return (
    <div className="scene-root">
      {/* 3D canvas */}
      <Canvas camera={{ position: [0, 35, 55], fov: 45 }} onPointerMissed={handleBackgroundClick}>
        <ambientLight intensity={0.08} />

        <OrbitTimeManager paused={!!focusedId} />

        <VolumetricStarField theme={activeTheme} />

        {activeTheme === 'scifi' && (
          <Grid infiniteGrid fadeDistance={150} sectionColor="#00ffff" cellColor="#004488" position={[0, -10, 0]} />
        )}

        {/* Cung Mệnh at center */}
        <CungMenh
          data={menhData}
          isFocused={focusedId === MENH_ID}
          onClick={handlePalaceClick}
          activeTheme={activeTheme}
        />

        {/* 11 remaining palaces orbiting around Cung Mệnh */}
        {orbitingPalaces.map((palace, index) => {
          // Calculate score to affect speed
          const scoreInfo = calculateExtendedPalaceScore(palace.id, data);
          const totalScore = scoreInfo ? scoreInfo.final.total : 0;
          
          return (
            <Planet
              key={palace.id}
              data={palace}
              index={index}
              total={orbitingPalaces.length}
              isFocused={focusedId === palace.id}
              paused={!!focusedId}
              onClick={handlePalaceClick}
              activeTheme={activeTheme}
              palaceScore={totalScore}
            />
          );
        })}

        {/* Connection lines for Tam Hợp & Xung Chiếu */}
        <ConnectionLines
          focusedId={focusedId}
          palaces={data}
          showTamHop={showTamHop}
          showXungChieu={showXungChieu}
        />

        <CameraController focusedIndex={focusedIndex} />

        <MapControls
          enablePan={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={12}
          maxDistance={120}
          autoRotate={!focusedId}
          autoRotateSpeed={0.2}
        />

        {/* Post-processing */}
        <EffectComposer>
          <Bloom
            intensity={activeTheme === 'mystical' ? 2.0 : (activeTheme === 'scifi' ? 1.2 : 0.8)}
            luminanceThreshold={activeTheme === 'asian' ? 0.35 : 0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0005, 0.0005]}
          />
        </EffectComposer>
      </Canvas>

      {/* Navigation sidebar */}
      <PalaceNav
        palaces={data}
        focusedId={focusedId}
        onSelect={handlePalaceClick}
      />

      {/* Connection toggle controls */}
      <ConnectionToggle
        showTamHop={showTamHop}
        showXungChieu={showXungChieu}
        onToggleTamHop={() => setShowTamHop(prev => !prev)}
        onToggleXungChieu={() => setShowXungChieu(prev => !prev)}
        hasFocused={!!focusedId}
      />

      {/* Info panel overlay */}
      <InfoPanel 
        data={focusedData} 
        allPalacesData={data} 
        onClose={() => setFocusedId(null)} 
        metaData={metaData}
        onUpdateDescription={onUpdateDescription}
      />
    </div>
  );
}
