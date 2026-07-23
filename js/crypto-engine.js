/**
 * CipherVault - Core Cryptographic Engine
 * Powered by W3C Web Crypto API (crypto.subtle)
 * 100% Client-side zero-knowledge security
 */

export class CryptoEngine {
  static MAGIC_BYTES = new Uint8Array([67, 86, 65, 85, 76, 84, 48, 49]); // "CVAULT01"
  static DEFAULT_ITERATIONS = 100000;
  static SALT_LENGTH = 16;
  static IV_LENGTH = 12; // 96-bit for AES-GCM

  /**
   * Check Web Crypto API support
   */
  static isSupported() {
    return !!(window.crypto && window.crypto.subtle);
  }

  /**
   * Generate cryptographically secure random bytes
   */
  static getRandomBytes(length) {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Derive AES-256-GCM Key using PBKDF2 with SHA-256
   */
  static async deriveKey(password, salt, iterations = CryptoEngine.DEFAULT_ITERATIONS, keyfileBuffer = null) {
    const encoder = new TextEncoder();
    let combinedSecretBytes = encoder.encode(password);

    // If keyfile provided, append its contents to secret bytes
    if (keyfileBuffer && keyfileBuffer.byteLength > 0) {
      const keyfileArray = new Uint8Array(keyfileBuffer);
      const merged = new Uint8Array(combinedSecretBytes.length + keyfileArray.length);
      merged.set(combinedSecretBytes, 0);
      merged.set(keyfileArray, combinedSecretBytes.length);
      combinedSecretBytes = merged;
    }

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      combinedSecretBytes,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
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
  }

  /**
   * Encrypt File Data and wrap in .cvault Binary Format
   */
  static async encryptFile(fileBuffer, originalFilename, password, keyfileBuffer = null, options = {}) {
    const iterations = options.iterations || CryptoEngine.DEFAULT_ITERATIONS;
    const salt = CryptoEngine.getRandomBytes(CryptoEngine.SALT_LENGTH);
    const iv = CryptoEngine.getRandomBytes(CryptoEngine.IV_LENGTH);

    // Derive Key
    const key = await CryptoEngine.deriveKey(password, salt, iterations, keyfileBuffer);

    // Encrypt payload
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      fileBuffer
    );

    // Encode Filename UTF-8
    const encoder = new TextEncoder();
    const filenameBytes = encoder.encode(originalFilename || 'unnamed_file');
    const filenameLen = filenameBytes.length;

    // Header layout:
    // Magic (8 bytes) + Version (1 byte: 1) + Algo (1 byte: 1=AES-GCM) + Iterations (4 bytes Uint32) +
    // Salt (16 bytes) + IV (12 bytes) + FilenameLen (2 bytes Uint16) + FilenameBytes + EncryptedData
    const headerSize = 8 + 1 + 1 + 4 + CryptoEngine.SALT_LENGTH + CryptoEngine.IV_LENGTH + 2 + filenameLen;
    const totalSize = headerSize + encryptedContent.byteLength;

    const resultBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(resultBuffer);
    const uint8View = new Uint8Array(resultBuffer);

    let offset = 0;

    // 1. Magic
    uint8View.set(CryptoEngine.MAGIC_BYTES, offset);
    offset += 8;

    // 2. Version
    view.setUint8(offset, 1);
    offset += 1;

    // 3. Algorithm (1 = AES-GCM-256)
    view.setUint8(offset, 1);
    offset += 1;

    // 4. Iterations (Uint32)
    view.setUint32(offset, iterations, false); // Big endian
    offset += 4;

    // 5. Salt (16 bytes)
    uint8View.set(salt, offset);
    offset += CryptoEngine.SALT_LENGTH;

    // 6. IV (12 bytes)
    uint8View.set(iv, offset);
    offset += CryptoEngine.IV_LENGTH;

    // 7. Filename length (Uint16)
    view.setUint16(offset, filenameLen, false);
    offset += 2;

    // 8. Filename
    uint8View.set(filenameBytes, offset);
    offset += filenameLen;

    // 9. Encrypted payload
    uint8View.set(new Uint8Array(encryptedContent), offset);

    return {
      encryptedBuffer: resultBuffer,
      exportName: (originalFilename || 'file') + '.cvault'
    };
  }

  /**
   * Decrypt .cvault Binary Format File
   */
  static async decryptFile(cvaultBuffer, password, keyfileBuffer = null) {
    const view = new DataView(cvaultBuffer);
    const uint8View = new Uint8Array(cvaultBuffer);

    if (cvaultBuffer.byteLength < 44) {
      throw new Error('Invalid file: Header structure incomplete.');
    }

    // Verify Magic Bytes
    for (let i = 0; i < 8; i++) {
      if (uint8View[i] !== CryptoEngine.MAGIC_BYTES[i]) {
        throw new Error('Invalid file format: Missing CVAULT signature header.');
      }
    }

    let offset = 8;
    const version = view.getUint8(offset); offset += 1;
    const algo = view.getUint8(offset); offset += 1;
    const iterations = view.getUint32(offset, false); offset += 4;

    const salt = uint8View.subarray(offset, offset + CryptoEngine.SALT_LENGTH);
    offset += CryptoEngine.SALT_LENGTH;

    const iv = uint8View.subarray(offset, offset + CryptoEngine.IV_LENGTH);
    offset += CryptoEngine.IV_LENGTH;

    const filenameLen = view.getUint16(offset, false); offset += 2;

    const decoder = new TextDecoder();
    const filenameBytes = uint8View.subarray(offset, offset + filenameLen);
    const originalFilename = decoder.decode(filenameBytes);
    offset += filenameLen;

    const encryptedData = uint8View.subarray(offset);

    // Derive key
    const key = await CryptoEngine.deriveKey(password, salt, iterations, keyfileBuffer);

    // Decrypt
    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );

      return {
        decryptedBuffer,
        filename: originalFilename || 'decrypted_file'
      };
    } catch (err) {
      throw new Error('Decryption failed: Incorrect password, corrupted keyfile, or tampered file content.');
    }
  }

  /**
   * Encrypt Raw Text String to Base64 Cipher Package
   */
  static async encryptText(plainText, password) {
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(plainText);
    const { encryptedBuffer } = await CryptoEngine.encryptFile(
      textBytes.buffer,
      'secret.txt',
      password
    );

    // Convert to Base64
    const bytes = new Uint8Array(encryptedBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Decrypt Base64 Cipher Package to Raw Text String
   */
  static async decryptText(base64Cipher, password) {
    const binary = atob(base64Cipher);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const { decryptedBuffer } = await CryptoEngine.decryptFile(bytes.buffer, password);
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Compute File/Buffer Checksum Hash
   */
  static async computeHash(arrayBuffer, algorithm = 'SHA-256') {
    const validAlgos = ['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1'];
    const algoName = validAlgos.includes(algorithm) ? algorithm : 'SHA-256';

    const hashBuffer = await window.crypto.subtle.digest(algoName, arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
