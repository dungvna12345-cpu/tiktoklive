/**
 * Game Main Script (main.js)
 * Khởi tạo Canvas, Socket.IO, vòng lặp 60fps và đồng bộ trạng thái từ Server.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const audioBtn = document.getElementById('audio-toggle');
  const reconnectBadge = document.getElementById('reconnect-badge');

  // Đặt kích thước logic nội bộ 540x960, scale x2 lên 1080x1920 cho độ nét tuyệt hảo
  const LOGICAL_WIDTH = 540;
  const LOGICAL_HEIGHT = 960;
  const SCALE = 2;

  canvas.width = LOGICAL_WIDTH * SCALE;
  canvas.height = LOGICAL_HEIGHT * SCALE;

  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE); // Tất cả tọa độ vẽ dùng hệ 540x960

  const renderer = new window.GameRenderer(canvas);
  const sound = window.soundSystem;

  // Trạng thái cục bộ phản chiếu từ máy chủ
  const gameState = {
    round: 1,
    questionNumber: 1,
    phase: 'WAITING',
    timer: 0,
    isChallenge: false,
    isWindX2: false,
    targetFloor: 20,
    currentQuestion: null,
    eliminatedOptions: [],
    totalAnswered: 0,
    players: [],
    leaderboard: [],
    totalPlayers: 0,
    fastestUserIds: [],
    winner: null
  };

  // Nút bật/tắt âm thanh
  audioBtn.addEventListener('click', () => {
    sound.init();
    const isEnabled = sound.toggle();
    audioBtn.textContent = isEnabled ? '🔊' : '🔇';
    audioBtn.title = isEnabled ? 'Tắt âm thanh' : 'Bật âm thanh';
  });

  // Tự kích hoạt audio context khi click bất kỳ đâu vào trang
  window.addEventListener('click', () => {
    sound.init();
  }, { once: true });

  // Kết nối Socket.IO
  const socket = io();

  socket.on('connect', () => {
    console.log('✅ Đã kết nối Socket.IO với máy chủ game');
  });

  // Đồng bộ toàn bộ trạng thái khi kết nối
  socket.on('game:state_sync', (data) => {
    Object.assign(gameState, data);
  });

  // Bảng xếp hạng Top người chơi
  socket.on('game:leaderboard', (data) => {
    gameState.leaderboard = data.leaderboard || [];
    gameState.totalPlayers = data.totalPlayers || 0;
  });

  // Chuyển giai đoạn câu hỏi (READ, ANSWER, REVEAL, VICTORY)
  socket.on('game:phase_change', (data) => {
    gameState.phase = data.phase;
    gameState.timer = data.timer;
    if (data.questionNumber !== undefined) gameState.questionNumber = data.questionNumber;
    if (data.isChallenge !== undefined) gameState.isChallenge = data.isChallenge;
    if (data.isWindX2 !== undefined) gameState.isWindX2 = data.isWindX2;
    if (data.question) gameState.currentQuestion = data.question;
    gameState.eliminatedOptions = [];
    gameState.totalAnswered = 0;

    if (data.phase === 'READ') {
      sound.playTone(587.33, 'triangle', 0.15, 0.1); // Tiếng bắt đầu câu mới
    }
  });

  // Đếm giây từng nhịp
  socket.on('game:timer_tick', (data) => {
    gameState.timer = data.timer;
    gameState.phase = data.phase;

    // Tiếng tick ở giai đoạn TRẢ LỜI
    if (data.phase === 'ANSWER') {
      if (data.timer <= 5 && data.timer > 0) {
        sound.playTick(true); // Tiếng tick dồn dập 5 giây cuối
      } else if (data.timer > 5) {
        sound.playTick(false);
      }
    }
  });

  // Có người nộp đáp án
  socket.on('game:answer_received', (data) => {
    gameState.totalAnswered = data.totalAnswered;
    const player = gameState.players.find(p => p.userId === data.userId);
    if (player) player.hasAnswered = true;
  });

  // Công bố kết quả & đáp án đúng
  socket.on('game:reveal', (data) => {
    gameState.phase = data.phase;
    gameState.timer = data.timer;
    gameState.correctOption = data.correctOption;
    gameState.optionPercentages = data.optionPercentages;
    gameState.fastestUserIds = data.fastestUserIds || [];
    if (gameState.currentQuestion) {
      gameState.currentQuestion.fact = data.fact;
      gameState.currentQuestion.answer = data.correctOption;
    }

    // Cập nhật tầng mới cho từng người chơi
    if (data.deltas) {
      let anyCorrect = false;
      for (const d of data.deltas) {
        const p = gameState.players.find(x => x.userId === d.userId);
        if (p) {
          p.floor = d.newFloor;
          if (d.isCorrect) anyCorrect = true;
        }
      }

      if (anyCorrect) {
        sound.playCorrect();
        renderer.effects.spawnConfetti(35);
      } else {
        sound.playWrong();
        renderer.effects.showBanner('KHÔNG AI ĐÚNG! 😅', 'Cố gắng ở câu tiếp theo nhé!');
      }

      // Banner vinh danh người nhanh nhất
      if (data.fastestNickname) {
        setTimeout(() => {
          renderer.effects.showBanner(`NHANH NHẤT: ${data.fastestNickname} ⚡`, 'Được thưởng thêm +1 tầng!');
        }, 1200);
      }
    }
  });

  // Chạm Đỉnh Tháp (Victory)
  socket.on('game:victory', (data) => {
    gameState.phase = 'VICTORY';
    gameState.winner = data.winner;
    gameState.timer = data.timer;
    gameState.round = data.round;

    sound.playVictory();
    renderer.effects.spawnConfetti(120);
  });

  // Bắt đầu vòng mới
  socket.on('game:round_reset', (data) => {
    gameState.round = data.round;
    gameState.phase = 'WAITING';
    for (const p of gameState.players) {
      p.floor = 0;
    }
  });

  // Gợi ý 50:50
  socket.on('game:hint_5050', (data) => {
    gameState.eliminatedOptions = data.eliminatedOptions || [];
    sound.playTone(800, 'sine', 0.2, 0.15);
  });

  // Gió đẩy x2
  socket.on('game:wind_x2', () => {
    gameState.isWindX2 = true;
    sound.playTone(400, 'triangle', 0.4, 0.15, 300);
  });

  // Hiệu ứng Banner nổi & âm thanh
  socket.on('fx:banner', (data) => {
    renderer.effects.showBanner(data.title, data.subtitle);

    switch (data.sound) {
      case 'ladder':
        sound.playLadder();
        break;
      case 'cable_car':
        sound.playCableCar();
        renderer.effects.spawnConfetti(50);
        break;
      case 'freeze':
        sound.playFreeze();
        break;
      case 'cheer':
        sound.playCheer();
        break;
      default:
        sound.playTone(600, 'triangle', 0.25, 0.15);
    }
  });

  // Trạng thái TikTok LIVE (báo kết nối lại)
  socket.on('tiktok:status', (data) => {
    if (data.status === 'RECONNECTING') {
      reconnectBadge.style.display = 'block';
      reconnectBadge.textContent = '🔄 Đang kết nối lại LIVE...';
    } else if (data.status === 'ERROR') {
      reconnectBadge.style.display = 'block';
      reconnectBadge.textContent = '⚠️ Mất kết nối LIVE';
    } else {
      reconnectBadge.style.display = 'none';
    }
  });

  // VÒNG LẶP RENDER 60 FPS
  let lastTime = performance.now();

  function loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    renderer.update(dt, gameState);
    renderer.render(gameState);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
