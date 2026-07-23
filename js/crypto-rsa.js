/**
 * CipherVault - Asymmetric RSA Key Studio & Cipher Engine
 * Web Crypto API RSA-OAEP Key Pair Generation & PEM Formatting
 */

const RSAEngine = (() => {

    /**
     * Convert ArrayBuffer to PEM string format
     */
    function arrayBufferToPem(buffer, label) {
        const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
        const base64 = btoa(binary);
        const lines = base64.match(/.{1,64}/g) || [];
        return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
    }

    /**
     * Convert PEM string back to ArrayBuffer
     */
    function pemToArrayBuffer(pem) {
        const lines = pem.trim().split('\n');
        let base64 = '';
        for (let line of lines) {
            if (!line.startsWith('-----')) {
                base64 += line.trim();
            }
        }
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Generate RSA-OAEP Keypair
     */
    async function generateKeyPair(modulusLength = 2048) {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: parseInt(modulusLength),
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
                hash: 'SHA-256'
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );

        // Export Public Key as SPKI
        const spkiBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const pubPem = arrayBufferToPem(spkiBuffer, 'PUBLIC KEY');

        // Export Private Key as PKCS8
        const pkcs8Buffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        const privPem = arrayBufferToPem(pkcs8Buffer, 'PRIVATE KEY');

        return {
            publicKeyPem: pubPem,
            privateKeyPem: privPem
        };
    }

    /**
     * Encrypt text with RSA Public Key (PEM format)
     */
    async function encryptWithPublicKey(pemPublicKey, textMessage) {
        const spkiBuffer = pemToArrayBuffer(pemPublicKey);
        const publicKey = await crypto.subtle.importKey(
            'spki',
            spkiBuffer,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['encrypt']
        );

        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(textMessage);

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            dataBytes
        );

        // Return Base64 encoded ciphertext
        const binary = String.fromCharCode.apply(null, new Uint8Array(encryptedBuffer));
        return btoa(binary);
    }

    /**
     * Decrypt Base64 ciphertext with RSA Private Key (PEM format)
     */
    async function decryptWithPrivateKey(pemPrivateKey, base64Ciphertext) {
        const pkcs8Buffer = pemToArrayBuffer(pemPrivateKey);
        const privateKey = await crypto.subtle.importKey(
            'pkcs8',
            pkcs8Buffer,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['decrypt']
        );

        const binary = atob(base64Ciphertext.trim());
        const encryptedBytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            encryptedBytes[i] = binary.charCodeAt(i);
        }

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            encryptedBytes
        );

        return new TextDecoder().decode(decryptedBuffer);
    }

    return {
        generateKeyPair,
        encryptWithPublicKey,
        decryptWithPrivateKey
    };
})();
