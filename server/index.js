/**
 * Máy Chủ Chính THÁP SÁCH (server/index.js)
 * Express + Socket.IO + Routing + Admin REST APIs
 */

require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

const { handleAvatarProxy } = require('./avatar');
const GameEngine = require('./game');
const TikTokManager = require('./tiktok');
const questionManager = require('./questions');
const { getGiftsConfig, saveGiftsConfig, reloadGiftsConfig } = require('./gifts');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Khởi tạo Game Engine & TikTok LIVE Manager
const gameEngine = new GameEngine(io);
const tiktokManager = new TikTokManager(gameEngine, io);

// Tự động kết nối nếu có TIKTOK_USERNAME trong .env
if (process.env.TIKTOK_USERNAME) {
  setTimeout(() => {
    tiktokManager.connect(process.env.TIKTOK_USERNAME);
  }, 2000);
}

// Bắt đầu câu hỏi đầu tiên của game
setTimeout(() => {
  gameEngine.startNewQuestion();
}, 1500);

// Proxy tải Avatar không vướng CORS
app.get('/avatar', handleAvatarProxy);

// Phục vụ tài nguyên tĩnh
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use('/game', express.static(path.join(__dirname, '..', 'public', 'game')));
app.use('/admin', express.static(path.join(__dirname, '..', 'public', 'admin')));

// Chuyển hướng trang chủ về /game
app.get('/', (req, res) => {
  res.redirect('/game');
});

// --- REST API CHO TRANG ADMIN ---

// 1. Trạng thái tổng quan
app.get('/api/status', (req, res) => {
  res.json({
    tiktok: tiktokManager.getStatus(),
    game: gameEngine.getState()
  });
});

// 2. Kết nối / Ngắt kết nối TikTok
app.post('/api/tiktok/connect', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Thiếu username' });
  }
  const ok = await tiktokManager.connect(username);
  res.json({ success: ok, status: tiktokManager.getStatus() });
});

app.post('/api/tiktok/disconnect', (req, res) => {
  tiktokManager.disconnect();
  res.json({ success: true, status: tiktokManager.getStatus() });
});

// 3. Cấu hình game
app.get('/api/config', (req, res) => {
  res.json({
    game: gameEngine.config,
    gifts: getGiftsConfig()
  });
});

app.post('/api/config/game', (req, res) => {
  gameEngine.saveConfig(req.body);
  res.json({ success: true, config: gameEngine.config });
});

app.post('/api/config/gifts', (req, res) => {
  saveGiftsConfig(req.body);
  reloadGiftsConfig();
  res.json({ success: true, gifts: getGiftsConfig() });
});

// 4. Quản lý câu hỏi (CRUD + Import/Export)
app.get('/api/questions', (req, res) => {
  const { topic, level, search } = req.query;
  let list = questionManager.getAll();

  if (topic) {
    list = list.filter(q => q.topic === topic);
  }
  if (level) {
    list = list.filter(q => String(q.level) === String(level));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(q => q.question.toLowerCase().includes(s));
  }

  res.json({
    total: list.length,
    topics: questionManager.getTopics(),
    questions: list
  });
});

app.post('/api/questions', (req, res) => {
  const newQ = questionManager.addQuestion(req.body);
  res.json({ success: true, question: newQ });
});

app.put('/api/questions/:id', (req, res) => {
  const updated = questionManager.updateQuestion(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
  res.json({ success: true, question: updated });
});

app.delete('/api/questions/:id', (req, res) => {
  const ok = questionManager.deleteQuestion(req.params.id);
  res.json({ success: ok });
});

app.post('/api/questions/import', (req, res) => {
  const count = questionManager.importQuestions(req.body);
  if (count === false) return res.status(400).json({ error: 'Dữ liệu không đúng định dạng mảng' });
  res.json({ success: true, count });
});

app.get('/api/questions/export', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="questions.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(questionManager.getAll(), null, 2));
});

// 5. Thống kê & Người chơi
app.get('/api/stats/players', (req, res) => {
  const top = db.getTopPlayers(50);
  res.json({ players: top });
});

app.post('/api/stats/reset', (req, res) => {
  db.deleteAllStats();
  gameEngine.players.clear();
  gameEngine.broadcastLeaderboard();
  res.json({ success: true });
});

// 6. Điều khiển Game
app.post('/api/game/control', (req, res) => {
  const { action } = req.body;
  switch (action) {
    case 'start':
    case 'skip':
      gameEngine.skipQuestion();
      break;
    case 'pause':
      gameEngine.pause();
      break;
    case 'resume':
      gameEngine.resume();
      break;
    case 'reset':
      gameEngine.resetRound();
      break;
    default:
      return res.status(400).json({ error: 'Hành động không hợp lệ' });
  }
  res.json({ success: true, phase: gameEngine.phase });
});

// 7. Chế độ Giả Lập (Simulator)
app.post('/api/simulator/bots', (req, res) => {
  const count = Number(req.body.count) || 20;
  const totalBots = gameEngine.simulator.spawnBots(count);
  gameEngine.broadcastState();
  gameEngine.broadcastLeaderboard();
  res.json({ success: true, totalBots });
});

app.post('/api/simulator/auto-gift', (req, res) => {
  const { enabled } = req.body;
  gameEngine.simulator.toggleAutoGift(enabled);
  res.json({ success: true, autoGift: gameEngine.simulator.autoGiftEnabled });
});

app.post('/api/simulator/send', (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) return res.status(400).json({ error: 'Thiếu type hoặc data' });

  switch (type) {
    case 'chat':
      gameEngine.handleComment({
        userId: data.userId || 'sim_user',
        uniqueId: data.uniqueId || 'sim_user',
        nickname: data.nickname || 'Khán giả',
        avatarUrl: data.avatarUrl || '',
        text: data.text || ''
      });
      break;
    case 'gift':
      gameEngine.handleGift({
        userId: data.userId || 'sim_user',
        uniqueId: data.uniqueId || 'sim_user',
        nickname: data.nickname || 'Khán giả',
        avatarUrl: data.avatarUrl || '',
        giftId: Number(data.giftId) || 5655,
        giftName: data.giftName || 'Rose',
        repeatCount: Number(data.repeatCount) || 1,
        repeatEnd: true
      });
      break;
    case 'like':
      gameEngine.handleLike({
        likeCount: Number(data.likeCount) || 10,
        totalLikeCount: Number(data.totalLikeCount) || 0
      });
      break;
    case 'follow':
      gameEngine.handleFollow({
        userId: data.userId || 'sim_user',
        uniqueId: data.uniqueId || 'sim_user',
        nickname: data.nickname || 'Bạn mới',
        avatarUrl: data.avatarUrl || ''
      });
      break;
    case 'share':
      gameEngine.handleShare({
        userId: data.userId || 'sim_user',
        uniqueId: data.uniqueId || 'sim_user',
        nickname: data.nickname || 'Người chia sẻ',
        avatarUrl: data.avatarUrl || ''
      });
      break;
    default:
      return res.status(400).json({ error: 'Loại sự kiện không hỗ trợ' });
  }

  res.json({ success: true });
});

// --- SOCKET.IO KẾT NỐI REALTIME ---
io.on('connection', (socket) => {
  // Gửi ngay trạng thái ban đầu cho client mới
  socket.emit('game:state_sync', gameEngine.getState());
  socket.emit('tiktok:status', tiktokManager.getStatus());
  gameEngine.broadcastLeaderboard();

  socket.on('disconnect', () => {});
});

const net = require('net');

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

async function startServer() {
  let targetPort = Number(PORT) || 3000;
  while (!(await isPortAvailable(targetPort))) {
    console.warn(`⚠️ [CẢNH BÁO] Cổng ${targetPort} đang bận bởi ứng dụng khác. Đang thử cổng ${targetPort + 1}...`);
    targetPort++;
  }

  server.listen(targetPort, () => {
    console.log(`=======================================================`);
    console.log(`🎮 THÁP SÁCH - TikTok LIVE Game Server`);
    console.log(`📡 Máy chủ đang chạy tại: http://localhost:${targetPort}`);
    console.log(`🎯 Màn hình Game (OBS/TikTok LIVE Studio): http://localhost:${targetPort}/game`);
    console.log(`⚙️ Bảng Điều Khiển Admin: http://localhost:${targetPort}/admin`);
    console.log(`=======================================================`);
  });
}

startServer();
