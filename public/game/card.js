/**
 * Module Thẻ Câu Hỏi & Ô "BẠN CÓ BIẾT?" Phong Cách Cuộn Giấy Hoàng Gia (card.js)
 * Khung mạ vàng baroque, giấy da cổ ấm áp, con dấu sáp ruby, huân chương đáp án 2x2.
 */

class QuestionCardRenderer {
  constructor() {
    this.pulseAngle = 0;
  }

  update(dt) {
    this.pulseAngle += dt * 4.5;
  }

  /**
   * Vẽ toàn bộ Thẻ Câu Hỏi Hoàng Gia (hệ tọa độ 540x960)
   */
  draw(ctx, state) {
    const cardX = 16;
    const cardY = 64;
    const cardW = 508;
    const cardH = 314;
    const r = 18;

    ctx.save();

    // 1. Hào quang ma thuật nhẹ phía sau thẻ
    ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    // 2. Lớp đế khung vàng baroque ngoài cùng
    const outerBorderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    outerBorderGrad.addColorStop(0, '#F59E0B');
    outerBorderGrad.addColorStop(0.3, '#FDE047');
    outerBorderGrad.addColorStop(0.7, '#D97706');
    outerBorderGrad.addColorStop(1, '#B45309');

    ctx.fillStyle = outerBorderGrad;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, r);
    ctx.fill();
    ctx.restore();

    // 3. Nền Cuộn Giấy Da Hoàng Gia Cổ (Royal Antique Parchment)
    ctx.save();
    const pad = 4;
    const innerX = cardX + pad;
    const innerY = cardY + pad;
    const innerW = cardW - pad * 2;
    const innerH = cardH - pad * 2;

    const paperGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    paperGrad.addColorStop(0, '#FFFDF8');
    paperGrad.addColorStop(0.5, '#FAF5E9');
    paperGrad.addColorStop(1, '#F4EAD4');

    ctx.fillStyle = paperGrad;
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerW, innerH, r - 3);
    ctx.fill();
    ctx.clip();

    // 4. Đường chỉ vàng viền góc cổ điển (Filigree corner borders)
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(innerX + 6, innerY + 6, innerW - 12, innerH - 12, 12);
    ctx.stroke();

    // Dòng kẻ mảnh trang nhã như sách cổ
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)';
    ctx.lineWidth = 1;
    for (let y = innerY + 48; y < innerY + innerH; y += 22) {
      ctx.beginPath();
      ctx.moveTo(innerX + 16, y);
      ctx.lineTo(innerX + innerW - 16, y);
      ctx.stroke();
    }

    // Đường lề son nhung hoàng gia bên trái
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(innerX + 44, innerY);
    ctx.lineTo(innerX + 44, innerY + innerH);
    ctx.stroke();

    // 5. Con dấu sáp hoàng gia đỏ ruby góc trái trên
    this.drawWaxSeal(ctx, innerX + 22, innerY + 22);

    // 6. Hàng chip tiêu đề vinh dự
    let chipX = innerX + 48;
    const chipY = innerY + 11;

    // Chip: Số câu
    this.drawRoyalChip(ctx, chipX, chipY, `CÂU ${state.questionNumber || 1}`, '#78350F', '#FEF3C7', '#F59E0B');
    chipX += 78;

    // Chip: Chủ đề
    if (state.currentQuestion?.topic) {
      this.drawRoyalChip(ctx, chipX, chipY, state.currentQuestion.topic, '#312E81', '#EEF2FF', '#818CF8');
      chipX += ctx.measureText(state.currentQuestion.topic).width + 24;
    }

    // Chip: THỬ THÁCH (ngọn lửa bập bùng)
    if (state.isChallenge) {
      const pulseScale = 1 + Math.sin(this.pulseAngle) * 0.06;
      ctx.save();
      ctx.translate(chipX + 50, chipY + 10);
      ctx.scale(pulseScale, pulseScale);
      this.drawRoyalChip(ctx, -50, -10, '🔥 THỬ THÁCH', '#991B1B', '#FEE2E2', '#EF4444');
      ctx.restore();
      chipX += 110;
    }

    // Chip: GIÓ ĐẨY x2 (vòng lốc xoáy)
    if (state.isWindX2) {
      this.drawRoyalChip(ctx, chipX, chipY, '🌪️ GIÓ x2', '#155E75', '#ECFEFF', '#06B6D4');
    }

    // 7. Đồng Hồ Ma Thuật Đếm Ngược góc phải
    this.drawMagicClock(ctx, innerX + innerW - 36, innerY + 22, state.timer, state.phase);

    // 8. Nội dung câu hỏi (Font Baloo 2 trang nhã, màu mực cổ điển sang trọng)
    const qText = state.currentQuestion ? state.currentQuestion.question : 'Đang chuẩn bị câu hỏi tiếp theo...';
    ctx.fillStyle = '#1E1B4B';
    ctx.font = 'bold 17px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const questionLines = this.wrapText(ctx, qText, innerW - 68);
    let textY = innerY + 44;
    for (let i = 0; i < Math.min(3, questionLines.length); i++) {
      ctx.fillText(questionLines[i], innerX + 50, textY);
      textY += 23;
    }

    // 9. 4 Ô ĐÁP ÁN 2x2 Phong Cách Huân Chương Hoàng Gia
    const optY = innerY + 118;
    const optW = (innerW - 34) / 2; // ~233px
    const optH = 52;
    const optGapX = 14;
    const optGapY = 10;

    const options = state.currentQuestion ? state.currentQuestion.options : ['A', 'B', 'C', 'D'];
    const letters = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = innerX + 10 + col * (optW + optGapX);
      const y = optY + row * (optH + optGapY);

      const isCorrect = state.phase === 'REVEAL' && state.correctOption === i;
      const isEliminated = state.eliminatedOptions && state.eliminatedOptions.includes(i);
      const percentage = state.optionPercentages ? state.optionPercentages[i] : null;

      this.drawRoyalOptionBox(
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

    // 10. Phần dưới: Thanh Mana Thời Gian hoặc Cuộn Tri Thức "BẠN CÓ BIẾT?"
    const bottomY = innerY + innerH - 66;
    if (state.phase === 'REVEAL' && state.currentQuestion?.fact) {
      this.drawRoyalFactBox(ctx, innerX + 10, bottomY, innerW - 20, 56, state.currentQuestion.fact);
    } else {
      this.drawMagicManaBar(ctx, innerX + 10, bottomY + 10, innerW - 20, 40, state);
    }

    ctx.restore();
  }

  drawWaxSeal(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Đổ bóng con dấu
    ctx.shadowColor = 'rgba(159, 18, 57, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // Thân con dấu sáp đỏ thắm
    ctx.fillStyle = '#9F1239';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#BE123C';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Biểu tượng tri thức hoàng gia dập nổi
    ctx.fillStyle = '#FEF08A';
    ctx.font = '10px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚜️', 0, 1);
    ctx.restore();
  }

  drawRoyalChip(ctx, x, y, text, textColor, bgColor, borderColor) {
    ctx.font = 'bold 11px "Baloo 2", sans-serif';
    const textW = ctx.measureText(text).width;
    const w = textW + 16;
    const h = 20;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  }

  drawMagicClock(ctx, cx, cy, timer, phase) {
    const isAlert = phase === 'ANSWER' && timer <= 5;
    const r = 21;

    ctx.save();
    if (isAlert) {
      const scale = 1 + Math.sin(this.pulseAngle * 1.6) * 0.14;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
    }

    // Đổ bóng phát quang
    ctx.shadowColor = isAlert ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = isAlert ? 14 : 8;

    // Vành đồng hồ mạ vàng hoàng gia
    const rimGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (isAlert) {
      rimGrad.addColorStop(0, '#EF4444');
      rimGrad.addColorStop(1, '#991B1B');
    } else {
      rimGrad.addColorStop(0, '#FBBF24');
      rimGrad.addColorStop(1, '#B45309');
    }

    ctx.fillStyle = isAlert ? '#FEE2E2' : '#FFFBEB';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Số đếm ngược
    ctx.fillStyle = isAlert ? '#DC2626' : '#78350F';
    ctx.font = 'bold 20px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(Math.max(0, timer), cx, cy + 1);

    ctx.restore();
  }

  drawRoyalOptionBox(ctx, x, y, w, h, letter, text, isCorrect, isEliminated, percentage, phase) {
    ctx.save();

    let bgColor = '#FFFFFF';
    let borderColor = '#E2E8F0';
    let textColor = '#1E1B4B';
    let badgeBg = '#FDE047';
    let badgeText = '#78350F';

    if (isCorrect) {
      // Bừng sáng Ngọc Lục Bảo (Emerald Radiance)
      bgColor = '#DCFCE7';
      borderColor = '#16A34A';
      textColor = '#14532D';
      badgeBg = '#16A34A';
      badgeText = '#FFFFFF';

      ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
      ctx.shadowBlur = 12;
    } else if (isEliminated) {
      bgColor = '#F8FAFC';
      borderColor = '#CBD5E1';
      textColor = '#94A3B8';
      badgeBg = '#E2E8F0';
      badgeText = '#94A3B8';
    }

    // Hộp đáp án mạ viền
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = isCorrect ? 2.5 : 1.5;
    ctx.stroke();

    // Huy hiệu tròn chữ cái A/B/C/D như đồng xu vàng dập nổi
    const badgeR = 15;
    const badgeX = x + 21;
    const badgeY = y + h / 2;

    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isCorrect ? '#FFFFFF' : '#D97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = badgeText;
    ctx.font = 'bold 15px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, badgeX, badgeY + 1);

    // Chữ đáp án
    ctx.fillStyle = textColor;
    ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    let display = text;
    if (ctx.measureText(display).width > w - 88) {
      while (display.length > 3 && ctx.measureText(display + '…').width > w - 88) {
        display = display.slice(0, -1);
      }
      display += '…';
    }
    ctx.fillText(display, x + 44, y + h / 2);

    // Vết gạch ngang ma thuật nếu bị loại
    if (isEliminated) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 42, y + h / 2);
      ctx.lineTo(x + w - 12, y + h / 2);
      ctx.stroke();
    }

    // Tỉ lệ % bình chọn khi công bố
    if (percentage !== null && phase === 'REVEAL') {
      ctx.fillStyle = isCorrect ? '#15803D' : '#64748B';
      ctx.font = 'bold 13px "Baloo 2", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${percentage}%`, x + w - 10, y + h / 2);
    }

    ctx.restore();
  }

  drawMagicManaBar(ctx, x, y, w, h, state) {
    // Nhãn số người đã trả lời
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 13px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const statusText = state.phase === 'READ'
      ? '📜 Lắng nghe sắc lệnh câu hỏi...'
      : `⚡ ${state.totalAnswered || 0} chiến binh đã nộp đáp án`;
    ctx.fillText(statusText, x, y);

    // Rãnh chứa thanh mana
    const barY = y + 21;
    const barH = 8;
    ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
    ctx.beginPath();
    ctx.roundRect(x, barY, w, barH, 4);
    ctx.fill();

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
        grad.addColorStop(0, '#FDE047');
        grad.addColorStop(1, '#D97706');
      }

      ctx.fillStyle = grad;
      ctx.shadowColor = isRed ? 'rgba(220, 38, 38, 0.6)' : 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(x, barY, fillW, barH, 4);
      ctx.fill();
    }
  }

  drawRoyalFactBox(ctx, x, y, w, h, fact) {
    ctx.save();

    // Hộp cuộn tri thức màu hoàng kim hổ phách
    const bgGrad = ctx.createLinearGradient(x, y, x, y + h);
    bgGrad.addColorStop(0, '#FEF9C3');
    bgGrad.addColorStop(1, '#FEF08A');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tiêu đề nhỏ
    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 12px "Baloo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('💡 BẠN CÓ BIẾT? (TRI THỨC HOÀNG GIA)', x + 10, y + 6);

    // Nội dung kiến thức
    ctx.fillStyle = '#78350F';
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
