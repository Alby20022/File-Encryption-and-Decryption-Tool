# 🔒 File Encryption & Decryption Tool v3.0 Ultra

[![Zero-Trust](https://img.shields.io/badge/Security-Zero--Trust%20Client--Side-00f0ff?style=for-the-badge&logo=shield)](https://github.com/Alby20022/File-Encryption-and-Decryption-Tool)
[![AES-256-GCM](https://img.shields.io/badge/Cipher-AES--256--GCM%20%2B%20PBKDF2-00f5a0?style=for-the-badge&logo=lock)](https://github.com/Alby20022/File-Encryption-and-Decryption-Tool)
[![Web Crypto API](https://img.shields.io/badge/API-Web%20Crypto%20API-7000ff?style=for-the-badge)](https://github.com/Alby20022/File-Encryption-and-Decryption-Tool)
[![License](https://img.shields.io/badge/License-MIT-ffb703?style=for-the-badge)](LICENSE)

An ultra-premium, high-performance, client-side web application for zero-trust file encryption, authenticated decryption, text vaults, and cryptographic key generation built with modern Web Crypto API, AES-256-GCM, PBKDF2 key derivation, and translucent glassmorphism aesthetics.

---

## ✨ Features

### 🔒 1. Zero-Knowledge File Encryption
- **AES-256-GCM Encryption**: Encrypt any file type (images, documents, archives, videos, executables) with Web Crypto API.
- **PBKDF2 Key Derivation**: Configurable derivation iteration rounds (100,000 to 500,000 iterations) via an interactive slider.
- **Optional Keyfile Dual-Factor Protection**: Attach an additional `.key` file to double-lock your password derivation.
- **Modern Dropzone UI**: Glassmorphic drag & drop file upload card with real-time file size badge and extension icons.

### 🔓 2. Authenticated File Decryption
- **Container Validation**: Automatically checks the `CVAULT01` 8-byte magic binary header signature.
- **Integrity Tag Authentication**: Ensures file payload has not been tampered with or corrupted before decryption.
- **Original Filename & Byte Restoration**: Preserves and restores exact original file names upon decryption.

### 📝 3. Text Vault
- **Confidential Note Locker**: Encrypt sensitive text payload, credentials, or API keys into Base64 AES-256-GCM ciphertext.
- **Payload Unlocker**: Decrypt Base64 ciphertext notes back into readable plaintext.

### 🔑 4. Key Studio
- **Cryptographically Secure Passphrase Generator**: Generate high-entropy passwords with custom character sets (lowercase, uppercase, numbers, special symbols).
- **NIST Entropy Analytics**: Real-time bit entropy calculator & estimated crack-time math (ranging from Instant to Trillions of Years).

### 📊 5. Hex & Shannon Entropy Inspector
- **Real-Time Frequency Chart**: Dynamic HTML5 Canvas rendering byte distribution spectrum (0.0000 to 8.0000 bits/byte).
- **256-Byte Hex Dump**: Inspect binary header bytes and ASCII representations of selected files live.

### 📜 6. Session Audit Log & Security Utilities
- **Cryptographic Audit Log**: Timestamped in-memory log tracking encryption, decryption, and key generation events during your session.
- **Panic Purge Button**: Instant memory wipe clearing all password inputs, text buffers, and logs.
- **Web Audio Sound FX**: Interactive sound synthesis engine providing click, success, and error audio feedback.
- **Multi-Theme Engine**: Dynamic color theme switcher (Deep Cyan, Cyber Emerald, Violet Pulse, Solar Gold) with matching ambient backdrop glows.

---

## 🏗️ Binary Container Specifications (`.cvault`)

Encrypted files created by File Encryption & Decryption Tool use the custom `CVAULT01` binary format:

| Offset (Bytes) | Field Name | Description |
| :--- | :--- | :--- |
| `0x00 - 0x07` | **Magic Header** | `CVAULT01` ASCII signature (8 bytes) |
| `0x08 - 0x17` | **PBKDF2 Salt** | 16-byte cryptographically secure random salt |
| `0x18 - 0x23` | **AES-GCM IV** | 12-byte initialization vector |
| `0x24 - 0x27` | **Iterations** | 32-bit big-endian integer (PBKDF2 round count) |
| `0x28 - 0x29` | **Name Length** | 16-bit big-endian integer ($N$ bytes of original filename) |
| `0x2A - (0x2A + N)` | **Filename** | UTF-8 encoded original file name |
| `(0x2A + N) - End` | **Ciphertext & Tag** | AES-256-GCM encrypted payload + 16-byte authentication tag |

---

## 🚀 Quick Start

### Option 1: Direct File Protocol
Simply double click `index.html` or open it in any modern browser:
```bash
file:///x:/File%20Encryption%20and%20Decryption%20Tool/index.html
```

### Option 2: Local Web Server (Python)
Run a lightweight Python HTTP server in your terminal:
```bash
# Navigate to project directory
cd "x:/File Encryption and Decryption Tool"

# Host local web server
python -m http.server 9090
```
Open **[http://localhost:9090](http://localhost:9090)** in your web browser.

---

## 📁 Repository Structure

```
File-Encryption-and-Decryption-Tool/
├── index.html          # Master HTML5 SPA Markup & Component Layout
├── styles.css          # Primary CSS Stylesheet (Translucent Glass System)
├── cyber_bg.jpg        # Background Visual Asset
├── css/
│   ├── style.css       # Subdirectory Synchronized Stylesheet
│   └── styles.css      # Fallback Synchronized Stylesheet
├── js/
│   ├── app.js          # Master Application Engine & Web Crypto Logic
│   ├── crypto-aes.js   # Modular AES Helper Utilities
│   ├── crypto-engine.js# Web Crypto API Derived Key Wrappers
│   └── visualizer.js   # Shannon Entropy Canvas Visualizer Engine
└── README.md           # Project Documentation
```

---

## 🛡️ Security & Privacy Guarantee

- **100% Client-Side Execution**: All key derivation, encryption, decryption, and hash math occurs locally inside your browser using the native `window.crypto.subtle` API.
- **Zero Server Uploads**: No passwords, keys, or file bytes are ever transmitted over the network or saved on remote servers.
- **Panic Wipe Protection**: One-click Panic Purge button immediately wipes all password text fields, buffers, and audit histories from memory.

---

## 👤 Author & License

- **Author**: [Alby20022](https://github.com/Alby20022)
- **License**: Distributed under the MIT License. See `LICENSE` for details.