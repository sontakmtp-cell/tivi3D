import React, { useState } from 'react';

const BirthInfoForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    ten: '',
    ngay: 1,
    thang: 1,
    nam: 2000,
    gio: 1,
    gioiTinh: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ten' ? value : parseInt(value, 10)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/laso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Lập Lá Số Tử Vi</h2>
        {error && <div className="error-msg" style={{ marginBottom: "12px" }}>{error}</div>}
        <form onSubmit={handleSubmit} className="birth-form">
          <div className="form-group">
            <label>Họ Tên</label>
            <input type="text" name="ten" placeholder="Nguyễn Văn A" value={formData.ten} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày (DL)</label>
              <input type="number" name="ngay" min="1" max="31" value={formData.ngay} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tháng (DL)</label>
              <input type="number" name="thang" min="1" max="12" value={formData.thang} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Năm (DL)</label>
              <input type="number" name="nam" min="1900" max="2100" value={formData.nam} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Giờ sinh</label>
              <select name="gio" value={formData.gio} onChange={handleChange}>
                <option value={1}>Tý (23g-01g)</option>
                <option value={2}>Sửu (01g-03g)</option>
                <option value={3}>Dần (03g-05g)</option>
                <option value={4}>Mão (05g-07g)</option>
                <option value={5}>Thìn (07g-09g)</option>
                <option value={6}>Tỵ (09g-11g)</option>
                <option value={7}>Ngọ (11g-13g)</option>
                <option value={8}>Mùi (13g-15g)</option>
                <option value={9}>Thân (15g-17g)</option>
                <option value={10}>Dậu (17g-19g)</option>
                <option value={11}>Tuất (19g-21g)</option>
                <option value={12}>Hợi (21g-23g)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Giới tính</label>
              <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange}>
                <option value={1}>Nam</option>
                <option value={-1}>Nữ</option>
              </select>
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Lập Lá Số'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BirthInfoForm;
