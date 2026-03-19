/**
 * starsDatabase.js — Cơ sở dữ liệu tất cả các sao Tử Vi
 * 
 * Mỗi sao có metadata: type (loại), element (hành), baseScore (điểm cơ bản)
 * Đây là single source of truth cho toàn hệ thống.
 */

// ── Phân loại sao ──
export const STAR_TYPES = {
  CHINH_TINH: 'chinhTinh',    // 14 chính tinh
  SAT_TINH: 'satTinh',        // 6 đại sát tinh  
  CAT_TINH: 'catTinh',        // Lục cát tinh + cát tinh khác
  TU_HOA: 'tuHoa',            // Hóa Lộc, Quyền, Khoa, Kỵ
  PHU_TINH: 'phuTinh',        // Phụ tinh thông thường
};

// ── Danh sách 14 Chính Tinh ──
export const CHINH_TINH_LIST = [
  "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
  "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương",
  "Thất Sát", "Phá Quân"
];

// ── Danh sách Tứ Hóa ──
export const TU_HOA_LIST = ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"];

// ── Danh sách 6 Đại Sát Tinh ──
export const SAT_TINH_LIST = ["Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp"];

// ── Danh sách Lục Cát Tinh ──
export const LUC_CAT_TINH_LIST = ["Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt"];

// ── Cơ sở dữ liệu toàn bộ sao ──
export const STARS_DB = {
  // === 14 CHÍNH TINH (baseScore = 0, tính riêng theo cung vị) ===
  "Tử Vi":      { type: 'chinhTinh', element: 'Thổ',  baseScore: 0, description: "Đế tinh, chủ về quyền uy, lãnh đạo" },
  "Thiên Cơ":   { type: 'chinhTinh', element: 'Mộc',  baseScore: 0, description: "Mưu lược, thông minh, linh hoạt" },
  "Thái Dương":  { type: 'chinhTinh', element: 'Hỏa',  baseScore: 0, description: "Quang minh, nhiệt tình, công bằng" },
  "Vũ Khúc":    { type: 'chinhTinh', element: 'Kim',  baseScore: 0, description: "Tài tinh, quả quyết, cương nghị" },
  "Thiên Đồng":  { type: 'chinhTinh', element: 'Thủy', baseScore: 0, description: "Phúc tinh, nhân hậu, hiền lành" },
  "Liêm Trinh":  { type: 'chinhTinh', element: 'Hỏa',  baseScore: 0, description: "Thứ đào hoa, cương trực, đa tài" },
  "Thiên Phủ":   { type: 'chinhTinh', element: 'Thổ',  baseScore: 0, description: "Lệnh tinh, tài khố, bền vững" },
  "Thái Âm":    { type: 'chinhTinh', element: 'Thủy', baseScore: 0, description: "Tài tinh, từ ái, mẫn cảm" },
  "Tham Lang":   { type: 'chinhTinh', element: 'Thủy', baseScore: 0, description: "Đào hoa, đa tài, đa dục" },
  "Cự Môn":     { type: 'chinhTinh', element: 'Thủy', baseScore: 0, description: "Ám tinh, khẩu tài, tranh biện" },
  "Thiên Tướng":  { type: 'chinhTinh', element: 'Thủy', baseScore: 0, description: "Ấn tinh, nhân hậu, chính nghĩa" },
  "Thiên Lương":  { type: 'chinhTinh', element: 'Mộc',  baseScore: 0, description: "Ấm tinh, phúc thọ, che chở" },
  "Thất Sát":    { type: 'chinhTinh', element: 'Kim',  baseScore: 0, description: "Sát tinh, uy quyền, quả cảm" },
  "Phá Quân":    { type: 'chinhTinh', element: 'Thủy', baseScore: 0, description: "Hao tinh, phá cách, biến đổi" },

  // === TỨ HÓA ===
  "Hóa Lộc":  { type: 'tuHoa', element: null, baseScore: 8,  description: "Lộc, tài, duyên, may mắn" },
  "Hóa Quyền": { type: 'tuHoa', element: null, baseScore: 7,  description: "Quyền lực, chủ động, mạnh mẽ" },
  "Hóa Khoa":  { type: 'tuHoa', element: null, baseScore: 7,  description: "Thanh danh, quý nhân, học vấn" },
  "Hóa Kỵ":   { type: 'tuHoa', element: null, baseScore: -8, description: "Thị phi, cản trở, phiền phức" },

  // === LỤC CÁT TINH ===
  "Tả Phù":    { type: 'catTinh', element: 'Thổ',  baseScore: 5, description: "Trợ tinh, giúp đỡ, trung thành" },
  "Hữu Bật":   { type: 'catTinh', element: 'Thủy', baseScore: 5, description: "Trợ tinh, mưu trí, sáng tạo" },
  "Văn Xương":  { type: 'catTinh', element: 'Kim',  baseScore: 5, description: "Văn tinh, học vấn, văn chương" },
  "Văn Khúc":   { type: 'catTinh', element: 'Thủy', baseScore: 5, description: "Văn tinh, tài nghệ, âm nhạc" },
  "Thiên Khôi":  { type: 'catTinh', element: 'Hỏa',  baseScore: 6, description: "Quý tinh, quý nhân, phù trợ" },
  "Thiên Việt":  { type: 'catTinh', element: 'Hỏa',  baseScore: 6, description: "Quý tinh, quý nhân, phù trợ" },

  // === LỤC SÁT TINH ===
  "Kình Dương":  { type: 'satTinh', element: 'Kim',  baseScore: -6, description: "Hình tinh, cương mãnh, tai nạn" },
  "Đà La":     { type: 'satTinh', element: 'Kim',  baseScore: -6, description: "Ám sát tinh, trì trệ, cản ngại" },
  "Hỏa Tinh":   { type: 'satTinh', element: 'Hỏa',  baseScore: -5, description: "Bạo phát bạo tàn, xung động" },
  "Linh Tinh":   { type: 'satTinh', element: 'Hỏa',  baseScore: -5, description: "Nóng nảy, cô độc, tai ương" },
  "Địa Không":   { type: 'satTinh', element: 'Hỏa',  baseScore: -8, description: "Hư không, mất mát, phá hoại" },
  "Địa Kiếp":   { type: 'satTinh', element: 'Hỏa',  baseScore: -8, description: "Cướp đoạt, hao tán, tai họa" },

  // === CÁT TINH KHÁC ===
  "Lộc Tồn":   { type: 'catTinh', element: 'Thổ',  baseScore: 8, description: "Tài tinh, giàu có, bền vững" },
  "Thiên Mã":   { type: 'catTinh', element: 'Hỏa',  baseScore: 5, description: "Di chuyển, bôn ba, xuất ngoại" },
  "Ân Quang":   { type: 'catTinh', element: null,   baseScore: 3, description: "Nhân đức, lễ độ, ân huệ" },
  "Thiên Quý":   { type: 'catTinh', element: null,   baseScore: 3, description: "Quý nhân, vinh hiển" },
  "Long Trì":   { type: 'catTinh', element: null,   baseScore: 3, description: "Tài năng, nghệ thuật" },
  "Phượng Các":  { type: 'catTinh', element: null,   baseScore: 3, description: "Danh vọng, phú quý" },
  "Tam Thai":   { type: 'catTinh', element: null,   baseScore: 3, description: "Học vấn, thi cử" },
  "Bát Tọa":    { type: 'catTinh', element: null,   baseScore: 3, description: "Học vấn, địa vị" },
  "Thiên Quan":  { type: 'catTinh', element: null,   baseScore: 3, description: "Quan chức, quyền lực" },
  "Thiên Phúc":  { type: 'catTinh', element: null,   baseScore: 3, description: "Phúc đức, may mắn" },
  "Thiên Tài":   { type: 'catTinh', element: null,   baseScore: 2, description: "Tài năng thiên bẩm" },
  "Thiên Thọ":   { type: 'catTinh', element: null,   baseScore: 2, description: "Thọ mệnh, sức khỏe" },
  "Hồng Loan":  { type: 'catTinh', element: null,   baseScore: 3, description: "Đào hoa cát, hôn nhân" },
  "Thiên Hỷ":   { type: 'catTinh', element: null,   baseScore: 3, description: "Vui mừng, hỷ sự" },
  "Đào Hoa":    { type: 'catTinh', element: null,   baseScore: 3, description: "Duyên dáng, lãng mạn" },
  "Hỷ Thần":    { type: 'catTinh', element: null,   baseScore: 2, description: "Vui vẻ, thiện lương" },
  "Thanh Long":  { type: 'catTinh', element: null,   baseScore: 3, description: "May mắn, phát triển" },
  "Thiên Giải":  { type: 'catTinh', element: null,   baseScore: 3, description: "Giải trừ tai nạn" },
  "Địa Giải":   { type: 'catTinh', element: null,   baseScore: 3, description: "Giải trừ hung hiểm" },
  "Giải Thần":  { type: 'catTinh', element: null,   baseScore: 3, description: "Hóa giải tai ách" },
  "Quốc Ấn":   { type: 'catTinh', element: null,   baseScore: 3, description: "Quyền uy, danh vọng" },
  "Đường Phù":  { type: 'catTinh', element: null,   baseScore: 2, description: "Pháp luật, quan tụng" },
  "Thai Phụ":   { type: 'catTinh', element: null,   baseScore: 2, description: "Phù trợ, quý nhân" },
  "Phong Cáo":  { type: 'catTinh', element: null,   baseScore: 2, description: "Danh vọng, phong hàm" },
  "Nguyệt Đức":  { type: 'catTinh', element: null,   baseScore: 2, description: "Phúc đức, nhân từ" },
  "Thiên Đức":   { type: 'catTinh', element: null,   baseScore: 2, description: "Đức hạnh, thiện lương" },
  "Long Đức":   { type: 'catTinh', element: null,   baseScore: 2, description: "Phúc lộc, may mắn" },
  "Phúc Đức":   { type: 'catTinh', element: null,   baseScore: 2, description: "Phúc lộc tổ tiên" },
  "Thiên Y":    { type: 'catTinh', element: null,   baseScore: 1, description: "Y thuật, chữa bệnh" },

  // === VÒNG THÁI TUẾ ===
  "Thái Tuế":   { type: 'phuTinh', element: null, baseScore: 2,  description: "Uy quyền, quyết đoán" },
  "Thiếu Dương":  { type: 'phuTinh', element: null, baseScore: 2,  description: "Phát triển, sinh trưởng" },
  "Thiếu Âm":   { type: 'phuTinh', element: null, baseScore: 2,  description: "Thu hoạch, tĩnh lặng" },
  "Trực Phù":   { type: 'phuTinh', element: null, baseScore: 1,  description: "Phù trợ, bảo vệ" },

  // === VÒNG LỘC TỒN ===
  "Bác Sĩ":    { type: 'phuTinh', element: null, baseScore: 2, description: "Kiến thức, y thuật" },
  "Lực Sĩ":    { type: 'phuTinh', element: null, baseScore: 2, description: "Sức mạnh, quyền uy" },
  "Tướng Quân":  { type: 'phuTinh', element: null, baseScore: 3, description: "Uy quyền, quân sự" },

  // === VÒNG TRÀNG SINH (Cát) ===
  "Trường Sinh": { type: 'phuTinh', element: null, baseScore: 4, description: "Trường thọ, sinh lực" },
  "Mộc Dục":    { type: 'phuTinh', element: null, baseScore: 1, description: "Tẩy trần, khởi đầu mới" },
  "Quan Đới":   { type: 'phuTinh', element: null, baseScore: 2, description: "Chức vị, bằng cấp" },
  "Lâm Quan":   { type: 'phuTinh', element: null, baseScore: 3, description: "Quyền chức, độc lập" },
  "Đế Vượng":   { type: 'phuTinh', element: null, baseScore: 4, description: "Cực thịnh, quyền uy" },
  "Thai":       { type: 'phuTinh', element: null, baseScore: 2, description: "Khởi đầu, sinh sôi" },
  "Dưỡng":     { type: 'phuTinh', element: null, baseScore: 2, description: "Nuôi dưỡng, chăm sóc" },

  // === HUNG TINH / SÁT TINH KHÁC ===
  "Thiên Không": { type: 'phuTinh', element: null, baseScore: -5, description: "Hư ảo, không thực tế" },
  "Kiếp Sát":   { type: 'phuTinh', element: null, baseScore: -4, description: "Cướp đoạt, tai nạn" },
  "Tang Môn":   { type: 'phuTinh', element: null, baseScore: -4, description: "Tang tóc, buồn đau" },
  "Bạch Hổ":   { type: 'phuTinh', element: null, baseScore: -4, description: "Uy quyền nhưng tai nạn" },
  "Điếu Khách":  { type: 'phuTinh', element: null, baseScore: -3, description: "Cô đơn, buồn bã" },
  "Tuế Phá":    { type: 'phuTinh', element: null, baseScore: -3, description: "Phá hoại, hao tổn" },
  "Cô Thần":   { type: 'phuTinh', element: null, baseScore: -3, description: "Cô độc, xa cách" },
  "Quả Tú":    { type: 'phuTinh', element: null, baseScore: -3, description: "Cô đơn, lẻ loi" },
  "Thiên Hình":  { type: 'phuTinh', element: null, baseScore: -4, description: "Hình phạt, tai nạn" },
  "Thiên Riêu":  { type: 'phuTinh', element: null, baseScore: -3, description: "Mẫn cảm, tế nhị" },
  "Phá Toái":   { type: 'phuTinh', element: null, baseScore: -3, description: "Phá tan, vỡ nát" },
  "Đẩu Quân":   { type: 'phuTinh', element: null, baseScore: -2, description: "Biến cố trọng đại" },
  "Phi Liêm":   { type: 'phuTinh', element: null, baseScore: -2, description: "Thị phi, miệng lưỡi" },
  "Lưu Hà":    { type: 'phuTinh', element: null, baseScore: -3, description: "Tai nạn nước" },
  "Thiên Thương": { type: 'phuTinh', element: null, baseScore: -3, description: "Thương tổn, đau đớn" },
  "Thiên Sứ":   { type: 'phuTinh', element: null, baseScore: -3, description: "Bệnh tật, khó khăn" },
  "Thiên La":   { type: 'phuTinh', element: null, baseScore: -4, description: "Lưới trời, ràng buộc" },
  "Địa Võng":   { type: 'phuTinh', element: null, baseScore: -4, description: "Lưới đất, giam cầm" },
  "Quan Phủ":   { type: 'phuTinh', element: null, baseScore: -2, description: "Kiện tụng, thị phi" },
  "Quan Phù":   { type: 'phuTinh', element: null, baseScore: -2, description: "Kiện tụng, quan tụng" },
  "Tử Phù":    { type: 'phuTinh', element: null, baseScore: -2, description: "Tang tóc, buồn bã" },
  "Tuần":       { type: 'phuTinh', element: null, baseScore: -3, description: "Cản trở, trì hoãn" },
  "Triệt":      { type: 'phuTinh', element: null, baseScore: -3, description: "Cắt đứt, đoạn tuyệt" },
  "Cổ Thần":   { type: 'phuTinh', element: null, baseScore: -3, description: "Cô đơn, xa cách" },

  // === BẠI TINH ===
  "Đại Hao":    { type: 'phuTinh', element: null, baseScore: -4, description: "Hao tán lớn" },
  "Tiểu Hao":   { type: 'phuTinh', element: null, baseScore: -2, description: "Hao tán nhỏ" },
  "Thiên Khốc":  { type: 'phuTinh', element: null, baseScore: -3, description: "Khóc lóc, buồn đau" },
  "Thiên Hư":   { type: 'phuTinh', element: null, baseScore: -3, description: "Hư ảo, không thực" },

  // === VÒNG TRÀNG SINH (Xấu) ===
  "Bệnh Phù":   { type: 'phuTinh', element: null, baseScore: -2, description: "Bệnh tật" },
  "Suy":        { type: 'phuTinh', element: null, baseScore: -2, description: "Suy yếu, giảm sút" },
  "Bệnh":       { type: 'phuTinh', element: null, baseScore: -2, description: "Bệnh tật, ốm đau" },
  "Tử":         { type: 'phuTinh', element: null, baseScore: -2, description: "Kết thúc, chấm dứt" },
  "Mộ":         { type: 'phuTinh', element: null, baseScore: 0,  description: "Tàng giấu, chứa đựng" },
  "Tuyệt":      { type: 'phuTinh', element: null, baseScore: -3, description: "Chấm hết, tuyệt diệt" },
  "Phục Binh":   { type: 'phuTinh', element: null, baseScore: -3, description: "Ẩn náu, bất ngờ" },
  "Hoa Cái":    { type: 'phuTinh', element: null, baseScore: 0,  description: "Nghệ thuật, tôn giáo" },

  // === SAO ĐẶC BIỆT (không nằm trong phân loại chuẩn) ===
  "Văn Tinh":   { type: 'phuTinh', element: null, baseScore: 2, description: "Văn chương, học thuật" },
  "Tẩu Thư":   { type: 'phuTinh', element: null, baseScore: 1, description: "Văn thư, giấy tờ" },
  "Thiên Trù":   { type: 'phuTinh', element: null, baseScore: 2, description: "Ẩm thực, phúc lộc" },
  "Từ Phù":    { type: 'phuTinh', element: null, baseScore: -1, description: "Từ bi, nhân hậu" },
};

/**
 * Tra cứu thông tin sao từ database
 * @param {string} starName - Tên sao
 * @returns {object|null} thông tin sao hoặc null nếu không tìm thấy
 */
export function getStarInfo(starName) {
  return STARS_DB[starName] || null;
}

/**
 * Kiểm tra loại sao
 */
export function isChinhTinh(starName) {
  return CHINH_TINH_LIST.includes(starName);
}

export function isTuHoa(starName) {
  return TU_HOA_LIST.includes(starName);
}

export function isSatTinh(starName) {
  return SAT_TINH_LIST.includes(starName);
}

export function isCatTinh(starName) {
  const info = STARS_DB[starName];
  return info && (info.type === 'catTinh' || (info.type === 'phuTinh' && info.baseScore > 0));
}

/**
 * Lấy điểm cơ bản của 1 sao
 */
export function getStarScore(starName) {
  const info = STARS_DB[starName];
  return info ? info.baseScore : 0;
}
