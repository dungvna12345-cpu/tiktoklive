/**
 * Admin Dashboard Controller (admin.js)
 * Tương tác REST API và Socket.IO cho mọi tính năng điều khiển, giả lập và cấu hình.
 */

window.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');

      // Tải dữ liệu theo tab khi chuyển
      if (btn.dataset.tab === 'tab-questions') loadQuestions();
      if (btn.dataset.tab === 'tab-gifts') loadGiftsConfig();
      if (btn.dataset.tab === 'tab-stats') loadPlayerStats();
      if (btn.dataset.tab === 'tab-settings') loadGameSettings();
    });
  });

  // --- TRẠNG THÁI TIKTOK LIVE & GAME ---
  const liveDot = document.getElementById('live-dot');
  const liveStatusText = document.getElementById('live-status-text');
  const liveViewers = document.getElementById('live-viewers');
  const usernameInput = document.getElementById('tiktok-username-input');
  const btnConnectLive = document.getElementById('btn-connect-live');
  const btnDisconnectLive = document.getElementById('btn-disconnect-live');
  const connectionDetail = document.getElementById('connection-detail');

  const gamePhaseText = document.getElementById('game-phase-text');
  const gameRoundText = document.getElementById('game-round-text');
  const gameQNumText = document.getElementById('game-qnum-text');

  // Socket: TikTok status update
  socket.on('tiktok:status', (data) => {
    updateLiveStatusUI(data);
  });

  socket.on('tiktok:viewers', (data) => {
    liveViewers.textContent = data.viewerCount || 0;
  });

  function updateLiveStatusUI(data) {
    liveDot.className = 'status-dot';
    if (data.status === 'CONNECTED') {
      liveDot.classList.add('connected');
      liveStatusText.textContent = `Đang kết nối: @${data.username}`;
      btnConnectLive.style.display = 'none';
      btnDisconnectLive.style.display = 'inline-flex';
      connectionDetail.textContent = `Phiên LIVE của @${data.username} đang hoạt động.`;
    } else if (data.status === 'CONNECTING' || data.status === 'RECONNECTING') {
      liveDot.classList.add('connecting');
      liveStatusText.textContent = data.message || 'Đang kết nối...';
      btnConnectLive.style.display = 'none';
      btnDisconnectLive.style.display = 'inline-flex';
      connectionDetail.textContent = data.message || 'Đang kết nối...';
    } else {
      liveDot.classList.add('disconnected');
      liveStatusText.textContent = 'Chưa kết nối';
      btnConnectLive.style.display = 'inline-flex';
      btnDisconnectLive.style.display = 'none';
      if (data.message) connectionDetail.textContent = data.message;
    }
  }

  // Socket: Game state update
  socket.on('game:phase_change', (data) => {
    gamePhaseText.textContent = data.phase;
    if (data.questionNumber) gameQNumText.textContent = data.questionNumber;
  });

  socket.on('game:state_sync', (state) => {
    gamePhaseText.textContent = state.phase;
    gameRoundText.textContent = state.round;
    gameQNumText.textContent = state.questionNumber;
  });

  // Nút Kết Nối / Ngắt Kết Nối LIVE
  btnConnectLive.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      alert('Vui lòng nhập username TikTok');
      return;
    }
    btnConnectLive.disabled = true;
    try {
      const res = await fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!data.success && data.status) {
        updateLiveStatusUI(data.status);
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ: ' + e.message);
    } finally {
      btnConnectLive.disabled = false;
    }
  });

  btnDisconnectLive.addEventListener('click', async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  });

  // Điều Khiển Game (Skip, Pause, Resume, Reset)
  const btnSkipQ = document.getElementById('btn-skip-q');
  const btnPauseGame = document.getElementById('btn-pause-game');
  const btnResumeGame = document.getElementById('btn-resume-game');
  const btnResetRound = document.getElementById('btn-reset-round');

  async function sendGameControl(action) {
    try {
      await fetch('/api/game/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (e) {
      alert('Lỗi điều khiển game: ' + e.message);
    }
  }

  btnSkipQ.addEventListener('click', () => sendGameControl('skip'));
  btnPauseGame.addEventListener('click', () => {
    sendGameControl('pause');
    btnPauseGame.style.display = 'none';
    btnResumeGame.style.display = 'inline-flex';
  });
  btnResumeGame.addEventListener('click', () => {
    sendGameControl('resume');
    btnResumeGame.style.display = 'none';
    btnPauseGame.style.display = 'inline-flex';
  });
  btnResetRound.addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn bắt đầu lại vòng và đưa tất cả người chơi về mặt đất?')) {
      sendGameControl('reset');
    }
  });

  // Nhật Ký Sự Kiện Realtime
  const logBox = document.getElementById('realtime-log');
  document.getElementById('btn-clear-log').addEventListener('click', () => {
    logBox.innerHTML = '';
  });

  socket.on('tiktok:event', (evt) => {
    const item = document.createElement('div');
    item.className = `log-item ${evt.type}`;
    const time = new Date(evt.timestamp).toLocaleTimeString();

    if (evt.type === 'chat') {
      item.innerHTML = `<span style="opacity:0.6;">[${time}]</span> 💬 <strong>${evt.data.nickname}:</strong> ${escapeHtml(evt.data.text)}`;
    } else if (evt.type === 'gift') {
      item.innerHTML = `<span style="opacity:0.6;">[${time}]</span> 🎁 <strong>${evt.data.nickname}</strong> tặng <strong>${evt.data.giftName}</strong> (x${evt.data.repeatCount}) · <em>giftId: ${evt.data.giftId}</em>`;
    } else if (evt.type === 'like') {
      item.innerHTML = `<span style="opacity:0.6;">[${time}]</span> ❤️ <strong>${evt.data.nickname}</strong> đã thả ${evt.data.likeCount} tim (tổng phòng: ${evt.data.totalLikeCount})`;
    } else if (evt.type === 'follow') {
      item.innerHTML = `<span style="opacity:0.6;">[${time}]</span> ➕ <strong>${evt.data.nickname}</strong> đã bấm Follow kênh!`;
    } else if (evt.type === 'share') {
      item.innerHTML = `<span style="opacity:0.6;">[${time}]</span> 🚀 <strong>${evt.data.nickname}</strong> đã chia sẻ LIVE!`;
    }

    logBox.prepend(item);
    if (logBox.children.length > 80) {
      logBox.removeChild(logBox.lastChild);
    }
  });

  // --- TAB 2: CHẾ ĐỘ GIẢ LẬP (SIMULATOR) ---
  const btnSpawn20Bots = document.getElementById('btn-spawn-20-bots');
  const btnToggleAutoGift = document.getElementById('btn-toggle-auto-gift');
  const simStatus = document.getElementById('simulator-status');
  let autoGiftOn = false;

  btnSpawn20Bots.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/simulator/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 20 })
      });
      const data = await res.json();
      simStatus.textContent = `✅ Đã tạo thành công. Tổng cộng hiện có ${data.totalBots} bot đang leo tháp!`;
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  });

  btnToggleAutoGift.addEventListener('click', async () => {
    autoGiftOn = !autoGiftOn;
    try {
      await fetch('/api/simulator/auto-gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: autoGiftOn })
      });
      btnToggleAutoGift.textContent = autoGiftOn ? '🛑 Tắt Bot Tự Tặng Quà' : '🎁 Bật Bot Tự Tặng Quà';
      btnToggleAutoGift.className = autoGiftOn ? 'btn btn-danger' : 'btn btn-secondary';
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  });

  // Gửi bình luận test
  const simChatNick = document.getElementById('sim-chat-nick');
  const simChatText = document.getElementById('sim-chat-text');
  const btnSendSimChat = document.getElementById('btn-send-sim-chat');

  async function sendSimChat(text) {
    const nickname = simChatNick.value.trim() || 'Khán Giả';
    const content = text || simChatText.value.trim();
    if (!content) return;

    await fetch('/api/simulator/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        data: { nickname, text: content }
      })
    });
    simChatText.value = '';
  }

  btnSendSimChat.addEventListener('click', () => sendSimChat());
  document.querySelectorAll('.quick-ans-btn').forEach(btn => {
    btn.addEventListener('click', () => sendSimChat(btn.dataset.ans));
  });

  // Gửi quà test
  const simGiftNick = document.getElementById('sim-gift-nick');
  const simGiftSelect = document.getElementById('sim-gift-select');
  const simGiftCount = document.getElementById('sim-gift-count');
  const btnSendSimGift = document.getElementById('btn-send-sim-gift');

  btnSendSimGift.addEventListener('click', async () => {
    const nickname = simGiftNick.value.trim() || 'Người Tặng';
    const [giftId, giftName] = simGiftSelect.value.split('|');
    const repeatCount = Number(simGiftCount.value) || 1;

    await fetch('/api/simulator/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'gift',
        data: { nickname, giftId, giftName, repeatCount }
      })
    });
  });

  document.querySelectorAll('.quick-gift-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const nickname = simGiftNick.value.trim() || 'Người Tặng';
      const [giftId, giftName, countStr] = btn.dataset.gift.split('|');
      const repeatCount = Number(countStr) || 1;

      await fetch('/api/simulator/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'gift',
          data: { nickname, giftId, giftName, repeatCount }
        })
      });
    });
  });

  // Gửi like, follow, share test
  document.getElementById('btn-sim-like-100').addEventListener('click', () => {
    fetch('/api/simulator/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'like', data: { likeCount: 100 } })
    });
  });

  document.getElementById('btn-sim-like-500').addEventListener('click', () => {
    fetch('/api/simulator/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'like', data: { likeCount: 500 } })
    });
  });

  document.getElementById('btn-sim-follow').addEventListener('click', () => {
    fetch('/api/simulator/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'follow', data: { nickname: 'Người Mới' } })
    });
  });

  document.getElementById('btn-sim-share').addEventListener('click', () => {
    fetch('/api/simulator/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'share', data: { nickname: 'Fan Cứng' } })
    });
  });

  // --- TAB 3: QUẢN LÝ CÂU HỎI ---
  const qSearchInput = document.getElementById('q-search-input');
  const qTopicFilter = document.getElementById('q-topic-filter');
  const qLevelFilter = document.getElementById('q-level-filter');
  const qTableBody = document.getElementById('q-table-body');
  const qTotalCount = document.getElementById('q-total-count');

  async function loadQuestions() {
    const search = qSearchInput.value.trim();
    const topic = qTopicFilter.value;
    const level = qLevelFilter.value;

    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (topic) query.set('topic', topic);
    if (level) query.set('level', level);

    const res = await fetch(`/api/questions?${query.toString()}`);
    const data = await res.json();

    qTotalCount.textContent = data.total;

    // Cập nhật danh sách chủ đề vào dropdown
    if (qTopicFilter.options.length <= 1 && data.topics) {
      data.topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        qTopicFilter.appendChild(opt);
      });
    }

    // Hiển thị danh sách câu hỏi trong bảng
    qTableBody.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    data.questions.forEach(q => {
      const tr = document.createElement('tr');
      const lvlClass = q.level === 3 ? 'tag-hard' : (q.level === 2 ? 'tag-medium' : 'tag-easy');
      const lvlText = q.level === 3 ? 'Thử thách' : (q.level === 2 ? 'Vừa' : 'Dễ');

      tr.innerHTML = `
        <td>${q.id}</td>
        <td><strong>${escapeHtml(q.question)}</strong></td>
        <td><span class="tag" style="background:#312E81;color:#A5B4FC;">${escapeHtml(q.topic)}</span></td>
        <td><span class="tag ${lvlClass}">${lvlText}</span></td>
        <td><strong style="color:#22C55E;">${letters[q.answer] || 'A'}</strong></td>
        <td>
          <button class="btn btn-secondary btn-sm btn-edit-q" data-id="${q.id}">Sửa</button>
          <button class="btn btn-danger btn-sm btn-del-q" data-id="${q.id}">Xóa</button>
        </td>
      `;
      qTableBody.appendChild(tr);
    });

    // Xử lý nút xóa
    document.querySelectorAll('.btn-del-q').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(`Bạn có chắc muốn xóa câu hỏi ID #${btn.dataset.id}?`)) {
          await fetch(`/api/questions/${btn.dataset.id}`, { method: 'DELETE' });
          loadQuestions();
        }
      });
    });

    // Xử lý nút sửa
    document.querySelectorAll('.btn-edit-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetQ = data.questions.find(x => x.id === Number(btn.dataset.id));
        if (targetQ) openEditQuestionPrompt(targetQ);
      });
    });
  }

  qSearchInput.addEventListener('input', debounce(loadQuestions, 300));
  qTopicFilter.addEventListener('change', loadQuestions);
  qLevelFilter.addEventListener('change', loadQuestions);

  // Thêm câu hỏi mới
  document.getElementById('btn-open-add-q').addEventListener('click', () => {
    const qText = prompt('Nhập nội dung câu hỏi:');
    if (!qText) return;
    const optA = prompt('Đáp án A:') || 'A';
    const optB = prompt('Đáp án B:') || 'B';
    const optC = prompt('Đáp án C:') || 'C';
    const optD = prompt('Đáp án D:') || 'D';
    const ansLetter = (prompt('Đáp án đúng (A/B/C/D):') || 'A').toUpperCase();
    const ansIdx = Math.max(0, 'ABCD'.indexOf(ansLetter));
    const fact = prompt('Kiến thức thêm ("Bạn có biết?"):') || '';
    const topic = prompt('Chủ đề (Khoa học, Địa lý, Lịch sử, Văn học, Toán nhẩm, Tiếng Anh, Đời sống):') || 'Đời sống';

    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: qText,
        options: [optA, optB, optC, optD],
        answer: ansIdx,
        fact,
        topic,
        level: 1
      })
    }).then(() => loadQuestions());
  });

  function openEditQuestionPrompt(q) {
    const newText = prompt('Chỉnh sửa câu hỏi:', q.question);
    if (!newText) return;
    const fact = prompt('Kiến thức thêm ("Bạn có biết?"):', q.fact || '');

    fetch(`/api/questions/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newText, fact })
    }).then(() => loadQuestions());
  }

  // Xuất & Nhập JSON
  document.getElementById('btn-export-q').addEventListener('click', () => {
    window.location.href = '/api/questions/export';
  });

  document.getElementById('input-import-q').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        const res = await fetch('/api/questions/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        const d = await res.json();
        alert(`Đã nhập thành công ${d.count} câu hỏi!`);
        loadQuestions();
      } catch (err) {
        alert('File JSON không hợp lệ: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // --- TAB 4: CẤU HÌNH QUÀ TẶNG ---
  const giftsMappingBody = document.getElementById('gifts-mapping-body');
  let currentGiftsConfig = { mappings: [] };

  async function loadGiftsConfig() {
    const res = await fetch('/api/config');
    const data = await res.json();
    currentGiftsConfig = data.gifts || { mappings: [] };

    giftsMappingBody.innerHTML = '';
    currentGiftsConfig.mappings.forEach((m, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #60A5FA;">${escapeHtml(m.name)}</strong><br><small style="opacity:0.6;">${m.effect}</small></td>
        <td>${escapeHtml(m.description || '')}</td>
        <td>
          <input type="text" class="input-gift-names" data-idx="${idx}" value="${escapeHtml((m.giftNames || []).join(', '))}">
        </td>
        <td>
          <input type="text" class="input-gift-ids" data-idx="${idx}" value="${escapeHtml((m.giftIds || []).join(', '))}">
        </td>
      `;
      giftsMappingBody.appendChild(tr);
    });
  }

  document.getElementById('btn-save-gifts').addEventListener('click', async () => {
    const nameInputs = document.querySelectorAll('.input-gift-names');
    const idInputs = document.querySelectorAll('.input-gift-ids');

    nameInputs.forEach((input) => {
      const idx = Number(input.dataset.idx);
      currentGiftsConfig.mappings[idx].giftNames = input.value.split(',').map(s => s.trim()).filter(Boolean);
    });

    idInputs.forEach((input) => {
      const idx = Number(input.dataset.idx);
      currentGiftsConfig.mappings[idx].giftIds = input.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    });

    await fetch('/api/config/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentGiftsConfig)
    });
    alert('Đã lưu cấu hình quà tặng thành công!');
  });

  // --- TAB 5: THỐNG KÊ NGƯỜI CHƠI ---
  const playersStatsBody = document.getElementById('players-stats-body');

  async function loadPlayerStats() {
    const res = await fetch('/api/stats/players');
    const data = await res.json();

    playersStatsBody.innerHTML = '';
    if (!data.players || data.players.length === 0) {
      playersStatsBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Chưa có dữ liệu người chơi</td></tr>';
      return;
    }

    data.players.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(p.nickname)}</strong><br><small style="opacity:0.5;">ID: ${p.userId}</small></td>
        <td><strong style="color: #38BDF8;">T.${p.currentFloor}</strong></td>
        <td>T.${p.highestFloor}</td>
        <td>${p.correctCount} / ${p.totalAnswered}</td>
        <td>⚡ ${p.fastestCount}</td>
        <td>🏆 ${p.wins}</td>
        <td>🎁 ${p.totalGifts}</td>
      `;
      playersStatsBody.appendChild(tr);
    });
  }

  document.getElementById('btn-reset-stats').addEventListener('click', async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa sạch toàn bộ lịch sử và điểm số người chơi trong SQLite. Bạn có chắc chắn không?')) {
      await fetch('/api/stats/reset', { method: 'POST' });
      alert('Đã xóa toàn bộ thống kê!');
      loadPlayerStats();
    }
  });

  // --- TAB 6: CÀI ĐẶT LUẬT CHƠI ---
  const settingsForm = document.getElementById('settings-form');
  const cfgTargetFloor = document.getElementById('cfg-target-floor');
  const cfgReadSec = document.getElementById('cfg-read-sec');
  const cfgAnswerSec = document.getElementById('cfg-answer-sec');
  const cfgRevealSec = document.getElementById('cfg-reveal-sec');
  const cfgVictorySec = document.getElementById('cfg-victory-sec');
  const cfgChallengeInterval = document.getElementById('cfg-challenge-interval');

  async function loadGameSettings() {
    const res = await fetch('/api/config');
    const data = await res.json();
    const g = data.game;

    if (g) {
      cfgTargetFloor.value = g.targetFloor || 20;
      if (g.timings) {
        cfgReadSec.value = g.timings.readDuration || 3;
        cfgAnswerSec.value = g.timings.answerDuration || 15;
        cfgRevealSec.value = g.timings.revealDuration || 7;
        cfgVictorySec.value = g.timings.victoryDuration || 7;
      }
      cfgChallengeInterval.value = g.challengeInterval || 5;
    }
  }

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      targetFloor: Number(cfgTargetFloor.value) || 20,
      challengeInterval: Number(cfgChallengeInterval.value) || 5,
      timings: {
        readDuration: Number(cfgReadSec.value) || 3,
        answerDuration: Number(cfgAnswerSec.value) || 15,
        revealDuration: Number(cfgRevealSec.value) || 7,
        victoryDuration: Number(cfgVictorySec.value) || 7
      }
    };

    await fetch('/api/config/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    alert('Đã lưu cấu hình luật chơi thành công!');
  });

  // Helper tiện ích
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Tải trạng thái ban đầu
  fetch('/api/status')
    .then(r => r.json())
    .then(data => {
      if (data.tiktok) updateLiveStatusUI(data.tiktok);
      if (data.game) {
        gamePhaseText.textContent = data.game.phase;
        gameRoundText.textContent = data.game.round;
        gameQNumText.textContent = data.game.questionNumber;
      }
    })
    .catch(() => {});
});
