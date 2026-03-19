/**
 * dataAdapter.js — Chuyển đổi dữ liệu giữa format cũ và format mới
 * 
 * Hỗ trợ backward-compatible: file JSON format cũ (stars: string[])
 * vẫn hoạt động với hệ thống format mới (chinhTinh/phuTinh/tuHoa arrays)
 */

import { CHINH_TINH_LIST, TU_HOA_LIST } from './starsDatabase';

/**
 * Chuyển đổi 1 cung từ format cũ (flat stars[]) sang format mới
 * @param {object} palace - Dữ liệu cung format cũ
 * @returns {object} Dữ liệu cung format mới
 */
export function adaptLegacyPalace(palace) {
  // Nếu đã có format mới rồi thì trả về luôn
  if (palace.chinhTinh && Array.isArray(palace.chinhTinh)) {
    return palace;
  }

  const allStars = palace.stars || [];
  
  const chinhTinh = allStars.filter(s => CHINH_TINH_LIST.includes(s));
  const tuHoa = allStars.filter(s => TU_HOA_LIST.includes(s));
  const phuTinh = allStars.filter(s => 
    !CHINH_TINH_LIST.includes(s) && !TU_HOA_LIST.includes(s)
  );

  return {
    ...palace,
    chinhTinh,
    phuTinh,
    tuHoa,
    // Giữ lại stars[] để backward-compatible
    stars: allStars,
  };
}

/**
 * Chuyển đổi toàn bộ mảng 12 cung từ format cũ sang format mới
 * @param {object[]} palaces - Mảng 12 cung format cũ
 * @returns {object[]} Mảng 12 cung format mới
 */
export function adaptLegacyData(palaces) {
  if (!Array.isArray(palaces)) return palaces;
  return palaces.map(adaptLegacyPalace);
}

/**
 * Từ format mới, lấy lại flat stars[] (backward-compatible)
 * @param {object} palace - Cung format mới
 * @returns {string[]}
 */
export function getAllStars(palace) {
  if (palace.stars && Array.isArray(palace.stars) && palace.stars.length > 0) {
    return palace.stars;
  }
  return [
    ...(palace.chinhTinh || []),
    ...(palace.tuHoa || []),
    ...(palace.phuTinh || []),
  ];
}
