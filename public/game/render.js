/**
 * Main Render Pipeline (render.js)
 * Tích hợp toàn bộ các lớp vẽ: Bầu trời, Tiêu đề, Thẻ câu hỏi, Tháp sách, Bảng xếp hạng, Ticker và Banners.
 */

class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.cardRenderer = new window.QuestionCardRenderer();
    this.towerRenderer = new window.TowerRenderer();
    this.effects = new window.EffectsManager();

    this.marqueeX = 540;
    this.tickerText = '📚 THÁP SÁCH: Bình luận A/B/C/D để trả lời câu hỏi · Đúng leo tầng, chạm tầng 20 trước thắng! · Tặng quà để mở thang tre, cáp treo, gió đẩy x2, đóng băng đối thủ!';
  }

  update(dt, state) {
    const targetFloor = state.targetFloor || 7749;
    this.tickerText = `📚 THÁP SÁCH: Bình luận A/B/C/D để trả lời câu hỏi · Đúng leo tầng, chạm tầng ${targetFloor} trước thắng! · Tặng hoa hồng hoặc quà để leo tháp thần tốc!`;
    this.cardRenderer.update(dt);
    this.towerRenderer.update(dt, state.players || [], state.leaderboard?.[0]?.floor || 0, targetFloor);
    this.effects.update(dt, state.isWindX2);

    // Cập nhật chữ chạy ticker dưới đáy
    this.marqueeX -= dt * 65;
    if (this.marqueeX < -1200) {
      this.marqueeX = 540;
    }
  }

  render(state) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 540, 960);

    // 1. Nền trời xanh tươi sáng
    this.drawSkyBackground(ctx);

    // 2. Mây trôi
    this.effects.drawSkyAndClouds(ctx);

    // 3. Hiệu ứng gió x2
    if (state.isWindX2) {
      this.effects.drawWindLines(ctx);
    }

    // 4. Tháp sách 7749 tầng và nhân vật
    this.towerRenderer.draw(ctx, state);

    // 5. Thanh tiêu đề trên cùng
    this.drawHeader(ctx, state);

    // 6. Thẻ câu hỏi dạng trang vở học trò
    this.cardRenderer.draw(ctx, state);

    // 7. Bảng xếp hạng Top 6 và Thanh tiến độ đích
    this.drawLeaderboardOverlay(ctx, state);

    // 8. Hạt pháo hoa / confetti
    this.effects.drawParticles(ctx);

    // 9. Banner thông báo phóng to
    this.effects.drawBanners(ctx);

    // 10. Dải chữ chạy hướng dẫn dưới cùng
    this.drawBottomTicker(ctx);

    // 11. Màn hình vinh danh khi chạm đỉnh tháp
    if (state.phase === 'VICTORY') {
      this.effects.drawVictoryScreen(ctx, state, (url) => this.towerRenderer.getOrCreateAvatarImage(url));
    }
  }

  drawSkyBackground(ctx) {
    // Gradient bầu trời chuyển tiếp mượt mà từ xanh thiên thanh xuống lam dịu
    const grad = ctx.createLinearGradient(0, 0, 0, 960);
    grad.addColorStop(0, '#38BDF8');
    grad.addColorStop(0.45, '#7DD3FC');
    grad.addColorStop(0.85, '#BAE6FD');
    grad.addColorStop(1, '#E0F2FE');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 540, 960);
  }

  drawHeader(ctx, state) {
    ctx.save();

    // Tiêu đề THÁP SÁCH lớn
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 26px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText('THÁP SÁCH 📚', 20, 14);

    // Dòng phụ: Vòng chơi & mục tiêu
    const targetFloor = state.targetFloor || 7749;
    ctx.fillStyle = '#1E293B';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillText(`VÒNG ${state.round || 1} · AI CHẠM TẦNG ${targetFloor} TRƯỚC THẮNG!`, 22, 43);

    // Ô số người đang leo tháp ở góc phải
    const totalClimbers = state.totalPlayers || (state.players ? state.players.length : 0);
    const badgeW = 95;
    const badgeH = 26;
    const badgeX = 540 - badgeW - 18;
    const badgeY = 16;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🧗 ${totalClimbers} đang leo`, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);

    ctx.restore();
  }

  drawLeaderboardOverlay(ctx, state) {
    const list = state.leaderboard || [];
    if (list.length === 0) return;

    ctx.save();
    const panelW = 120;
    const panelX = 540 - panelW - 14;
    const panelY = 390;

    // Tiêu đề bảng xếp hạng
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, 22, [6, 6, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 10px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LEO CAO NHẤT 👑', panelX + panelW / 2, panelY + 11);

    // Danh sách Top 6
    let itemY = panelY + 22;
    const itemH = 28;

    for (let i = 0; i < Math.min(6, list.length); i++) {
      const p = list[i];
      const isTop1 = i === 0;

      ctx.fillStyle = isTop1 ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.roundRect(panelX, itemY, panelW, itemH, 0);
      ctx.fill();

      // Huy hiệu số thứ tự #1..#6
      ctx.fillStyle = isTop1 ? '#FACC15' : '#94A3B8';
      ctx.font = 'bold 11px "Baloo 2", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, panelX + 6, itemY + itemH / 2);

      // Tên rút gọn
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 10px "Be Vietnam Pro", sans-serif';
      let name = p.nickname || 'Viewer';
      if (ctx.measureText(name).width > 55) {
        name = name.slice(0, 6) + '…';
      }
      ctx.fillText(name, panelX + 22, itemY + itemH / 2);

      // Số tầng hiện tại
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px "Baloo 2", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`T.${p.floor || 0}`, panelX + panelW - 6, itemY + itemH / 2);

      itemY += itemH;
    }

    // Thanh tiến độ "ĐÍCH: TẦNG 20"
    const leaderFloor = list[0] ? list[0].floor : 0;
    const progH = 20;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(panelX, itemY, panelW, progH, [0, 0, 6, 6]);
    ctx.fill();

    // Thanh tiến độ lấp đầy
    const fillRatio = Math.max(0, Math.min(1, leaderFloor / (state.targetFloor || 20)));
    if (fillRatio > 0) {
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.roundRect(panelX + 2, itemY + 2, (panelW - 4) * fillRatio, progH - 4, 3);
      ctx.fill();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ĐÍCH: ${leaderFloor}/${state.targetFloor || 20}`, panelX + panelW / 2, itemY + progH / 2);

    ctx.restore();
  }

  drawBottomTicker(ctx) {
    ctx.save();
    const h = 32;
    const y = 960 - h;

    // Dải đen mờ dưới cùng
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, y, 540, h);

    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(0, y, 540, 1.5);

    // Chữ chạy hướng dẫn luật chơi
    ctx.beginPath();
    ctx.rect(0, y, 540, h);
    ctx.clip();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.tickerText, this.marqueeX, y + h / 2);

    ctx.restore();
  }
}

window.GameRenderer = GameRenderer;
