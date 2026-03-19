/**
 * relationships.js — Re-export hub (backward-compatible)
 * 
 * Module gốc đã được tách sang data/palaceRelationships.js
 * File này giữ lại để các component import cũ vẫn hoạt động.
 */

export {
  tamHopGroups,
  xungChieuPairs,
  nhiHopPairs,
  getTamHopForPalace,
  getXungChieuForPalace,
  getNhiHopForPalace,
  getRelatedPalaceIds,
} from './data/palaceRelationships';
