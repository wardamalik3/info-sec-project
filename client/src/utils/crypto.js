// Utility for Web Crypto API operations

const ENC_ALGO = { name: 'AES-GCM', length: 256 };
const SIGN_ALGO = { name: 'ECDSA', namedCurve: 'P-256' };
const DH_ALGO = { name: 'ECDH', namedCurve: 'P-256' };

// 1. Generate Key Pair (ECDH for Key Exchange, ECDSA for Signing)
export const generateKeyPair = async (type = 'ECDH') => {
    const algo = type === 'ECDH' ? DH_ALGO : SIGN_ALGO;
    const usages = type === 'ECDH' ? ['deriveKey', 'deriveBits'] : ['sign', 'verify'];

    return await window.crypto.subtle.generateKey(
        algo,
        true, // extractable
        usages
    );
};

// 2. Export Key (to send to server/other user)
export const exportKey = async (key) => {
    const exported = await window.crypto.subtle.exportKey('jwk', key);
    return exported;
};

// 3. Import Key (from server/other user)
export const importKey = async (jwk, type = 'ECDH', usage = 'public') => {
    const algo = type === 'ECDH' ? DH_ALGO : SIGN_ALGO;
    const usages = type === 'ECDH'
        ? (usage === 'public' ? [] : ['deriveKey', 'deriveBits']) // Public key for ECDH usually has no usages in importKey for deriveKey? Wait, it needs to be used in deriveKey.
        : (usage === 'public' ? ['verify'] : ['sign']);

    // For ECDH public key import, we don't specify usages usually? 
    // Actually for deriveKey, the public key is the "other" key.

    return await window.crypto.subtle.importKey(
        'jwk',
        jwk,
        algo,
        true,
        usages.length === 0 ? [] : usages // Fix usage later if needed
    );
};

// 4. Derive Shared Secret (AES-GCM Key)
export const deriveSharedKey = async (privateKey, publicKey) => {
    return await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: publicKey },
        privateKey,
        ENC_ALGO,
        true,
        ['encrypt', 'decrypt']
    );
};

// 5. Encrypt Message (AES-GCM)
export const encryptMessage = async (key, message) => {
    const encoded = new TextEncoder().encode(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoded
    );

    return {
        ciphertext: Array.from(new Uint8Array(ciphertext)),
        iv: Array.from(iv)
    };
};

// 6. Decrypt Message (AES-GCM)
export const decryptMessage = async (key, ciphertext, iv) => {
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext)
    );

    return new TextDecoder().decode(decrypted);
};

// 7. Sign Data (ECDSA)
export const signData = async (privateKey, data) => {
    const encoded = new TextEncoder().encode(data);
    const signature = await window.crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        encoded
    );
    return Array.from(new Uint8Array(signature));
};

// 8. Verify Signature (ECDSA)
export const verifySignature = async (publicKey, signature, data) => {
    const encoded = new TextEncoder().encode(data);
    return await window.crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        publicKey,
        new Uint8Array(signature),
        encoded
    );
};
