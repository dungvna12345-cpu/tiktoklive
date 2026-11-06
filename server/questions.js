/**
 * Module Quản Lý Ngân Hàng Câu Hỏi
 * Hỗ trợ xáo trộn không lặp lại, lọc theo chủ đề và độ khó, CRUD câu hỏi.
 */

const fs = require('fs');
const path = require('path');

const QUESTIONS_FILE = path.join(__dirname, '..', 'data', 'questions.json');

class QuestionManager {
  constructor() {
    this.questions = [];
    this.deck = [];
    this.currentIndex = 0;
    this.selectedTopics = null; // null = tất cả chủ đề
    this.selectedLevels = null; // null = tất cả độ khó
    this.loadQuestions();
  }

  loadQuestions() {
    try {
      if (fs.existsSync(QUESTIONS_FILE)) {
        const raw = fs.readFileSync(QUESTIONS_FILE, 'utf8');
        this.questions = JSON.parse(raw);
      } else {
        this.questions = [];
      }
    } catch (e) {
      console.error('Lỗi khi đọc file câu hỏi:', e.message);
      this.questions = [];
    }
    this.resetDeck();
  }

  saveQuestions() {
    try {
      fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(this.questions, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Lỗi khi lưu file câu hỏi:', e.message);
      return false;
    }
  }

  getAll() {
    return this.questions;
  }

  getTopics() {
    const set = new Set();
    this.questions.forEach(q => {
      if (q.topic) set.add(q.topic);
    });
    return Array.from(set);
  }

  setFilters(topics = null, levels = null) {
    this.selectedTopics = Array.isArray(topics) && topics.length > 0 ? topics : null;
    this.selectedLevels = Array.isArray(levels) && levels.length > 0 ? levels.map(Number) : null;
    this.resetDeck();
  }

  resetDeck() {
    let pool = [...this.questions];

    if (this.selectedTopics) {
      pool = pool.filter(q => this.selectedTopics.includes(q.topic));
    }

    if (this.selectedLevels) {
      pool = pool.filter(q => this.selectedLevels.includes(Number(q.level)));
    }

    // Nếu bộ lọc quá chặt không còn câu nào thì lấy toàn bộ
    if (pool.length === 0) {
      pool = [...this.questions];
    }

    // Fisher-Yates Shuffle xáo trộn ngẫu nhiên
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.deck = pool;
    this.currentIndex = 0;
  }

  /**
   * Lấy câu hỏi tiếp theo
   * @param {boolean} isChallenge Có phải câu thử thách (ưu tiên level 3) không
   */
  getNextQuestion(isChallenge = false) {
    if (this.deck.length === 0) {
      this.resetDeck();
    }

    if (isChallenge) {
      // Tìm câu hỏi level 3 trong phần còn lại của deck
      const l3Idx = this.deck.findIndex((q, idx) => idx >= this.currentIndex && q.level === 3);
      if (l3Idx !== -1) {
        // Đưa câu level 3 lên vị trí hiện tại
        const [q] = this.deck.splice(l3Idx, 1);
        this.deck.splice(this.currentIndex, 0, q);
      }
    }

    if (this.currentIndex >= this.deck.length) {
      // Hết một chu kỳ, xáo trộn lại
      this.resetDeck();
    }

    const question = this.deck[this.currentIndex];
    this.currentIndex++;
    return question;
  }

  // CRUD
  addQuestion(questionData) {
    const nextId = this.questions.reduce((max, q) => Math.max(max, q.id || 0), 0) + 1;
    const newQ = {
      id: nextId,
      question: String(questionData.question || '').trim(),
      options: Array.isArray(questionData.options) ? questionData.options.slice(0, 4) : ["A", "B", "C", "D"],
      answer: Math.max(0, Math.min(3, Number(questionData.answer) || 0)),
      fact: String(questionData.fact || '').trim(),
      topic: String(questionData.topic || 'Đời sống').trim(),
      level: Math.max(1, Math.min(3, Number(questionData.level) || 1))
    };
    this.questions.push(newQ);
    this.saveQuestions();
    this.resetDeck();
    return newQ;
  }

  updateQuestion(id, updateData) {
    const idx = this.questions.findIndex(q => q.id === Number(id));
    if (idx === -1) return null;

    const current = this.questions[idx];
    this.questions[idx] = {
      ...current,
      question: updateData.question !== undefined ? String(updateData.question).trim() : current.question,
      options: Array.isArray(updateData.options) ? updateData.options.slice(0, 4) : current.options,
      answer: updateData.answer !== undefined ? Number(updateData.answer) : current.answer,
      fact: updateData.fact !== undefined ? String(updateData.fact).trim() : current.fact,
      topic: updateData.topic !== undefined ? String(updateData.topic).trim() : current.topic,
      level: updateData.level !== undefined ? Number(updateData.level) : current.level
    };

    this.saveQuestions();
    this.resetDeck();
    return this.questions[idx];
  }

  deleteQuestion(id) {
    const initialLen = this.questions.length;
    this.questions = this.questions.filter(q => q.id !== Number(id));
    if (this.questions.length !== initialLen) {
      this.saveQuestions();
      this.resetDeck();
      return true;
    }
    return false;
  }

  importQuestions(newArray) {
    if (!Array.isArray(newArray)) return false;
    let nextId = 1;
    this.questions = newArray.map(q => ({
      id: nextId++,
      question: String(q.question || '').trim(),
      options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ["A", "B", "C", "D"],
      answer: Math.max(0, Math.min(3, Number(q.answer) || 0)),
      fact: String(q.fact || '').trim(),
      topic: String(q.topic || 'Đời sống').trim(),
      level: Math.max(1, Math.min(3, Number(q.level) || 1))
    }));
    this.saveQuestions();
    this.resetDeck();
    return this.questions.length;
  }
}

module.exports = new QuestionManager();
