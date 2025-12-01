
const crypto = require('crypto');

console.log('═══════════════════════════════════════════════════════════');
console.log('  MITM ATTACK DEMONSTRATION - WITH SIGNATURES');
console.log('═══════════════════════════════════════════════════════════\n');

// ============================================
// STEP 1: Setup - Generate Keys for Everyone
// ============================================
console.log('📋 STEP 1: Setup - Generating Keys\n');

// Alice's keys (ECDH for key exchange + ECDSA for signing)
const aliceECDH = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const aliceECDSA = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
console.log('✅ Alice generated ECDH key pair (for key exchange)');
console.log('✅ Alice generated ECDSA key pair (for signing)');

// Bob's keys
const bobECDH = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const bobECDSA = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
console.log('✅ Bob generated ECDH key pair (for key exchange)');
console.log('✅ Bob generated ECDSA key pair (for signing)');

// Mallory's keys (attacker)
const malloryECDH = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const malloryECDSA = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
console.log('✅ Mallory (attacker) generated ECDH key pair');
console.log('✅ Mallory (attacker) generated ECDSA key pair');

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 2: Alice Signs Her Public Key
// ============================================
console.log('🔏 STEP 2: Alice signs her public key\n');

const alicePublicKeyPEM = aliceECDH.publicKey.export({ type: 'spki', format: 'pem' });

// Alice signs her public key with her ECDSA private key
const sign = crypto.createSign('SHA256');
sign.update(alicePublicKeyPEM);
const aliceSignature = sign.sign(aliceECDSA.privateKey, 'hex');

console.log('Alice\'s public key:', alicePublicKeyPEM.substring(0, 50) + '...');
console.log('Alice\'s signature:', aliceSignature.substring(0, 50) + '...');
console.log('\n✅ Alice sends: [Public Key + Signature]');

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 3: MITM ATTACK ATTEMPT - Mallory Intercepts!
// ============================================
console.log('🚨 STEP 3: MITM ATTACK ATTEMPT - Mallory Intercepts!\n');

console.log('❌ Mallory intercepts Alice\'s message');
console.log('❌ Mallory tries to REPLACE Alice\'s public key with her own');

const malloryPublicKeyPEM = malloryECDH.publicKey.export({ type: 'spki', format: 'pem' });
console.log('\nMallory\'s public key:', malloryPublicKeyPEM.substring(0, 50) + '...');

console.log('\n🤔 Mallory has TWO options:\n');
console.log('Option 1: Send Mallory\'s key with Alice\'s signature');
console.log('Option 2: Sign Mallory\'s key with Mallory\'s own signing key');

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 4: Option 1 - Use Alice's Signature
// ============================================
console.log('🔍 STEP 4: Option 1 - Mallory sends her key with Alice\'s signature\n');

console.log('Bob receives:');
console.log('  - Public Key: Mallory\'s key (replaced)');
console.log('  - Signature: Alice\'s signature (original)');

// Bob verifies the signature
const verify1 = crypto.createVerify('SHA256');
verify1.update(malloryPublicKeyPEM); // Mallory's key
const isValid1 = verify1.verify(aliceECDSA.publicKey, aliceSignature, 'hex'); // Alice's signature

console.log('\n🔐 Bob verifies signature using Alice\'s public signing key...');
console.log('Result:', isValid1 ? '✅ VALID' : '❌ INVALID');

if (!isValid1) {
    console.log('\n🛡️  MITM ATTACK BLOCKED!');
    console.log('Reason: Signature doesn\'t match the public key');
    console.log('Alice signed HER key, not Mallory\'s key');
}

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 5: Option 2 - Sign with Mallory's Key
// ============================================
console.log('🔍 STEP 5: Option 2 - Mallory signs her key with her own signing key\n');

// Mallory signs her own public key
const signM = crypto.createSign('SHA256');
signM.update(malloryPublicKeyPEM);
const mallorySignature = signM.sign(malloryECDSA.privateKey, 'hex');

console.log('Bob receives:');
console.log('  - Public Key: Mallory\'s key');
console.log('  - Signature: Mallory\'s signature');

// Bob verifies using Alice's public signing key (because Bob expects Alice's signature)
const verify2 = crypto.createVerify('SHA256');
verify2.update(malloryPublicKeyPEM); // Mallory's key
const isValid2 = verify2.verify(aliceECDSA.publicKey, mallorySignature, 'hex'); // Verify with Alice's key

console.log('\n🔐 Bob verifies signature using Alice\'s public signing key...');
console.log('Result:', isValid2 ? '✅ VALID' : '❌ INVALID');

if (!isValid2) {
    console.log('\n🛡️  MITM ATTACK BLOCKED!');
    console.log('Reason: Signature was created with Mallory\'s key, not Alice\'s key');
    console.log('Bob expects Alice\'s signature, verification fails');
}

console.log('\n' + '─'.repeat(60) + '\n');

// ============================================
// STEP 6: Legitimate Exchange (No Attack)
// ============================================
console.log('✅ STEP 6: Legitimate exchange (no attack)\n');

console.log('Bob receives Alice\'s ORIGINAL message:');
console.log('  - Public Key: Alice\'s key');
console.log('  - Signature: Alice\'s signature');

// Bob verifies the legitimate signature
const verify3 = crypto.createVerify('SHA256');
verify3.update(alicePublicKeyPEM); // Alice's key
const isValid3 = verify3.verify(aliceECDSA.publicKey, aliceSignature, 'hex'); // Alice's signature

console.log('\n🔐 Bob verifies signature using Alice\'s public signing key...');
console.log('Result:', isValid3 ? '✅ VALID' : '❌ INVALID');

if (isValid3) {
    console.log('\n✅ SIGNATURE VALID!');
    console.log('Bob can trust this is really Alice\'s public key');
    console.log('Secure key exchange proceeds...');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  CONCLUSION: Digital Signatures PREVENT MITM Attacks');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📊 Summary:');
console.log('  ❌ Option 1: Mallory\'s key + Alice\'s signature = FAILS');
console.log('  ❌ Option 2: Mallory\'s key + Mallory\'s signature = FAILS');
console.log('  ✅ Legitimate: Alice\'s key + Alice\'s signature = SUCCEEDS');
console.log('\n🔒 Mallory CANNOT forge Alice\'s signature without Alice\'s private key!');
console.log('🛡️  Digital signatures provide AUTHENTICATION and prevent MITM!\n');
