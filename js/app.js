/**
 * File Encryption & Decryption Tool v3.0 Ultra - Master Application Engine
 * 100% Client-Side Zero-Trust Web Cryptography Suite
 * Includes Futuristic Cybersecurity Control Center & Holographic Hex Grid Engine
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. AUDIT LOGGER ENGINE
  // ==========================================================================
  const AuditLogger = {
    logs: [],
    log(event, details = '') {
      const timestamp = new Date().toLocaleTimeString();
      const entry = `[${timestamp}] ${event.toUpperCase()}: ${details}`;
      this.logs.unshift(entry);
      this.render();
    },
    clear() {
      this.logs = [];
      this.render();
    },
    render() {
      const container = document.getElementById('history-log-container');
      if (!container) return;
      if (this.logs.length === 0) {
        container.innerHTML = '<div style="color: var(--text-dim);">No cryptographic activity recorded yet in this session.</div>';
        return;
      }
      container.innerHTML = this.logs.map(log => `<div>${log}</div>`).join('');
    }
  };

  // ==========================================================================
  // 2. AUDIO SYNTHESIZER ENGINE (Web Audio API)
  // ==========================================================================
  const AudioFX = {
    enabled: true,
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },
    play(type) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'click') {
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === 'success') {
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'error') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(110, now + 0.2);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      } catch (e) {
        console.warn('Audio FX play error:', e);
      }
    }
  };

  // ==========================================================================
  // 3. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  // ==========================================================================
  // 4. AES-256-GCM CRYPTO ENGINE
  // ==========================================================================
  const CryptoEngine = {
    MAGIC_HEADER: new Uint8Array([67, 86, 65, 85, 76, 84, 48, 49]), // "CVAULT01"

    async deriveKey(password, salt, keyfileBytes = null, iterations = 100000) {
      const enc = new TextEncoder();
      let passBuffer = enc.encode(password);

      if (keyfileBytes && keyfileBytes.length > 0) {
        const combined = new Uint8Array(passBuffer.length + keyfileBytes.length);
        combined.set(passBuffer, 0);
        combined.set(keyfileBytes, passBuffer.length);
        passBuffer = combined;
      }

      const baseKey = await crypto.subtle.importKey(
        'raw',
        passBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    },

    async encryptFile(file, password, keyfileBytes = null, iterations = 100000, progressCb) {
      const fileBuffer = await file.arrayBuffer();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      if (progressCb) progressCb(20, 'Deriving AES-256 key via PBKDF2...');
      const key = await this.deriveKey(password, salt, keyfileBytes, iterations);

      if (progressCb) progressCb(50, 'Encrypting data payload...');
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        fileBuffer
      );

      if (progressCb) progressCb(80, 'Packaging CVAULT01 binary container...');

      const enc = new TextEncoder();
      const filenameBytes = enc.encode(file.name);
      const filenameLen = filenameBytes.length;

      const headerLen = 8 + 16 + 12 + 4 + 2 + filenameLen;
      const totalLen = headerLen + ciphertext.byteLength;
      const output = new Uint8Array(totalLen);

      let offset = 0;
      output.set(this.MAGIC_HEADER, offset); offset += 8;
      output.set(salt, offset); offset += 16;
      output.set(iv, offset); offset += 12;

      const iterView = new DataView(output.buffer, offset, 4);
      iterView.setUint32(0, iterations, false); offset += 4;

      const nameLenView = new DataView(output.buffer, offset, 2);
      nameLenView.setUint16(0, filenameLen, false); offset += 2;

      output.set(filenameBytes, offset); offset += filenameLen;
      output.set(new Uint8Array(ciphertext), offset);

      if (progressCb) progressCb(100, 'Encryption Complete!');
      return new Blob([output], { type: 'application/octet-stream' });
    },

    async decryptFile(file, password, keyfileBytes = null, progressCb) {
      const fileBuffer = await file.arrayBuffer();
      const dataView = new DataView(fileBuffer);
      const bytes = new Uint8Array(fileBuffer);

      if (progressCb) progressCb(10, 'Validating CVAULT01 header...');

      for (let i = 0; i < 8; i++) {
        if (bytes[i] !== this.MAGIC_HEADER[i]) {
          throw new Error('Invalid file format. Missing CVAULT01 binary signature.');
        }
      }

      let offset = 8;
      const salt = bytes.slice(offset, offset + 16); offset += 16;
      const iv = bytes.slice(offset, offset + 12); offset += 12;

      const iterations = dataView.getUint32(offset, false); offset += 4;
      const filenameLen = dataView.getUint16(offset, false); offset += 2;

      const filenameBytes = bytes.slice(offset, offset + filenameLen); offset += filenameLen;
      const dec = new TextDecoder();
      const originalFilename = dec.decode(filenameBytes);

      const ciphertext = fileBuffer.slice(offset);

      if (progressCb) progressCb(40, 'Deriving AES-256 key...');
      const key = await this.deriveKey(password, salt, keyfileBytes, iterations);

      if (progressCb) progressCb(70, 'Decrypting payload...');
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      if (progressCb) progressCb(100, 'Decryption Complete!');
      return {
        blob: new Blob([decryptedBuffer]),
        filename: originalFilename
      };
    },

    async encryptText(plaintext, password) {
      const enc = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await this.deriveKey(password, salt, null, 100000);

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        enc.encode(plaintext)
      );

      const combined = new Uint8Array(16 + 12 + ciphertext.byteLength);
      combined.set(salt, 0);
      combined.set(iv, 16);
      combined.set(new Uint8Array(ciphertext), 28);

      return btoa(String.fromCharCode.apply(null, combined));
    },

    async decryptText(base64Ciphertext, password) {
      const binaryStr = atob(base64Ciphertext);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const salt = bytes.slice(0, 16);
      const iv = bytes.slice(16, 28);
      const ciphertext = bytes.slice(28);

      const key = await this.deriveKey(password, salt, null, 100000);
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    }
  };

  // ==========================================================================
  // 5. KEY & PASSPHRASE GENERATOR
  // ==========================================================================
  const KeyGenerator = {
    generate(length, lower, upper, numbers, symbols) {
      let charset = '';
      if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (numbers) charset += '0123456789';
      if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!charset) return '';

      const randValues = new Uint32Array(length);
      crypto.getRandomValues(randValues);

      let result = '';
      for (let i = 0; i < length; i++) {
        result += charset[randValues[i] % charset.length];
      }
      return result;
    },

    calculateEntropy(password) {
      if (!password) return { bits: 0, crackTime: '-' };
      let poolSize = 0;
      if (/[a-z]/.test(password)) poolSize += 26;
      if (/[A-Z]/.test(password)) poolSize += 26;
      if (/[0-9]/.test(password)) poolSize += 10;
      if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

      const bits = Math.floor(password.length * Math.log2(poolSize || 1));
      let crackTime = 'Instant';
      if (bits > 100) crackTime = 'Trillions of Years';
      else if (bits > 80) crackTime = 'Centuries';
      else if (bits > 60) crackTime = 'Several Years';
      else if (bits > 40) crackTime = 'Few Days';
      else if (bits > 20) crackTime = 'Few Minutes';

      return { bits, crackTime };
    }
  };

  // ==========================================================================
  // 6. HEX & SHANNON ENTROPY VISUALIZER
  // ==========================================================================
  const HexVisualizer = {
    inspect(buffer) {
      const bytes = new Uint8Array(buffer);
      this.renderEntropyChart(bytes);
      this.renderHexDump(bytes);
    },

    renderEntropyChart(bytes) {
      const canvas = document.getElementById('entropy-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const freq = new Array(256).fill(0);
      for (let b of bytes) freq[b]++;

      let entropy = 0;
      const len = bytes.length;
      if (len > 0) {
        for (let count of freq) {
          if (count > 0) {
            const p = count / len;
            entropy -= p * Math.log2(p);
          }
        }
      }

      document.getElementById('entropy-val').textContent = entropy.toFixed(4) + ' bits/byte';
      const rating = document.getElementById('entropy-rating');
      if (entropy > 7.5) {
        rating.textContent = 'High Randomness (Encrypted/Compressed)';
        rating.style.color = '#00f0ff';
      } else {
        rating.textContent = 'Normal Data Structure';
        rating.style.color = '#00f5a0';
      }

      const barWidth = canvas.width / 256;
      const maxFreq = Math.max(...freq, 1);

      for (let i = 0; i < 256; i++) {
        const h = (freq[i] / maxFreq) * (canvas.height - 10);
        ctx.fillStyle = `hsl(${i * 1.4}, 100%, 60%)`;
        ctx.fillRect(i * barWidth, canvas.height - h, barWidth, h);
      }
    },

    renderHexDump(bytes) {
      const container = document.getElementById('hex-view-container');
      if (!container) return;

      const sample = bytes.slice(0, 256);
      let lines = [];

      for (let i = 0; i < sample.length; i += 16) {
        const chunk = sample.slice(i, i + 16);
        const addr = i.toString(16).padStart(4, '0').toUpperCase();
        let hexParts = [];
        let asciiParts = [];

        for (let b of chunk) {
          hexParts.push(b.toString(16).padStart(2, '0').toUpperCase());
          asciiParts.push(b >= 32 && b <= 126 ? String.fromCharCode(b) : '.');
        }

        const hexStr = hexParts.join(' ').padEnd(47, ' ');
        const asciiStr = asciiParts.join('');

        lines.push(`<div class="hex-line"><span class="hex-addr">${addr}</span><span class="hex-bytes">${hexStr}</span><span class="hex-ascii">${asciiStr}</span></div>`);
      }

      container.innerHTML = lines.join('');
    }
  };

  // ==========================================================================
  // 7. FUTURISTIC CYBERSECURITY CONTROL CENTER CANVAS ENGINE
  // ==========================================================================
  const CanvasBackgroundEngine = {
    canvas: null,
    ctx: null,
    nodes: [],
    dataStreams: [],
    radarRings: [],
    hexGridSize: 55,
    mouse: { x: -1000, y: -1000 },
    animId: null,
    time: 0,

    init() {
      this.canvas = document.getElementById('bg-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();

      window.addEventListener('resize', () => this.resize());
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      this.createCyberCenter();
      this.animate();
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    createCyberCenter() {
      this.nodes = [];
      this.dataStreams = [];
      this.radarRings = [];

      // 1. Holographic Network Nodes
      const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 16000);
      for (let i = 0; i < nodeCount; i++) {
        this.nodes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 2.2 + 1.2,
          pulse: Math.random() * Math.PI * 2
        });
      }

      // 2. Encrypted Data Streams & Digital Code Particles
      const streamCount = Math.floor(window.innerWidth / 35);
      const chars = '01010101ABCDEF456789X';
      for (let i = 0; i < streamCount; i++) {
        this.dataStreams.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          speed: Math.random() * 1.5 + 0.8,
          char: chars[Math.floor(Math.random() * chars.length)],
          size: Math.random() * 10 + 9,
          opacity: Math.random() * 0.5 + 0.2
        });
      }

      // 3. AI Security Radar Expanding Rings
      for (let i = 0; i < 3; i++) {
        this.radarRings.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 100,
          maxRadius: Math.random() * 220 + 150,
          speed: Math.random() * 0.6 + 0.3
        });
      }
    },

    drawHexGrid() {
      const size = this.hexGridSize;
      const h = size * Math.sqrt(3);
      const w = size * 2;

      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
      this.ctx.lineWidth = 1;

      for (let y = -h; y < this.canvas.height + h; y += h * 0.75) {
        let row = 0;
        for (let x = -w; x < this.canvas.width + w; x += w * 0.75) {
          const offsetX = (Math.floor(y / (h * 0.75)) % 2 === 0) ? 0 : w * 0.375;
          this.ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = x + offsetX + size * 0.5 * Math.cos(angle);
            const py = y + size * 0.5 * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
          }
          this.ctx.closePath();
          this.ctx.stroke();
        }
      }
    },

    animate() {
      this.time += 0.015;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const cyanColor = '#00f0ff';
      const blueColor = '#7000ff';

      // 1. Draw Volumetric Fog Lighting Backdrops
      const grad1 = this.ctx.createRadialGradient(this.canvas.width * 0.2, this.canvas.height * 0.3, 0, this.canvas.width * 0.2, this.canvas.height * 0.3, 400);
      grad1.addColorStop(0, 'rgba(0, 240, 255, 0.09)');
      grad1.addColorStop(1, 'rgba(0, 240, 255, 0)');
      this.ctx.fillStyle = grad1;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const grad2 = this.ctx.createRadialGradient(this.canvas.width * 0.8, this.canvas.height * 0.7, 0, this.canvas.width * 0.8, this.canvas.height * 0.7, 450);
      grad2.addColorStop(0, 'rgba(112, 0, 255, 0.09)');
      grad2.addColorStop(1, 'rgba(112, 0, 255, 0)');
      this.ctx.fillStyle = grad2;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // 2. Draw Subtle Hexagonal Grid
      this.drawHexGrid();

      // 3. Draw AI Security Radar Expanding Rings
      for (let r of this.radarRings) {
        r.radius += r.speed;
        if (r.radius > r.maxRadius) {
          r.radius = 0;
          r.x = Math.random() * this.canvas.width;
          r.y = Math.random() * this.canvas.height;
        }

        const alpha = (1 - r.radius / r.maxRadius) * 0.18;
        this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // 4. Draw Floating Encrypted Code Data Streams
      this.ctx.font = '10px var(--font-mono)';
      for (let s of this.dataStreams) {
        s.y += s.speed;
        if (s.y > this.canvas.height + 20) {
          s.y = -20;
          s.x = Math.random() * this.canvas.width;
        }

        this.ctx.fillStyle = `rgba(0, 240, 255, ${s.opacity})`;
        this.ctx.fillText(s.char, s.x, s.y);
      }

      // 5. Draw Holographic Network Connections
      this.ctx.fillStyle = cyanColor;
      this.ctx.strokeStyle = cyanColor;

      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > this.canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > this.canvas.height) n.vy *= -1;

        // Mouse Interactivity
        const mdx = n.x - this.mouse.x;
        const mdy = n.y - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          const force = (140 - mdist) / 140;
          n.x += (mdx / mdist) * force * 2.5;
          n.y += (mdy / mdist) * force * 2.5;
        }

        n.pulse += 0.03;
        const radius = n.radius + Math.sin(n.pulse) * 0.6;

        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, Math.max(0.5, radius), 0, Math.PI * 2);
        this.ctx.fill();

        for (let j = i + 1; j < this.nodes.length; j++) {
          const n2 = this.nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            this.ctx.globalAlpha = (1 - dist / 115) * 0.22;
            this.ctx.beginPath();
            this.ctx.moveTo(n.x, n.y);
            this.ctx.lineTo(n2.x, n2.y);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
          }
        }
      }

      this.animId = requestAnimationFrame(() => this.animate());
    }
  };

  // ==========================================================================
  // 8. MAIN UI CONTROLLER & EVENT LISTENERS
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    CanvasBackgroundEngine.init();

    // Tab Navigation
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        navTabs.forEach(t => t.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
        AudioFX.play('click');
      });
    });

    // Theme Switcher
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const theme = btn.dataset.setTheme;
        document.body.setAttribute('data-theme', theme);
        AudioFX.play('click');
        showToast(`Theme switched to ${theme.toUpperCase()}`, 'info');
      });
    });

    // Audio FX Toggle
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        AudioFX.enabled = !AudioFX.enabled;
        audioBtn.style.opacity = AudioFX.enabled ? '1' : '0.4';
        showToast(`Sound FX ${AudioFX.enabled ? 'Enabled' : 'Muted'}`, 'info');
      });
    }

    // Panic Wipe Button
    const panicBtn = document.getElementById('btn-panic-wipe');
    if (panicBtn) {
      panicBtn.addEventListener('click', () => {
        document.querySelectorAll('input').forEach(i => i.value = '');
        document.querySelectorAll('textarea').forEach(t => t.value = '');
        AuditLogger.clear();
        AudioFX.play('error');
        showToast('PANIC WIPE: All memory buffers and inputs cleared!', 'error');
      });
    }

    // --- ENCRYPT FILE SECTION ---
    let selectedEncFile = null;
    let selectedEncKeyfile = null;

    const encDropzone = document.getElementById('encrypt-dropzone');
    const encFileInput = document.getElementById('encrypt-file-input');
    const encSelectedCard = document.getElementById('encrypt-selected-file');
    const encSubmitBtn = document.getElementById('btn-encrypt-submit');
    const encPassInput = document.getElementById('encrypt-password');

    encDropzone.addEventListener('click', () => encFileInput.click());
    encDropzone.addEventListener('dragover', (e) => { e.preventDefault(); encDropzone.classList.add('drag-over'); });
    encDropzone.addEventListener('dragleave', () => encDropzone.classList.remove('drag-over'));
    encDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      encDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) handleEncFile(e.dataTransfer.files[0]);
    });
    encFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleEncFile(e.target.files[0]);
    });

    function handleEncFile(file) {
      selectedEncFile = file;
      document.getElementById('enc-filename').textContent = file.name;
      document.getElementById('enc-filesize').textContent = (file.size / 1024).toFixed(2) + ' KB';
      encDropzone.style.display = 'none';
      encSelectedCard.style.display = 'flex';
      checkEncBtnState();

      const reader = new FileReader();
      reader.onload = (e) => HexVisualizer.inspect(e.target.result);
      reader.readAsArrayBuffer(file);
    }

    document.getElementById('enc-file-remove').addEventListener('click', () => {
      selectedEncFile = null;
      encFileInput.value = '';
      encDropzone.style.display = 'block';
      encSelectedCard.style.display = 'none';
      checkEncBtnState();
    });

    encPassInput.addEventListener('input', () => {
      const pwd = encPassInput.value;
      const { bits } = KeyGenerator.calculateEntropy(pwd);
      const bar = document.getElementById('enc-strength-bar');
      bar.className = 'strength-bar';

      if (bits > 80) { bar.classList.add('strength-very-strong'); }
      else if (bits > 60) { bar.classList.add('strength-strong'); }
      else if (bits > 40) { bar.classList.add('strength-medium'); }
      else if (bits > 20) { bar.classList.add('strength-weak'); }
      else { bar.classList.add('strength-very-weak'); }

      checkEncBtnState();
    });

    document.getElementById('encrypt-iterations').addEventListener('input', (e) => {
      document.getElementById('enc-iterations-val').textContent = Number(e.target.value).toLocaleString();
    });

    document.getElementById('encrypt-keyfile-input').addEventListener('change', async (e) => {
      const tag = document.getElementById('enc-keyfile-status');
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const buf = await file.arrayBuffer();
        selectedEncKeyfile = new Uint8Array(buf);
        if (tag) {
          tag.textContent = `Attached: ${file.name}`;
          tag.classList.add('active');
        }
        showToast('Keyfile attached to encryption key derivation', 'info');
      } else {
        selectedEncKeyfile = null;
        if (tag) {
          tag.textContent = 'No keyfile attached';
          tag.classList.remove('active');
        }
      }
    });

    function checkEncBtnState() {
      encSubmitBtn.disabled = !(selectedEncFile && encPassInput.value.length >= 4);
    }

    encSubmitBtn.addEventListener('click', async () => {
      if (!selectedEncFile || !encPassInput.value) return;
      const progressContainer = document.getElementById('encrypt-progress');
      const progressBar = document.getElementById('enc-progress-bar');
      const progressText = document.getElementById('enc-progress-text');
      const progressPercent = document.getElementById('enc-progress-percent');

      progressContainer.style.display = 'block';
      encSubmitBtn.disabled = true;

      try {
        const iterations = parseInt(document.getElementById('encrypt-iterations').value);
        const encryptedBlob = await CryptoEngine.encryptFile(
          selectedEncFile,
          encPassInput.value,
          selectedEncKeyfile,
          iterations,
          (pct, msg) => {
            progressBar.style.width = pct + '%';
            progressText.textContent = msg;
            progressPercent.textContent = pct + '%';
          }
        );

        const url = URL.createObjectURL(encryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedEncFile.name + '.cvault';
        a.click();
        URL.revokeObjectURL(url);

        AudioFX.play('success');
        showToast('File encrypted successfully!', 'success');
        AuditLogger.log('File Encrypted', `${selectedEncFile.name} -> ${selectedEncFile.name}.cvault`);
      } catch (err) {
        AudioFX.play('error');
        showToast(err.message || 'Encryption failed', 'error');
      } finally {
        encSubmitBtn.disabled = false;
      }
    });

    // --- DECRYPT FILE SECTION ---
    let selectedDecFile = null;
    let selectedDecKeyfile = null;

    const decDropzone = document.getElementById('decrypt-dropzone');
    const decFileInput = document.getElementById('decrypt-file-input');
    const decSelectedCard = document.getElementById('decrypt-selected-file');
    const decSubmitBtn = document.getElementById('btn-decrypt-submit');
    const decPassInput = document.getElementById('decrypt-password');

    decDropzone.addEventListener('click', () => decFileInput.click());
    decDropzone.addEventListener('dragover', (e) => { e.preventDefault(); decDropzone.classList.add('drag-over'); });
    decDropzone.addEventListener('dragleave', () => decDropzone.classList.remove('drag-over'));
    decDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      decDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) handleDecFile(e.dataTransfer.files[0]);
    });
    decFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleDecFile(e.target.files[0]);
    });

    function handleDecFile(file) {
      selectedDecFile = file;
      document.getElementById('dec-filename').textContent = file.name;
      document.getElementById('dec-filesize').textContent = (file.size / 1024).toFixed(2) + ' KB';
      decDropzone.style.display = 'none';
      decSelectedCard.style.display = 'flex';
      checkDecBtnState();
    }

    document.getElementById('dec-file-remove').addEventListener('click', () => {
      selectedDecFile = null;
      decFileInput.value = '';
      decDropzone.style.display = 'block';
      decSelectedCard.style.display = 'none';
      checkDecBtnState();
    });

    decPassInput.addEventListener('input', checkDecBtnState);

    document.getElementById('decrypt-keyfile-input').addEventListener('change', async (e) => {
      const tag = document.getElementById('dec-keyfile-status');
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const buf = await file.arrayBuffer();
        selectedDecKeyfile = new Uint8Array(buf);
        if (tag) {
          tag.textContent = `Attached: ${file.name}`;
          tag.classList.add('active');
        }
        showToast('Keyfile attached to decryption key derivation', 'info');
      } else {
        selectedDecKeyfile = null;
        if (tag) {
          tag.textContent = 'No keyfile attached';
          tag.classList.remove('active');
        }
      }
    });

    function checkDecBtnState() {
      decSubmitBtn.disabled = !(selectedDecFile && decPassInput.value.length > 0);
    }

    decSubmitBtn.addEventListener('click', async () => {
      if (!selectedDecFile || !decPassInput.value) return;
      const progressContainer = document.getElementById('decrypt-progress');
      const progressBar = document.getElementById('dec-progress-bar');
      const progressText = document.getElementById('dec-progress-text');
      const progressPercent = document.getElementById('dec-progress-percent');

      progressContainer.style.display = 'block';
      decSubmitBtn.disabled = true;

      try {
        const result = await CryptoEngine.decryptFile(
          selectedDecFile,
          decPassInput.value,
          selectedDecKeyfile,
          (pct, msg) => {
            progressBar.style.width = pct + '%';
            progressText.textContent = msg;
            progressPercent.textContent = pct + '%';
          }
        );

        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);

        AudioFX.play('success');
        showToast('File decrypted & restored successfully!', 'success');
        AuditLogger.log('File Decrypted', `${selectedDecFile.name} -> ${result.filename}`);
      } catch (err) {
        AudioFX.play('error');
        showToast(err.message || 'Decryption failed. Incorrect password or corrupted payload.', 'error');
      } finally {
        decSubmitBtn.disabled = false;
      }
    });

    // --- TEXT VAULT ---
    document.getElementById('btn-text-encrypt').addEventListener('click', async () => {
      const text = document.getElementById('text-encrypt-input').value;
      const pwd = document.getElementById('text-encrypt-password').value;
      if (!text || !pwd) { showToast('Please provide text and password.', 'error'); return; }

      try {
        const cipher = await CryptoEngine.encryptText(text, pwd);
        document.getElementById('text-encrypt-output').value = cipher;
        AudioFX.play('success');
        showToast('Text encrypted into Base64 cipher!', 'success');
        AuditLogger.log('Text Encrypted', `${text.length} chars payload`);
      } catch (e) {
        showToast('Text encryption failed', 'error');
      }
    });

    document.getElementById('btn-copy-text-cipher').addEventListener('click', () => {
      const out = document.getElementById('text-encrypt-output');
      if (out.value) {
        navigator.clipboard.writeText(out.value);
        showToast('Copied to clipboard!', 'info');
      }
    });

    document.getElementById('btn-text-decrypt').addEventListener('click', async () => {
      const cipher = document.getElementById('text-decrypt-input').value;
      const pwd = document.getElementById('text-decrypt-password').value;
      if (!cipher || !pwd) { showToast('Please provide cipher payload and password.', 'error'); return; }

      try {
        const plain = await CryptoEngine.decryptText(cipher, pwd);
        document.getElementById('text-decrypt-output').value = plain;
        AudioFX.play('success');
        showToast('Text payload unlocked!', 'success');
        AuditLogger.log('Text Decrypted', 'Success');
      } catch (e) {
        AudioFX.play('error');
        showToast('Decryption failed. Bad password or invalid cipher.', 'error');
      }
    });

    // --- KEY STUDIO ---
    const keygenLen = document.getElementById('keygen-length');
    keygenLen.addEventListener('input', (e) => {
      document.getElementById('keygen-len-val').textContent = e.target.value;
    });

    document.getElementById('btn-generate-pwd').addEventListener('click', () => {
      const len = parseInt(keygenLen.value);
      const lower = document.getElementById('chk-lower').checked;
      const upper = document.getElementById('chk-upper').checked;
      const num = document.getElementById('chk-numbers').checked;
      const sym = document.getElementById('chk-symbols').checked;

      const pwd = KeyGenerator.generate(len, lower, upper, num, sym);
      document.getElementById('keygen-pwd-output').value = pwd;

      const { bits, crackTime } = KeyGenerator.calculateEntropy(pwd);
      document.getElementById('keygen-entropy').textContent = bits + ' bits';
      document.getElementById('keygen-crack-time').textContent = crackTime;

      AudioFX.play('click');
      AuditLogger.log('Passphrase Generated', `${len} chars, ${bits} bits entropy`);
    });

    document.getElementById('btn-copy-keygen').addEventListener('click', () => {
      const val = document.getElementById('keygen-pwd-output').value;
      if (val) {
        navigator.clipboard.writeText(val);
        showToast('Passphrase copied!', 'info');
      }
    });

    // --- AUDIT LOG CLEAR ---
    document.getElementById('btn-clear-history').addEventListener('click', () => {
      AuditLogger.clear();
      showToast('Audit log cleared.', 'info');
    });

    // Password visibility toggles
    document.getElementById('toggle-enc-pwd-vis').addEventListener('click', () => {
      const input = document.getElementById('encrypt-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('toggle-dec-pwd-vis').addEventListener('click', () => {
      const input = document.getElementById('decrypt-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

  });
})();
