/**
 * Module Hiệu Ứng Hình Ảnh & Màn Hình Vinh Danh (fx.js)
 * Mây trôi, gió thổi, pháo hoa, banner thông báo phóng to, màn hình Chạm Đỉnh Tháp.
 */

class EffectsManager {
  constructor() {
    this.clouds = [
      { x: 40, y: 390, speed: 12, scale: 0.8 },
      { x: 300, y: 440, speed: 8, scale: 1.1 },
      { x: 180, y: 560, speed: 15, scale: 0.9 },
      { x: 420, y: 680, speed: 10, scale: 1.0 }
    ];

    this.particles = [];
    this.banners = []; // [{ title, subtitle, startTime, duration: 3.5 }]
    this.windParticles = [];

    // Khởi tạo các hạt gió
    for (let i = 0; i < 25; i++) {
      this.windParticles.push({
        x: Math.random() * 540,
        y: 350 + Math.random() * 500,
        len: 20 + Math.random() * 30,
        speed: 180 + Math.random() * 120
      });
    }
  }

  showBanner(title, subtitle = '') {
    this.banners.push({
      title,
      subtitle,
      startTime: performance.now(),
      duration: 3500 // Hiển thị trong 3.5 giây
    });
  }

  spawnConfetti(count = 60) {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: 270 + (Math.random() - 0.5) * 200,
        y: 400 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 280,
        vy: -150 - Math.random() * 200,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        life: 1,
        decay: 0.35 + Math.random() * 0.3
      });
    }
  }

  update(dt, isWindActive = false) {
    // 1. Cập nhật mây trôi
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > 620) {
        c.x = -120;
        c.y = 360 + Math.random() * 400;
      }
    }

    // 2. Cập nhật hạt gió x2
    if (isWindActive) {
      for (const w of this.windParticles) {
        w.x += w.speed * dt;
        if (w.x > 560) {
          w.x = -50;
          w.y = 350 + Math.random() * 500;
        }
      }
    }

    // 3. Cập nhật hạt pháo hoa confetti
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt; // Trọng lực
      p.rotation += p.rotSpeed * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 4. Lọc bỏ các banner đã hết hạn
    const now = performance.now();
    this.banners = this.banners.filter(b => now - b.startTime < b.duration);
  }

  drawSkyAndClouds(ctx) {
    // Vẽ các đám mây xốp trắng nhẹ trên nền trời
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (const c of this.clouds) {
      this.drawPuffyCloud(ctx, c.x, c.y, c.scale);
    }
    ctx.restore();
  }

  drawPuffyCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.arc(22, -10, 20, 0, Math.PI * 2);
    ctx.arc(42, 2, 22, 0, Math.PI * 2);
    ctx.arc(20, 12, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawWindLines(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (const w of this.windParticles) {
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
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    ctx.restore();
  }

  drawBanners(ctx) {
    if (this.banners.length === 0) return;
    const now = performance.now();
    const banner = this.banners[this.banners.length - 1]; // Lấy banner mới nhất
    const elapsed = (now - banner.startTime) / 1000;
    const totalSec = banner.duration / 1000;

    // Hiệu ứng phóng to zoom-in rồi mờ dần
    let scale = 1;
    let alpha = 1;

    if (elapsed < 0.25) {
      // Phóng to nhanh lúc xuất hiện
      scale = 0.5 + (elapsed / 0.25) * 0.55;
    } else if (elapsed > totalSec - 0.4) {
      // Mờ dần lúc biến mất
      alpha = Math.max(0, (totalSec - elapsed) / 0.4);
    }

    ctx.save();
    ctx.translate(270, 390);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // Nền hộp banner
    const bw = 420;
    const bh = 64;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    const grad = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    grad.addColorStop(0, '#F59E0B');
    grad.addColorStop(0.5, '#EF4444');
    grad.addColorStop(1, '#EC4899');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 32);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Tiêu đề banner
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(banner.title, 0, banner.subtitle ? -9 : 0);

    // Phụ đề (nếu có)
    if (banner.subtitle) {
      ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#FEF08A';
      ctx.fillText(banner.subtitle, 0, 15);
    }

    ctx.restore();
  }

  /**
   * Vẽ màn hình vinh danh "CHẠM ĐỈNH THÁP!" khi có người chiến thắng
   */
  drawVictoryScreen(ctx, state, getAvatarImgFn) {
    const winner = state.winner;
    if (!winner) return;

    ctx.save();
    // Nền mờ huyền ảo
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, 0, 540, 960);

    const cx = 270;
    const cy = 480;

    // Hiệu ứng hào quang xoay
    const grad = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy - 30, 220);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 220, 0, Math.PI * 2);
    ctx.fill();

    // Tiêu đề rực rỡ
    ctx.fillStyle = '#FACC15';
    ctx.font = 'bold 36px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('🏆 CHẠM ĐỈNH THÁP! 🏆', cx, cy - 180);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`VÔ ĐỊCH VÒNG ${state.round || 1}`, cx, cy - 140);

    // Avatar khổng lồ của người chiến thắng
    const avatarR = 64;
    const avatarY = cy - 40;

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
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = (winner.nickname || 'W').charAt(0).toUpperCase();
      ctx.fillText(initial, cx, avatarY + 3);
    }
    ctx.restore();

    // Viền vàng kim cương cho avatar
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2);
    ctx.stroke();

    // Vương miện khổng lồ trên đầu
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑', cx, avatarY - avatarR - 10);

    // Tên người chiến thắng
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Baloo 2", sans-serif';
    ctx.fillText(winner.nickname || 'Người chơi', cx, cy + 60);

    // Thống kê thành tích
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 16px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Số câu đúng: ${winner.correctCount || 0} câu · Đạt Tầng 20`, cx, cy + 95);

    // Dòng đếm ngược bắt đầu vòng mới
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 15px "Baloo 2", sans-serif';
    ctx.fillText(`Vòng mới sẽ bắt đầu sau ${state.timer || 7}s...`, cx, cy + 145);

    ctx.restore();
  }
}

window.EffectsManager = EffectsManager;
