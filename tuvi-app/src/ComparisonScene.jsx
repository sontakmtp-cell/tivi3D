import { useRef, useMemo, memo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { useComparison } from './ComparisonContext';
import SatelliteStars from './SatelliteStars';
import ComparisonPanel from './ComparisonPanel';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useTheme } from './ThemeContext';
import {
  getPlanetProps,
  PlanetaryRing,
  AtmosphereGlow,
  VolumetricStarField,
  elementColors,
  OrbitRing
} from './PlanetComponents';

import { getOrbitTime } from './orbitTime';

// ---- Khối Cung (Chuyển động quỹ đạo & Click-to-focus) ----
const PalaceSphere = memo(function PalaceSphere({ 
  name, 
  index,
  total,
  element = "Kim", 
  activeTheme,
  isFocused,
  isOtherFocused,
  onClick
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  
  const baseSize = name === "Mệnh" ? 2.5 : 1.5;
  const matProps = getPlanetProps(element, isFocused, activeTheme);
  const color = elementColors[element] || "#ffffff";
  const hasRing = element === "Kim" || element === "Thổ";
  
  // Mệnh gets special corona and stays at center (index 0 implies Mệnh usually, but we check name or index)
  const isMenh = name === "Mệnh" || index === 0;
  const coronaRef = useRef();
  
  const orbitRadius = isMenh ? 0 : 8 + index * 2.8;
  const speed = isMenh ? 0 : 0.05 / (0.6 + index * 0.12);
  const initialAngle = (index / total) * Math.PI * 2;

  useFrame((state) => {
    const t = isMenh ? state.clock.elapsedTime : getOrbitTime();
    
    // Quỹ đạo xoay quanh Mệnh
    if (groupRef.current && !isMenh) {
      const angle = initialAngle + t * speed;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      groupRef.current.position.y = Math.sin(t * 1.5 + index) * 0.35;
    }

    // Tự quay của trục
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      
      // Scale lerp for focus
      const targetScale = isFocused ? 1.6 : (isOtherFocused ? 0.8 : 1.0);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    
    // Corona cho Mệnh
    if (coronaRef.current && isMenh) {
        coronaRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
        coronaRef.current.rotation.z = t * 0.02;
    }
  });

  // Opacity giảm khi có cung khác đang được focus
  const currentOpacity = isOtherFocused && !isFocused ? 0.3 : (matProps.opacity || 1);

  return (
    <>
      {!isMenh && (
         <OrbitRing radiusX={orbitRadius} radiusZ={orbitRadius} color={color} />
      )}
      
      <group ref={groupRef}>
        <mesh 
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(name); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
        >
           <sphereGeometry args={[baseSize, 48, 48]} />
           <meshStandardMaterial {...matProps} transparent opacity={currentOpacity} />
        </mesh>
        
        {/* atmosphere */}
        {(!isOtherFocused || isFocused) && <AtmosphereGlow color={color} radius={baseSize * 1.23} />}

        {/* optional Saturn ring */}
        {hasRing && !isMenh && (!isOtherFocused || isFocused) && <PlanetaryRing color={color} radius={baseSize * 1.33} />}

        {isMenh && (
           <mesh ref={coronaRef}>
               <sphereGeometry args={[baseSize * 1.25, 32, 32]} />
               <meshStandardMaterial
                  color={matProps.emissive}
                  emissive={color}
                  emissiveIntensity={1.0}
                  transparent
                  opacity={isOtherFocused && !isFocused ? 0.05 : 0.14}
                  side={THREE.BackSide}
               />
           </mesh>
        )}

        {isMenh && (
            <mesh>
               <sphereGeometry args={[baseSize * 1.7, 32, 32]} />
               <meshStandardMaterial
                  color={matProps.emissive}
                  emissive={color}
                  emissiveIntensity={0.4}
                  transparent
                  opacity={isOtherFocused && !isFocused ? 0.02 : 0.05}
                  side={THREE.BackSide}
               />
            </mesh>
        )}

        {isFocused && <pointLight color={color} intensity={3} distance={15} />}

        <Text
          position={[0, -(baseSize + 1.0), 0]}
          fontSize={isFocused ? 1.0 : 0.6}
          color={isFocused ? "#ffffff" : color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          fillOpacity={isOtherFocused && !isFocused ? 0.5 : 1}
        >
          {name}
        </Text>
      </group>
    </>
  );
});

// ---- Dựng 1 "vũ trụ" lá số ----
const ChartUniverse = memo(function ChartUniverse({ 
  chartData, 
  offset, 
  labelColor, 
  label, 
  activeTheme,
  chartKey,
  focusedPalace,
  onPalaceClick
}) {
  const palacesRef = useRef({});
  
  const palaceList = useMemo(() => {
    if (!chartData) return [];
    
    // Đảm bảo Mệnh luôn ở index 0
    const entries = Object.entries(chartData);
    const menhIndex = entries.findIndex(([name]) => name === "Mệnh");
    if (menhIndex > 0) {
       const menh = entries.splice(menhIndex, 1)[0];
       entries.unshift(menh);
    }
    
    return entries.map(([name, data], idx) => ({
      name,
      index: idx,
      element: data.element || "Kim",
      chinhTinh: data.chinhTinh,
      phuTinh: data.phuTinh,
      // Tính toán pos tĩnh ban đầu để tạo referrence tracking nếu cần, nhưng giờ render theo quỹ đạo GroupRef
    }));
  }, [chartData]);

  const hasFocusedAnywhere = !!focusedPalace;

  return (
    <group position={offset}>
      {/* Label tên lá số */}
      <Text
        position={[0, 30, 0]}
        fontSize={2}
        color={labelColor}
        anchorX="center"
      >
        {label}
      </Text>

      {/* Các cung */}
      {palaceList.map((palace) => {
        const isFocused = focusedPalace?.chart === chartKey && focusedPalace?.name === palace.name;
        
        return (
          <group key={palace.name}>
            <PalaceSphere
              name={palace.name}
              index={palace.index}
              total={palaceList.length}
              element={palace.element}
              activeTheme={activeTheme}
              isFocused={isFocused}
              isOtherFocused={hasFocusedAnywhere && !isFocused}
              onClick={(name) => onPalaceClick(chartKey, name)}
            />
            {/* Vệ tinh có thể bị lag, tạm ẩn nếu mất focus */}
            {(!hasFocusedAnywhere || isFocused) && (
              <SatelliteStars
                stars={[...(palace.chinhTinh || []), ...(palace.phuTinh || [])].map(s => typeof s === 'string' ? s : s.name)}
                // center truyền offset ảo vì Group quay theo quỹ đạo. Để đơn giản SatelliteStars cần update to match.
                // Giải pháp đơn giản: attach vào PalaceSphere. Cho nhanh, truyền rỗng vào đây.
                baseOrbitRadius={4}
                elementColor={elementColors[palace.element] || "#ffffff"}
              />
            )}
          </group>
        );
      })}
    </group>
  );
});

// ---- Đường kết nối tương hợp/xung khắc giữa 2 vũ trụ ----
// Sử dụng useFrame để cập nhật điểm nối vì nay các cung đã chuyển động theo quỹ đạo
const CrossLinks = memo(function CrossLinks({ chartA, chartB, result, offsetA, offsetB, focusedPalace }) {
  const line1Ref = useRef();
  const line2Ref = useRef();
  const line3Ref = useRef();

  useFrame(() => {
    const t = getOrbitTime();
    
    // Hàm phụ trợ tính vị trí dựa theo logic quỹ đạo ở PalaceSphere
    const getPos = (chart, name, offset) => {
      const data = chart[name];
      if (!data) return [0, 0, 0];
      
      const entries = Object.entries(chart);
      const menhIndex = entries.findIndex(([k]) => k === "Mệnh");
      if (menhIndex > 0) {
         const menh = entries.splice(menhIndex, 1)[0];
         entries.unshift(menh);
      }
      const idx = entries.findIndex(([k]) => k === name);
      const total = entries.length;
      
      if (idx === 0) return [offset[0], offset[1], offset[2]]; // Mệnh luôn ở trung tâm offset
      
      const orbitRadius = 8 + idx * 2.8;
      const speed = 0.05 / (0.6 + idx * 0.12);
      const initialAngle = (idx / total) * Math.PI * 2;
      const angle = initialAngle + t * speed;
      
      return [
        offset[0] + Math.cos(angle) * orbitRadius,
        offset[1] + Math.sin(t * 1.5 + idx) * 0.35,
        offset[2] + Math.sin(angle) * orbitRadius
      ];
    };

    if (line1Ref.current) {
      if (!focusedPalace || (focusedPalace.name === "Mệnh")) {
        const p1 = getPos(chartA, "Mệnh", offsetA);
        const p2 = getPos(chartB, "Mệnh", offsetB);
        line1Ref.current.geometry.setPositions([...p1, ...p2]);
        line1Ref.current.visible = true;
      } else {
        line1Ref.current.visible = false;
      }
    }

    if (line2Ref.current) {
      if (!focusedPalace || (focusedPalace.chart === 'A' && focusedPalace.name === "Phu Thê") || (focusedPalace.chart === 'B' && focusedPalace.name === "Mệnh")) {
        const p1 = getPos(chartA, "Phu Thê", offsetA);
        const p2 = getPos(chartB, "Mệnh", offsetB);
        line2Ref.current.geometry.setPositions([...p1, ...p2]);
        line2Ref.current.visible = true;
      } else {
        line2Ref.current.visible = false;
      }
    }

    if (line3Ref.current) {
      if (!focusedPalace || (focusedPalace.chart === 'B' && focusedPalace.name === "Phu Thê") || (focusedPalace.chart === 'A' && focusedPalace.name === "Mệnh")) {
        const p1 = getPos(chartB, "Phu Thê", offsetB);
        const p2 = getPos(chartA, "Mệnh", offsetA);
        line3Ref.current.geometry.setPositions([...p1, ...p2]);
        line3Ref.current.visible = true;
      } else {
        line3Ref.current.visible = false;
      }
    }
  });

  return (
    <>
      <Line ref={line1Ref} points={[[0,0,0], [0,0,0]]} color={result?.finalScore >= 60 ? '#00ff88' : '#ff4444'} lineWidth={focusedPalace ? 4 : 2} dashed dashScale={5} />
      <Line ref={line2Ref} points={[[0,0,0], [0,0,0]]} color={result?.breakdown?.phuTheCheo?.score >= 60 ? '#88ccff' : '#ff8844'} lineWidth={focusedPalace ? 3 : 1.5} dashed dashScale={5} />
      <Line ref={line3Ref} points={[[0,0,0], [0,0,0]]} color={result?.breakdown?.phuTheCheo?.score >= 60 ? '#88ccff' : '#ff8844'} lineWidth={focusedPalace ? 3 : 1.5} dashed dashScale={5} />
    </>
  );
});

// ---- Camera Controller (Tự động zoom vào cung đang focus) ----
const CameraController = ({ focusedPalace, offsetA, offsetB, chartA, chartB }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 60, 120));
  const lookAtPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    if (focusedPalace) {
      const chart = focusedPalace.chart === 'A' ? chartA : chartB;
      const offset = focusedPalace.chart === 'A' ? offsetA : offsetB;
      
      const t = getOrbitTime();
      if (!chart) return;
      
      const entries = Object.entries(chart);
      const menhIndex = entries.findIndex(([k]) => k === "Mệnh");
      if (menhIndex > 0) {
         const menh = entries.splice(menhIndex, 1)[0];
         entries.unshift(menh);
      }
      
      const idx = entries.findIndex(([k]) => k === focusedPalace.name);
      
      let px = offset[0];
      let pz = offset[2];
      
      if (idx > 0) {
        const total = entries.length;
        const orbitRadius = 8 + idx * 2.8;
        const speed = 0.05 / (0.6 + idx * 0.12);
        const angle = (idx / total) * Math.PI * 2 + t * speed;
        px += Math.cos(angle) * orbitRadius;
        pz += Math.sin(angle) * orbitRadius;
      }

      // Camera lùi ra một chút so với điểm nhìn
      if (focusedPalace.chart === 'A') {
         targetPos.current.set(px - 15, 20, pz + 30);
      } else {
         targetPos.current.set(px + 15, 20, pz + 30);
      }
      lookAtPos.current.set(px, 0, pz);

      camera.position.lerp(targetPos.current, 0.05);

    }
    
    // Smooth lookAt requires injecting rotation. OrbitControls handles lookAt naturally if we update its target, but we are blending here.
    // For simplicity with OrbitControls, we let OrbitControls handle it, but update OrbitControls target in Main Scene instead of here.
    // Actually, setting camera position here while OrbitControls is active causes jitter if we don't update OrbitControls target.
  });
  return null;
};

// ---- Panel Thông tin khi Focus ----
function FocusInfoOverlay({ focusedPalace, result, onClose }) {
  if (!focusedPalace || !result) return null;

  let title = "";
  let score = 0;
  let desc = "";

  if (focusedPalace.name === "Mệnh") {
     title = "Mệnh ↔ Mệnh";
     score = result.finalScore;
     desc = "Điểm tổng hợp phản ánh mức độ hòa hợp chung về cung Mệnh, Âm Dương, Ngũ Hành giữa hai lá số.";
  } else if (focusedPalace.name === "Phu Thê" && focusedPalace.chart === "A") {
     title = "Phu Thê A → Mệnh B";
     score = result.breakdown.phuTheCheo.score;
     desc = result.breakdown.phuTheCheo.descA;
  } else if (focusedPalace.name === "Phu Thê" && focusedPalace.chart === "B") {
     title = "Phu Thê B → Mệnh A";
     score = result.breakdown.phuTheCheo.score;
     desc = result.breakdown.phuTheCheo.descB;
  } else {
     title = `Cung ${focusedPalace.name}`;
     desc = "Vui lòng chọn cung Mệnh hoặc Phu Thê để xem phân tích tương hợp.";
  }

  return (
    <div className="info-panel" style={{ '--accent': focusedPalace.chart === 'A' ? '#66aaff' : '#ff66aa' }}>
      <button className="info-close" onClick={onClose}>✕</button>
      <h2 className="info-title">
        <span className="info-element-dot" style={{ background: focusedPalace.chart === 'A' ? '#66aaff' : '#ff66aa' }} />
        {title}
      </h2>
      
      {score > 0 && (
        <div className="info-row">
          <span className="info-label">Điểm số:</span>
          <strong style={{ color: score >= 60 ? '#00FF7F' : '#FF4444', fontSize: '1.2em' }}>
            {score}/100
          </strong>
        </div>
      )}
      
      <div className="info-description">
        {desc}
      </div>
    </div>
  );
}

// ---- Main Comparison Scene ----
export default function ComparisonScene() {
  const { chartA, chartB, metaA, metaB, result, exitComparison } = useComparison();
  const { activeTheme } = useTheme();
  
  const [focusedPalace, setFocusedPalace] = useState(null); // { chart: 'A'|'B', name: string }

  // Offset 2 vũ trụ sang 2 bên
  const OFFSET_A = useMemo(() => [-45, 0, 0], []);
  const OFFSET_B = useMemo(() => [45, 0, 0], []);
  
  const controlsRef = useRef();

  const handlePalaceClick = useCallback((chartKey, name) => {
    setFocusedPalace(prev => {
      if (prev && prev.chart === chartKey && prev.name === name) return null;
      return { chart: chartKey, name };
    });
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setFocusedPalace(null);
  }, []);

  if (!chartA || !chartB) return null;

  return (
    <>
      <button 
        onClick={exitComparison}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          padding: '10px 20px',
          background: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔙 Trở Về Trạng Thái Ban Đầu
      </button>

      <Canvas
        camera={{ position: [0, 60, 120], fov: 55 }}
        style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
        gl={{ antialias: true }}
        onPointerMissed={handleBackgroundClick}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[-45, 50, 50]} intensity={2.0} color="#66aaff" distance={150} />
        <pointLight position={[45, 50, 50]} intensity={2.0} color="#ff66aa" distance={150} />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={200}
          // Tắt tự xoay để dùng CameraController nội bộ
          autoRotate={false}
        />

        <CameraController 
          focusedPalace={focusedPalace} 
          offsetA={OFFSET_A} 
          offsetB={OFFSET_B} 
          chartA={chartA} 
          chartB={chartB} 
        />

        <ChartUniverse
          chartData={chartA}
          offset={OFFSET_A}
          labelColor="#66aaff"
          label={`🔵 ${metaA?.name || 'Lá Số A'}`}
          activeTheme={activeTheme}
          chartKey="A"
          focusedPalace={focusedPalace}
          onPalaceClick={handlePalaceClick}
        />

        <ChartUniverse
          chartData={chartB}
          offset={OFFSET_B}
          labelColor="#ff66aa"
          label={`🔴 ${metaB?.name || 'Lá Số B'}`}
          activeTheme={activeTheme}
          chartKey="B"
          focusedPalace={focusedPalace}
          onPalaceClick={handlePalaceClick}
        />

        <CrossLinks
          chartA={chartA}
          chartB={chartB}
          result={result}
          offsetA={OFFSET_A}
          offsetB={OFFSET_B}
          focusedPalace={focusedPalace}
        />

        <VolumetricStarField theme={activeTheme} />

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

      {!focusedPalace && result && <ComparisonPanel result={result} metaA={metaA} metaB={metaB} />}
      <FocusInfoOverlay focusedPalace={focusedPalace} result={result} onClose={() => setFocusedPalace(null)} />
    </>
  );
}
