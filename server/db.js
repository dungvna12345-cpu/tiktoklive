/**
 * Module Quản Lý Cơ Sở Dữ Liệu SQLite (better-sqlite3)
 * Lưu trữ tiến độ và thống kê người chơi tháp sách.
 */

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'thap_sach.db');

// Khởi tạo database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Tạo bảng người chơi và bảng lịch sử vòng chơi
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    userId TEXT PRIMARY KEY,
    uniqueId TEXT,
    nickname TEXT,
    avatarUrl TEXT,
    currentFloor INTEGER DEFAULT 0,
    highestFloor INTEGER DEFAULT 0,
    correctCount INTEGER DEFAULT 0,
    totalAnswered INTEGER DEFAULT 0,
    fastestCount INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    totalGifts INTEGER DEFAULT 0,
    lastActive INTEGER
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roundNumber INTEGER,
    winnerUserId TEXT,
    winnerNickname TEXT,
    totalQuestions INTEGER,
    completedAt INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_players_floor ON players(currentFloor DESC);
`);

// Chuẩn bị sẵn các prepared statement để tối ưu hiệu năng
const stmts = {
  upsertPlayer: db.prepare(`
    INSERT INTO players (userId, uniqueId, nickname, avatarUrl, lastActive)
    VALUES (@userId, @uniqueId, @nickname, @avatarUrl, @lastActive)
    ON CONFLICT(userId) DO UPDATE SET
      uniqueId = excluded.uniqueId,
      nickname = excluded.nickname,
      avatarUrl = COALESCE(excluded.avatarUrl, players.avatarUrl),
      lastActive = excluded.lastActive
  `),

  updateFloor: db.prepare(`
    UPDATE players SET
      currentFloor = @floor,
      highestFloor = MAX(highestFloor, @floor),
      lastActive = @lastActive
    WHERE userId = @userId
  `),

  recordAnswer: db.prepare(`
    UPDATE players SET
      totalAnswered = totalAnswered + 1,
      correctCount = correctCount + @correctInc,
      fastestCount = fastestCount + @fastestInc,
      lastActive = @lastActive
    WHERE userId = @userId
  `),

  recordWin: db.prepare(`
    UPDATE players SET
      wins = wins + 1,
      lastActive = @lastActive
    WHERE userId = @userId
  `),

  addGiftCount: db.prepare(`
    UPDATE players SET
      totalGifts = totalGifts + @count,
      lastActive = @lastActive
    WHERE userId = @userId
  `),

  getPlayer: db.prepare(`SELECT * FROM players WHERE userId = ?`),

  getTopPlayers: db.prepare(`
    SELECT * FROM players
    ORDER BY currentFloor DESC, correctCount DESC
    LIMIT ?
  `),

  getAllPlayers: db.prepare(`SELECT * FROM players ORDER BY currentFloor DESC`),

  resetRoundFloors: db.prepare(`UPDATE players SET currentFloor = 0`),

  deleteAllStats: db.prepare(`DELETE FROM players`),
  clearRounds: db.prepare(`DELETE FROM rounds`),

  saveRound: db.prepare(`
    INSERT INTO rounds (roundNumber, winnerUserId, winnerNickname, totalQuestions, completedAt)
    VALUES (?, ?, ?, ?, ?)
  `)
};

function upsertPlayer({ userId, uniqueId, nickname, avatarUrl }) {
  if (!userId) return;
  const now = Date.now();
  stmts.upsertPlayer.run({
    userId: String(userId),
    uniqueId: String(uniqueId || ''),
    nickname: String(nickname || 'Người xem'),
    avatarUrl: String(avatarUrl || ''),
    lastActive: now
  });
}

function updateFloor(userId, floor) {
  stmts.updateFloor.run({
    userId: String(userId),
    floor: Math.max(0, Number(floor) || 0),
    lastActive: Date.now()
  });
}

function recordAnswer(userId, isCorrect, isFastest) {
  stmts.recordAnswer.run({
    userId: String(userId),
    correctInc: isCorrect ? 1 : 0,
    fastestInc: isFastest ? 1 : 0,
    lastActive: Date.now()
  });
}

function recordWin(userId) {
  stmts.recordWin.run({
    userId: String(userId),
    lastActive: Date.now()
  });
}

function addGift(userId, count = 1) {
  stmts.addGiftCount.run({
    userId: String(userId),
    count: Math.max(1, count),
    lastActive: Date.now()
  });
}

function getPlayer(userId) {
  return stmts.getPlayer.get(String(userId));
}

function getTopPlayers(limit = 6) {
  return stmts.getTopPlayers.all(limit);
}

function resetRoundFloors() {
  stmts.resetRoundFloors.run();
}

function deleteAllStats() {
  stmts.deleteAllStats.run();
  stmts.clearRounds.run();
}

function saveRoundHistory(roundNumber, winnerUserId, winnerNickname, totalQuestions) {
  stmts.saveRound.run(roundNumber, winnerUserId, winnerNickname, totalQuestions, Date.now());
}

module.exports = {
  db,
  upsertPlayer,
  updateFloor,
  recordAnswer,
  recordWin,
  addGift,
  getPlayer,
  getTopPlayers,
  resetRoundFloors,
  deleteAllStats,
  saveRoundHistory
};
