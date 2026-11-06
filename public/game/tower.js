/**
 * Module Vẽ Tháp Sách 20 Tầng, Camera Theo Dõi và Nhân Vật Leo Tháp
 * Tọa độ hệ chuẩn 540x960
 */

// Bảng màu 20 cuốn sách phong phú, sang trọng
const BOOK_COLORS = [
  { spine: '#C0392B', cover: '#E74C3C', text: '#FFFFFF' }, // Tập 1: Đỏ ruby
  { spine: '#2980B9', cover: '#3498DB', text: '#FFFFFF' }, // Tập 2: Xanh sapphire
  { spine: '#27AE60', cover: '#2ECC71', text: '#FFFFFF' }, // Tập 3: Xanh ngọc
  { spine: '#D35400', cover: '#E67E22', text: '#FFFFFF' }, // Tập 4: Cam hổ phách
  { spine: '#8E44AD', cover: '#9B59B6', text: '#FFFFFF' }, // Tập 5: Tím thạch anh
  { spine: '#16A085', cover: '#1ABC9C', text: '#FFFFFF' }, // Tập 6: Xanh biển sâu
  { spine: '#2C3E50', cover: '#34495E', text: '#FFFFFF' }, // Tập 7: Lam than
  { spine: '#B9770E', cover: '#F39C12', text: '#FFFFFF' }, // Tập 8: Vàng mù tạt
  { spine: '#A93226', cover: '#CD6155', text: '#FFFFFF' }, // Tập 9: Đỏ gạch
  { spine: '#2471A3', cover: '#5499C7', text: '#FFFFFF' }, // Tập 10: Xanh denim
  { spine: '#1E8449', cover: '#52BE80', text: '#FFFFFF' }, // Tập 11: Xanh rêu
  { spine: '#BA4A00', cover: '#DC7633', text: '#FFFFFF' }, // Tập 12: Đất nung
  { spine: '#7D3C98', cover: '#A569BD', text: '#FFFFFF' }, // Tập 13: Tím oải hương
  { spine: '#117A65', cover: '#48C9B0', text: '#FFFFFF' }, // Tập 14: Xanh mòng két
  { spine: '#78281F', cover: '#922B21', text: '#FFFFFF' }, // Tập 15: Đỏ mận
  { spine: '#1F618D', cover: '#2980B9', text: '#FFFFFF' }, // Tập 16: Lam biếc
  { spine: '#196F3D', cover: '#27AE60', text: '#FFFFFF' }, // Tập 17: Lục bảo
  { spine: '#B7950B', cover: '#D4AC0D', text: '#FFFFFF' }, // Tập 18: Hoàng kim
  { spine: '#6C3483', cover: '#884EA0', text: '#FFFFFF' }, // Tập 19: Tím hoàng gia
  { spine: '#D4AF37', cover: '#FFD700', text: '#78350F' }  // Tập 20: ĐỈNH THÁP VÀNG
];

class TowerRenderer {
  constructor() {
    this.targetCameraFloor = 0;
    this.currentCameraFloor = 0;

    // Chiều cao mỗi cuốn sách
    this.floorHeight = 52;
    this.bookWidth = 340;
    this.towerCenterX = 230; // Đặt lệch trái nhẹ để chừa góc phải cho bảng xếp hạng

    // Bộ nhớ cache hình ảnh avatar người chơi
    this.avatarCache = new Map();

    // Vị trí nội suy chuyển động nhân vật
    this.characterPositions = new Map(); // userId -> { x, y, currentFloor, targetFloor, jumpTime }
  }

  update(dt, players, topFloor = 0, targetFloor = 7749) {
    // Camera bám theo người dẫn đầu mà không giới hạn ở tầng 14
    this.targetCameraFloor = Math.max(0, Math.min(targetFloor, topFloor - 2));

    // Lerp camera mượt mà
    const lerpSpeed = 3.5;
    this.currentCameraFloor += (this.targetCameraFloor - this.currentCameraFloor) * Math.min(1, dt * lerpSpeed);

    // Cập nhật vị trí chuyển động của các nhân vật
    const now = performance.now();
    for (const p of players) {
      let charPos = this.characterPositions.get(p.userId);
      if (!charPos) {
        charPos = {
          userId: p.userId,
          floor: p.floor,
          renderFloor: p.floor,
          jumpProgress: 1
        };
        this.characterPositions.set(p.userId, charPos);
      }

      // Nếu có sự thay đổi tầng
      if (charPos.floor !== p.floor) {
        charPos.oldFloor = charPos.renderFloor;
        charPos.floor = p.floor;
        charPos.jumpProgress = 0;
        charPos.jumpStartTime = now;
      }

      if (charPos.jumpProgress < 1) {
        charPos.jumpProgress += dt * 2.2; // Tốc độ nhảy ~0.45s
        if (charPos.jumpProgress >= 1) {
          charPos.jumpProgress = 1;
          charPos.renderFloor = charPos.floor;
        } else {
          // Tính quỹ đạo nhảy hình parabol
          const pNorm = charPos.jumpProgress;
          const currentBase = charPos.oldFloor + (charPos.floor - charPos.oldFloor) * pNorm;
          const jumpArc = Math.sin(pNorm * Math.PI) * 0.45; // Nhảy bổng lên
          charPos.renderFloor = currentBase + jumpArc;
        }
      }
    }
  }

  /**
   * Chuyển đổi từ số tầng sang tọa độ Y trên màn hình
   */
  floorToScreenY(floorNumber) {
    // Đáy nhìn thấy ở tầm Y = 880
    const baseY = 880;
    return baseY - (floorNumber - this.currentCameraFloor) * this.floorHeight;
  }

  draw(ctx, state) {
    const players = state.players || [];
    const topFloor = players.reduce((max, p) => Math.max(max, p.floor), 0);
    const targetFloor = state.targetFloor || 7749;

    // 1. Vẽ Mặt Đất (Tầng 0)
    this.drawGround(ctx);

    // 2. Vẽ tháp sách vô hạn (tính toán các cuốn sách đang lọt vào khung hình)
    const minVisible = Math.max(1, Math.floor(this.currentCameraFloor - 3));
    const maxVisible = Math.min(targetFloor, Math.ceil(this.currentCameraFloor + 13));

    for (let f = minVisible; f <= maxVisible; f++) {
      const bookY = this.floorToScreenY(f);
      // Chỉ vẽ các cuốn sách nằm trong tầm nhìn
      if (bookY > 330 && bookY < 950) {
        this.drawBook(ctx, f, bookY, f === targetFloor);
      }
    }

    // 3. Phân nhóm người chơi theo từng tầng để bố trí vị trí đứng
    const floorGroups = new Map();
    for (const p of players) {
      const f = p.floor;
      if (!floorGroups.has(f)) floorGroups.set(f, []);
      floorGroups.get(f).push(p);
    }

    // 4. Vẽ các nhân vật người chơi
    for (const [floorNum, group] of floorGroups.entries()) {
      const displayCount = Math.min(group.length, 12);
      const overflow = group.length - displayCount;

      // Khoảng cách giữa các nhân vật trên gáy sách
      const availableWidth = this.bookWidth - 40;
      const spacing = displayCount > 1 ? Math.min(26, availableWidth / (displayCount - 1)) : 0;
      const startX = this.towerCenterX - ((displayCount - 1) * spacing) / 2;

      for (let i = 0; i < displayCount; i++) {
        const player = group[i];
        const charPos = this.characterPositions.get(player.userId);
        const renderFloor = charPos ? charPos.renderFloor : floorNum;
        const charY = this.floorToScreenY(renderFloor) - 18;
        const charX = startX + i * spacing;

        const isLeader = player.floor === topFloor && topFloor > 0 && i === 0;
        const isFastest = state.fastestUserIds && state.fastestUserIds.includes(player.userId);

        this.drawCharacter(ctx, player, charX, charY, isLeader, isFastest, i < 3 && floorNum === topFloor);
      }

      // Nếu tầng có hơn 12 người thì vẽ huy hiệu "+N"
      if (overflow > 0) {
        const badgeX = startX + displayCount * spacing + 12;
        const badgeY = this.floorToScreenY(floorNum) - 18;
        this.drawOverflowBadge(ctx, badgeX, badgeY, overflow);
      }
    }
  }

  drawGround(ctx) {
    const groundY = this.floorToScreenY(0);
    if (groundY < 350 || groundY > 960) return;

    ctx.save();
    // Bệ đá/gỗ nền tháp
    const w = this.bookWidth + 50;
    const x = this.towerCenterX - w / 2;

    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.roundRect(x, groundY, w, 40, [8, 8, 0, 0]);
    ctx.fill();

    // Thảm cỏ trang trí
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x - 10, groundY + 36, w + 20, 24);

    // Chữ Mặt Đất
    ctx.fillStyle = '#E0E0E0';
    ctx.font = 'bold 12px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MẶT ĐẤT (TẦNG 0)', this.towerCenterX, groundY + 22);
    ctx.restore();
  }

  drawBook(ctx, floorNum, y, isSummit = false) {
    const x = this.towerCenterX - this.bookWidth / 2;
    const h = 44;
    const color = isSummit
      ? { spine: '#D4AF37', cover: '#FFD700', text: '#78350F' }
      : BOOK_COLORS[(floorNum - 1) % BOOK_COLORS.length];

    ctx.save();

    // 1. Đổ bóng gáy sách
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // 2. Thân gáy sách
    ctx.fillStyle = color.spine;
    ctx.beginPath();
    ctx.roundRect(x, y, this.bookWidth, h, 6);
    ctx.fill();
    ctx.restore();

    ctx.save();
    // 3. Đường chỉ viền gáy mạ vàng / bóng bẩy
    ctx.strokeStyle = isSummit ? '#FEF08A' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 4);
    ctx.lineTo(x + 16, y + h - 4);
    ctx.moveTo(x + this.bookWidth - 16, y + 4);
    ctx.lineTo(x + this.bookWidth - 16, y + h - 4);
    ctx.stroke();

    // 4. Nhãn tên tập sách
    ctx.fillStyle = color.text;
    ctx.font = isSummit ? 'bold 15px "Baloo 2", sans-serif' : 'bold 13px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const label = isSummit ? `🏆 ĐỈNH THÁP (TẬP ${floorNum}) 🏆` : `TẬP ${floorNum}`;
    ctx.fillText(label, this.towerCenterX, y + h / 2);

    // Điểm nhấn lấp lánh cho tầng đỉnh tháp
    if (isSummit) {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(x, y, this.bookWidth, h, 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCharacter(ctx, player, x, y, isLeader, isFastest, showName) {
    const r = 16;
    ctx.save();

    // Đổ bóng nhân vật
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;

    // Vòng tròn avatar
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    // Kiểm tra và vẽ avatar từ proxy nếu có
    let avatarImg = null;
    if (player.avatarUrl) {
      avatarImg = this.getOrCreateAvatarImage(player.avatarUrl);
    }

    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      ctx.drawImage(avatarImg, x - r, y - r, r * 2, r * 2);
    } else {
      // Fallback: Vẽ hình tròn màu kèm chữ cái đầu
      ctx.fillStyle = player.color || '#3B82F6';
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = (player.nickname || 'N').charAt(0).toUpperCase();
      ctx.fillText(initial, x, y + 1);
    }

    ctx.restore();

    // Viền avatar (Vàng cho Leader, Xanh cho người thường)
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = isLeader ? '#F59E0B' : '#FFFFFF';
    ctx.lineWidth = isLeader ? 3 : 2;
    ctx.stroke();

    // Vương miện nhỏ xinh cho người dẫn đầu
    if (isLeader) {
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', x, y - r - 2);
    }

    // Hiệu ứng đóng băng (khối băng bao bọc)
    if (player.isFrozen) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
      ctx.beginPath();
      ctx.roundRect(x - r - 2, y - r - 2, (r + 2) * 2, (r + 2) * 2, 4);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = '10px serif';
      ctx.fillText('❄️', x, y);
    }

    // Chấm nhỏ báo hiệu đã trả lời câu hỏi hiện tại
    if (player.hasAnswered) {
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(x + r - 3, y - r + 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Hiển thị tên cho Top 3 hoặc người nhanh nhất
    if (showName || isFastest) {
      ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
      const name = player.nickname || '';
      const textW = ctx.measureText(name).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(x - textW / 2 - 4, y - r - 16, textW + 8, 14, 4);
      ctx.fill();

      ctx.fillStyle = isFastest ? '#FDE047' : '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, x, y - r - 9);
    }

    ctx.restore();
  }

  drawOverflowBadge(ctx, x, y, count) {
    ctx.save();
    const r = 12;
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${count}`, x, y + 1);
    ctx.restore();
  }

  getOrCreateAvatarImage(url) {
    if (!url) return null;
    if (this.avatarCache.has(url)) {
      return this.avatarCache.get(url);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Chuyển qua proxy /avatar để tránh lỗi CORS
    img.src = `/avatar?u=${encodeURIComponent(url)}`;
    this.avatarCache.set(url, img);
    return img;
  }
}

window.TowerRenderer = TowerRenderer;
