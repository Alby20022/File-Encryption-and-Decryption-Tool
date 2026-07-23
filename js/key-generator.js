/**
 * CipherVault - Passphrase & Key Generator
 * Generates secure passphrases, evaluates entropy, and creates cryptographic .key files
 */

import { CryptoEngine } from './crypto-engine.js';

export class KeyGenerator {
  static CHAR_LOWER = 'abcdefghijklmnopqrstuvwxyz';
  static CHAR_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static CHAR_NUMBERS = '0123456789';
  static CHAR_SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  /**
   * Generate Secure Password
   */
  static generatePassword(length = 20, options = {}) {
    const useLower = options.lower !== false;
    const useUpper = options.upper !== false;
    const useNumbers = options.numbers !== false;
    const useSymbols = options.symbols !== false;

    let charset = '';
    if (useLower) charset += KeyGenerator.CHAR_LOWER;
    if (useUpper) charset += KeyGenerator.CHAR_UPPER;
    if (useNumbers) charset += KeyGenerator.CHAR_NUMBERS;
    if (useSymbols) charset += KeyGenerator.CHAR_SYMBOLS;

    if (!charset) charset = KeyGenerator.CHAR_LOWER + KeyGenerator.CHAR_NUMBERS;

    const randomBytes = CryptoEngine.getRandomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }
    return password;
  }

  /**
   * Calculate Password Entropy & Crack Time Estimation
   */
  static evaluateStrength(password) {
    if (!password) {
      return { entropy: 0, score: 0, label: 'Empty', crackTime: 'Instant' };
    }

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    if (poolSize === 0) poolSize = 1;

    const entropy = Math.floor(password.length * Math.log2(poolSize));

    let score = 1;
    let label = 'Very Weak';
    let crackTime = 'Instant';

    if (entropy >= 80) {
      score = 5;
      label = 'Very Strong';
      crackTime = 'Centuries+';
    } else if (entropy >= 60) {
      score = 4;
      label = 'Strong';
      crackTime = 'Decades';
    } else if (entropy >= 40) {
      score = 3;
      label = 'Medium';
      crackTime = 'A few days';
    } else if (entropy >= 25) {
      score = 2;
      label = 'Weak';
      crackTime = 'A few minutes';
    }

    return { entropy, score, label, crackTime };
  }

  /**
   * Generate Binary Keyfile (.key)
   */
  static generateKeyFile(byteLength = 64) {
    const randomBytes = CryptoEngine.getRandomBytes(byteLength);
    const blob = new Blob([randomBytes], { type: 'application/octet-stream' });
    const filename = `cipher_key_${Date.now()}.key`;

    return {
      blob,
      filename,
      bytes: randomBytes,
      hex: Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
    };
  }
}
