/**
 * Game Engine Tháp Sách - Single Source of Truth
 * Điều phối toàn bộ vòng đời câu hỏi, nhận đáp án, quà tặng và tính điểm.
 */

const fs = require('fs');
const path = require('path');
const { extractAnswer, sanitizeNickname } = require('./normalize');
const { calculateQuestionScores } = require('./scoring');
const { GiftStreakTracker, findGiftEffect } = require('./gifts');
const questionManager = require('./questions');
const db = require('./db');
const Simulator = require('./simulator');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'game.json');

class GameEngine {
  constructor(io) {
    this.io = io;
    this.loadConfig();

    this.round = 1;
    this.questionNumber = 0;
    this.phase = 'WAITING'; // WAITING, READ, ANSWER, REVEAL, VICTORY, PAUSED
    this.timer = 0;
    this.timerInterval = null;

    this.currentQuestion = null;
    this.isChallenge = false;
    this.isWindX2 = false;
    this.pendingWindX2 = false;
    this.eliminatedOptions = []; // Cho gợi ý 50:50
    this.frozenUserIds = new Set();
    this.nextFrozenUserIds = new Set();

    // Người chơi: userId -> { userId, uniqueId, nickname, avatarUrl, floor, correctCount, fastestCount, color, hasAnswered, lastOption }
    this.players = new Map();

    // Đáp án câu hiện tại: [{ userId, option, timestamp }]
    this.currentAnswers = [];
    this.answeredUserIds = new Set();

    // Bộ theo dõi combo quà
    this.streakTracker = new GiftStreakTracker();

    // Spam filter cache: userId -> lastCommentTime
    this.userLastComment = new Map();

    // Tương tác like, follow, share
    this.totalRoomLikes = 0;
    this.lastLikeMilestone = 0;
    this.followedUsers = new Set();
    this.userLastShare = new Map();

    // Simulator
    this.simulator = new Simulator(this);

    // Người chiến thắng vòng hiện tại
    this.currentWinner = null;
  }

  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      this.config = {
        targetFloor: 20,
        timings: { readDuration: 3, answerDuration: 15, revealDuration: 7, victoryDuration: 7 },
        challengeInterval: 5,
        maxClimbersPerFloor: 12,
        maxLeaderboard: 6,
        soundEnabled: true
      };
    }
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf8');
    this.broadcastState();
  }

  /**
   * Đăng ký hoặc lấy người chơi
   */
  registerPlayer({ userId, uniqueId, nickname, avatarUrl, color }) {
    if (!userId) return null;
    const strId = String(userId);

    let player = this.players.get(strId);
    if (!player) {
      // Đọc từ database nếu đã có
      const dbPlayer = db.getPlayer(strId);
      const safeNick = sanitizeNickname(nickname || (dbPlayer ? dbPlayer.nickname : 'Người xem'));

      player = {
        userId: strId,
        uniqueId: uniqueId || (dbPlayer ? dbPlayer.uniqueId : ''),
        nickname: safeNick,
        avatarUrl: avatarUrl || (dbPlayer ? dbPlayer.avatarUrl : ''),
        floor: dbPlayer ? dbPlayer.currentFloor : 0,
        correctCount: dbPlayer ? dbPlayer.correctCount : 0,
        fastestCount: dbPlayer ? dbPlayer.fastestCount : 0,
        color: color || this.getRandomColor(),
        hasAnswered: false,
        lastOption: null
      };

      this.players.set(strId, player);
      db.upsertPlayer(player);
      this.broadcastLeaderboard();
    } else {
      if (nickname) player.nickname = sanitizeNickname(nickname);
      if (avatarUrl) player.avatarUrl = avatarUrl;
    }
    return player;
  }

  getRandomColor() {
    const palette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7D794', '#778BEB', '#E77F67', '#CF6A87', '#786FA6'
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  /**
   * Bắt đầu một vòng câu hỏi mới
   */
  startNewQuestion() {
    if (this.phase === 'PAUSED') return;

    this.questionNumber++;
    this.isChallenge = this.questionNumber % (this.config.challengeInterval || 5) === 0;

    // Kế thừa gió x2 nếu được kích hoạt từ trước
    this.isWindX2 = this.pendingWindX2;
    this.pendingWindX2 = false;

    // Áp dụng trạng thái đóng băng cho câu này
    this.frozenUserIds = new Set(this.nextFrozenUserIds);
    this.nextFrozenUserIds.clear();

    this.eliminatedOptions = [];
    this.currentAnswers = [];
    this.answeredUserIds.clear();

    // Reset trạng thái trả lời của người chơi
    for (const p of this.players.values()) {
      p.hasAnswered = false;
      p.lastOption = null;
    }

    // Lấy câu hỏi từ ngân hàng
    this.currentQuestion = questionManager.getNextQuestion(this.isChallenge);

    // Chuyển sang giai đoạn ĐỌC ĐỀ
    this.phase = 'READ';
    this.timer = this.config.timings.readDuration || 3;

    this.io.emit('game:phase_change', {
      phase: this.phase,
      timer: this.timer,
      questionNumber: this.questionNumber,
      isChallenge: this.isChallenge,
      isWindX2: this.isWindX2,
      question: {
        id: this.currentQuestion.id,
        question: this.currentQuestion.question,
        options: this.currentQuestion.options,
        topic: this.currentQuestion.topic,
        level: this.currentQuestion.level
      }
    });

    this.broadcastState();

    this.startCountdown(() => {
      // Khi hết giai đoạn ĐỌC ĐỀ -> Chuyển sang TRẢ LỜI
      this.enterAnswerPhase();
    });
  }

  /**
   * Giai đoạn TRẢ LỜI (15 giây)
   */
  enterAnswerPhase() {
    this.phase = 'ANSWER';
    this.timer = this.config.timings.answerDuration || 15;

    this.io.emit('game:phase_change', {
      phase: this.phase,
      timer: this.timer,
      questionNumber: this.questionNumber
    });

    // Thông báo cho bot simulator
    this.simulator.onQuestionStart(this.currentQuestion);

    this.startCountdown(() => {
      // Hết giờ trả lời -> Chuyển sang CÔNG BỐ
      this.enterRevealPhase();
    });
  }

  /**
   * Giai đoạn CÔNG BỐ ĐÁP ÁN (7 giây)
   */
  enterRevealPhase() {
    this.phase = 'REVEAL';
    this.timer = this.config.timings.revealDuration || 7;

    const currentFloors = {};
    for (const [uid, p] of this.players.entries()) {
      currentFloors[uid] = p.floor;
    }

    // Tính điểm và thăng tụt tầng
    const scoringResult = calculateQuestionScores({
      answers: this.currentAnswers,
      correctOption: this.currentQuestion.answer,
      isChallenge: this.isChallenge,
      isWindX2: this.isWindX2,
      frozenUserIds: this.frozenUserIds,
      currentFloors,
      targetFloor: this.config.targetFloor || 20
    });

    // Cập nhật tầng mới cho người chơi
    const playerDeltas = [];
    for (const [uid, res] of scoringResult.results.entries()) {
      const p = this.players.get(uid);
      if (p) {
        p.floor = res.newFloor;
        if (res.isCorrect) p.correctCount++;
        if (res.isFastest) p.fastestCount++;
        db.updateFloor(uid, p.floor);
        db.recordAnswer(uid, res.isCorrect, res.isFastest);

        playerDeltas.push({
          userId: uid,
          oldFloor: res.oldFloor,
          newFloor: res.newFloor,
          delta: res.delta,
          isCorrect: res.isCorrect,
          isFastest: res.isFastest,
          isFrozen: res.isFrozen
        });
      }
    }

    // Thống kê % bình chọn cho 4 phương án
    const totalAns = this.currentAnswers.length;
    const optionCounts = [0, 0, 0, 0];
    for (const a of this.currentAnswers) {
      if (a.option >= 0 && a.option <= 3) optionCounts[a.option]++;
    }
    const optionPercentages = optionCounts.map(count =>
      totalAns > 0 ? Math.round((count / totalAns) * 100) : 0
    );

    // Tìm tên người trả lời đúng nhanh nhất (Top 1)
    let fastestNickname = null;
    if (scoringResult.fastestUserIds.length > 0) {
      const top1 = this.players.get(scoringResult.fastestUserIds[0]);
      if (top1) fastestNickname = top1.nickname;
    }

    this.io.emit('game:reveal', {
      phase: this.phase,
      timer: this.timer,
      correctOption: this.currentQuestion.answer,
      fact: this.currentQuestion.fact,
      optionPercentages,
      optionCounts,
      totalAnswers: totalAns,
      deltas: playerDeltas,
      fastestUserIds: scoringResult.fastestUserIds,
      fastestNickname
    });

    this.broadcastLeaderboard();

    // Hết 7s công bố -> Kiểm tra chiến thắng hoặc câu hỏi kế tiếp
    this.startCountdown(() => {
      if (scoringResult.winners.length > 0) {
        const winnerId = scoringResult.winners[0];
        const winner = this.players.get(winnerId);
        this.triggerVictory(winner);
      } else {
        this.startNewQuestion();
      }
    });
  }

  /**
   * Màn hình CHẠM ĐỈNH THÁP! (7 giây)
   */
  triggerVictory(winner) {
    this.phase = 'VICTORY';
    this.timer = this.config.timings.victoryDuration || 7;
    this.currentWinner = winner;

    if (winner) {
      db.recordWin(winner.userId);
      db.saveRoundHistory(this.round, winner.userId, winner.nickname, this.questionNumber);
    }

    this.io.emit('game:victory', {
      winner: winner ? {
        userId: winner.userId,
        nickname: winner.nickname,
        avatarUrl: winner.avatarUrl,
        correctCount: winner.correctCount,
        floor: winner.floor
      } : null,
      round: this.round,
      timer: this.timer
    });

    this.startCountdown(() => {
      // Sau 7s, mọi người về mặt đất và bắt đầu vòng mới
      this.resetRound();
    });
  }

  /**
   * Bắt đầu vòng chơi mới
   */
  resetRound() {
    this.round++;
    this.questionNumber = 0;
    this.currentWinner = null;
    this.frozenUserIds.clear();
    this.nextFrozenUserIds.clear();
    this.isWindX2 = false;
    this.pendingWindX2 = false;

    // Reset tầng tất cả người chơi về 0
    for (const p of this.players.values()) {
      p.floor = 0;
      p.hasAnswered = false;
      p.lastOption = null;
    }
    db.resetRoundFloors();

    this.io.emit('game:round_reset', {
      round: this.round
    });

    this.broadcastLeaderboard();
    this.startNewQuestion();
  }

  /**
   * Bộ đếm giây chung
   */
  startCountdown(onComplete) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.phase === 'PAUSED') return;

      this.timer--;
      this.io.emit('game:timer_tick', { timer: this.timer, phase: this.phase });

      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }, 1000);
  }

  /**
   * Xử lý bình luận gửi từ LIVE hoặc Simulator
   */
  handleComment({ userId, uniqueId, nickname, avatarUrl, text }) {
    if (!userId || !text) return;
    const strId = String(userId);
    const now = Date.now();

    // Lọc spam: cùng người không bình luận quá nhanh (< 2s)
    const lastTime = this.userLastComment.get(strId) || 0;
    if (now - lastTime < (this.config.spamFilter?.sameUserCommentIntervalMs || 2000)) {
      return;
    }
    this.userLastComment.set(strId, now);

    // Người bình luận lần đầu tự động vào tháp ở mặt đất
    const player = this.registerPlayer({ userId: strId, uniqueId, nickname, avatarUrl });

    // Chỉ nhận đáp án khi đang ở giai đoạn TRẢ LỜI
    if (this.phase === 'ANSWER') {
      // Mỗi người chỉ tính đáp án ĐẦU TIÊN
      if (this.answeredUserIds.has(strId)) {
        return;
      }

      const optionIndex = extractAnswer(text);
      if (optionIndex !== null) {
        this.answeredUserIds.add(strId);
        player.hasAnswered = true;
        player.lastOption = optionIndex;

        this.currentAnswers.push({
          userId: strId,
          option: optionIndex,
          timestamp: now
        });

        // Thông báo số người đã trả lời
        this.io.emit('game:answer_received', {
          userId: strId,
          totalAnswered: this.currentAnswers.length
        });
      }
    }
  }

  /**
   * Xử lý sự kiện quà tặng
   */
  handleGift(rawGiftData) {
    const giftResult = this.streakTracker.processGiftEvent(rawGiftData);
    if (!giftResult) return; // Đang trong combo

    const { userId, uniqueId, nickname, avatarUrl, giftName, repeatCount, mapping } = giftResult;
    const player = this.registerPlayer({ userId, uniqueId, nickname, avatarUrl });
    db.addGift(userId, repeatCount);

    if (!mapping) return;

    let bannerMessage = '';
    let soundEffect = 'gift';

    switch (mapping.effect) {
      case 'ladder': { // Thang tre / Hoa hồng: 1 hoa hồng = 1 tầng
        const climb = repeatCount * (mapping.climbPerUnit || 1);
        player.floor += climb;
        db.updateFloor(userId, player.floor);
        bannerMessage = `🌹 ${player.nickname} tặng x${repeatCount} ${giftName} leo vút +${climb} tầng!`;
        soundEffect = 'ladder';
        break;
      }

      case 'hint_5050': { // Gợi ý 50:50: loại 2 đáp án sai
        if (this.currentQuestion && this.eliminatedOptions.length === 0) {
          const wrongIndices = [0, 1, 2, 3].filter(i => i !== this.currentQuestion.answer);
          // Xáo trộn để lấy ngẫu nhiên 2 đáp án sai
          wrongIndices.sort(() => Math.random() - 0.5);
          this.eliminatedOptions = wrongIndices.slice(0, 2);
          bannerMessage = `GỢI Ý 50:50 từ ${player.nickname}!`;
          soundEffect = 'hint';
          this.io.emit('game:hint_5050', {
            eliminatedOptions: this.eliminatedOptions,
            from: player.nickname
          });
        } else {
          bannerMessage = `Cảm ơn ${player.nickname} đã tặng ${giftName}!`;
        }
        break;
      }

      case 'wind_x2': { // Gió đẩy x2
        if (this.phase === 'READ' || this.phase === 'ANSWER') {
          this.isWindX2 = true;
        } else {
          this.pendingWindX2 = true;
        }
        bannerMessage = `GIÓ ĐẨY x2 từ ${player.nickname}!`;
        soundEffect = 'wind';
        this.io.emit('game:wind_x2', { from: player.nickname });
        break;
      }

      case 'freeze_leader': { // Đóng băng người dẫn đầu
        // Tìm người dẫn đầu (khác người tặng)
        let leader = null;
        let highestFloor = -1;
        for (const p of this.players.values()) {
          if (p.userId !== String(userId) && p.floor > highestFloor) {
            highestFloor = p.floor;
            leader = p;
          }
        }

        if (leader && highestFloor > 0) {
          this.nextFrozenUserIds.add(leader.userId);
          bannerMessage = `ĐÓNG BĂNG ${leader.nickname} ở câu kế tiếp!`;
          soundEffect = 'freeze';
          this.io.emit('game:freeze', {
            frozenUserId: leader.userId,
            frozenNickname: leader.nickname,
            from: player.nickname
          });
        } else {
          bannerMessage = `Cảm ơn ${player.nickname} đã tặng ${giftName}!`;
        }
        break;
      }

      case 'cable_car': { // Cáp treo: leo ngay +50 tầng
        const climb = repeatCount * (mapping.climbPerUnit || 50);
        player.floor += climb;
        db.updateFloor(userId, player.floor);
        bannerMessage = `🎆 CÁP TREO: ${player.nickname} phóng vút +${climb} tầng!`;
        soundEffect = 'cable_car';
        break;
      }

      default:
        bannerMessage = `Cảm ơn ${player.nickname} đã tặng ${giftName}!`;
    }

    // Kiểm tra nếu quà giúp chạm đỉnh tháp
    if (player.floor >= (this.config.targetFloor || 7749)) {
      this.triggerVictory(player);
    }

    // Phát hiệu ứng banner và âm thanh trên màn hình game
    this.io.emit('fx:banner', {
      title: bannerMessage,
      subtitle: `${player.nickname} x${repeatCount} ${giftName}`,
      sound: soundEffect
    });

    this.broadcastLeaderboard();
  }

  /**
   * Xử lý lượt like của phòng
   */
  handleLike({ likeCount, totalLikeCount }) {
    this.totalRoomLikes = totalLikeCount || (this.totalRoomLikes + (likeCount || 1));

    // Cứ mỗi 500 like cả phòng: "Cả lớp cổ vũ!" và câu kế tiếp tự bật Gió đẩy x2
    if (this.totalRoomLikes - this.lastLikeMilestone >= 500) {
      this.lastLikeMilestone = Math.floor(this.totalRoomLikes / 500) * 500;
      this.pendingWindX2 = true;

      this.io.emit('fx:banner', {
        title: 'CẢ LỚP CỔ VŨ! 🎉',
        subtitle: `Đã đạt ${this.lastLikeMilestone} tim · Bật Gió đẩy x2 câu tiếp!`,
        sound: 'cheer'
      });
    }
  }

  /**
   * Xử lý follow
   */
  handleFollow({ userId, uniqueId, nickname, avatarUrl }) {
    if (!userId) return;
    const strId = String(userId);
    if (!this.followedUsers.has(strId)) {
      this.followedUsers.add(strId);
      const player = this.registerPlayer({ userId: strId, uniqueId, nickname, avatarUrl });
      player.floor += 1;
      db.updateFloor(strId, player.floor);

      this.io.emit('fx:banner', {
        title: `Chào bạn mới ${player.nickname}! 👋`,
        subtitle: 'Được tặng +1 tầng leo tháp',
        sound: 'follow'
      });
      this.broadcastLeaderboard();
    }
  }

  /**
   * Xử lý share
   */
  handleShare({ userId, uniqueId, nickname, avatarUrl }) {
    if (!userId) return;
    const strId = String(userId);
    const now = Date.now();
    const lastShare = this.userLastShare.get(strId) || 0;

    // Giới hạn 1 lần mỗi 5 phút
    if (now - lastShare >= 5 * 60 * 1000) {
      this.userLastShare.set(strId, now);
      const player = this.registerPlayer({ userId: strId, uniqueId, nickname, avatarUrl });
      player.floor += 1;
      db.updateFloor(strId, player.floor);

      this.io.emit('fx:banner', {
        title: `${player.nickname} đã chia sẻ LIVE! 🚀`,
        subtitle: 'Được thưởng +1 tầng leo tháp',
        sound: 'share'
      });
      this.broadcastLeaderboard();
    }
  }

  /**
   * Phát bảng xếp hạng top 6 và danh sách hiển thị
   */
  broadcastLeaderboard() {
    const list = Array.from(this.players.values())
      .sort((a, b) => b.floor - a.floor || b.correctCount - a.correctCount)
      .slice(0, this.config.maxLeaderboard || 6);

    this.io.emit('game:leaderboard', {
      leaderboard: list.map(p => ({
        userId: p.userId,
        nickname: p.nickname,
        avatarUrl: p.avatarUrl,
        floor: p.floor,
        color: p.color
      })),
      totalPlayers: this.players.size
    });
  }

  /**
   * Xuất toàn bộ trạng thái hiện tại (dùng cho client mới kết nối)
   */
  getState() {
    const playersList = Array.from(this.players.values()).map(p => ({
      userId: p.userId,
      nickname: p.nickname,
      avatarUrl: p.avatarUrl,
      floor: p.floor,
      color: p.color,
      hasAnswered: p.hasAnswered,
      isFrozen: this.frozenUserIds.has(p.userId)
    }));

    return {
      round: this.round,
      questionNumber: this.questionNumber,
      phase: this.phase,
      timer: this.timer,
      isChallenge: this.isChallenge,
      isWindX2: this.isWindX2,
      targetFloor: this.config.targetFloor || 20,
      currentQuestion: this.currentQuestion ? {
        id: this.currentQuestion.id,
        question: this.currentQuestion.question,
        options: this.currentQuestion.options,
        topic: this.currentQuestion.topic,
        level: this.currentQuestion.level,
        fact: this.phase === 'REVEAL' ? this.currentQuestion.fact : undefined,
        answer: this.phase === 'REVEAL' ? this.currentQuestion.answer : undefined
      } : null,
      eliminatedOptions: this.eliminatedOptions,
      totalAnswered: this.currentAnswers.length,
      players: playersList,
      totalPlayers: this.players.size
    };
  }

  broadcastState() {
    this.io.emit('game:state_sync', this.getState());
  }

  // Điều khiển Admin
  pause() {
    this.phase = 'PAUSED';
    this.io.emit('game:paused');
  }

  resume() {
    if (this.phase === 'PAUSED') {
      this.phase = 'ANSWER';
      this.startCountdown(() => this.enterRevealPhase());
      this.io.emit('game:resumed');
    }
  }

  skipQuestion() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.startNewQuestion();
  }
}

module.exports = GameEngine;
