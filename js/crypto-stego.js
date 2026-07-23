/**
 * CipherVault - Image Steganography Engine
 * Hides and extracts secret messages inside PNG images using LSB (Least Significant Bit) encoding.
 */

const StegoEngine = (() => {
    const MAGIC_HEADER = "STEG";

    /**
     * Convert string to Uint8Array UTF-8 bytes
     */
    function stringToBytes(str) {
        return new TextEncoder().encode(str);
    }

    /**
     * Convert Uint8Array to UTF-8 string
     */
    function bytesToString(bytes) {
        return new TextDecoder().decode(bytes);
    }

    /**
     * Embed text payload into HTML Image element, returning a PNG Blob URL
     */
    async function embedPayload(imgElement, textPayload, passphrase) {
        let payloadText = textPayload;

        // If passphrase provided, pre-encrypt text with AES
        if (passphrase && passphrase.trim().length > 0) {
            const encBuf = await AESEngine.encryptBuffer(
                stringToBytes(textPayload).buffer,
                "stego_msg.txt",
                "text/plain",
                passphrase
            );
            // Convert encBuf to base64 string
            const binary = String.fromCharCode.apply(null, new Uint8Array(encBuf));
            payloadText = "ENC:" + btoa(binary);
        } else {
            payloadText = "RAW:" + payloadText;
        }

        const payloadBytes = stringToBytes(payloadText);
        const headerBytes = stringToBytes(MAGIC_HEADER);

        // Header format: MAGIC_HEADER (4B) + Length (4B Uint32) + Payload
        const totalPayload = new Uint8Array(4 + 4 + payloadBytes.length);
        totalPayload.set(headerBytes, 0);

        const lenView = new DataView(totalPayload.buffer, 4, 4);
        lenView.setUint32(0, payloadBytes.length, false);
        totalPayload.set(payloadBytes, 8);

        // Canvas processing
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.naturalWidth || imgElement.width;
        canvas.height = imgElement.naturalHeight || imgElement.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;

        // Maximum available capacity (3 bits per pixel: RGB, ignore Alpha)
        const maxBits = (canvas.width * canvas.height) * 3;
        const requiredBits = totalPayload.length * 8;

        if (requiredBits > maxBits) {
            throw new Error(`Payload too large! Image can hold max ${(maxBits / 8 / 1024).toFixed(1)} KB, but payload requires ${(requiredBits / 8 / 1024).toFixed(1)} KB.`);
        }

        // Write bits into LSB of RGB channels
        let bitIndex = 0;
        for (let i = 0; i < totalPayload.length; i++) {
            const byte = totalPayload[i];
            for (let bit = 7; bit >= 0; bit--) {
                const bitVal = (byte >> bit) & 1;

                // Find pixel index and channel (skip Alpha channel at 3, 7, 11...)
                const pixelChannelIndex = Math.floor(bitIndex / 3) * 4 + (bitIndex % 3);

                // Set LSB
                pixels[pixelChannelIndex] = (pixels[pixelChannelIndex] & 0xFE) | bitVal;
                bitIndex++;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                resolve({ blob, url });
            }, 'image/png');
        });
    }

    /**
     * Extract hidden payload from an image canvas / image element
     */
    async function extractPayload(imgElement, passphrase) {
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.naturalWidth || imgElement.width;
        canvas.height = imgElement.naturalHeight || imgElement.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;

        // Helper to read N bytes from LSBs
        function readBytes(startBit, numBytes) {
            const output = new Uint8Array(numBytes);
            let bitIdx = startBit;
            for (let i = 0; i < numBytes; i++) {
                let byteVal = 0;
                for (let bit = 7; bit >= 0; bit--) {
                    const pixelChannelIndex = Math.floor(bitIdx / 3) * 4 + (bitIdx % 3);
                    const bitVal = pixels[pixelChannelIndex] & 1;
                    byteVal = (byteVal << 1) | bitVal;
                    bitIdx++;
                }
                output[i] = byteVal;
            }
            return { bytes: output, nextBitIdx: bitIdx };
        }

        // 1. Read 4B Magic Header
        const headerRes = readBytes(0, 4);
        const headerStr = bytesToString(headerRes.bytes);

        if (headerStr !== MAGIC_HEADER) {
            throw new Error('No hidden steganography payload detected in this image.');
        }

        // 2. Read 4B Length
        const lenRes = readBytes(headerRes.nextBitIdx, 4);
        const lenView = new DataView(lenRes.bytes.buffer);
        const payloadLen = lenView.getUint32(0, false);

        if (payloadLen <= 0 || payloadLen > (pixels.length / 4 * 3 / 8)) {
            throw new Error('Corrupted or invalid steganography payload size.');
        }

        // 3. Read Payload Bytes
        const payloadRes = readBytes(lenRes.nextBitIdx, payloadLen);
        const rawPayloadStr = bytesToString(payloadRes.bytes);

        if (rawPayloadStr.startsWith("RAW:")) {
            return rawPayloadStr.substring(4);
        } else if (rawPayloadStr.startsWith("ENC:")) {
            if (!passphrase || passphrase.trim().length === 0) {
                throw new Error('This hidden message is password protected. Please enter decryption password.');
            }
            const base64Str = rawPayloadStr.substring(4);
            const binary = atob(base64Str);
            const encBytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                encBytes[i] = binary.charCodeAt(i);
            }

            const decResult = await AESEngine.decryptBuffer(encBytes.buffer, passphrase);
            return bytesToString(new Uint8Array(decResult.buffer));
        } else {
            return rawPayloadStr;
        }
    }

    /**
     * Calculate image payload capacity in KB
     */
    function getCapacityKB(width, height) {
        const totalPixels = width * height;
        const availableBits = totalPixels * 3; // RGB channels
        // minus 8 bytes header
        const maxBytes = Math.max(0, (availableBits / 8) - 8);
        return (maxBytes / 1024).toFixed(1);
    }

    return {
        embedPayload,
        extractPayload,
        getCapacityKB
    };
})();
