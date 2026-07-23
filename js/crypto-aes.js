/**
 * CipherVault - AES-256-GCM Cryptographic Engine
 * Uses Web Crypto API for zero-trust, browser-native file & arraybuffer encryption
 */

const AESEngine = (() => {
    const MAGIC_BYTES = new Uint8Array([0x43, 0x50, 0x48, 0x56]); // "CPHV"
    const PBKDF2_ITERATIONS = 100000;

    /**
     * Derive AES-GCM 256-bit Key from Passphrase and Salt using PBKDF2
     */
    async function deriveKey(passphrase, salt) {
        const encoder = new TextEncoder();
        const passphraseBytes = encoder.encode(passphrase);
        const baseKey = await crypto.subtle.importKey(
            'raw',
            passphraseBytes,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt an ArrayBuffer with metadata (Filename and MimeType)
     */
    async function encryptBuffer(fileBuffer, filename, mimeType, passphrase, progressCb) {
        if (progressCb) progressCb(10, 'Deriving secure cryptographic key...');

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(passphrase, salt);

        if (progressCb) progressCb(40, 'Encrypting data payload (AES-256-GCM)...');

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            fileBuffer
        );

        if (progressCb) progressCb(80, 'Packing encrypted file header...');

        // Format metadata header
        const encoder = new TextEncoder();
        const filenameBytes = encoder.encode(filename || 'file');
        const mimeBytes = encoder.encode(mimeType || 'application/octet-stream');

        const headerLen = MAGIC_BYTES.length + salt.length + iv.length + 2 + filenameBytes.length + 2 + mimeBytes.length;
        const totalLen = headerLen + ciphertext.byteLength;

        const outputBuffer = new Uint8Array(totalLen);
        let offset = 0;

        // 1. Magic Bytes
        outputBuffer.set(MAGIC_BYTES, offset);
        offset += MAGIC_BYTES.length;

        // 2. Salt & IV
        outputBuffer.set(salt, offset);
        offset += salt.length;
        outputBuffer.set(iv, offset);
        offset += iv.length;

        // 3. Filename Length & Filename
        const fnLenView = new DataView(outputBuffer.buffer, offset, 2);
        fnLenView.setUint16(0, filenameBytes.length, false);
        offset += 2;
        outputBuffer.set(filenameBytes, offset);
        offset += filenameBytes.length;

        // 4. Mime Length & Mime
        const mimeLenView = new DataView(outputBuffer.buffer, offset, 2);
        mimeLenView.setUint16(0, mimeBytes.length, false);
        offset += 2;
        outputBuffer.set(mimeBytes, offset);
        offset += mimeBytes.length;

        // 5. Ciphertext
        outputBuffer.set(new Uint8Array(ciphertext), offset);

        if (progressCb) progressCb(100, 'Encryption complete!');

        return outputBuffer.buffer;
    }

    /**
     * Decrypt a CipherVault `.enc` file Buffer
     */
    async function decryptBuffer(encBuffer, passphrase, progressCb) {
        if (progressCb) progressCb(10, 'Reading encrypted header...');

        const bytes = new Uint8Array(encBuffer);
        let offset = 0;

        // Verify Magic Bytes
        for (let i = 0; i < MAGIC_BYTES.length; i++) {
            if (bytes[offset + i] !== MAGIC_BYTES[i]) {
                throw new Error('Invalid file format. File is not a valid CipherVault (.enc) file.');
            }
        }
        offset += MAGIC_BYTES.length;

        // Extract Salt & IV
        const salt = bytes.slice(offset, offset + 16);
        offset += 16;
        const iv = bytes.slice(offset, offset + 12);
        offset += 12;

        // Read Filename
        const fnLenView = new DataView(bytes.buffer, bytes.byteOffset + offset, 2);
        const fnLen = fnLenView.getUint16(0, false);
        offset += 2;
        const filenameBytes = bytes.slice(offset, offset + fnLen);
        offset += fnLen;
        const filename = new TextDecoder().decode(filenameBytes);

        // Read MimeType
        const mimeLenView = new DataView(bytes.buffer, bytes.byteOffset + offset, 2);
        const mimeLen = mimeLenView.getUint16(0, false);
        offset += 2;
        const mimeBytes = bytes.slice(offset, offset + mimeLen);
        offset += mimeLen;
        const mimeType = new TextDecoder().decode(mimeBytes);

        // Remaining is Ciphertext
        const ciphertext = bytes.slice(offset);

        if (progressCb) progressCb(40, 'Deriving cryptographic key...');

        const key = await deriveKey(passphrase, salt);

        if (progressCb) progressCb(70, 'Decrypting data & verifying GCM integrity tag...');

        try {
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                ciphertext
            );

            if (progressCb) progressCb(100, 'Decryption successful!');

            return {
                buffer: decryptedBuffer,
                filename: filename,
                mimeType: mimeType
            };
        } catch (err) {
            throw new Error('Decryption failed! Wrong passphrase or file corrupted.');
        }
    }

    return {
        encryptBuffer,
        decryptBuffer
    };
})();
