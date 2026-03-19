import React, { useState } from 'react';
import { tuViData } from './data';
import { adaptLegacyData } from './data/dataAdapter';
import TuViScene from './TuViScene';
import { ThemeProvider } from './ThemeContext';
import ThemeSelector from './ThemeSelector';
import { ComparisonProvider, useComparison } from './ComparisonContext';
import ComparisonUploader from './ComparisonUploader';
import ComparisonScene from './ComparisonScene';
import BirthInfoForm from './BirthInfoForm';
import './comparison.css';

function AppContent({ appData, metaData, handleFileUpload, errorMsg, handleLasoSuccess, handleUpdatePalaceDescription, handleInterpretFull, isInterpretingFull }) {
  const { mode } = useComparison();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="app-root" style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {mode === 'single' && (
        <>
          <div className="upload-container" style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="upload-btn" onClick={() => setShowForm(true)}>
                Lập Lá Số Tử Vi
              </button>
              <label htmlFor="file-upload" className="upload-btn" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                Tải dữ liệu (.json)
              </label>
              {metaData && (
                <button 
                  className="upload-btn" 
                  onClick={handleInterpretFull}
                  disabled={isInterpretingFull}
                  style={{ background: 'rgba(147, 112, 219, 0.2)', borderColor: 'rgba(147, 112, 219, 0.5)' }}
                >
                  {isInterpretingFull ? 'Đang luận giải...' : '✨ Luận Giải Tổng Quan AI'}
                </button>
              )}
            </div>
            <input 
              id="file-upload" 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
            />
            {errorMsg && <div className="error-msg">{errorMsg}</div>}
          </div>
          {showForm && (
            <BirthInfoForm 
              onClose={() => setShowForm(false)} 
              onSuccess={(data) => {
                handleLasoSuccess(data);
                setShowForm(false);
              }} 
            />
          )}
          <ThemeSelector />
          <TuViScene 
            data={appData} 
            metaData={metaData} 
            onUpdateDescription={handleUpdatePalaceDescription} 
          />
          <ComparisonUploader />
        </>
      )}
      {mode === 'comparison' && (
        <ComparisonScene />
      )}
    </div>
  );
}

function App() {
  const [appData, setAppData] = useState(tuViData);
  const [metaData, setMetaData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isInterpretingFull, setIsInterpretingFull] = useState(false);

  const handleUpdatePalaceDescription = (palaceId, text) => {
    setAppData(prev => prev.map(p => p.id === palaceId ? { ...p, detailedDescription: text } : p));
  };

  const handleInterpretFull = async () => {
    if (!metaData || !appData) return;
    setIsInterpretingFull(true);
    try {
      const res = await fetch('http://localhost:8000/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palaces: appData, meta: metaData, mode: 'full' })
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      // we can put the full interpretation in the menh palace or we need a global modal
      // For now, let's put it in the MENH palace's detailedDescription as it represents the overall body
      handleUpdatePalaceDescription(1, data.interpretation);
      alert("Luận giải tổng quan đã hoàn tất. Bạn có thể xem trong Cung Mệnh.");
    } catch (err) {
      alert("Lỗi khi luận giải: " + err.message);
    } finally {
      setIsInterpretingFull(false);
    }
  };

  const handleLasoSuccess = (data) => {
    if (data.palaces && Array.isArray(data.palaces)) {
      setAppData(adaptLegacyData(data.palaces));
      setMetaData(data.meta);
      setErrorMsg("");
    } else {
      setErrorMsg("Dữ liệu lá số trả về không hợp lệ.");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json) && json.length === 12) {
          setAppData(adaptLegacyData(json));
          setErrorMsg("");
        } else {
          setErrorMsg("Định dạng JSON không hợp lệ. Hệ thống cần mảng chứa đủ 12 cung Tử Vi.");
        }
      } catch (err) {
        setErrorMsg("Lỗi đọc file JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input so user can re-upload the same file if needed
    event.target.value = null;
  };

  return (
    <ThemeProvider>
      <ComparisonProvider>
        <AppContent 
          appData={appData} 
          metaData={metaData}
          handleFileUpload={handleFileUpload} 
          errorMsg={errorMsg} 
          handleLasoSuccess={handleLasoSuccess} 
          handleUpdatePalaceDescription={handleUpdatePalaceDescription}
          handleInterpretFull={handleInterpretFull}
          isInterpretingFull={isInterpretingFull}
        />
      </ComparisonProvider>
    </ThemeProvider>
  );
}

export default App;
