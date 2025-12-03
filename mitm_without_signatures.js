/**
 * MITM ATTACK DEMONSTRATION - PART 1
 * Shows how MITM breaks Diffie-Hellman WITHOUT signatures
 * 
 * SCENARIO:
 * Alice wants to talk to Bob securely
 * Mallory (attacker) intercepts the key exchange
 * WITHOUT signatures, Mallory can perform MITM attack successfully
 */

const crypto = require('crypto');

console.log('═══════════════════════════════════════════════════════════');
console.log('  MITM ATTACK DEMONSTRATION - WITHOUT SIGNATURES');
console.log('═══════════════════════════════════════════════════════════\n');

// ============================================
// STEP 1: Setup - Generate Keys for Everyone
// ============================================
console.log(' STEP 1: Setup - Generating Keys\n');

// Alice's keys
const aliceKeys = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
console.log(' Alice generated her key pair');

// Bob's keys
const bobKeys = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
console.log('Bob generated his key pair');

// Mallory's keys (attacker)
const malloryKeys = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
console.log(' Mallory (attacker) generated her key pair');

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 2: Alice Sends Public Key to Bob
// ============================================
console.log(' STEP 2: Alice sends her public key to Bob\n');

const alicePublicKeyPEM = aliceKeys.publicKey.export({ type: 'spki', format: 'pem' });
console.log('Alice sends:', alicePublicKeyPEM.substring(0, 50) + '...');

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 3: MITM ATTACK - Mallory Intercepts!
// ============================================
console.log(' STEP 3: MITM ATTACK - Mallory Intercepts!\n');

console.log(' Mallory intercepts Alice\'s public key');
console.log(' Mallory REPLACES it with her own public key');
console.log(' Bob receives Mallory\'s key, thinking it\'s from Alice\n');

const malloryPublicKeyPEM = malloryKeys.publicKey.export({ type: 'spki', format: 'pem' });
console.log('Bob receives (Mallory\'s key):', malloryPublicKeyPEM.substring(0, 50) + '...');

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 4: Bob Derives Shared Secret
// ============================================
console.log(' STEP 4: Bob derives shared secret\n');

// Bob thinks he's deriving with Alice, but actually with Mallory!
const bobSharedSecret = crypto.diffieHellman({
    privateKey: bobKeys.privateKey,
    publicKey: malloryKeys.publicKey
});

console.log('Bob\'s shared secret (with Mallory):', bobSharedSecret.toString('hex').substring(0, 32) + '...');

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 5: Mallory Derives TWO Shared Secrets
// ============================================
console.log(' STEP 5: Mallory derives TWO shared secrets\n');

// Mallory derives shared secret with Bob
const malloryBobSecret = crypto.diffieHellman({
    privateKey: malloryKeys.privateKey,
    publicKey: bobKeys.publicKey
});

// Mallory derives shared secret with Alice
const malloryAliceSecret = crypto.diffieHellman({
    privateKey: malloryKeys.privateKey,
    publicKey: aliceKeys.publicKey
});

console.log('Mallory\'s shared secret with Bob:', malloryBobSecret.toString('hex').substring(0, 32) + '...');
console.log('Mallory\'s shared secret with Alice:', malloryAliceSecret.toString('hex').substring(0, 32) + '...');

console.log('\n' + '─'.repeat(60) + '\n');


// STEP 6: MITM Attack Success!

console.log(' STEP 6: MITM ATTACK SUCCESSFUL!\n');

console.log(' Mallory can now:');
console.log('   1. Decrypt messages from Alice (using malloryAliceSecret)');
console.log('   2. Read the plaintext');
console.log('   3. Re-encrypt for Bob (using malloryBobSecret)');
console.log('   4. Bob receives the message, thinking it\'s secure');
console.log('   5. Neither Alice nor Bob know Mallory is reading everything!\n');

console.log('WITHOUT SIGNATURES, MITM ATTACK SUCCEEDS!');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  CONCLUSION: DH without signatures is VULNERABLE to MITM');
console.log('═══════════════════════════════════════════════════════════\n');
