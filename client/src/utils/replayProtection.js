// Replay Attack Protection Module

class ReplayProtection {
    constructor() {
        // Store used nonces (in production, use Redis or database)
        this.usedNonces = new Set();

        // Store message sequence numbers per user
        this.sequenceNumbers = new Map(); // username -> { sent: number, received: Map<peer, number> }

        // Timestamp window (5 minutes)
        this.TIMESTAMP_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

        // Cleanup old nonces periodically
        this.startCleanup();
    }

    /**
     * Generate a cryptographically secure random nonce
     */
    generateNonce() {
        const nonceArray = window.crypto.getRandomValues(new Uint8Array(16)); // 128-bit nonce
        return Array.from(nonceArray).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Get next sequence number for sending
     */
    getNextSequence(username) {
        if (!this.sequenceNumbers.has(username)) {
            this.sequenceNumbers.set(username, { sent: 0, received: new Map() });
        }
        const userSeq = this.sequenceNumbers.get(username);
        userSeq.sent += 1;
        return userSeq.sent;
    }

    /**
     * Verify incoming message for replay attacks
     * Returns: { valid: boolean, reason: string }
     */
    verifyMessage(message, sender) {
        const { nonce, timestamp, sequence } = message;

        // 1. Check if nonce exists
        if (!nonce) {
            return { valid: false, reason: 'Missing nonce' };
        }

        // 2. Check if nonce was already used (replay attack!)
        if (this.usedNonces.has(nonce)) {
            console.warn('🚨 REPLAY ATTACK DETECTED: Duplicate nonce!', nonce);
            return { valid: false, reason: 'Duplicate nonce - possible replay attack' };
        }

        // 3. Check timestamp validity
        if (!timestamp) {
            return { valid: false, reason: 'Missing timestamp' };
        }

        const now = Date.now();
        const messageAge = now - timestamp;

        // Message too old
        if (messageAge > this.TIMESTAMP_WINDOW) {
            console.warn('🚨 REPLAY ATTACK DETECTED: Message too old!', messageAge);
            return { valid: false, reason: `Message too old (${Math.floor(messageAge / 1000)}s)` };
        }

        // Message from future (clock skew or attack)
        if (messageAge < -60000) { // Allow 1 minute clock skew
            console.warn('🚨 REPLAY ATTACK DETECTED: Message from future!', messageAge);
            return { valid: false, reason: 'Message timestamp from future' };
        }

        // 4. Check sequence number
        if (sequence === undefined) {
            return { valid: false, reason: 'Missing sequence number' };
        }

        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!this.sequenceNumbers.has(currentUser.username)) {
            this.sequenceNumbers.set(currentUser.username, { sent: 0, received: new Map() });
        }

        const userSeq = this.sequenceNumbers.get(currentUser.username);
        const lastReceivedSeq = userSeq.received.get(sender) || 0;

        // Sequence number must be strictly increasing
        if (sequence <= lastReceivedSeq) {
            console.warn('🚨 REPLAY ATTACK DETECTED: Out-of-order sequence!', {
                received: sequence,
                expected: lastReceivedSeq + 1
            });
            return { valid: false, reason: `Out-of-order sequence (got ${sequence}, expected > ${lastReceivedSeq})` };
        }

        // All checks passed - mark nonce as used and update sequence
        this.usedNonces.add(nonce);
        userSeq.received.set(sender, sequence);

        console.log('✅ Message verified - No replay attack detected', {
            nonce: nonce.substring(0, 16) + '...',
            sequence,
            age: `${Math.floor(messageAge / 1000)}s`
        });

        return { valid: true, reason: 'OK' };
    }

    /**
     * Prepare message with replay protection
     */
    prepareMessage(sender, messageData) {
        return {
            ...messageData,
            nonce: this.generateNonce(),
            timestamp: Date.now(),
            sequence: this.getNextSequence(sender)
        };
    }

    /**
     * Cleanup old nonces (older than timestamp window)
     */
    startCleanup() {
        setInterval(() => {
            // In production, implement proper cleanup based on timestamps
            // For now, clear all if too many accumulated
            if (this.usedNonces.size > 10000) {
                console.log('Cleaning up old nonces...');
                this.usedNonces.clear();
            }
        }, 60000); // Every minute
    }

    /**
     * Reset for testing
     */
    reset() {
        this.usedNonces.clear();
        this.sequenceNumbers.clear();
    }
}

// Export singleton instance
export const replayProtection = new ReplayProtection();
