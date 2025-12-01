import { deriveSharedKey, signData, verifySignature, importKey, exportKey, encryptMessage, decryptMessage } from './crypto';
import { getKey } from './keyStorage';
import { logSecurityEvent } from './logger';

// Protocol: Both sides use their static keys for ECDH
// Initiator: ECDH(my_private, recipient_public)
// Responder: ECDH(my_private, sender_public)
// Both derive the same shared secret

const getCanonicalKeyString = (key) => {
    return JSON.stringify({
        crv: key.crv,
        kty: key.kty,
        x: key.x,
        y: key.y
    });
};

export const initiateKeyExchange = async (recipientPublicKey, recipientSigningKey) => {
    // 1. Get my static private key and public key
    const myPrivateKey = await getKey('encPrivateKey');
    const myPublicKey = await getKey('encPublicKey');

    if (!myPrivateKey || !myPublicKey) {
        throw new Error('Encryption keys not found in local storage.');
    }

    // 2. Import Recipient's Public Key (for ECDH)
    const importedRecipientKey = await importKey(recipientPublicKey, 'ECDH', 'public');

    // 3. Derive Shared Secret using my static private key + recipient's static public key
    const sharedSecretKey = await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: importedRecipientKey },
        myPrivateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // 4. Get my signing key
    const mySigningKey = await getKey('signPrivateKey');

    if (!mySigningKey) {
        throw new Error('Signing Key not found in local storage.');
    }

    // Sign my public encryption key
    const signature = await signData(mySigningKey, getCanonicalKeyString(myPublicKey));

    return {
        ephemeralPublicKey: myPublicKey, // Send my static public key
        signature,
        sharedSecretKey
    };
};

export const respondToKeyExchange = async (senderEphemeralPublicKey, senderSigningPublicKey, signature) => {
    // 1. Verify Signature
    const importedSenderSigningKey = await importKey(senderSigningPublicKey, 'ECDSA', 'public');
    const isValid = await verifySignature(importedSenderSigningKey, signature, getCanonicalKeyString(senderEphemeralPublicKey));

    if (!isValid) {
        logSecurityEvent('INVALID_SIGNATURE', { senderSigningPublicKey, signature });
        throw new Error('Invalid signature during key exchange');
    }

    // 2. Import Sender's Public Key
    const importedSenderKey = await importKey(senderEphemeralPublicKey, 'ECDH', 'public');

    // 3. Derive Shared Secret using my private key + sender's public key
    const myPrivateKey = await getKey('encPrivateKey');

    if (!myPrivateKey) {
        throw new Error('Encryption Private Key not found in local storage.');
    }

    const sharedSecretKey = await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: importedSenderKey },
        myPrivateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    return sharedSecretKey;
};

// Helper function to export session key for demonstration purposes
export const exportSessionKeyForDemo = async (sessionKey) => {
    try {
        const exported = await window.crypto.subtle.exportKey('raw', sessionKey);
        const keyArray = Array.from(new Uint8Array(exported));
        // Convert to hex string for display
        const keyHex = keyArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return {
            algorithm: 'AES-GCM',
            keyLength: keyArray.length * 8, // 256 bits
            keyPreview: keyHex.substring(0, 32) + '...', // First 16 bytes
            fullKeyHash: keyHex.substring(0, 64) // First 32 bytes for comparison
        };
    } catch (err) {
        console.error('Failed to export key:', err);
        return null;
    }
};
