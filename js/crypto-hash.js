/**
 * CipherVault - Hash & Integrity Checksum Engine
 * Computes SHA-256, SHA-512, SHA-384, and SHA-1 using Web Crypto API
 */

const HashEngine = (() => {

    /**
     * Compute hex digest for ArrayBuffer or String using specified algorithm
     */
    async function computeHash(dataBuffer, algoName = 'SHA-256') {
        let buffer = dataBuffer;
        if (typeof dataBuffer === 'string') {
            buffer = new TextEncoder().encode(dataBuffer).buffer;
        }

        const hashBuffer = await crypto.subtle.digest(algoName, buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Compute all standard cryptographic hashes at once (SHA-256, SHA-512, SHA-1)
     */
    async function computeAllHashes(dataBuffer) {
        let buffer = dataBuffer;
        if (typeof dataBuffer === 'string') {
            buffer = new TextEncoder().encode(dataBuffer).buffer;
        }

        const [sha256, sha512, sha1] = await Promise.all([
            computeHash(buffer, 'SHA-256'),
            computeHash(buffer, 'SHA-512'),
            computeHash(buffer, 'SHA-1')
        ]);

        return { sha256, sha512, sha1 };
    }

    return {
        computeHash,
        computeAllHashes
    };
})();
