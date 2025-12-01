/**
 * MITM Attack Simulation
 *
 * This script simulates a Man-In-The-Middle attack where the attacker intercepts
 * the key exchange process.
 *
 * Scenario:
 * 1. Alice sends Ephemeral Public Key (EPK_A) to Bob.
 * 2. Mallory (Attacker) intercepts EPK_A.
 * 3. Mallory replaces EPK_A with her own Ephemeral Public Key (EPK_M).
 * 4. Bob receives EPK_M, thinking it's from Alice.
 * 5. Bob computes Shared Secret with Mallory (K_BM).
 *
 * DEFENSE:
 * The system uses Digital Signatures. Alice signs EPK_A with her Static Private Key.
 * Bob verifies the signature using Alice's Static Public Key.
 * If Mallory replaces EPK_A, the signature verification will FAIL because Mallory
 * cannot forge Alice's signature.
 */
// Import necessary crypto functions

const { generateKeyPair, signData, verifySignature } = require("crypto"); // Node.js crypto for simulation
// Note: Real system uses Web Crypto API, here we use Node's crypto for the script.

console.log("logs from mitm_attack.js:");
console.log("--- MITM Attack Simulation ---");

//identities
console.log("1. Setting up identities...");
// Alice
const { publicKey: alicePub, privateKey: alicePriv } =
  require("crypto").generateKeyPairSync("ec", { namedCurve: "P-256" });
// Mallory
const { publicKey: malloryPub, privateKey: malloryPriv } =
  require("crypto").generateKeyPairSync("ec", { namedCurve: "P-256" });

// 2. Alice generates Ephemeral Key and Signs it
console.log("\n2. Alice generates Ephemeral Key and Signs it...");
const aliceEphemeral = require("crypto").generateKeyPairSync("ec", {
  namedCurve: "P-256",
});
const alicePayload = {
  ephemeralKey: aliceEphemeral.publicKey.export({
    type: "spki",
    format: "pem",
  }),
  timestamp: Date.now(),
};

// Sign with Alice's Static Key
const sign = require("crypto").createSign("SHA256");
sign.update(JSON.stringify(alicePayload));
const signature = sign.sign(alicePriv, "hex");

console.log("Alice sends payload + signature.");

// 3. Mallory Intercepts and Modifies Payload
// a mallory intercept is simulated by simply replacing the payload before it reaches Bob
console.log("\n3. Mallory Intercepts and Modifies Payload...");
const malloryEphemeral = require("crypto").generateKeyPairSync("ec", {
  namedCurve: "P-256",
});
const malloryPayload = {
  ephemeralKey: malloryEphemeral.publicKey.export({
    type: "spki",
    format: "pem",
  }), // Replaced Key!
  timestamp: Date.now(),
};

console.log("Mallory replaces Alice's key with her own.");

// 4. Bob Receives Payload and Verifies Signature
console.log("\n4. Bob Receives Payload and Verifies Signature...");

// Bob tries to verify using Alice's Public Key (which he knows is Alice's)
const verify = require("crypto").createVerify("SHA256");
verify.update(JSON.stringify(malloryPayload)); // Bob received Mallory's payload
const isValid = verify.verify(alicePub, signature, "hex"); // But the signature is from Alice's original payload!

if (isValid) {
  console.log("MITM SUCCESS: Signature verified! (This should not happen)");
} else {
  console.log("MITM FAILED: Signature verification failed! Attack detected.");
}

// 5. What if Mallory signs it with her own key?
//so Mallory tries to sign the modified payload with her own private key
console.log("\n5. What if Mallory signs with her own key?");
const signM = require("crypto").createSign("SHA256");
signM.update(JSON.stringify(malloryPayload));
const signatureM = signM.sign(malloryPriv, "hex");

// Bob verifies... but Bob expects ALICE'S signature, so he uses Alice's Public Key.
const verify2 = require("crypto").createVerify("SHA256");
verify2.update(JSON.stringify(malloryPayload));
const isValid2 = verify2.verify(alicePub, signatureM, "hex");

if (isValid2) {
  console.log(
    "MITM SUCCESS: Signature verified! (Impossible unless Mallory has Alice's private key)"
  );
} else {
  console.log(
    "MITM FAILED: Signature verification failed! Bob used Alice's Public Key to verify."
  );
}
