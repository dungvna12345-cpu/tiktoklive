/**
 * Module Xử Lý Quà Tặng và Tương Tác (Gift, Like, Follow, Share)
 */

const fs = require('fs');
const path = require('path');

const GIFTS_CONFIG_PATH = path.join(__dirname, '..', 'config', 'gifts.json');

let giftsConfig = { mappings: [] };
try {
  giftsConfig = JSON.parse(fs.readFileSync(GIFTS_CONFIG_PATH, 'utf8'));
} catch (e) {
  console.error('Không thể đọc gifts.json:', e.message);
}

function reloadGiftsConfig() {
  try {
    giftsConfig = JSON.parse(fs.readFileSync(GIFTS_CONFIG_PATH, 'utf8'));
    return true;
  } catch (e) {
    return false;
  }
}

function getGiftsConfig() {
  return giftsConfig;
}

function saveGiftsConfig(newConfig) {
  giftsConfig = newConfig;
  fs.writeFileSync(GIFTS_CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
}

/**
 * Tìm hiệu ứng tương ứng với quà tặng
 * Ưu tiên khớp theo giftId, sau đó mới khớp theo giftName
 */
function findGiftEffect(giftId, giftName) {
  if (!giftsConfig || !giftsConfig.mappings) return null;

  // 1. Khớp giftId
  if (giftId !== undefined && giftId !== null) {
    const byId = giftsConfig.mappings.find(m => Array.isArray(m.giftIds) && m.giftIds.includes(Number(giftId)));
    if (byId) return byId;
  }

  // 2. Khớp giftName
  if (giftName) {
    const cleanName = String(giftName).trim().toLowerCase();
    const byName = giftsConfig.mappings.find(m =>
      Array.isArray(m.giftNames) && m.giftNames.some(name => name.toLowerCase() === cleanName)
    );
    if (byName) return byName;
  }

  // 3. Mặc định là Thang tre nếu không tìm thấy
  return giftsConfig.mappings.find(m => m.id === 'thang_tre') || {
    id: 'thang_tre',
    name: 'Thang tre',
    effect: 'ladder',
    maxClimb: 3,
    climbPerUnit: 1
  };
}

/**
 * Bộ theo dõi combo quà streak.
 * Với quà combo, chỉ kích hoạt hiệu ứng khi combo kết thúc (repeatEnd === true).
 */
class GiftStreakTracker {
  constructor() {
    this.activeStreaks = new Map(); // key: userId_giftId -> { count, lastTimestamp }
  }

  /**
   * Xử lý sự kiện quà. Trả về thông tin hiệu ứng nếu đây là thời điểm kích hoạt.
   * @param {Object} giftData { userId, uniqueId, nickname, avatarUrl, giftId, giftName, repeatCount, repeatEnd }
   * @returns {Object|null} Thông tin để thực thi hiệu ứng hoặc null nếu đang trong combo
   */
  processGiftEvent(giftData) {
    const { userId, giftId, repeatCount = 1, repeatEnd = true } = giftData;
    const streakKey = `${userId}_${giftId}`;

    // Nếu quà có tính năng combo và chưa kết thúc, lưu lại và chưa kích hoạt
    if (repeatEnd === false) {
      this.activeStreaks.set(streakKey, {
        giftData,
        count: repeatCount,
        timestamp: Date.now()
      });
      return null;
    }

    // Nếu repeatEnd === true hoặc quà đơn lẻ
    let finalCount = repeatCount;
    if (this.activeStreaks.has(streakKey)) {
      const prev = this.activeStreaks.get(streakKey);
      finalCount = Math.max(finalCount, prev.count);
      this.activeStreaks.delete(streakKey);
    }

    const mapping = findGiftEffect(giftId, giftData.giftName);
    return {
      userId: giftData.userId,
      uniqueId: giftData.uniqueId,
      nickname: giftData.nickname,
      avatarUrl: giftData.avatarUrl,
      giftId: giftData.giftId,
      giftName: giftData.giftName,
      repeatCount: finalCount,
      mapping
    };
  }
}

module.exports = {
  findGiftEffect,
  reloadGiftsConfig,
  getGiftsConfig,
  saveGiftsConfig,
  GiftStreakTracker
};
