/**
 * Module Tính Điểm và Thăng / Tụt Tầng Tháp Sách
 */

/**
 * Tính toán kết quả cho từng người chơi sau một câu hỏi.
 * @param {Object} params
 * @param {Array} params.answers Danh sách câu trả lời của người chơi [{ userId, option, timestamp }]
 * @param {number} params.correctOption Đáp án đúng (0..3)
 * @param {boolean} params.isChallenge Có phải câu thử thách không
 * @param {boolean} params.isWindX2 Có kích hoạt gió đẩy x2 không
 * @param {Set|Array} params.frozenUserIds Tập hợp userId bị đóng băng
 * @param {Map|Object} params.currentFloors Bản đồ tầng hiện tại của người chơi { [userId]: floor }
 * @param {number} params.targetFloor Tầng đích (mặc định 20)
 * @returns {Object} { results: Map(userId => { oldFloor, newFloor, delta, isCorrect, isFastest, rank, isFrozen }), winners: [] }
 */
function calculateQuestionScores({
  answers = [],
  correctOption,
  isChallenge = false,
  isWindX2 = false,
  frozenUserIds = new Set(),
  currentFloors = {},
  targetFloor = 20
}) {
  const frozenSet = frozenUserIds instanceof Set ? frozenUserIds : new Set(frozenUserIds);
  const results = new Map();
  const winners = [];

  // 1. Phân loại câu trả lời đúng và sắp xếp theo thời gian sớm nhất
  const correctAnswers = answers
    .filter(a => a.option === correctOption)
    .sort((a, b) => a.timestamp - b.timestamp);

  // Top 3 người đúng nhanh nhất
  const top3FastestIds = new Set(correctAnswers.slice(0, 3).map(a => a.userId));

  // 2. Duyệt qua từng người đã nộp đáp án
  for (const item of answers) {
    const { userId } = item;
    const currentFloor = currentFloors[userId] || 0;
    const isCorrect = item.option === correctOption;
    const isFrozen = frozenSet.has(userId);

    let delta = 0;
    const isFastest = top3FastestIds.has(userId);

    if (isFrozen) {
      // Người bị đóng băng không thể leo tầng trong câu này
      delta = 0;
    } else if (isCorrect) {
      // Đúng
      if (isChallenge) {
        delta = 2; // Thử thách đúng +2
      } else {
        delta = 1; // Thường đúng +1
      }

      // Thưởng top 3 nhanh nhất
      if (isFastest) {
        delta += 1;
      }

      // Hiệu ứng Gió đẩy x2: nhân đôi số tầng leo được
      if (isWindX2) {
        delta *= 2;
      }
    } else {
      // Sai
      if (isChallenge) {
        delta = -1; // Thử thách sai tụt 1 tầng
      } else {
        delta = 0; // Bình thường sai không bị trừ
      }
    }

    let newFloor = currentFloor + delta;
    if (newFloor < 0) newFloor = 0; // Không thấp hơn mặt đất

    results.set(userId, {
      userId,
      oldFloor: currentFloor,
      newFloor,
      delta,
      isCorrect,
      isFastest,
      isFrozen
    });

    if (newFloor >= targetFloor) {
      winners.push(userId);
    }
  }

  return {
    results,
    winners,
    fastestUserIds: Array.from(top3FastestIds)
  };
}

module.exports = {
  calculateQuestionScores
};
