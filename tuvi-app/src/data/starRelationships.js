/**
 * starRelationships.js — Quan hệ giữa các sao khi đồng cung
 * 
 * Mô hình hóa các bộ sao nổi tiếng trong Tử Vi: 
 * combo tốt (synergy), combo xấu (conflict), combo đặc biệt (special)
 */

// ── Các bộ sao nổi tiếng ──
export const STAR_COMBOS = [
  // === Combo tốt (Synergy) ===
  {
    id: "de-phu-trieu-vien",
    stars: ["Tử Vi", "Thiên Phủ"],
    type: "synergy",
    name: "Đế Phủ Triều Viên",
    effect: "Quý hiển, phú quý, quyền uy",
    bonusScore: 15,
    color: "#FFD700",
  },
  {
    id: "nhat-nguyet-dong-minh",
    stars: ["Thái Dương", "Thái Âm"],
    type: "synergy",
    name: "Nhật Nguyệt Đồng Minh",
    effect: "Sáng rỡ, thành đạt, phú quý",
    bonusScore: 15,
    color: "#FFA500",
  },
  {
    id: "co-nguyet-dong-luong",
    stars: ["Thiên Cơ", "Thiên Lương"],
    type: "synergy",
    name: "Cơ Lương",
    effect: "Mưu lược, phúc thọ, thông minh",
    bonusScore: 10,
    color: "#00CED1",
  },
  {
    id: "dong-luong",
    stars: ["Thiên Đồng", "Thiên Lương"],
    type: "synergy",
    name: "Đồng Lương",
    effect: "Nhân hậu, an nhàn, phú quý",
    bonusScore: 8,
    color: "#87CEEB",
  },
  {
    id: "xương-khuc",
    stars: ["Văn Xương", "Văn Khúc"],
    type: "synergy",
    name: "Xương Khúc",
    effect: "Văn chương lỗi lạc, học vấn uyên bác",
    bonusScore: 8,
    color: "#DDA0DD",
  },
  {
    id: "ta-huu",
    stars: ["Tả Phù", "Hữu Bật"],
    type: "synergy",
    name: "Tả Hữu",
    effect: "Được trợ giúp, quý nhân phù trì",
    bonusScore: 8,
    color: "#98FB98",
  },
  {
    id: "khoi-viet",
    stars: ["Thiên Khôi", "Thiên Việt"],
    type: "synergy",
    name: "Khôi Việt",
    effect: "Quý nhân ở trên và dưới, thuận lợi",
    bonusScore: 10,
    color: "#FFB6C1",
  },
  {
    id: "loc-ma",
    stars: ["Lộc Tồn", "Thiên Mã"],
    type: "synergy",
    name: "Lộc Mã Giao Trì",
    effect: "Phát tài ở xa, xuất ngoại phát đạt",
    bonusScore: 12,
    color: "#32CD32",
  },
  {
    id: "loc-quyen-khoa",
    stars: ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa"],
    type: "synergy",
    name: "Tam Hóa Cát",
    effect: "Đại phú đại quý, vạn sự hanh thông",
    bonusScore: 20,
    color: "#FF6347",
  },
  {
    id: "hong-dào",
    stars: ["Hồng Loan", "Đào Hoa"],
    type: "synergy",
    name: "Hồng Đào",
    effect: "Duyên dáng, tình duyên tốt đẹp",
    bonusScore: 5,
    color: "#FF69B4",
  },
  {
    id: "long-phuong",
    stars: ["Long Trì", "Phượng Các"],
    type: "synergy",
    name: "Long Phượng",
    effect: "Tài hoa, phú quý",
    bonusScore: 5,
    color: "#DA70D6",
  },

  // === Combo xấu (Conflict) ===
  {
    id: "sat-pha",
    stars: ["Thất Sát", "Phá Quân"],
    type: "conflict",
    name: "Sát Phá",
    effect: "Biến động mạnh, phá cách, xung khắc",
    bonusScore: -10,
    color: "#FF4444",
  },
  {
    id: "liem-tham",
    stars: ["Liêm Trinh", "Tham Lang"],
    type: "conflict",
    name: "Liêm Tham",
    effect: "Đào hoa nặng, tình duyên phức tạp",
    bonusScore: -5,
    color: "#DC143C",
  },
  {
    id: "liem-sat",
    stars: ["Liêm Trinh", "Thất Sát"],
    type: "conflict",
    name: "Liêm Sát",
    effect: "Cương liệt, tai nạn, hình thương",
    bonusScore: -8,
    color: "#8B0000",
  },
  {
    id: "vu-pha",
    stars: ["Vũ Khúc", "Phá Quân"],
    type: "conflict",
    name: "Vũ Phá",
    effect: "Tài chính bất ổn, lên xuống thất thường",
    bonusScore: -5,
    color: "#B22222",
  },
  {
    id: "khong-kiep",
    stars: ["Địa Không", "Địa Kiếp"],
    type: "conflict",
    name: "Không Kiếp",
    effect: "Đại hung, phá hoại, mất mát lớn",
    bonusScore: -12,
    color: "#4A0000",
  },
  {
    id: "kinh-da",
    stars: ["Kình Dương", "Đà La"],
    type: "conflict",
    name: "Kình Đà",
    effect: "Trở ngại lớn, tai nạn, khó khăn",
    bonusScore: -8,
    color: "#800000",
  },
  {
    id: "hoa-linh",
    stars: ["Hỏa Tinh", "Linh Tinh"],
    type: "conflict",
    name: "Hỏa Linh",
    effect: "Bạo phát bạo tàn, nóng nảy, tai ương",
    bonusScore: -6,
    color: "#CD5C5C",
  },
  {
    id: "co-qua",
    stars: ["Cô Thần", "Quả Tú"],
    type: "conflict",
    name: "Cô Quả",
    effect: "Cô độc, xa cách người thân",
    bonusScore: -5,
    color: "#696969",
  },
  {
    id: "tang-dieu",
    stars: ["Tang Môn", "Điếu Khách"],
    type: "conflict",
    name: "Tang Điếu",
    effect: "Tang tóc, buồn đau",
    bonusScore: -5,
    color: "#2F4F4F",
  },

  // === Combo đặc biệt (Special) ===
  {
    id: "co-nguyet-dong-luong-full",
    stars: ["Thiên Cơ", "Thái Âm", "Thiên Đồng", "Thiên Lương"],
    type: "special",
    name: "Cơ Nguyệt Đồng Lương",
    effect: "Thích hợp đi làm công, hưởng lương ổn định",
    bonusScore: 5,
    color: "#4682B4",
  },
  {
    id: "tu-linh",
    stars: ["Thanh Long", "Bạch Hổ"],
    type: "special",
    name: "Long Hổ",
    effect: "Uy quyền, danh tiếng",
    bonusScore: 4,
    color: "#CD853F",
  },
  {
    id: "la-vong",
    stars: ["Thiên La", "Địa Võng"],
    type: "special",
    name: "La Võng",
    effect: "Bị ràng buộc, giam cầm",
    bonusScore: -6,
    color: "#4B0082",
  },
];

/**
 * Tìm tất cả các combo active trong 1 mảng sao
 * @param {string[]} starNames - Danh sách tên các sao trong cung
 * @returns {object[]} Các combo được kích hoạt
 */
export function findActiveCombos(starNames) {
  if (!starNames || starNames.length < 2) return [];
  
  const nameSet = new Set(starNames);
  
  return STAR_COMBOS.filter(combo => {
    // Minimum 2 stars from the combo must be present
    const matchCount = combo.stars.filter(s => nameSet.has(s)).length;
    // For combos with 2 stars: need all 2
    // For combos with 3+ stars: need at least 2
    if (combo.stars.length <= 2) return matchCount === combo.stars.length;
    return matchCount >= 2;
  }).map(combo => ({
    ...combo,
    matchedStars: combo.stars.filter(s => nameSet.has(s)),
    fullMatch: combo.stars.every(s => nameSet.has(s)),
  }));
}

/**
 * Tính tổng điểm bonus từ combos 
 * @param {string[]} starNames 
 * @returns {number}
 */
export function calculateComboScore(starNames) {
  const combos = findActiveCombos(starNames);
  return combos.reduce((sum, c) => {
    // Full match: 100% bonus, partial match: 50%
    const factor = c.fullMatch ? 1 : 0.5;
    return sum + c.bonusScore * factor;
  }, 0);
}
