/**
 * starScores.js — Tính điểm sao và cung
 * 
 * Sử dụng starsDatabase.js làm single source of truth cho điểm sao.
 * Tích hợp calculateComboScore từ starRelationships.js.
 */

import { STARS_DB, isChinhTinh } from './data/starsDatabase';
import { calculateComboScore, findActiveCombos } from './data/starRelationships';
import { getTamHopForPalace, getXungChieuForPalace, getNhiHopForPalace } from './data/palaceRelationships';
import { getAllStars } from './data/dataAdapter';

// Re-export danh sách chính tinh (backward-compatible)
export { CHINH_TINH_LIST as CHINH_TINH } from './data/starsDatabase';

// Re-export PHU_TINH_SCORES từ starsDatabase (backward-compatible)
// Tạo map điểm tương thích format cũ
const _phuTinhScores = {};
Object.entries(STARS_DB).forEach(([name, info]) => {
  if (info.type !== 'chinhTinh') {
    _phuTinhScores[name] = info.baseScore;
  }
});
export const PHU_TINH_SCORES = _phuTinhScores;

/**
 * Hàm tính điểm tổng các phụ tinh của một cung đơn lẻ 
 * @param {string[]|object} starsOrPalace - Mảng tên sao HOẶC object cung
 * @returns {object} { total, positive, negative }
 */
export function calculatePalaceScore(starsOrPalace) {
  let starsArray;
  
  // Hỗ trợ cả format cũ (string[]) và format mới (palace object)
  if (Array.isArray(starsOrPalace)) {
    starsArray = starsOrPalace;
  } else if (starsOrPalace && typeof starsOrPalace === 'object') {
    starsArray = getAllStars(starsOrPalace);
  } else {
    return { total: 0, positive: 0, negative: 0 };
  }

  let totalScore = 0;
  let positiveScore = 0;
  let negativeScore = 0;

  starsArray.forEach(star => {
    // Bỏ qua Chính Tinh
    if (isChinhTinh(star)) return;

    // Lấy điểm từ database
    const info = STARS_DB[star];
    const point = info ? info.baseScore : 0;
    
    totalScore += point;
    if (point > 0) {
      positiveScore += point;
    } else if (point < 0) {
      negativeScore += Math.abs(point);
    }
  });

  // Thêm điểm combo
  const comboBonus = calculateComboScore(starsArray);
  totalScore += comboBonus;
  if (comboBonus > 0) positiveScore += comboBonus;
  if (comboBonus < 0) negativeScore += Math.abs(comboBonus);

  return {
    total: totalScore,
    positive: positiveScore,
    negative: negativeScore
  };
}

/**
 * Hàm tính điểm mở rộng cho một cung, bao gồm cả Bản Cung, Tam Hợp, Xung Chiếu và Nhị Hợp
 * @param {number} palaceId - ID của cung cần tính
 * @param {Array<object>} allPalacesData - Toàn bộ dữ liệu 12 cung
 * @returns {object} Điểm chi tiết + combos
 */
export function calculateExtendedPalaceScore(palaceId, allPalacesData) {
  const currentPalace = allPalacesData.find(p => p.id === palaceId);
  if (!currentPalace) return null;

  const getStars = (p) => getAllStars(p);

  // 1. Điểm Bản Cung (hệ số 1.0)
  const baseScore = calculatePalaceScore(getStars(currentPalace));
  
  // Tìm combos active trong cung
  const activeCombos = findActiveCombos(getStars(currentPalace));

  // 2. Điểm Tam Hợp (hệ số 0.5)
  let tamHopScore = { total: 0, positive: 0, negative: 0 };
  const tamHopGroups = getTamHopForPalace(palaceId);
  tamHopGroups.forEach(group => {
    group.palaceIds.forEach(id => {
      if (id === palaceId) return;
      const palace = allPalacesData.find(p => p.id === id);
      if (palace) {
        const score = calculatePalaceScore(getStars(palace));
        tamHopScore.total += score.total * 0.5;
        tamHopScore.positive += score.positive * 0.5;
        tamHopScore.negative += score.negative * 0.5;
      }
    });
  });

  // 3. Điểm Xung Chiếu (hệ số 0.8)
  let xungChieuScore = { total: 0, positive: 0, negative: 0 };
  const xungChieuPairs = getXungChieuForPalace(palaceId);
  xungChieuPairs.forEach(pair => {
    pair.palaceIds.forEach(id => {
      if (id === palaceId) return;
      const palace = allPalacesData.find(p => p.id === id);
      if (palace) {
        const score = calculatePalaceScore(getStars(palace));
        xungChieuScore.total += score.total * 0.8;
        xungChieuScore.positive += score.positive * 0.8;
        xungChieuScore.negative += score.negative * 0.8;
      }
    });
  });

  // 4. Điểm Nhị Hợp (hệ số 0.3)
  let nhiHopScore = { total: 0, positive: 0, negative: 0 };
  const nhiHopPairsArr = getNhiHopForPalace(palaceId);
  nhiHopPairsArr.forEach(pair => {
    pair.palaceIds.forEach(id => {
      if (id === palaceId) return;
      const palace = allPalacesData.find(p => p.id === id);
      if (palace) {
        const score = calculatePalaceScore(getStars(palace));
        nhiHopScore.total += score.total * 0.3;
        nhiHopScore.positive += score.positive * 0.3;
        nhiHopScore.negative += score.negative * 0.3;
      }
    });
  });

  // Tổng hợp kết quả
  const finalTotal = baseScore.total + tamHopScore.total + xungChieuScore.total + nhiHopScore.total;
  const finalPositive = baseScore.positive + tamHopScore.positive + xungChieuScore.positive + nhiHopScore.positive;
  const finalNegative = baseScore.negative + tamHopScore.negative + xungChieuScore.negative + nhiHopScore.negative;

  return {
    base: baseScore,
    tamHop: tamHopScore,
    xungChieu: xungChieuScore,
    nhiHop: nhiHopScore,
    activeCombos,  // NEW: danh sách combos active trong cung
    final: {
      total: Number(finalTotal.toFixed(1)),
      positive: Number(finalPositive.toFixed(1)),
      negative: Number(finalNegative.toFixed(1))
    }
  };
}
