/**
 * CipherVault - Image Steganography Module
 * Hides and extracts encrypted messages or files inside PNG images using LSB (Least Significant Bit)
 */

export class SteganographyEngine {
  static MAGIC_PREFIX = "STEGO10:";

  /**
   * Hide secret text inside image
   */
  static async hideDataInImage(imageFile, secretText) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data; // RGBA array

            const fullPayload = SteganographyEngine.MAGIC_PREFIX + secretText;
            const encoder = new TextEncoder();
            const payloadBytes = encoder.encode(fullPayload);

            // 4 bytes length + payload bytes
            const totalBytesNeeded = 4 + payloadBytes.length;
            const availableCapacity = Math.floor((data.length * 3) / 32); // 4 RGBA channels, 3 color channels, 8 bits/byte

            if (totalBytesNeeded > availableCapacity) {
              return reject(new Error(`Image capacity exceeded! Max message length for this image is ~${availableCapacity} bytes.`));
            }

            // Convert payload bytes to bit array
            const bitArray = [];
            
            // Encode length as 32-bit uint
            const len = payloadBytes.length;
            for (let b = 31; b >= 0; b--) {
              bitArray.push((len >> b) & 1);
            }

            // Encode payload bytes
            for (let i = 0; i < payloadBytes.length; i++) {
              for (let b = 7; b >= 0; b--) {
                bitArray.push((payloadBytes[i] >> b) & 1);
              }
            }

            // Embed bit array into RGB LSBs
            let bitIdx = 0;
            for (let i = 0; i < data.length && bitIdx < bitArray.length; i++) {
              // Skip Alpha channel (i % 4 === 3)
              if (i % 4 === 3) continue;

              // Modify LSB
              data[i] = (data[i] & 0xFE) | bitArray[bitIdx];
              bitIdx++;
            }

            ctx.putImageData(imgData, 0, 0);

            canvas.toBlob((blob) => {
              resolve({
                stegoBlob: blob,
                stegoUrl: URL.createObjectURL(blob),
                width: img.width,
                height: img.height,
                capacityBytes: availableCapacity
              });
            }, 'image/png');

          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image file.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Extract hidden secret data from image
   */
  static async extractDataFromImage(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Extract LSB bits from RGB channels
            const extractedBits = [];
            for (let i = 0; i < data.length; i++) {
              if (i % 4 === 3) continue; // Skip alpha
              extractedBits.push(data[i] & 1);
            }

            // Read 32-bit length header
            let payloadLen = 0;
            for (let b = 0; b < 32; b++) {
              payloadLen = (payloadLen << 1) | extractedBits[b];
            }

            if (payloadLen <= 0 || payloadLen > (extractedBits.length / 8)) {
              return reject(new Error('No valid steganographic data detected in this image.'));
            }

            // Read payload bytes
            const payloadBytes = new Uint8Array(payloadLen);
            let bitIdx = 32;
            for (let i = 0; i < payloadLen; i++) {
              let byteVal = 0;
              for (let b = 0; b < 8; b++) {
                byteVal = (byteVal << 1) | extractedBits[bitIdx++];
              }
              payloadBytes[i] = byteVal;
            }

            const decoder = new TextDecoder();
            const rawString = decoder.decode(payloadBytes);

            if (!rawString.startsWith(SteganographyEngine.MAGIC_PREFIX)) {
              return reject(new Error('No CipherVault steganography header found in image pixels.'));
            }

            const hiddenMessage = rawString.substring(SteganographyEngine.MAGIC_PREFIX.length);
            resolve(hiddenMessage);

          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image file.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(imageFile);
    });
  }
}
