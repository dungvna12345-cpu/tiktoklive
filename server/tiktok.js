/**
 * Module Kết Nối TikTok LIVE (server/tiktok.js)
 * Sử dụng thư viện tiktok-live-connector bản mới nhất.
 * Chỉ đọc sự kiện công khai, tự động kết nối lại theo chiến lược exponential backoff.
 */

const { TikTokLiveConnection } = require('tiktok-live-connector');

class TikTokManager {
  constructor(gameEngine, io) {
    this.game = gameEngine;
    this.io = io;

    this.connection = null;
    this.currentUsername = process.env.TIKTOK_USERNAME || '';
    this.signApiKey = process.env.EULER_API_KEY || '';

    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING
    this.viewerCount = 0;
    this.retryDelay = 5000; // 5s bắt đầu
    this.maxRetryDelay = 120000; // 2 phút tối đa
    this.reconnectTimeout = null;
    this.manualDisconnect = false;
  }

  /**
   * Bắt đầu kết nối tới phiên LIVE
   * @param {string} username Tên tài khoản TikTok (có hoặc không có dấu @)
   */
  async connect(username) {
    if (username) {
      this.currentUsername = username.replace(/^@/, '').trim();
    }

    if (!this.currentUsername) {
      this.emitStatus('ERROR', 'Vui lòng nhập tên tài khoản TikTok');
      return false;
    }

    // Nếu đang có kết nối thì đóng kết nối cũ trước
    if (this.connection) {
      try {
        this.manualDisconnect = true;
        this.connection.disconnect();
      } catch (e) {}
      this.connection = null;
    }

    this.clearReconnectTimer();
    this.manualDisconnect = false;
    this.status = 'CONNECTING';
    this.emitStatus('CONNECTING', `Đang kết nối tới @${this.currentUsername}...`);

    try {
      const options = {
        processInitialData: true,
        enableExtendedGiftInfo: true
      };

      if (this.signApiKey) {
        options.signApiKey = this.signApiKey;
      }

      this.connection = new TikTokLiveConnection(this.currentUsername, options);
      this.setupEventListeners();

      const state = await this.connection.connect();
      this.status = 'CONNECTED';
      this.retryDelay = 5000; // Reset độ trễ kết nối lại khi thành công
      this.viewerCount = state.roomInfo?.user_count || 0;

      this.emitStatus('CONNECTED', `Đã kết nối thành công tới phòng LIVE của @${this.currentUsername}!`);
      return true;
    } catch (err) {
      this.status = 'DISCONNECTED';
      const errMsg = err.message || 'Lỗi không xác định khi kết nối LIVE';
      this.emitStatus('ERROR', errMsg);
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Ngắt kết nối thủ công từ Admin
   */
  disconnect() {
    this.manualDisconnect = true;
    this.clearReconnectTimer();

    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch (e) {}
      this.connection = null;
    }

    this.status = 'DISCONNECTED';
    this.viewerCount = 0;
    this.emitStatus('DISCONNECTED', 'Đã ngắt kết nối LIVE.');
  }

  /**
   * Thiết lập lắng nghe các sự kiện TikTok chuẩn hóa
   */
  setupEventListeners() {
    if (!this.connection) return;

    // 1. Sự kiện bình luận (chat)
    this.connection.on('chat', (data) => {
      const chatEvent = {
        userId: data.userId ? String(data.userId) : (data.uniqueId || 'unknown'),
        uniqueId: data.uniqueId || '',
        nickname: data.nickname || data.uniqueId || 'Người xem',
        avatarUrl: data.profilePictureUrl || '',
        text: data.comment || ''
      };

      // Chuyển tới Game Engine
      this.game.handleComment(chatEvent);

      // Gửi log sự kiện tới Admin
      this.io.emit('tiktok:event', {
        type: 'chat',
        data: chatEvent,
        timestamp: Date.now()
      });
    });

    // 2. Sự kiện tặng quà (gift)
    this.connection.on('gift', (data) => {
      const isStreak = data.giftType === 1;
      const repeatEnd = isStreak ? (data.repeatEnd === 1 || data.repeatEnd === true) : true;

      const giftEvent = {
        userId: data.userId ? String(data.userId) : (data.uniqueId || 'unknown'),
        uniqueId: data.uniqueId || '',
        nickname: data.nickname || data.uniqueId || 'Người xem',
        avatarUrl: data.profilePictureUrl || '',
        giftId: data.giftId,
        giftName: data.giftName || 'Quà tặng',
        repeatCount: data.repeatCount || 1,
        diamondCount: data.diamondCount || 0,
        repeatEnd
      };

      // Chuyển tới Game Engine xử lý (lọc combo bằng streakTracker)
      this.game.handleGift(giftEvent);

      // Gửi log sự kiện tới Admin
      this.io.emit('tiktok:event', {
        type: 'gift',
        data: giftEvent,
        timestamp: Date.now()
      });
    });

    // 3. Sự kiện like
    this.connection.on('like', (data) => {
      const likeEvent = {
        userId: data.userId ? String(data.userId) : '',
        nickname: data.nickname || 'Người xem',
        likeCount: data.likeCount || 1,
        totalLikeCount: data.totalLikeCount || 0
      };

      this.game.handleLike(likeEvent);

      this.io.emit('tiktok:event', {
        type: 'like',
        data: likeEvent,
        timestamp: Date.now()
      });
    });

    // 4. Sự kiện follow
    this.connection.on('follow', (data) => {
      const followEvent = {
        userId: data.userId ? String(data.userId) : (data.uniqueId || ''),
        uniqueId: data.uniqueId || '',
        nickname: data.nickname || 'Bạn mới',
        avatarUrl: data.profilePictureUrl || ''
      };

      this.game.handleFollow(followEvent);

      this.io.emit('tiktok:event', {
        type: 'follow',
        data: followEvent,
        timestamp: Date.now()
      });
    });

    // 5. Sự kiện share
    this.connection.on('share', (data) => {
      const shareEvent = {
        userId: data.userId ? String(data.userId) : (data.uniqueId || ''),
        uniqueId: data.uniqueId || '',
        nickname: data.nickname || 'Người xem',
        avatarUrl: data.profilePictureUrl || ''
      };

      this.game.handleShare(shareEvent);

      this.io.emit('tiktok:event', {
        type: 'share',
        data: shareEvent,
        timestamp: Date.now()
      });
    });

    // 6. Số người đang xem phòng (roomUser)
    this.connection.on('roomUser', (data) => {
      if (data.viewerCount !== undefined) {
        this.viewerCount = data.viewerCount;
        this.io.emit('tiktok:viewers', { viewerCount: this.viewerCount });
      }
    });

    // 7. Người mới vào phòng (member)
    this.connection.on('member', (data) => {
      // Có thể log nhẹ trên admin nếu cần
    });

    // 8. Phiên LIVE kết thúc (streamEnd)
    this.connection.on('streamEnd', () => {
      this.status = 'DISCONNECTED';
      this.emitStatus('STREAM_END', 'Phiên LIVE đã kết thúc.');
      this.disconnect();
    });

    // 9. Mất kết nối (disconnected)
    this.connection.on('disconnected', () => {
      if (!this.manualDisconnect) {
        this.status = 'DISCONNECTED';
        this.emitStatus('DISCONNECTED', 'Mất kết nối LIVE, đang chuẩn bị kết nối lại...');
        this.scheduleReconnect();
      }
    });

    // 10. Lỗi kết nối (error)
    this.connection.on('error', (err) => {
      console.error('[TikTok Connection Error]:', err.message);
      if (!this.manualDisconnect) {
        this.emitStatus('ERROR', `Lỗi: ${err.message}`);
        this.scheduleReconnect();
      }
    });
  }

  /**
   * Lập lịch tự động kết nối lại với độ trễ tăng dần (exponential backoff)
   * 5s -> 10s -> 20s -> 40s -> 80s -> tối đa 120s
   */
  scheduleReconnect() {
    if (this.manualDisconnect || this.reconnectTimeout) return;

    this.status = 'RECONNECTING';
    const delaySec = Math.round(this.retryDelay / 1000);
    this.emitStatus('RECONNECTING', `Đang thử kết nối lại sau ${delaySec}s...`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      console.log(`[TikTok Reconnect] Thử kết nối lại tới @${this.currentUsername} (${delaySec}s)...`);
      const success = await this.connect();
      if (!success) {
        // Tăng độ trễ theo hàm số mũ, tối đa 2 phút
        this.retryDelay = Math.min(this.maxRetryDelay, this.retryDelay * 2);
      }
    }, this.retryDelay);
  }

  clearReconnectTimer() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  emitStatus(state, message) {
    this.io.emit('tiktok:status', {
      status: state,
      message,
      username: this.currentUsername,
      viewerCount: this.viewerCount
    });
  }

  getStatus() {
    return {
      status: this.status,
      username: this.currentUsername,
      viewerCount: this.viewerCount
    };
  }
}

module.exports = TikTokManager;
