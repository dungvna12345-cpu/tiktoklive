/**
 * Web Audio API Synthesizer cho Tháp Sách
 * Tạo âm thanh trực tiếp bằng code, không sợ lỗi tải file thiếu hay CORS.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmPlaying = false;
    this.bgmOscs = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(enabled) {
    if (enabled !== undefined) {
      this.enabled = !!enabled;
    } else {
      this.enabled = !this.enabled;
    }
    if (!this.enabled && this.bgmPlaying) {
      this.stopBGM();
    }
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.2, volume = 0.15, pitchDecay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (pitchDecay !== 0) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(10, freq + pitchDecay),
          this.ctx.currentTime + duration
        );
      }

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playTick(isAlert = false) {
    if (isAlert) {
      this.playTone(880, 'triangle', 0.08, 0.2, -200); // Tiếng tick dồn dập 5s cuối
    } else {
      this.playTone(440, 'sine', 0.05, 0.08, -100);
    }
  }

  playCorrect() {
    // Hợp âm Đô trưởng vui tươi C5 - E5 - G5
    this.playTone(523.25, 'triangle', 0.25, 0.15);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.25, 0.15), 80);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.35, 0.2), 160);
  }

  playWrong() {
    // Tiếng buzz trầm khi sai
    this.playTone(180, 'sawtooth', 0.3, 0.12, -40);
    setTimeout(() => this.playTone(140, 'sawtooth', 0.35, 0.12, -30), 120);
  }

  playLadder() {
    // Tiếng leo thang vút lên
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playTone(350 + i * 120, 'sine', 0.12, 0.15);
      }, i * 60);
    }
  }

  playFreeze() {
    // Tiếng tinh thể băng giá lấp lánh
    this.playTone(1200, 'sine', 0.3, 0.12, -100);
    setTimeout(() => this.playTone(1500, 'sine', 0.3, 0.12, 200), 100);
    setTimeout(() => this.playTone(1800, 'sine', 0.4, 0.1, -300), 200);
  }

  playCableCar() {
    // Tiếng cáp treo phóng vút lên cao
    this.playTone(300, 'triangle', 0.5, 0.2, 500);
    setTimeout(() => this.playTone(600, 'triangle', 0.5, 0.2, 400), 150);
  }

  playVictory() {
    // Khúc khải hoàn chiến thắng chạm đỉnh tháp
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.50, d: 0.4 }, // C6
      { f: 880.00, d: 0.2 },  // A5
      { f: 1046.50, d: 0.6 }  // C6
    ];

    let t = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d, 0.25);
      }, t);
      t += note.d * 1000 + 40;
    });
  }

  playCheer() {
    // Tiếng reo hò cả lớp cổ vũ
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const freq = 600 + Math.random() * 400;
        this.playTone(freq, 'sine', 0.15, 0.1);
      }, i * 70);
    }
  }
}

window.soundSystem = new SoundSystem();
