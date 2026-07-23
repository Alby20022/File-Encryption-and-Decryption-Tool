/**
 * CipherVault - Text Vault Engine
 * Formats inline text payloads into armored Base64 cipher strings with version header
 */

const TextVaultEngine = (() => {

    /**
     * Encrypt text message into Armored Base64 String
     */
    async function encryptText(text, passphrase) {
        if (!text || text.trim().length === 0) {
            throw new Error('Please enter text content to encrypt.');
        }
        if (!passphrase || passphrase.trim().length === 0) {
            throw new Error('Please enter a secret passphrase.');
        }

        const encoder = new TextEncoder();
        const textBuffer = encoder.encode(text).buffer;

        const encBuffer = await AESEngine.encryptBuffer(
            textBuffer,
            'text_payload.txt',
            'text/plain',
            passphrase
        );

        // Convert ArrayBuffer to Base64 String
        const binary = String.fromCharCode.apply(null, new Uint8Array(encBuffer));
        const base64 = btoa(binary);

        return `-----BEGIN CIPHERVAULT ENCRYPTED MESSAGE-----\n${base64}\n-----END CIPHERVAULT ENCRYPTED MESSAGE-----`;
    }

    /**
     * Decrypt Armored Base64 Cipher String back to Plaintext
     */
    async function decryptText(cipherArmored, passphrase) {
        if (!cipherArmored || cipherArmored.trim().length === 0) {
            throw new Error('Please enter encrypted cipher text to decrypt.');
        }
        if (!passphrase || passphrase.trim().length === 0) {
            throw new Error('Please enter the secret passphrase.');
        }

        let base64Str = cipherArmored.trim();
        const lines = base64Str.split('\n');
        let cleanBase64 = '';
        for (let line of lines) {
            if (!line.startsWith('-----')) {
                cleanBase64 += line.trim();
            }
        }

        let binary;
        try {
            binary = atob(cleanBase64);
        } catch (e) {
            throw new Error('Invalid ciphertext encoding. Text must be valid Base64.');
        }

        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const result = await AESEngine.decryptBuffer(bytes.buffer, passphrase);
        return new TextDecoder().decode(new Uint8Array(result.buffer));
    }

    return {
        encryptText,
        decryptText
    };
})();
