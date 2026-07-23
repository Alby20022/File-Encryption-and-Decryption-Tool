# 🔒 File Encryption & Decryption Tool v3.0 Ultra

[![Zero-Trust](https://img.shields.io/badge/Security-Zero--Trust%20Client--Side-00f0ff?style=for-the-badge&logo=shield)](https://github.com/Alby20022/File-Encryption-and-Decryption-Tool)
[![AES-256-GCM](https://img.shields.io/badge/Cipher-AES--256--GCM%20%2B%20PBKDF2-00f5a0?style=for-the-badge&logo=lock)](https://github.com/Alby20022/File-Encryption-and-Decryption-Tool)
[![Web Crypto API](https://img.shields.io/badge/API-Web%20Crypto%20API-7000ff?style=for-the-badge)](https://github.com/Alby20022/File-Encryption-and-Decryption-Tool)
[![License](https://img.shields.io/badge/License-MIT-ffb703?style=for-the-badge)](LICENSE)

An ultra-premium, high-performance web application for zero-trust file encryption, authenticated decryption, text vaults, and cryptographic key generation built with Python, Web Crypto API, AES-256-GCM, PBKDF2 key derivation, and translucent glassmorphism aesthetics.

---

## 🚀 Quick Start (Master Python Entry File: `index.py`)

Run the master Python entry point file **`index.py`**:

```bash
# Execute master Python entry point file
python index.py
```
This automatically initializes the server and launches the application in your default browser at **`http://localhost:8000`**!

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
- **NIST Entropy Analytics**: Real-time bit entropy calculator & estimated crack-time math.

### 📊 5. Hex & Shannon Entropy Inspector
- **Real-Time Frequency Chart**: Dynamic HTML5 Canvas rendering byte distribution spectrum.
- **256-Byte Hex Dump**: Inspect binary header bytes and ASCII representations of selected files live.

---

## 📁 Repository Structure

```
File-Encryption-and-Decryption-Tool/
├── index.py          # Master Python Main Entry File & Server Launcher
├── index.html        # Web Application SPA UI
├── styles.css        # Primary CSS Stylesheet (Translucent Glass System)
├── cyber_bg.jpg      # Background Visual Asset
├── css/
│   ├── style.css     # Subdirectory Synchronized Stylesheet
│   └── styles.css    # Fallback Synchronized Stylesheet
├── js/
│   ├── app.js        # Master Application Engine & Web Crypto Logic
│   ├── crypto-aes.js # Modular AES Helper Utilities
│   └── visualizer.js # Shannon Entropy Canvas Visualizer Engine
├── README.md         # Project Documentation
└── LICENSE           # MIT License
```

---

## 🛡️ Security & Privacy Guarantee

- **100% Client-Side Execution**: All key derivation, encryption, decryption, and hash math occurs locally inside your browser using native cryptography APIs.
- **Zero Server Uploads**: No passwords, keys, or file bytes are ever transmitted over the network.

---

## 👤 Author & License

- **Author**: [Alby20022](https://github.com/Alby20022)
- **License**: Distributed under the MIT License. See `LICENSE` for details.