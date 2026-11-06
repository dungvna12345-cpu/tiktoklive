/**
 * Module Tháp Sách Ma Thuật 3D Cổ Điển & Nhân Vật Leo Tháp (tower.js)
 * Sách bìa da chạm trổ chỉ vàng cổ điển, bệ đá cẩm thạch Hy Lạp, khung avatar hoàng gia.
 */

// Bảng 20 phối màu sách ma thuật bìa da hoàng tộc cực sang
const ROYAL_BOOK_PALETTES = [
  { spine: '#7F1D1D', shadow: '#450A0A', gold: '#FDE047', icon: '⚜️' }, // Đỏ Ruby Hoàng Tộc
  { spine: '#1E3A8A', shadow: '#172554', gold: '#FDE047', icon: '⭐' }, // Lam Sapphire Đại Dương
  { spine: '#14532D', shadow: '#052E16', gold: '#FDE047', icon: '🌿' }, // Lục Bảo Thần Rừng
  { spine: '#581C87', shadow: '#3B0764', gold: '#FDE047', icon: '🔮' }, // Tím Thạch Anh Huyền Bí
  { spine: '#78350F', shadow: '#451A03', gold: '#FDE047', icon: '📜' }, // Nâu Da Cổ Điển
  { spine: '#831843', shadow: '#500724', gold: '#FDE047', icon: '🍷' }, // Đỏ Rượu Vang Đế Vương
  { spine: '#164E63', shadow: '#083344', gold: '#FDE047', icon: '🌙' }, // Xanh Mộng Ảo Đêm
  { spine: '#701A75', shadow: '#4A044E', gold: '#FDE047', icon: '✨' }, // Tím Hoa Cà Hoàng Gia
  { spine: '#134E4A', shadow: '#042F2E', gold: '#FDE047', icon: '🛡️' }, // Xanh Khổng Tước Cổ
  { spine: '#713F12', shadow: '#422006', gold: '#FDE047', icon: '🗡️' }, // Nâu Hổ Phách Cổ
  { spine: '#1E293B', shadow: '#0F172A', gold: '#FDE047', icon: '⚔️' }, // Hắc Kim Thiết Giáp
  { spine: '#881337', shadow: '#4C0519', gold: '#FDE047', icon: '💎' }, // Hồng Ngọc Lộng Lẫy
  { spine: '#312E81', shadow: '#1E1B4B', gold: '#FDE047', icon: '🌌' }, // Lam Thiên Hà Huyền Diệu
  { spine: '#064E3B', shadow: '#022C22', gold: '#FDE047', icon: '🍀' }, // Xanh Cỏ May Mắn
  { spine: '#4C1D95', shadow: '#2E1065', gold: '#FDE047', icon: '🕯️' }, // Tím Ngọn Nến Thần
  { spine: '#6B21A8', shadow: '#3B0764', gold: '#FDE047', icon: '🌠' }, // Tím Sao Băng
  { spine: '#1E40AF', shadow: '#1E1B4B', gold: '#FDE047', icon: '🔱' }, // Lam Quyền Trượng
  { spine: '#0F766E', shadow: '#115E59', gold: '#FDE047', icon: '🗝️' }, // Xanh Chìa Khóa Vàng
  { spine: '#9A3412', shadow: '#7C2D12', gold: '#FDE047', icon: '🔥' }, // Cam Lửa Bất Diệt
  { spine: '#B45309', shadow: '#78350F', gold: '#FEF08A', icon: '👑' }  // Vàng Kim Hoàng Đế
];

class TowerRenderer {
  constructor() {
    this.targetCameraFloor = 0;
    this.currentCameraFloor = 0;

    this.floorHeight = 52;
    this.bookWidth = 346;
    this.towerCenterX = 232;

    this.avatarCache = new Map();
    this.characterPositions = new Map();
  }

  update(dt, players, topFloor = 0, targetFloor = 7749) {
    this.targetCameraFloor = Math.max(0, Math.min(targetFloor, topFloor - 2));

    const lerpSpeed = 3.6;
    this.currentCameraFloor += (this.targetCameraFloor - this.currentCameraFloor) * Math.min(1, dt * lerpSpeed);

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

      if (charPos.floor !== p.floor) {
        charPos.oldFloor = charPos.renderFloor;
        charPos.floor = p.floor;
        charPos.jumpProgress = 0;
        charPos.jumpStartTime = now;
      }

      if (charPos.jumpProgress < 1) {
        charPos.jumpProgress += dt * 2.3;
        if (charPos.jumpProgress >= 1) {
          charPos.jumpProgress = 1;
          charPos.renderFloor = charPos.floor;
        } else {
          const pNorm = charPos.jumpProgress;
          const currentBase = charPos.oldFloor + (charPos.floor - charPos.oldFloor) * pNorm;
          const jumpArc = Math.sin(pNorm * Math.PI) * 0.5;
          charPos.renderFloor = currentBase + jumpArc;
        }
      }
    }
  }

  floorToScreenY(floorNumber) {
    const baseY = 880;
    return baseY - (floorNumber - this.currentCameraFloor) * this.floorHeight;
  }

  draw(ctx, state) {
    const players = state.players || [];
    const topFloor = players.reduce((max, p) => Math.max(max, p.floor), 0);
    const targetFloor = state.targetFloor || 7749;

    // 1. Bệ Đá Cẩm Thạch Cổ Đại (Mặt Đất)
    this.drawAncientPedestal(ctx);

    // 2. Tháp Sách Ma Thuật (Vẽ động các cuốn sách trong tầm nhìn)
    const minVisible = Math.max(1, Math.floor(this.currentCameraFloor - 3));
    const maxVisible = Math.min(targetFloor, Math.ceil(this.currentCameraFloor + 13));

    for (let f = minVisible; f <= maxVisible; f++) {
      const bookY = this.floorToScreenY(f);
      if (bookY > 330 && bookY < 950) {
        this.drawMagicBook(ctx, f, bookY, f === targetFloor);
      }
    }

    // 3. Phân nhóm người chơi theo tầng
    const floorGroups = new Map();
    for (const p of players) {
      const f = p.floor;
      if (!floorGroups.has(f)) floorGroups.set(f, []);
      floorGroups.get(f).push(p);
    }

    // 4. Vẽ các nhân vật người chơi với khung mặt dây chuyền hoàng gia
    for (const [floorNum, group] of floorGroups.entries()) {
      const displayCount = Math.min(group.length, 12);
      const overflow = group.length - displayCount;

      const availableWidth = this.bookWidth - 44;
      const spacing = displayCount > 1 ? Math.min(26, availableWidth / (displayCount - 1)) : 0;
      const startX = this.towerCenterX - ((displayCount - 1) * spacing) / 2;

      for (let i = 0; i < displayCount; i++) {
        const player = group[i];
        const charPos = this.characterPositions.get(player.userId);
        const renderFloor = charPos ? charPos.renderFloor : floorNum;
        const charY = this.floorToScreenY(renderFloor) - 20;
        const charX = startX + i * spacing;

        const isLeader = player.floor === topFloor && topFloor > 0 && i === 0;
        const isFastest = state.fastestUserIds && state.fastestUserIds.includes(player.userId);

        this.drawRoyalCharacter(ctx, player, charX, charY, isLeader, isFastest, i < 3 && floorNum === topFloor);
      }

      if (overflow > 0) {
        const badgeX = startX + displayCount * spacing + 12;
        const badgeY = this.floorToScreenY(floorNum) - 20;
        this.drawOverflowBadge(ctx, badgeX, badgeY, overflow);
      }
    }
  }

  /**
   * Bệ Đá Cẩm Thạch Thần Thoại Hy Lạp (Mặt Đất)
   */
  drawAncientPedestal(ctx) {
    const groundY = this.floorToScreenY(0);
    if (groundY < 340 || groundY > 960) return;

    ctx.save();
    const w = this.bookWidth + 64;
    const x = this.towerCenterX - w / 2;

    // Đổ bóng bệ đá
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    // Bệ đá cẩm thạch trắng ngà chạm khắc
    const marbleGrad = ctx.createLinearGradient(x, groundY, x + w, groundY + 44);
    marbleGrad.addColorStop(0, '#CBD5E1');
    marbleGrad.addColorStop(0.5, '#F1F5F9');
    marbleGrad.addColorStop(1, '#94A3B8');

    ctx.fillStyle = marbleGrad;
    ctx.beginPath();
    ctx.roundRect(x, groundY, w, 44, [10, 10, 0, 0]);
    ctx.fill();

    // Viền vàng chạm trổ
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rãnh hoa văn cổ điển
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 20, groundY + 8);
    ctx.lineTo(x + w - 20, groundY + 8);
    ctx.moveTo(x + 20, groundY + 36);
    ctx.lineTo(x + w - 20, groundY + 36);
    ctx.stroke();

    // Dòng chữ MẶT ĐẤT dập vàng nổi
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 13px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️ BỆ ĐÁ KHỞI NGUYÊN (MẶT ĐẤT)', this.towerCenterX, groundY + 22);

    ctx.restore();
  }

  /**
   * Vẽ cuốn sách ma thuật bìa da 3D chạm trổ chỉ vàng
   */
  drawMagicBook(ctx, floorNum, y, isSummit = false) {
    const x = this.towerCenterX - this.bookWidth / 2;
    const h = 46;
    const pal = isSummit
      ? { spine: '#D97706', shadow: '#78350F', gold: '#FEF08A', icon: '👑' }
      : ROYAL_BOOK_PALETTES[(floorNum - 1) % ROYAL_BOOK_PALETTES.length];

    ctx.save();

    // 1. Đổ bóng sống gáy sách 3D
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // 2. Thân gáy sách bìa da bo cong
    const spineGrad = ctx.createLinearGradient(x, y, x, y + h);
    spineGrad.addColorStop(0, pal.spine);
    spineGrad.addColorStop(0.15, pal.shadow);
    spineGrad.addColorStop(0.5, pal.spine);
    spineGrad.addColorStop(0.85, pal.shadow);
    spineGrad.addColorStop(1, pal.spine);

    ctx.fillStyle = spineGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, this.bookWidth, h, 8);
    ctx.fill();
    ctx.restore();

    ctx.save();
    // 3. Góc sách bọc vàng kim loại chạm khắc (Corner gold brackets)
    const bracketSize = 14;
    ctx.fillStyle = isSummit ? '#FDE047' : '#D97706';
    // Góc trên trái
    this.drawCornerFiligree(ctx, x + 4, y + 4, bracketSize);
    // Góc trên phải
    this.drawCornerFiligree(ctx, x + this.bookWidth - 4 - bracketSize, y + 4, bracketSize);

    // 4. Hai đường chỉ vàng dập chìm trên gáy da (Gold Filigree Inlays)
    ctx.strokeStyle = isSummit ? '#FEF08A' : 'rgba(253, 224, 71, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 5);
    ctx.lineTo(x + 28, y + h - 5);
    ctx.moveTo(x + this.bookWidth - 28, y + 5);
    ctx.lineTo(x + this.bookWidth - 28, y + h - 5);
    ctx.stroke();

    // 5. Biểu tượng ma thuật 2 bên gáy
    ctx.font = '13px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pal.icon, x + 16, y + h / 2);
    ctx.fillText(pal.icon, x + this.bookWidth - 16, y + h / 2);

    // 6. Nhãn tên tập sách khắc dát vàng nổi
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;

    ctx.fillStyle = '#FEF08A';
    ctx.font = isSummit ? 'bold 15px "Baloo 2", sans-serif' : 'bold 13px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const label = isSummit
      ? `👑 ĐỈNH THÁP HUYỀN THOẠI (TẬP ${floorNum}) 👑`
      : `TẬP ${floorNum}`;
    ctx.fillText(label, this.towerCenterX, y + h / 2);

    // Viền vàng phát sáng cho tầng đỉnh tháp
    if (isSummit) {
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(253, 224, 71, 0.9)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(x, y, this.bookWidth, h, 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCornerFiligree(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Vẽ nhân vật với Khung Mặt Dây Chuyền Hoàng Gia (Royal Pendant)
   */
  drawRoyalCharacter(ctx, player, x, y, isLeader, isFastest, showName) {
    const r = 17;
    ctx.save();

    // Hào quang vàng kim nếu là Leader
    if (isLeader) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 16;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
    }

    // Avatar hình tròn
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    let avatarImg = null;
    if (player.avatarUrl) {
      avatarImg = this.getOrCreateAvatarImage(player.avatarUrl);
    }

    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      ctx.drawImage(avatarImg, x - r, y - r, r * 2, r * 2);
    } else {
      // Fallback mặt dây chuyền phong thủy
      ctx.fillStyle = player.color || '#4338CA';
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = (player.nickname || 'N').charAt(0).toUpperCase();
      ctx.fillText(initial, x, y + 1);
    }

    ctx.restore();

    // Khung mạ vàng viền ngoài hoàng gia
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = isLeader ? '#FDE047' : '#D1D5DB';
    ctx.lineWidth = isLeader ? 3.5 : 2;
    ctx.stroke();

    // Vương miện hoàng gia lộng lẫy cho người dẫn đầu
    if (isLeader) {
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', x, y - r - 4);
    }

    // Khối pha lê băng ma thuật bao bọc
    if (player.isFrozen) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.beginPath();
      ctx.roundRect(x - r - 3, y - r - 3, (r + 3) * 2, (r + 3) * 2, 6);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('❄️', x, y + 4);
    }

    // Viên ngọc ma thuật xanh bích báo đã nộp đáp án
    if (player.hasAnswered) {
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x + r - 3, y - r + 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Thẻ tên hiệp sĩ phong cách danh thiếp hoàng gia
    if (showName || isFastest) {
      ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
      const name = player.nickname || '';
      const textW = ctx.measureText(name).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(x - textW / 2 - 6, y - r - 18, textW + 12, 15, 4);
      ctx.fill();

      ctx.strokeStyle = isFastest ? '#FDE047' : '#D97706';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isFastest ? '#FEF08A' : '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, x, y - r - 10);
    }

    ctx.restore();
  }

  drawOverflowBadge(ctx, x, y, count) {
    ctx.save();
    const r = 13;
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 11px "Baloo 2", sans-serif';
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
    img.src = `/avatar?u=${encodeURIComponent(url)}`;
    this.avatarCache.set(url, img);
    return img;
  }
}

window.TowerRenderer = TowerRenderer;
