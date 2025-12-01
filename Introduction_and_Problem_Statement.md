# Introduction

## Background

In today's digital age, secure communication has become a fundamental requirement for protecting sensitive information from unauthorized access, interception, and manipulation. With the increasing prevalence of cyber threats, data breaches, and surveillance, users demand communication systems that guarantee privacy and confidentiality. Traditional messaging platforms often rely on server-side encryption, where the service provider holds the decryption keys and can potentially access user content. This centralized trust model poses significant security and privacy risks.

**End-to-End Encryption (E2EE)** addresses these concerns by ensuring that only the communicating parties can read the messages. In a true E2EE system, messages are encrypted on the sender's device and remain encrypted during transmission and storage, only to be decrypted on the recipient's device. The server acts merely as a relay, unable to access the plaintext content.

## Project Motivation

This project aims to design, implement, and evaluate a **Secure End-to-End Encrypted Messaging and File-Sharing System** that demonstrates the practical application of modern cryptographic principles. The system combines multiple cryptographic techniques to achieve:

- **Confidentiality**: Messages and files are protected from eavesdropping
- **Authenticity**: Users can verify the identity of their communication partners
- **Integrity**: Messages cannot be tampered with during transmission
- **Forward Secrecy**: Compromise of long-term keys does not compromise past session keys
- **Replay Protection**: Old messages cannot be maliciously resent

## System Overview

The implemented system is a **web-based real-time messaging application** that enables users to:

1. **Register and authenticate** securely with password-based credentials
2. **Exchange cryptographic keys** using an authenticated Diffie-Hellman protocol
3. **Send encrypted text messages** using AES-GCM-256 symmetric encryption
4. **Share encrypted files** with end-to-end encryption guarantees
5. **Monitor security events** through comprehensive logging and auditing

The system employs a **hybrid cryptographic architecture** that combines:

- **Elliptic Curve Diffie-Hellman (ECDH)** for secure key exchange
- **Elliptic Curve Digital Signature Algorithm (ECDSA)** for authentication
- **AES-GCM-256** for message and file encryption
- **Bcrypt** for password hashing
- **Nonce, timestamp, and sequence numbers** for replay attack prevention

## Project Scope

This project encompasses multiple dimensions of information security:

### 1. **Cryptographic Implementation**
- Design and implement a secure key exchange protocol
- Integrate symmetric and asymmetric cryptography
- Ensure proper key management and storage

### 2. **Security Analysis**
- Conduct STRIDE threat modeling
- Identify vulnerabilities and attack vectors
- Implement countermeasures and defenses

### 3. **Attack Simulation and Defense**
- Demonstrate Man-in-the-Middle (MITM) attacks
- Simulate replay attacks
- Show how digital signatures and replay protection prevent these attacks

### 4. **System Development**
- Build a functional client-server architecture
- Implement real-time communication using WebSockets
- Design a user-friendly interface

### 5. **Security Auditing**
- Implement comprehensive security logging
- Track authentication attempts, key exchanges, and security events
- Provide audit trails for forensic analysis

## Technologies Used

### Client-Side
- **React + Vite**: Modern web application framework
- **Web Crypto API**: Browser-native cryptographic operations
- **Socket.io Client**: Real-time WebSocket communication

### Server-Side
- **Node.js + Express**: Backend server framework
- **Socket.io**: Real-time bidirectional communication
- **MongoDB**: NoSQL database for user credentials and metadata
- **Bcrypt**: Password hashing library

### Cryptographic Algorithms
- **ECDH (P-256)**: Elliptic Curve Diffie-Hellman key exchange
- **ECDSA (P-256)**: Digital signatures for authentication
- **AES-GCM-256**: Authenticated encryption for messages and files
- **SHA-256**: Cryptographic hashing

## Project Objectives

The primary objectives of this project are to:

1. **Demonstrate practical cryptography**: Implement industry-standard cryptographic protocols in a real-world application
2. **Ensure end-to-end security**: Guarantee that the server cannot access user content
3. **Prevent common attacks**: Implement defenses against MITM, replay, and other attacks
4. **Provide security transparency**: Log all security-relevant events for auditing
5. **Conduct threat analysis**: Use STRIDE methodology to identify and mitigate threats
6. **Validate security claims**: Test and demonstrate the effectiveness of security measures

## Document Structure

This report is organized as follows:

- **Chapter 2**: Problem Statement and Requirements
- **Chapter 3**: System Design and Architecture
- **Chapter 4**: Cryptographic Protocol Design
- **Chapter 5**: Implementation Details
- **Chapter 6**: Security Analysis (STRIDE Threat Modeling)
- **Chapter 7**: Attack Simulation and Defense Demonstration
- **Chapter 8**: Security Logging and Auditing
- **Chapter 9**: Testing and Validation
- **Chapter 10**: Conclusion and Future Work

---

# Problem Statement

## The Challenge of Secure Communication

Modern communication systems face a fundamental security challenge: **how to enable private communication between parties without trusting the intermediary infrastructure**. Traditional messaging systems suffer from several critical security weaknesses:

### 1. **Server-Side Vulnerability**
In conventional messaging platforms, the server has access to encryption keys and can decrypt user messages. This creates several risks:
- **Data breaches**: If the server is compromised, all user data is exposed
- **Insider threats**: Malicious administrators can access private communications
- **Government surveillance**: Servers can be compelled to provide user data
- **Third-party access**: Service providers may share data with advertisers or partners

### 2. **Man-in-the-Middle (MITM) Attacks**
Without proper authentication, an attacker can intercept the key exchange process and impersonate legitimate users:
- Attacker intercepts Alice's public key and replaces it with their own
- Attacker establishes separate encrypted sessions with both Alice and Bob
- Attacker can read, modify, or inject messages without detection
- Users believe they are communicating securely, but the attacker has full access

### 3. **Replay Attacks**
An attacker can capture encrypted messages and resend them later:
- Old messages can be replayed to cause confusion or trigger unintended actions
- Without freshness guarantees, recipients cannot distinguish replayed messages from new ones
- Sequence and timing information must be protected

### 4. **Key Management Complexity**
Secure communication requires proper key generation, exchange, storage, and rotation:
- Keys must be generated with sufficient entropy
- Private keys must never leave the user's device
- Key exchange must be authenticated to prevent impersonation
- Compromised keys should not compromise past communications (forward secrecy)

### 5. **Lack of Accountability**
Without proper logging and auditing:
- Security incidents cannot be detected or investigated
- Users cannot verify that security protocols are functioning correctly
- Forensic analysis is impossible after a breach

## Problem Definition

**Given these challenges, the problem is:**

> **How can we design and implement a secure communication system that guarantees end-to-end encryption, prevents man-in-the-middle and replay attacks, ensures message authenticity and integrity, and provides comprehensive security auditing—all while maintaining usability and performance?**

## Specific Requirements

To address this problem, the system must satisfy the following requirements:

### Functional Requirements

**FR1: User Authentication**
- Users must be able to register with unique usernames and passwords
- Passwords must be securely hashed and never stored in plaintext
- Users must authenticate before accessing the messaging system

**FR2: Key Generation and Management**
- Each user must generate ECDH and ECDSA key pairs upon registration
- Private keys must be stored securely on the client device only
- Public keys must be registered with the server for distribution

**FR3: Secure Key Exchange**
- Users must be able to establish a shared secret key with other users
- The key exchange must be authenticated using digital signatures
- The shared secret must never be transmitted over the network

**FR4: End-to-End Encrypted Messaging**
- Users must be able to send text messages encrypted with AES-GCM-256
- Messages must be encrypted on the sender's device and decrypted only on the recipient's device
- The server must be unable to decrypt message content

**FR5: Encrypted File Sharing**
- Users must be able to share files with end-to-end encryption
- File metadata (filename, size) may be visible to the server, but content must be encrypted
- Files must be encrypted before upload and decrypted after download

**FR6: Replay Attack Prevention**
- Each message must include a unique nonce, timestamp, and sequence number
- Recipients must reject duplicate or out-of-sequence messages
- Old messages must be rejected based on timestamp freshness

**FR7: Security Logging**
- The system must log all authentication attempts (success and failure)
- Key exchange events must be logged
- Security violations (invalid signatures, replay attacks) must be logged
- Logs must be accessible for review and auditing

### Security Requirements

**SR1: Confidentiality**
- Messages and files must never exist in plaintext on the server
- Only the intended recipient must be able to decrypt messages
- Eavesdroppers must not be able to read message content

**SR2: Authenticity**
- Users must be able to verify the identity of their communication partners
- Digital signatures must be used to authenticate key exchange messages
- Invalid signatures must be detected and rejected

**SR3: Integrity**
- Messages must not be modifiable in transit without detection
- AES-GCM must provide authenticated encryption
- Any tampering must cause decryption to fail

**SR4: MITM Attack Prevention**
- The key exchange protocol must prevent man-in-the-middle attacks
- Digital signatures must bind public keys to user identities
- Signature verification must be mandatory

**SR5: Replay Attack Prevention**
- The system must detect and reject replayed messages
- Nonce uniqueness must be enforced
- Timestamp freshness must be verified
- Sequence numbers must be strictly increasing

**SR6: Password Security**
- Passwords must be hashed using bcrypt with appropriate salt rounds
- Password hashes must never be reversible
- Brute-force attacks must be computationally infeasible

**SR7: Forward Secrecy**
- Compromise of long-term signing keys should not compromise past session keys
- Each session should use a freshly derived shared secret

### Non-Functional Requirements

**NFR1: Usability**
- The user interface must be intuitive and easy to use
- Cryptographic operations must be transparent to the user
- Security indicators must be clear and understandable

**NFR2: Performance**
- Message encryption and decryption must be fast (< 100ms)
- Key exchange must complete within reasonable time (< 2 seconds)
- The system must support real-time messaging

**NFR3: Scalability**
- The architecture must support multiple concurrent users
- WebSocket connections must be efficiently managed

**NFR4: Auditability**
- All security events must be logged with timestamps
- Logs must be tamper-evident
- Logs must be accessible for forensic analysis

## Success Criteria

The project will be considered successful if:

1. ✅ **End-to-end encryption is demonstrated**: Messages are encrypted on sender's device and decrypted only on recipient's device
2. ✅ **MITM attacks are prevented**: Digital signatures successfully authenticate key exchanges
3. ✅ **Replay attacks are detected**: Nonce, timestamp, and sequence validation rejects replayed messages
4. ✅ **Security logging is comprehensive**: All required events are logged and accessible
5. ✅ **STRIDE threat model is complete**: All threat categories are analyzed with countermeasures
6. ✅ **Attack demonstrations are successful**: MITM and replay attacks are simulated and shown to be prevented
7. ✅ **System is functional**: Users can register, login, exchange keys, and send encrypted messages

## Out of Scope

The following are explicitly **not** included in this project:

- ❌ Production deployment to public cloud infrastructure
- ❌ Mobile applications (iOS/Android)
- ❌ Group messaging or multi-party encryption
- ❌ Voice or video calling
- ❌ Perfect forward secrecy with ephemeral keys (using static ECDH keys)
- ❌ Post-quantum cryptography
- ❌ Formal security proofs or cryptanalysis
- ❌ Penetration testing by third parties

---

This problem statement establishes the foundation for the secure communication system developed in this project. The following chapters detail the design, implementation, and validation of the solution.
