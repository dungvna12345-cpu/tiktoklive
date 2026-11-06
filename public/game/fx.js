/**
 * Module Hiệu Ứng Hình Ảnh Phong Cách Thư Viện Ma Thuật & Hoàng Gia (fx.js)
 * Bầu trời đêm huyền ảo, sao băng, bụi tiên stardust lấp lánh, sắc lệnh hoàng gia, pháo hoa kim bảo.
 */

class EffectsManager {
  constructor() {
    // 1. Sao trời đêm lấp lánh
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * 540,
        y: Math.random() * 700,
        radius: 0.8 + Math.random() * 1.8,
        alpha: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 1.5 + Math.random() * 3,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // 2. Sao băng (Shooting stars)
    this.shootingStars = [];
    this.nextShootingStarTime = performance.now() + 2500;

    // 3. Bụi tiên ma thuật bay lơ lửng (Floating Magic Stardust)
    this.magicDust = [];
    for (let i = 0; i < 45; i++) {
      this.magicDust.push({
        x: Math.random() * 540,
        y: Math.random() * 960,
        vx: (Math.random() - 0.5) * 14,
        vy: -15 - Math.random() * 25,
        radius: 1 + Math.random() * 2.2,
        color: ['#FDE047', '#FBBF24', '#C084FC', '#67E8F9', '#F472B6'][Math.floor(Math.random() * 5)],
        alpha: 0.2 + Math.random() * 0.7,
        pulseSpeed: 2 + Math.random() * 3
      });
    }

    // 4. Mây dạ quang tím hồng
    this.clouds = [
      { x: 30, y: 390, speed: 8, scale: 0.9, alpha: 0.18 },
      { x: 280, y: 460, speed: 6, scale: 1.2, alpha: 0.15 },
      { x: 150, y: 580, speed: 10, scale: 0.85, alpha: 0.16 },
      { x: 400, y: 700, speed: 7, scale: 1.1, alpha: 0.14 }
    ];

    this.particles = []; // Pháo hoa / kim tuyến
    this.banners = [];   // Sắc lệnh hoàng gia
    this.windParticles = [];

    // Vệt gió ma thuật khi Gió x2
    for (let i = 0; i < 28; i++) {
      this.windParticles.push({
        x: Math.random() * 540,
        y: 350 + Math.random() * 520,
        len: 25 + Math.random() * 45,
        speed: 220 + Math.random() * 140,
        color: Math.random() > 0.5 ? '#67E8F9' : '#A855F7'
      });
    }
  }

  showBanner(title, subtitle = '') {
    this.banners.push({
      title,
      subtitle,
      startTime: performance.now(),
      duration: 3800
    });
  }

  spawnConfetti(count = 70) {
    // Tông màu hoàng gia: Vàng kim, Ngọc lục bảo, Hồng ngọc ruby, Tím thạch anh, Lam sapphire
    const colors = ['#F59E0B', '#FBBF24', '#FEF08A', '#10B981', '#EF4444', '#8B5CF6', '#38BDF8'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: 270 + (Math.random() - 0.5) * 220,
        y: 380 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 320,
        vy: -180 - Math.random() * 220,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 9,
        life: 1,
        decay: 0.3 + Math.random() * 0.35,
        isStar: Math.random() > 0.6
      });
    }
  }

  update(dt, isWindActive = false) {
    const now = performance.now();

    // 1. Cập nhật mây dạ quang
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > 620) {
        c.x = -130;
        c.y = 360 + Math.random() * 400;
      }
    }

    // 2. Cập nhật bụi tiên ma thuật
    for (const d of this.magicDust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < 200) {
        d.y = 960 + Math.random() * 40;
        d.x = Math.random() * 540;
      }
      if (d.x < -20) d.x = 560;
      if (d.x > 560) d.x = -20;
    }

    // 3. Sao băng xuất hiện ngẫu nhiên
    if (now > this.nextShootingStarTime) {
      this.shootingStars.push({
        x: 100 + Math.random() * 400,
        y: 20 + Math.random() * 150,
        len: 80 + Math.random() * 100,
        speed: 650 + Math.random() * 300,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        alpha: 1
      });
      this.nextShootingStarTime = now + 4000 + Math.random() * 6000;
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      const move = s.speed * dt;
      s.x += Math.cos(s.angle) * move;
      s.y += Math.sin(s.angle) * move;
      s.alpha -= dt * 1.8;
      if (s.alpha <= 0 || s.x > 600 || s.y > 600) {
        this.shootingStars.splice(i, 1);
      }
    }

    // 4. Cập nhật hạt gió x2
    if (isWindActive) {
      for (const w of this.windParticles) {
        w.x += w.speed * dt;
        if (w.x > 580) {
          w.x = -60;
          w.y = 350 + Math.random() * 520;
        }
      }
    }

    // 5. Cập nhật hạt pháo hoa
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 340 * dt;
      p.rotation += p.rotSpeed * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Lọc banner hết hạn
    this.banners = this.banners.filter(b => now - b.startTime < b.duration);
  }

  drawSkyAndClouds(ctx) {
    const now = performance.now() / 1000;

    // A. Vẽ các ngôi sao trời đêm lấp lánh
    ctx.save();
    for (const star of this.stars) {
      const twinkle = Math.sin(now * star.twinkleSpeed + star.twinklePhase) * 0.4 + 0.6;
      ctx.globalAlpha = star.alpha * twinkle;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      // Hào quang sao sáng
      if (star.radius > 1.4) {
        ctx.globalAlpha = star.alpha * twinkle * 0.3;
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // B. Vẽ sao băng
    ctx.save();
    for (const s of this.shootingStars) {
      ctx.globalAlpha = Math.max(0, s.alpha);
      const grad = ctx.createLinearGradient(
        s.x, s.y,
        s.x - Math.cos(s.angle) * s.len,
        s.y - Math.sin(s.angle) * s.len
      );
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, '#FDE047');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      ctx.stroke();
    }
    ctx.restore();

    // C. Mây dạ quang huyền ảo
    ctx.save();
    for (const c of this.clouds) {
      ctx.globalAlpha = c.alpha;
      const cloudGrad = ctx.createRadialGradient(c.x + 30, c.y, 10, c.x + 30, c.y, 80);
      cloudGrad.addColorStop(0, '#C084FC');
      cloudGrad.addColorStop(0.7, '#818CF8');
      cloudGrad.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = cloudGrad;
      this.drawPuffyCloud(ctx, c.x, c.y, c.scale);
    }
    ctx.restore();

    // D. Vẽ bụi tiên ma thuật lơ lửng
    ctx.save();
    for (const d of this.magicDust) {
      const pulse = Math.sin(now * d.pulseSpeed) * 0.3 + 0.7;
      ctx.globalAlpha = d.alpha * pulse;
      ctx.fillStyle = d.color;
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawPuffyCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.arc(30, -12, 28, 0, Math.PI * 2);
    ctx.arc(58, 4, 30, 0, Math.PI * 2);
    ctx.arc(28, 16, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawWindLines(ctx) {
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (const w of this.windParticles) {
      ctx.strokeStyle = w.color;
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(w.x, w.y);
      ctx.lineTo(w.x + w.len, w.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.isStar) {
        // Vẽ hình ngôi sao 4 cánh hoàng gia
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(0, 0, p.size, 0);
        ctx.quadraticCurveTo(0, 0, 0, p.size);
        ctx.quadraticCurveTo(0, 0, -p.size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -p.size);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Vẽ Sắc Lệnh Hoàng Gia (Royal Decree Scroll Banner)
   */
  drawBanners(ctx) {
    if (this.banners.length === 0) return;
    const now = performance.now();
    const banner = this.banners[this.banners.length - 1];
    const elapsed = (now - banner.startTime) / 1000;
    const totalSec = banner.duration / 1000;

    let scale = 1;
    let alpha = 1;

    if (elapsed < 0.28) {
      scale = 0.4 + (elapsed / 0.28) * 0.65;
    } else if (elapsed > totalSec - 0.4) {
      alpha = Math.max(0, (totalSec - elapsed) / 0.4);
    }

    ctx.save();
    ctx.translate(270, 395);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    const bw = 430;
    const bh = 68;

    // Đổ bóng sắc lệnh ma thuật
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;

    // Nền dải ruy băng hoàng gia (Royal Velvet Crimson to Imperial Gold)
    const ribbonGrad = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    ribbonGrad.addColorStop(0, '#4C0519');
    ribbonGrad.addColorStop(0.2, '#9F1239');
    ribbonGrad.addColorStop(0.5, '#BE123C');
    ribbonGrad.addColorStop(0.8, '#9F1239');
    ribbonGrad.addColorStop(1, '#4C0519');

    ctx.fillStyle = ribbonGrad;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 14);
    ctx.fill();

    // Khung mạ vàng chạm trổ (Gold Filigree Border)
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-bw / 2 + 3, -bh / 2 + 3, bw - 6, bh - 6, 12);
    ctx.stroke();

    // Con dấu hoàng gia 2 bên đầu sắc lệnh
    this.drawRoyalCrest(ctx, -bw / 2 + 22, 0);
    this.drawRoyalCrest(ctx, bw / 2 - 22, 0);

    // Chữ tiêu đề vàng kim dập nổi
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 18px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(banner.title, 0, banner.subtitle ? -10 : 0);

    if (banner.subtitle) {
      ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(banner.subtitle, 0, 15);
    }

    ctx.restore();
  }

  drawRoyalCrest(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FEF08A';
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚜️', 0, 1);
    ctx.restore();
  }

  /**
   * Màn hình vinh danh "CHẠM ĐỈNH THÁP!" phong cách Thư Viện Hoàng Gia
   */
  drawVictoryScreen(ctx, state, getAvatarImgFn) {
    const winner = state.winner;
    if (!winner) return;

    ctx.save();
    // Nền nhung huyền bí
    ctx.fillStyle = 'rgba(11, 8, 26, 0.94)';
    ctx.fillRect(0, 0, 540, 960);

    const cx = 270;
    const cy = 475;

    // Hào quang ma thuật xoay bừng sáng
    const now = performance.now() / 1000;
    const auraGrad = ctx.createRadialGradient(cx, cy - 35, 30, cx, cy - 35, 240);
    auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
    auraGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.25)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 240, 0, Math.PI * 2);
    ctx.fill();

    // Tia sáng thần thánh xoay tròn
    ctx.save();
    ctx.translate(cx, cy - 35);
    ctx.rotate(now * 0.2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.15)';
    ctx.lineWidth = 14;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(260, 0);
      ctx.stroke();
      ctx.rotate(Math.PI / 6);
    }
    ctx.restore();

    // Tiêu đề CHẠM ĐỈNH THÁP!
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 36px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
    ctx.shadowBlur = 24;
    ctx.fillText('👑 CHẠM ĐỈNH THÁP! 👑', cx, cy - 185);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`VÔ ĐỊCH VÒNG ${state.round || 1} · THẦN THÁP TRI THỨC`, cx, cy - 145);

    // Bệ đá hoàng kim nâng avatar
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 28, 90, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Avatar khổng lồ người chiến thắng
    const avatarR = 66;
    const avatarY = cy - 42;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2);
    ctx.clip();

    let avatarImg = null;
    if (winner.avatarUrl && typeof getAvatarImgFn === 'function') {
      avatarImg = getAvatarImgFn(winner.avatarUrl);
    }

    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      ctx.drawImage(avatarImg, cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
    } else {
      ctx.fillStyle = '#831843';
      ctx.fillRect(cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 46px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = (winner.nickname || 'W').charAt(0).toUpperCase();
      ctx.fillText(initial, cx, avatarY + 3);
    }
    ctx.restore();

    // Viền khung hoàng gia mạ vàng
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, avatarY, avatarR + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Vương miện hoàng gia lộng lẫy
    ctx.font = '44px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑', cx, avatarY - avatarR - 12);

    // Tên người chiến thắng
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Baloo 2", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(winner.nickname || 'Người chơi', cx, cy + 68);

    // Thành tích
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FDE047';
    ctx.font = '600 16px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`✨ Trả lời đúng: ${winner.correctCount || 0} câu · Chinh phục Tầng ${winner.floor || state.targetFloor || 7749}`, cx, cy + 100);

    // Đếm ngược vòng mới
    ctx.fillStyle = '#A5B4FC';
    ctx.font = 'bold 15px "Baloo 2", sans-serif';
    ctx.fillText(`Vòng mới sẽ bắt đầu sau ${state.timer || 7}s...`, cx, cy + 150);

    ctx.restore();
  }
}

window.EffectsManager = EffectsManager;
