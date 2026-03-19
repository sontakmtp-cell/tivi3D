/**
 * palaceRelationships.js — Quan hệ giữa các cung
 * 
 * Mô hình hóa Tam Hợp, Xung Chiếu, Nhị Hợp giữa 12 cung
 * Mở rộng từ relationships.js gốc, thêm metadata ý nghĩa
 */

// ── Tam Hợp: 4 nhóm, mỗi nhóm 3 cung ──
export const tamHopGroups = [
  {
    name: "Mệnh – Tài – Quan",
    description: "Bản mệnh, Tài chính, Sự nghiệp",
    meaning: "Tính cách → Kiếm tiền → Phát triển sự nghiệp. Đây là bộ tam hợp quan trọng nhất.",
    palaceIds: [1, 9, 5],
    color: "#FFD700",
    weight: 1.0,
  },
  {
    name: "Phụ Mẫu – Nô – Tử",
    description: "Cha mẹ, Bạn bè, Con cái",
    meaning: "Nguồn gốc → Xã giao → Hậu duệ. Thể hiện các mối quan hệ trên-dưới-ngang.",
    palaceIds: [2, 6, 10],
    color: "#E040FB",
    weight: 0.6,
  },
  {
    name: "Phúc – Di – Phu",
    description: "Phúc đức, Thiên di, Phu thê",
    meaning: "Phúc báu tổ tiên → Biểu hiện bên ngoài → Hôn nhân. Hậu vận và đối ngoại.",
    palaceIds: [3, 7, 11],
    color: "#00BCD4",
    weight: 0.7,
  },
  {
    name: "Điền – Tật – Huynh",
    description: "Điền trạch, Tật ách, Huynh đệ",
    meaning: "Tài sản cố định → Sức khỏe → Anh em. Nền tảng vật chất và sức khỏe.",
    palaceIds: [4, 8, 12],
    color: "#FF7043",
    weight: 0.5,
  }
];

// ── Xung Chiếu: 6 cặp đối diện ──
export const xungChieuPairs = [
  {
    palaceIds: [1, 7],
    name: "Mệnh ↔ Thiên Di",
    meaning: "Bản chất bên trong ↔ Biểu hiện bên ngoài",
    interactionType: "opposition",
  },
  {
    palaceIds: [2, 8],
    name: "Phụ Mẫu ↔ Tật Ách",
    meaning: "Di truyền ← → Sức khỏe. Bệnh tật gốc từ cha mẹ",
    interactionType: "opposition",
  },
  {
    palaceIds: [3, 9],
    name: "Phúc Đức ↔ Tài Bạch",
    meaning: "Phúc báu ← → Tài chính. 'Có phúc thì có lộc'",
    interactionType: "opposition",
  },
  {
    palaceIds: [4, 10],
    name: "Điền Trạch ↔ Tử Tức",
    meaning: "Tài sản cố định ← → Con cái, đầu tư",
    interactionType: "opposition",
  },
  {
    palaceIds: [5, 11],
    name: "Quan Lộc ↔ Phu Thê",
    meaning: "Sự nghiệp ← → Hôn nhân. Vợ chồng ảnh hưởng công danh",
    interactionType: "opposition",
  },
  {
    palaceIds: [6, 12],
    name: "Nô Bộc ↔ Huynh Đệ",
    meaning: "Bạn bè xã giao ← → Anh em ruột thịt",
    interactionType: "opposition",
  }
];

// ── Nhị Hợp: 6 cặp hài hòa ──
export const nhiHopPairs = [
  { palaceIds: [1, 2],   name: "Mệnh – Phụ Mẫu" },
  { palaceIds: [3, 12],  name: "Phúc Đức – Huynh Đệ" },
  { palaceIds: [4, 11],  name: "Điền Trạch – Phu Thê" },
  { palaceIds: [5, 10],  name: "Quan Lộc – Tử Tức" },
  { palaceIds: [6, 9],   name: "Nô Bộc – Tài Bạch" },
  { palaceIds: [7, 8],   name: "Thiên Di – Tật Ách" },
];


// ── Helper functions ──

/**
 * Tìm các nhóm Tam Hợp chứa palace ID
 */
export function getTamHopForPalace(palaceId) {
  return tamHopGroups.filter(g => g.palaceIds.includes(palaceId));
}

/**
 * Tìm cặp Xung Chiếu của palace ID
 */
export function getXungChieuForPalace(palaceId) {
  return xungChieuPairs.filter(p => p.palaceIds.includes(palaceId));
}

/**
 * Tìm các cặp Nhị Hợp của palace ID
 */
export function getNhiHopForPalace(palaceId) {
  return nhiHopPairs.filter(p => p.palaceIds.includes(palaceId));
}

/**
 * Lấy tất cả palace IDs liên quan (tam hợp + xung chiếu + nhị hợp)
 */
export function getRelatedPalaceIds(palaceId) {
  const ids = new Set();

  getTamHopForPalace(palaceId).forEach(g => {
    g.palaceIds.forEach(id => { if (id !== palaceId) ids.add(id); });
  });

  getXungChieuForPalace(palaceId).forEach(p => {
    p.palaceIds.forEach(id => { if (id !== palaceId) ids.add(id); });
  });

  getNhiHopForPalace(palaceId).forEach(p => {
    p.palaceIds.forEach(id => { if (id !== palaceId) ids.add(id); });
  });

  return [...ids];
}
