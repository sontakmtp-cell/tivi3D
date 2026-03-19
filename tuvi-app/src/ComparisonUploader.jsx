import { useCallback, useRef, useState } from 'react';
import { useComparison } from './ComparisonContext';

const CHINH_TINH_LIST = [
  "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
  "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương",
  "Thất Sát", "Phá Quân"
];

function transformArrayToChartData(arr, fileName) {
  const meta = {
    name: fileName.replace(/\.json$/i, ''),
    nguHanh: "Thổ",
    diaChi: "Tý",
    gioiTinh: "Nam"
  };
  
  const menh = arr.find(p => p.name === "Mệnh");
  if (menh) {
    const matchNguHanh = menh.detailedDescription?.match(/Mệnh\s+(Kim|Mộc|Thủy|Hỏa|Thổ)/i);
    if (matchNguHanh) meta.nguHanh = matchNguHanh[1];
    
    const matchDiaChi = menh.description?.match(/an tại\s+([A-ZÀ-Ỹa-zà-ỹ]+)/i);
    if (matchDiaChi) {
      let chi = matchDiaChi[1].trim();
      if (chi === "Tị") chi = "Tỵ";
      meta.diaChi = chi;
    }
  }

  const planets = {};
  arr.forEach((p, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 25;
    
    const chinhTinh = [];
    const phuTinh = [];
    
    (p.stars || []).forEach(starName => {
      if (CHINH_TINH_LIST.includes(starName)) {
        chinhTinh.push({ name: starName, score: 70 });
      } else {
        phuTinh.push({ name: starName, score: 50 });
      }
    });

    planets[p.name] = {
      position: {
        x: Math.cos(angle) * r,
        y: (Math.random() - 0.5) * 10,
        z: Math.sin(angle) * r
      },
      element: p.element || "Kim",
      chinhTinh,
      phuTinh
    };
  });
  
  return { meta, planets };
}

function FileSlot({ label, which, onLoaded }) {
  const inputRef = useRef(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        let json = JSON.parse(evt.target.result);
        
        let planetsData = null;
        let metaData = null;

        if (Array.isArray(json)) {
          const transformed = transformArrayToChartData(json, file.name);
          planetsData = transformed.planets;
          metaData = transformed.meta;
        } else {
          // Expect: { meta: { nguHanh, diaChi, name }, planets: { ...planetsData } }
          if (!json.meta || !json.planets) {
            alert('File JSON phải chứa trường "meta" và "planets"');
            return;
          }
          planetsData = json.planets;
          metaData = json.meta;
        }

        onLoaded(which, planetsData, metaData);
      } catch (e) {
        console.error(e);
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  }, [which, onLoaded]);

  return (
    <div className="file-slot">
      <h3>{label}</h3>
      <button onClick={() => inputRef.current?.click()}>
        📂 Chọn File JSON
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}

export default function ComparisonUploader() {
  const { loadChart, chartA, chartB, metaA, metaB, enterComparison } = useComparison();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`comparison-uploader-wrapper ${isVisible ? 'active' : ''}`}>
      {!isVisible && (
        <button className="btn-toggle-uploader" onClick={() => setIsVisible(true)}>
          🔮 So Sánh Lá Số
        </button>
      )}

      {isVisible && (
        <div className="comparison-uploader">
          <button className="btn-close-uploader" onClick={() => setIsVisible(false)}>✕</button>
          <h2>🔮 So Sánh Lá Số Tử Vi</h2>
          <p>Tải lên 2 file JSON lá số để xem độ tương hợp.</p>
          
          <div className="slots-container">
            <FileSlot
              label={metaA ? `✅ ${metaA.name}` : "Lá Số A (Bản thân)"}
              which="A"
              onLoaded={loadChart}
            />
            <div className="vs-divider">VS</div>
            <FileSlot
              label={metaB ? `✅ ${metaB.name}` : "Lá Số B (Đối phương)"}
              which="B"
              onLoaded={loadChart}
            />
          </div>

          {chartA && chartB && (
            <button className="btn-compare" onClick={enterComparison}>
              ⚡ So Sánh Ngay
            </button>
          )}
        </div>
      )}
    </div>
  );
}
