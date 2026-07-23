/**
 * CipherVault - Hex Inspector & Byte Entropy Visualizer
 * Renders raw hex dumps and canvas byte entropy distributions
 */

export class Visualizer {
  /**
   * Render Hex Dump View
   */
  static renderHexDump(arrayBuffer, maxBytes = 256) {
    const bytes = new Uint8Array(arrayBuffer.slice(0, maxBytes));
    const lines = [];

    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.subarray(i, i + 16);
      const addrHex = i.toString(16).padStart(8, '0');
      
      const hexBytes = Array.from(chunk)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
      const paddedHex = hexBytes.padEnd(47, ' ');

      const ascii = Array.from(chunk)
        .map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');

      lines.push(
        `<div class="hex-line">` +
        `<span class="hex-addr">${addrHex}</span>` +
        `<span class="hex-bytes">${paddedHex}</span>` +
        `<span class="hex-ascii">|${ascii}|</span>` +
        `</div>`
      );
    }

    return lines.join('');
  }

  /**
   * Render Entropy Histogram on Canvas
   */
  static renderEntropyChart(canvas, arrayBuffer) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const bytes = new Uint8Array(arrayBuffer);
    const frequencies = new Array(256).fill(0);

    for (let i = 0; i < bytes.length; i++) {
      frequencies[bytes[i]]++;
    }

    const maxFreq = Math.max(...frequencies, 1);

    // Draw grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = width / 256;
    for (let i = 0; i < 256; i++) {
      const barHeight = (frequencies[i] / maxFreq) * (height - 10);
      const x = i * barWidth;
      const y = height - barHeight;

      // Color gradient based on frequency
      const hue = (i / 256) * 180 + 180; // Cyan to Purple
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Calculate Shannon Entropy
    let entropy = 0;
    const len = bytes.length;
    if (len > 0) {
      for (let i = 0; i < 256; i++) {
        if (frequencies[i] > 0) {
          const p = frequencies[i] / len;
          entropy -= p * Math.log2(p);
        }
      }
    }

    return {
      shannonEntropy: entropy.toFixed(4), // Max 8.0 for pure random
      byteCount: len
    };
  }
}
