/**
 * Module Vẽ Thẻ Câu Hỏi & Ô "BẠN CÓ BIẾT?"
 * Thiết kế phong cách trang vở học sinh có lề đỏ, dòng kẻ, ô đáp án 2x2.
 */

class QuestionCardRenderer {
  constructor() {
    this.pulseAngle = 0;
  }

  update(dt) {
    this.pulseAngle += dt * 5;
  }

  /**
   * Vẽ toàn bộ khu vực Thẻ Câu Hỏi (tọa độ trên không gian 540x960)
   * Vị trí thẻ câu hỏi: x: 18, y: 70, w: 504, h: 320
   */
  draw(ctx, state) {
    const cardX = 18;
    const cardY = 66;
    const cardW = 504;
    const cardH = 310;
    const r = 16;

    ctx.save();

    // 1. Đổ bóng mềm mại phía sau trang vở
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;

    // 2. Nền trang vở màu trắng kem ấm áp
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, r);
    ctx.fill();
    ctx.restore();

    ctx.save();
    // Giới hạn trong khung thẻ
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, r);
    ctx.clip();

    // 3. Kẻ các dòng kẻ ngang màu xanh nhạt kiểu trang vở học trò
    ctx.strokeStyle = 'rgba(64, 158, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let y = cardY + 45; y < cardY + cardH; y += 22) {
      ctx.beginPath();
      ctx.moveTo(cardX, y);
      ctx.lineTo(cardX + cardW, y);
      ctx.stroke();
    }

    // 4. Đường lề đỏ đặc trưng của tập vở
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 42, cardY);
    ctx.lineTo(cardX + 42, cardY + cardH);
    ctx.stroke();

    // 5. Hàng chip tiêu đề trên cùng
    let chipX = cardX + 16;
    const chipY = cardY + 12;

    // Chip: Số câu
    this.drawChip(ctx, chipX, chipY, `CÂU ${state.questionNumber || 1}`, '#3B82F6', '#EFF6FF');
    chipX += 78;

    // Chip: Chủ đề
    if (state.currentQuestion?.topic) {
      this.drawChip(ctx, chipX, chipY, state.currentQuestion.topic, '#6366F1', '#EEF2FF');
      chipX += ctx.measureText(state.currentQuestion.topic).width + 24;
    }

    // Chip: THỬ THÁCH (nếu là câu thử thách)
    if (state.isChallenge) {
      const pulseScale = 1 + Math.sin(this.pulseAngle) * 0.05;
      ctx.save();
      ctx.translate(chipX + 45, chipY + 10);
      ctx.scale(pulseScale, pulseScale);
      this.drawChip(ctx, -45, -10, '🔥 THỬ THÁCH', '#EF4444', '#FEF2F2');
      ctx.restore();
      chipX += 105;
    }

    // Chip: GIÓ ĐẨY x2
    if (state.isWindX2) {
      this.drawChip(ctx, chipX, chipY, '🌪️ GIÓ x2', '#06B6D4', '#ECFEFF');
    }

    // 6. Đồng hồ đếm ngược số lớn ở góc phải
    this.drawTimer(ctx, cardX + cardW - 52, cardY + 22, state.timer, state.phase);

    // 7. Nội dung câu hỏi (tối đa 3 dòng)
    const qText = state.currentQuestion ? state.currentQuestion.question : 'Đang chuẩn bị câu hỏi tiếp theo...';
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 17px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const questionLines = this.wrapText(ctx, qText, cardW - 68);
    let textY = cardY + 44;
    for (let i = 0; i < Math.min(3, questionLines.length); i++) {
      ctx.fillText(questionLines[i], cardX + 50, textY);
      textY += 23;
    }

    // 8. 4 Ô ĐÁP ÁN 2x2
    const optY = cardY + 118;
    const optW = (cardW - 38) / 2; // ~233px
    const optH = 50;
    const optGapX = 14;
    const optGapY = 10;

    const options = state.currentQuestion ? state.currentQuestion.options : ['A', 'B', 'C', 'D'];
    const letters = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = cardX + 12 + col * (optW + optGapX);
      const y = optY + row * (optH + optGapY);

      const isCorrect = state.phase === 'REVEAL' && state.correctOption === i;
      const isEliminated = state.eliminatedOptions && state.eliminatedOptions.includes(i);
      const percentage = state.optionPercentages ? state.optionPercentages[i] : null;

      this.drawOptionBox(
        ctx,
        x, y, optW, optH,
        letters[i],
        options[i] || '',
        isCorrect,
        isEliminated,
        percentage,
        state.phase
      );
    }

    // 9. Phần dưới đáy thẻ:
    // Khi CÔNG BỐ (REVEAL) -> Hiển thị ô "BẠN CÓ BIẾT?"
    // Khi ĐỌC ĐỀ / TRẢ LỜI -> Hiển thị "N người đã trả lời" + Thanh thời gian
    const bottomY = cardY + cardH - 66;
    if (state.phase === 'REVEAL' && state.currentQuestion?.fact) {
      this.drawFactBox(ctx, cardX + 12, bottomY, cardW - 24, 56, state.currentQuestion.fact);
    } else {
      this.drawStatusBar(ctx, cardX + 12, bottomY + 12, cardW - 24, 38, state);
    }

    ctx.restore();
  }

  drawChip(ctx, x, y, text, textColor, bgColor) {
    ctx.font = 'bold 11px "Baloo 2", sans-serif';
    const textW = ctx.measureText(text).width;
    const w = textW + 16;
    const h = 20;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  }

  drawTimer(ctx, cx, cy, timer, phase) {
    const isAlert = phase === 'ANSWER' && timer <= 5;
    const r = 20;

    ctx.save();
    if (isAlert) {
      const scale = 1 + Math.sin(this.pulseAngle * 1.5) * 0.12;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
    }

    // Vòng tròn nền
    ctx.fillStyle = isAlert ? '#FEE2E2' : '#F1F5F9';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isAlert ? '#EF4444' : '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Số đếm ngược
    ctx.fillStyle = isAlert ? '#DC2626' : '#1E293B';
    ctx.font = 'bold 20px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.max(0, timer), cx, cy + 1);

    ctx.restore();
  }

  drawOptionBox(ctx, x, y, w, h, letter, text, isCorrect, isEliminated, percentage, phase) {
    ctx.save();

    let bgColor = '#F8FAFC';
    let borderColor = '#E2E8F0';
    let textColor = '#1E293B';
    let badgeBg = '#E2E8F0';
    let badgeText = '#475569';

    if (isCorrect) {
      bgColor = '#DCFCE7';
      borderColor = '#22C55E';
      textColor = '#14532D';
      badgeBg = '#22C55E';
      badgeText = '#FFFFFF';
    } else if (isEliminated) {
      bgColor = '#F1F5F9';
      borderColor = '#CBD5E1';
      textColor = '#94A3B8';
      badgeBg = '#E2E8F0';
      badgeText = '#94A3B8';
    }

    // Hộp đáp án
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = isCorrect ? 2.5 : 1.5;
    ctx.stroke();

    // Huy hiệu tròn chữ cái A/B/C/D
    const badgeR = 14;
    const badgeX = x + 20;
    const badgeY = y + h / 2;

    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = badgeText;
    ctx.font = 'bold 14px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, badgeX, badgeY + 1);

    // Chữ đáp án
    ctx.fillStyle = textColor;
    ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Rút gọn text nếu quá dài
    let display = text;
    if (ctx.measureText(display).width > w - 85) {
      while (display.length > 3 && ctx.measureText(display + '…').width > w - 85) {
        display = display.slice(0, -1);
      }
      display += '…';
    }
    ctx.fillText(display, x + 42, y + h / 2);

    // Gạch ngang nếu bị 50:50 loại
    if (isEliminated) {
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 40, y + h / 2);
      ctx.lineTo(x + w - 10, y + h / 2);
      ctx.stroke();
    }

    // Hiển thị % khi công bố
    if (percentage !== null && phase === 'REVEAL') {
      ctx.fillStyle = isCorrect ? '#15803D' : '#64748B';
      ctx.font = 'bold 12px "Baloo 2", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${percentage}%`, x + w - 8, y + h / 2);
    }

    ctx.restore();
  }

  drawStatusBar(ctx, x, y, w, h, state) {
    // Nhãn số người đã trả lời
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const statusText = state.phase === 'READ'
      ? '📖 Nghe hết đề...'
      : `⚡ ${state.totalAnswered || 0} người đã trả lời`;
    ctx.fillText(statusText, x, y);

    // Thanh thời gian chạy mượt
    const barY = y + 20;
    const barH = 8;
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.roundRect(x, barY, w, barH, 4);
    ctx.fill();

    // Tính tỉ lệ phần trăm thời gian còn lại
    let maxT = 15;
    if (state.phase === 'READ') maxT = 3;
    const progress = Math.max(0, Math.min(1, (state.timer || 0) / maxT));

    const fillW = w * progress;
    if (fillW > 0) {
      const isRed = state.phase === 'ANSWER' && state.timer <= 5;
      const grad = ctx.createLinearGradient(x, 0, x + fillW, 0);
      if (isRed) {
        grad.addColorStop(0, '#F87171');
        grad.addColorStop(1, '#DC2626');
      } else {
        grad.addColorStop(0, '#60A5FA');
        grad.addColorStop(1, '#2563EB');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, barY, fillW, barH, 4);
      ctx.fill();
    }
  }

  drawFactBox(ctx, x, y, w, h, fact) {
    ctx.save();

    // Hộp vàng ấm áp cho "BẠN CÓ BIẾT?"
    ctx.fillStyle = '#FEF9C3';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tiêu đề nhỏ
    ctx.fillStyle = '#854D0E';
    ctx.font = 'bold 12px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('💡 BẠN CÓ BIẾT?', x + 10, y + 6);

    // Nội dung giải thích thêm
    ctx.fillStyle = '#713F12';
    ctx.font = '500 12px "Be Vietnam Pro", sans-serif';
    const lines = this.wrapText(ctx, fact, w - 20);
    let ly = y + 23;
    for (let i = 0; i < Math.min(2, lines.length); i++) {
      ctx.fillText(lines[i], x + 10, ly);
      ly += 16;
    }

    ctx.restore();
  }

  wrapText(ctx, text, maxWidth) {
    const words = String(text || '').split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }
}

window.QuestionCardRenderer = QuestionCardRenderer;
