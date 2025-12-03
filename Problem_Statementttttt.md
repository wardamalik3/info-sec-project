Introduction
Background

In the contemporary digital landscape, secure communication is essential for safeguarding sensitive information against unauthorized access, interception, and manipulation. As cyber threats, data breaches, and pervasive surveillance continue to increase, users expect communication platforms to provide strong guarantees of privacy and confidentiality. Many conventional messaging services rely on server-side encryption, where the service provider manages the decryption keys and can, in principle, access user data. This centralized trust model introduces significant security and privacy concerns.

End-to-End Encryption (E2EE) directly addresses these issues by ensuring that only the intended communicating parties can read the exchanged content. In a genuine E2EE system, messages are encrypted on the sender’s device, remain encrypted while in transit and during storage, and are decrypted only on the recipient’s device. The server functions purely as a transport layer, relaying ciphertext without visibility into the underlying plaintext.

Project Motivation

This project focuses on the design, implementation, and evaluation of a Secure End-to-End Encrypted Messaging and File-Sharing System that showcases the practical use of modern cryptographic mechanisms. The system integrates several cryptographic techniques to achieve:

Confidentiality: Protection of messages and files from unauthorized disclosure.

Authenticity: Assurance that users can verify the identity of their communication peers.

Integrity: Detection of any unauthorized modification of messages during transmission.

Forward Secrecy: Protection of past session keys even if long-term keys are later compromised.

Replay Protection: Prevention of attackers from resending previously captured messages.

System Overview

The system is realized as a web-based, real-time messaging platform that allows users to:

Register and log in securely using password-based credentials.

Perform cryptographic key exchange via an authenticated Diffie–Hellman protocol.

Send end-to-end encrypted text messages using AES-GCM-256 symmetric encryption.

Share files with end-to-end encryption guarantees similar to messages.

Observe security-related events through extensive logging and auditing features.

The solution adopts a hybrid cryptographic architecture that combines:

Elliptic Curve Diffie–Hellman (ECDH) for secure key establishment.

Elliptic Curve Digital Signature Algorithm (ECDSA) for user and message authentication.

AES-GCM-256 for authenticated encryption of messages and files.

Bcrypt for secure password hashing.

Nonces, timestamps, and sequence numbers to mitigate replay attacks.

Project Scope

The project spans several core aspects of information security and secure system design.

1. Cryptographic Implementation

Design and implementation of a secure key exchange protocol.

Integration of symmetric and asymmetric cryptography.

Establishment of appropriate key management, storage, and handling practices.

2. Security Analysis

Application of STRIDE threat modeling to the system.

Identification of potential vulnerabilities and attack vectors.

Design and incorporation of countermeasures and mitigations.

3. Attack Simulation and Defense

Demonstration of Man-in-the-Middle (MITM) attack scenarios.

Simulation of replay attacks on the communication channels.

Illustration of how digital signatures and replay protection mechanisms prevent these attacks.

4. System Development

Construction of a functional client–server architecture.

Use of WebSockets for real-time, bidirectional communication.

Development of a user-friendly interface to support system usability.

5. Security Auditing

Implementation of comprehensive security logging mechanisms.

Recording of authentication attempts, key exchanges, and security incidents.

Provision of audit trails to support forensic analysis and post-incident review.

Technologies Used
Client-Side

React + Vite for building the modern web-based user interface.

Web Crypto API for performing cryptographic operations in the browser.

Socket.io Client for maintaining real-time WebSocket-based communication.

Server-Side

Node.js with Express as the backend framework.

Socket.io for real-time, bidirectional communication with clients.

MongoDB as the NoSQL database for storing user credentials and related metadata.

Bcrypt for secure password hashing.

Cryptographic Algorithms

ECDH (P-256) for elliptic curve-based key agreement.

ECDSA (P-256) for generating and verifying digital signatures.

AES-GCM-256 for authenticated encryption of data in transit and at rest.

SHA-256 for cryptographic hashing and data integrity.

Project Objectives

The main objectives of the project are to:

Demonstrate practical application of cryptography by implementing industry-standard protocols in a working system.

Enforce end-to-end security such that the server cannot access user content in plaintext.

Mitigate common attack types, including MITM and replay attacks, through appropriate defenses.

Provide transparency in security operations through detailed logging and auditing.

Perform a structured threat analysis using the STRIDE methodology and apply corresponding countermeasures.

Validate security claims by testing and demonstrating the effectiveness of implemented protections.

Document Structure

This report is structured as follows:

Chapter 2: Problem Statement and Requirements

Chapter 3: System Design and Architecture

Chapter 4: Cryptographic Protocol Design

Chapter 5: Implementation Details

Chapter 6: Security Analysis (STRIDE Threat Modeling)

Chapter 7: Attack Simulation and Defense Demonstration

Chapter 8: Security Logging and Auditing

Chapter 9: Testing and Validation

Chapter 10: Conclusion and Future Work

Problem Statement
The Challenge of Secure Communication

A central challenge for modern communication systems is to enable private, trustworthy communication between users without requiring blind trust in intermediary infrastructure. Traditional messaging platforms typically have several inherent security weaknesses.

1. Server-Side Vulnerability

In many conventional systems, the server can access encryption keys or plaintext data, leading to several risks:

Data breaches: Compromise of the server can expose all stored user communications.

Insider threats: Malicious or careless administrators may access sensitive user messages.

Government or legal requests: Service providers can be compelled to disclose stored data.

Third-party sharing: Providers may share or monetize user data, for example with advertisers.

2. Man-in-the-Middle (MITM) Attacks

If key exchange is not properly authenticated, an attacker can intercept and manipulate communications:

The attacker intercepts the public key sent by Alice and substitutes their own key.

Separate encrypted channels are established between the attacker and each user.

The attacker can read, modify, and inject messages while both parties believe they are communicating securely.

This compromises confidentiality and integrity without the users’ awareness.

3. Replay Attacks

Attackers may capture valid encrypted messages and resend them at a later time:

Previously sent messages can be replayed to cause confusion or trigger unintended behavior.

Without mechanisms ensuring message freshness, receivers cannot reliably distinguish old messages from new ones.

Proper handling of sequence numbers and timing information is necessary to prevent such attacks.

4. Key Management Complexity

Secure communication depends heavily on robust key management:

Keys must be generated using strong randomness and secure algorithms.

Private keys must remain solely on the user’s device and be protected from leakage.

Key exchange must be authenticated to prevent impersonation and MITM attacks.

Key compromise should not expose past communications; forward secrecy is essential.

5. Lack of Accountability

In the absence of sufficient logging and auditing:

Security incidents may go undetected.

It is difficult or impossible to reconstruct events after a breach.

Users and administrators cannot verify correct functioning of security protocols.

Problem Definition

In light of these challenges, the central problem addressed by this project can be stated as follows:

How can we design and implement a communication system that provides robust end-to-end encryption, resists man-in-the-middle and replay attacks, ensures message authenticity and integrity, and offers comprehensive security auditing, while remaining usable and performant for real-time messaging?

Specific Requirements

To address this problem, the system must meet the following requirements.

Functional Requirements

FR1: User Authentication

Users shall be able to register with unique usernames and passwords.

Passwords shall be securely hashed and never stored in plaintext.

Only authenticated users shall gain access to the messaging system.

FR2: Key Generation and Management

Each user shall generate ECDH and ECDSA key pairs during registration.

Private keys shall be stored securely on the client device and never transmitted.

Public keys shall be registered with the server for discovery and distribution.

FR3: Secure Key Exchange

Users shall be able to establish a shared secret key with other users.

The key exchange procedure shall be authenticated using digital signatures.

The derived shared secret shall never be transmitted over the network.

FR4: End-to-End Encrypted Messaging

Users shall send text messages encrypted using AES-GCM-256.

Encryption shall occur on the sender’s device; decryption shall occur only on the recipient’s device.

The server shall not be able to decrypt or view the content of messages.

FR5: Encrypted File Sharing

Users shall be able to share files with end-to-end encryption.

File content shall be encrypted before upload and decrypted only after download on the recipient’s device.

File metadata such as filename and size may be visible to the server, but the file content itself must remain encrypted.

FR6: Replay Attack Prevention

Each message shall include a unique nonce, a timestamp, and a sequence number.

Recipients shall reject duplicate or out-of-order messages.

Messages that are too old, based on timestamp, shall be rejected.

FR7: Security Logging

The system shall log all authentication attempts, including successes and failures.

Key exchange events shall be recorded.

Security violations, such as invalid signatures or detected replay attempts, shall be logged.

Logs shall be available for review and auditing.

Security Requirements

SR1: Confidentiality

Messages and files shall not appear in plaintext on the server at any time.

Only the intended recipient shall possess the keys necessary to decrypt content.

Passive eavesdroppers shall be unable to recover message content.

SR2: Authenticity

Users shall be able to verify the identities of their communication partners.

Digital signatures shall be used to authenticate key exchange and critical messages.

Invalid or missing signatures shall be detected and rejected.

SR3: Integrity

Any modification of a message in transit shall be detectable.

AES-GCM shall be employed to provide authenticated encryption.

Tampering shall cause decryption to fail and the message to be discarded.

SR4: MITM Attack Prevention

The key exchange protocol shall be designed to resist man-in-the-middle attacks.

Digital signatures shall bind public keys to specific user identities.

Signature verification shall be required for successful key establishment.

SR5: Replay Attack Prevention

The system shall detect and reject replayed messages.

Nonces shall be enforced as unique per message or session.

Timestamps shall be checked for freshness.

Sequence numbers shall be strictly increasing to prevent reuse.

SR6: Password Security

Passwords shall be hashed using bcrypt with appropriate cost parameters.

Stored password hashes shall not be reversible.

Offline brute-force attempts shall be computationally expensive.

SR7: Forward Secrecy

Compromise of long-term signing keys shall not expose previously derived session keys.

Each session shall derive a fresh shared secret, independent of prior sessions.

Non-Functional Requirements

NFR1: Usability

The user interface shall be straightforward and intuitive.

Cryptographic processes shall be automated and hidden from the user where appropriate.

Security status and indicators shall be presented in a clear and understandable way.

NFR2: Performance

Encryption and decryption operations for messages shall complete within acceptable latency (e.g., under 100 ms).

Key exchange procedures shall complete in a reasonable amount of time (e.g., under 2 seconds).

The system shall support real-time messaging without noticeable delays.

NFR3: Scalability

The system architecture shall support multiple concurrent users.

WebSocket connections shall be managed efficiently to handle many active sessions.

NFR4: Auditability

All significant security events shall be logged with accurate timestamps.

Logs shall include mechanisms to make tampering detectable.

Logs shall be retrievable and analyzable for forensic purposes.

Success Criteria

The project will be considered successful if the following conditions are met:

End-to-end encryption is demonstrated in practice, with messages encrypted on the sender’s device and decrypted only on the recipient’s device.

MITM attacks are effectively prevented through authenticated key exchange using digital signatures.

Replay attacks are successfully detected and blocked via nonce, timestamp, and sequence number validation.

Security logging is sufficiently detailed to cover all relevant events, including authentication, key exchanges, and violations.

A comprehensive STRIDE-based threat model is produced, and all categories are addressed with corresponding countermeasures.

Simulated attack scenarios, such as MITM and replay attacks, are carried out and shown to be mitigated by the implemented protections.

The system operates correctly as a messaging platform, enabling user registration, login, key exchange, and encrypted communication.

Out of Scope

The following items lie outside the scope of this project:

Deployment to production-grade public cloud environments.

Native mobile applications for iOS or Android.

Group messaging or multi-party encryption protocols.

Real-time voice or video communication.

Perfect forward secrecy with purely ephemeral ECDH keys (static ECDH keys are used).

Post-quantum cryptographic algorithms.

Formal proofs of security or full cryptanalytic evaluation.

Independent penetration testing by external security professionals.
