/**
 * Chế Độ Giả Lập Người Xem và Bot Ảo
 * Dùng để chạy thử nghiệm đầy đủ tính năng trước khi lên sóng LIVE.
 */

// Danh sách tên người xem ảo tiếng Việt sinh động
const BOT_NAMES = [
  'Minh Anh', 'Bảo Nam', 'Khánh Linh', 'Tuấn Khang', 'Hải Đăng',
  'Ngọc Diệp', 'Gia Hưng', 'Thùy Dung', 'Đức Trọng', 'Hương Giang',
  'Quang Huy', 'Thu Thảo', 'Hồng Phúc', 'Mỹ Uyên', 'Thành Đạt',
  'Kim Ngân', 'Văn Hậu', 'Thanh Hằng', 'Tiến Dũng', 'Mai Phương',
  'Hoàng Bách', 'Trúc Nhân', 'Phương Vy', 'Đình Trọng', 'Cẩm Ly'
];

// Danh sách màu avatar tượng trưng cho bot
const BOT_COLORS = [
  '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#FF9800', '#795548'
];

class Simulator {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.bots = [];
    this.autoGiftEnabled = false;
    this.autoGiftInterval = null;
    this.scheduledTimeouts = [];
  }

  /**
   * Tạo ra N bot người xem ảo
   */
  spawnBots(count = 20) {
    const existingCount = this.bots.length;
    for (let i = 0; i < count; i++) {
      const idx = existingCount + i;
      const baseName = BOT_NAMES[idx % BOT_NAMES.length];
      const botId = `bot_${idx + 1}`;
      const nickname = `${baseName} ${idx >= BOT_NAMES.length ? (idx + 1) : '🌸'}`;
      const color = BOT_COLORS[idx % BOT_COLORS.length];

      // Đưa bot vào danh sách
      const bot = {
        userId: botId,
        uniqueId: `user_${botId}`,
        nickname,
        avatarUrl: '', // Sẽ được canvas vẽ avatar màu kèm chữ cái đầu
        color,
        // Tỉ lệ trả lời đúng ngẫu nhiên 45% - 85%
        accuracy: 0.45 + Math.random() * 0.40
      };

      this.bots.push(bot);

      // Đăng ký người chơi vào game ở mặt đất
      this.game.registerPlayer({
        userId: bot.userId,
        uniqueId: bot.uniqueId,
        nickname: bot.nickname,
        avatarUrl: bot.avatarUrl,
        color: bot.color
      });
    }

    return this.bots.length;
  }

  /**
   * Kích hoạt bot tự động trả lời câu hỏi hiện tại
   * Gọi khi câu hỏi chuyển sang giai đoạn TRẢ LỜI (ANSWER)
   */
  onQuestionStart(question) {
    this.clearTimeouts();
    if (this.bots.length === 0) return;

    const answerDurationMs = (this.game.config.timings.answerDuration || 15) * 1000;

    for (const bot of this.bots) {
      // 85% khả năng bot sẽ trả lời câu này (mô phỏng một số người không trả lời)
      if (Math.random() > 0.88) continue;

      // Thời gian trễ ngẫu nhiên: từ 1.2s đến (answerDuration - 2.5s)
      const maxDelay = Math.max(2000, answerDurationMs - 2500);
      const delay = 1200 + Math.random() * (maxDelay - 1200);

      const timerId = setTimeout(() => {
        // Kiểm tra xem game còn đang ở giai đoạn TRẢ LỜI không
        if (this.game.phase !== 'ANSWER') return;

        // Quyết định đúng hay sai dựa vào accuracy của bot
        const isCorrect = Math.random() < bot.accuracy;
        let chosenOption;

        if (isCorrect) {
          chosenOption = question.answer;
        } else {
          // Chọn một trong 3 đáp án sai
          const wrongOptions = [0, 1, 2, 3].filter(o => o !== question.answer);
          // Nếu câu hỏi đã bị 50:50 loại trừ đáp án
          const availableWrongs = wrongOptions.filter(o => !this.game.eliminatedOptions.includes(o));
          chosenOption = availableWrongs.length > 0
            ? availableWrongs[Math.floor(Math.random() * availableWrongs.length)]
            : wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }

        const letter = ['a', 'b', 'c', 'd'][chosenOption];
        const prefixes = ['', 'chọn ', 'đáp án ', 'câu ', 'chắc là '];
        const suffixes = ['', ' nha', ' nè', '!', ' ạ'];
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        const commentText = `${p}${letter}${s}`;

        // Gửi bình luận vào game engine
        this.game.handleComment({
          userId: bot.userId,
          uniqueId: bot.uniqueId,
          nickname: bot.nickname,
          avatarUrl: bot.avatarUrl,
          text: commentText
        });
      }, delay);

      this.scheduledTimeouts.push(timerId);
    }
  }

  /**
   * Bật/tắt bot tự động tặng quà ngẫu nhiên
   */
  toggleAutoGift(enable) {
    this.autoGiftEnabled = !!enable;
    if (this.autoGiftInterval) {
      clearInterval(this.autoGiftInterval);
      this.autoGiftInterval = null;
    }

    if (this.autoGiftEnabled) {
      this.autoGiftInterval = setInterval(() => {
        if (this.bots.length === 0 || this.game.phase === 'VICTORY') return;
        const randomBot = this.bots[Math.floor(Math.random() * this.bots.length)];
        const gifts = [
          { giftId: 5655, giftName: 'Rose', count: 1 },
          { giftId: 5487, giftName: 'Finger Heart', count: 1 },
          { giftId: 5281, giftName: 'Doughnut', count: 1 },
          { giftId: 5372, giftName: 'Cap', count: 1 }
        ];
        const g = gifts[Math.floor(Math.random() * gifts.length)];

        this.game.handleGift({
          userId: randomBot.userId,
          uniqueId: randomBot.uniqueId,
          nickname: randomBot.nickname,
          avatarUrl: randomBot.avatarUrl,
          giftId: g.giftId,
          giftName: g.giftName,
          repeatCount: g.count,
          repeatEnd: true
        });
      }, 15000 + Math.random() * 10000);
    }
  }

  clearTimeouts() {
    for (const t of this.scheduledTimeouts) {
      clearTimeout(t);
    }
    this.scheduledTimeouts = [];
  }

  reset() {
    this.clearTimeouts();
    if (this.autoGiftInterval) {
      clearInterval(this.autoGiftInterval);
      this.autoGiftInterval = null;
    }
    this.bots = [];
    this.autoGiftEnabled = false;
  }
}

module.exports = Simulator;
