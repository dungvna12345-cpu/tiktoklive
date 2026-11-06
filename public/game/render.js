/**
 * Main Render Pipeline Phong Cách Thư Viện Ma Thuật & Hoàng Gia (render.js)
 * Tích hợp Bầu trời đêm huyền diệu, Tháp sách cổ, Cuộn giấy hoàng gia, Bảng hiệp sĩ và Ticker ruy băng.
 */

class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.cardRenderer = new window.QuestionCardRenderer();
    this.towerRenderer = new window.TowerRenderer();
    this.effects = new window.EffectsManager();

    this.marqueeX = 540;
    this.tickerText = '⚜️ THÁP SÁCH MA THUẬT: Bình luận A/B/C/D để giải đố · Đúng leo tầng, chạm Đỉnh Tháp trước thắng! · Tặng hoa hồng hoặc bảo vật để triệu hồi thang tre, cáp treo phóng vút!';
  }

  update(dt, state) {
    const targetFloor = state.targetFloor || 7749;
    this.tickerText = `⚜️ THÁP SÁCH MA THUẬT: Bình luận A/B/C/D để giải đố · Đúng leo tầng, chinh phục Tầng ${targetFloor}! · Tặng hoa hồng hoặc bảo vật để triệu hồi thang tre, cáp treo phóng vút!`;
    this.cardRenderer.update(dt);
    this.towerRenderer.update(dt, state.players || [], state.leaderboard?.[0]?.floor || 0, targetFloor);
    this.effects.update(dt, state.isWindX2);

    // Cập nhật chữ chạy ticker dưới đáy
    this.marqueeX -= dt * 62;
    if (this.marqueeX < -1300) {
      this.marqueeX = 540;
    }
  }

  render(state) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 540, 960);

    // 1. Nền Bầu Trời Đêm Ma Thuật Huyền Bí
    this.drawMysticNightSky(ctx);

    // 2. Sao trời đêm, sao băng và mây dạ quang
    this.effects.drawSkyAndClouds(ctx);

    // 3. Vệt lốc xoáy ma thuật khi Gió x2
    if (state.isWindX2) {
      this.effects.drawWindLines(ctx);
    }

    // 4. Tháp sách ma thuật 3D & Nhân vật
    this.towerRenderer.draw(ctx, state);

    // 5. Thanh tiêu đề Hoàng Gia trên cùng
    this.drawRoyalHeader(ctx, state);

    // 6. Thẻ câu hỏi Cuộn Giấy Hoàng Gia Cổ
    this.cardRenderer.draw(ctx, state);

    // 7. Bảng Vinh Danh Hiệp Sĩ (Top 6) & Thanh Tiến Độ
    this.drawRoyalLeaderboard(ctx, state);

    // 8. Hạt pháo hoa và kim tuyến
    this.effects.drawParticles(ctx);

    // 9. Sắc lệnh hoàng gia (Banners)
    this.effects.drawBanners(ctx);

    // 10. Dải ruy băng chữ chạy dưới cùng
    this.drawRoyalBottomTicker(ctx);

    // 11. Màn hình Chạm Đỉnh Tháp khi có người chiến thắng
    if (state.phase === 'VICTORY') {
      this.effects.drawVictoryScreen(ctx, state, (url) => this.towerRenderer.getOrCreateAvatarImage(url));
    }
  }

  /**
   * Bầu trời đêm ma thuật với gradient nhung huyền ảo và quầng cực quang tím
   */
  drawMysticNightSky(ctx) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 960);
    skyGrad.addColorStop(0, '#090514');   // Đêm đen huyền bí
    skyGrad.addColorStop(0.35, '#160B29'); // Tím thạch anh đậm
    skyGrad.addColorStop(0.7, '#241242');  // Tím dạ quang hoàng gia
    skyGrad.addColorStop(1, '#0F172A');    // Lam than sâu thẳm

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 540, 960);

    // Quầng cực quang tím hồng lãng đãng góc trên
    const aurora = ctx.createRadialGradient(270, 180, 40, 270, 180, 260);
    aurora.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
    aurora.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');
    aurora.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aurora;
    ctx.beginPath();
    ctx.arc(270, 180, 260, 0, Math.PI * 2);
    ctx.fill();
  }

  drawRoyalHeader(ctx, state) {
    ctx.save();

    // Tiêu đề THÁP SÁCH dập vàng kim nổi
    ctx.shadowColor = 'rgba(250, 204, 21, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 26px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('THÁP SÁCH ⚜️', 18, 12);

    // Dòng phụ: Vòng chơi & mục tiêu thần thoại
    ctx.shadowBlur = 0;
    const targetFloor = state.targetFloor || 7749;
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`VÒNG ${state.round || 1} · CHINH PHỤC ĐỈNH THÁP ${targetFloor} TẦNG`, 20, 42);

    // Ô số hiệp sĩ đang leo tháp ở góc phải
    const totalClimbers = state.totalPlayers || (state.players ? state.players.length : 0);
    const badgeW = 108;
    const badgeH = 28;
    const badgeX = 540 - badgeW - 16;
    const badgeY = 15;

    // Khung mạ vàng hoàng gia
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 14);
    ctx.fill();

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 12px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🧗 ${totalClimbers} hiệp sĩ`, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);

    ctx.restore();
  }

  /**
   * Bảng Vinh Danh Hiệp Sĩ (Top 6) & Thanh Tiến Độ Đích
   */
  drawRoyalLeaderboard(ctx, state) {
    const list = state.leaderboard || [];
    if (list.length === 0) return;

    ctx.save();
    const panelW = 126;
    const panelX = 540 - panelW - 14;
    const panelY = 390;

    // Tiêu đề bảng vàng
    ctx.fillStyle = 'rgba(76, 5, 25, 0.9)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, 24, [8, 8, 0, 0]);
    ctx.fill();

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 11px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BẢNG VÀNG HIỆP SĨ 👑', panelX + panelW / 2, panelY + 12);

    // Danh sách Top 6
    let itemY = panelY + 24;
    const itemH = 29;

    for (let i = 0; i < Math.min(6, list.length); i++) {
      const p = list[i];
      const isTop1 = i === 0;

      // Nền hàng
      ctx.fillStyle = isTop1 ? 'rgba(88, 28, 135, 0.85)' : 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(panelX, itemY, panelW, itemH, 0);
      ctx.fill();

      // Viền phân cách
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Huy hiệu #1 vàng, #2 bạc, #3 đồng
      const medalColors = ['#FACC15', '#E2E8F0', '#F97316', '#94A3B8', '#94A3B8', '#94A3B8'];
      ctx.fillStyle = medalColors[i] || '#94A3B8';
      ctx.font = 'bold 11px "Baloo 2", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, panelX + 7, itemY + itemH / 2);

      // Tên rút gọn
      ctx.fillStyle = isTop1 ? '#FEF08A' : '#FFFFFF';
      ctx.font = '600 10px "Be Vietnam Pro", sans-serif';
      let name = p.nickname || 'Hiệp sĩ';
      if (ctx.measureText(name).width > 56) {
        name = name.slice(0, 6) + '…';
      }
      ctx.fillText(name, panelX + 22, itemY + itemH / 2);

      // Tầng hiện tại
      ctx.fillStyle = '#67E8F9';
      ctx.font = 'bold 11px "Baloo 2", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`T.${p.floor || 0}`, panelX + panelW - 6, itemY + itemH / 2);

      itemY += itemH;
    }

    // Thanh Tiến Độ Đích Thần Thánh
    const leaderFloor = list[0] ? list[0].floor : 0;
    const progH = 22;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(panelX, itemY, panelW, progH, [0, 0, 8, 8]);
    ctx.fill();

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const target = state.targetFloor || 7749;
    const fillRatio = Math.max(0, Math.min(1, leaderFloor / target));
    if (fillRatio > 0) {
      const manaGrad = ctx.createLinearGradient(panelX, 0, panelX + panelW, 0);
      manaGrad.addColorStop(0, '#10B981');
      manaGrad.addColorStop(1, '#059669');
      ctx.fillStyle = manaGrad;
      ctx.beginPath();
      ctx.roundRect(panelX + 2, itemY + 2, (panelW - 4) * fillRatio, progH - 4, 4);
      ctx.fill();
    }

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 9px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ĐÍCH: ${leaderFloor}/${target}`, panelX + panelW / 2, itemY + progH / 2 + 1);

    ctx.restore();
  }

  /**
   * Dải Ruy Băng Sắc Lệnh Chữ Chạy Dưới Cùng
   */
  drawRoyalBottomTicker(ctx) {
    ctx.save();
    const h = 34;
    const y = 960 - h;

    // Ruy băng nhung đỏ thẫm viền chỉ vàng
    ctx.fillStyle = '#4C0519';
    ctx.fillRect(0, y, 540, h);

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(540, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(0, y, 540, h);
    ctx.clip();

    ctx.fillStyle = '#FEF08A';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.tickerText, this.marqueeX, y + h / 2 + 1);

    ctx.restore();
  }
}

window.GameRenderer = GameRenderer;
