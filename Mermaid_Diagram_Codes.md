# Mermaid Diagram Codes

Copy and paste these codes into https://mermaid.live/ to generate the diagrams.

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph Client["CLIENT SIDE"]
        UI[User Interface]
        Crypto[Crypto Module]
        Protocol[Protocol Handler]
        LocalStorage[Local Storage]
    end
    
    subgraph Network["NETWORK"]
        WS[WebSocket]
        HTTP[HTTP API]
    end
    
    subgraph Server["SERVER SIDE"]
        SocketServer[Socket.io]
        Express[Express]
        Auth[Auth Controller]
        Logger[Logger]
    end
    
    subgraph Data["DATABASE"]
        MongoDB[(MongoDB)]
        Logs[Security Logs]
    end
    
    UI --> Crypto
    Crypto --> Protocol
    Protocol --> LocalStorage
    Protocol --> WS
    Protocol --> HTTP
    WS --> SocketServer
    HTTP --> Express
    Express --> Auth
    Auth --> MongoDB
    SocketServer --> Logger
    Auth --> Logger
    Logger --> Logs
    
    style Client fill:#E3F2FD
    style Server fill:#E8F5E9
    style Data fill:#FFF3E0
    style Network fill:#F5F5F5
```

---

## 2. Key Exchange Protocol (Sequence Diagram)

```mermaid
sequenceDiagram
    participant Alice
    participant Server
    participant Bob
    
    Note over Alice,Bob: Registration Phase
    Alice->>Server: Register (username, password, publicKey, signingPublicKey)
    Server->>Server: Hash password with bcrypt
    Server->>Server: Store user data in MongoDB
    Server-->>Alice: JWT Token
    
    Bob->>Server: Register (username, password, publicKey, signingPublicKey)
    Server->>Server: Hash password with bcrypt
    Server->>Server: Store user data in MongoDB
    Server-->>Bob: JWT Token
    
    Note over Alice,Bob: Key Exchange Phase
    Alice->>Server: Fetch Bob's public keys
    Server-->>Alice: Bob's publicKey & signingPublicKey
    
    Alice->>Alice: Generate ephemeral ECDH key pair
    Alice->>Alice: Derive shared secret K = ECDH(Alice_private, Bob_public)
    Alice->>Alice: Sign ephemeral public key with ECDSA
    Alice->>Server: Send {ephemeralPublicKey, signature}
    Server->>Bob: Forward {ephemeralPublicKey, signature}
    
    Bob->>Server: Fetch Alice's signing public key
    Server-->>Bob: Alice's signingPublicKey
    Bob->>Bob: Verify signature using Alice's signingPublicKey
    Bob->>Bob: Derive shared secret K = ECDH(Bob_private, Alice_ephemeral_public)
    
    Note over Alice,Bob: Both parties now have shared secret K
    Note over Alice,Bob: K is used to derive AES-GCM-256 key
    
    Note over Alice,Bob: Encrypted Communication
    Alice->>Alice: Encrypt message with AES-GCM-256
    Alice->>Server: Send encrypted message
    Server->>Bob: Forward encrypted message
    Bob->>Bob: Decrypt message with AES-GCM-256
```

---

## 3. Client-Side Flow Diagram

```mermaid
flowchart TB
    Start([User Opens App])
    Start --> Login{Login or Register?}
    
    Login -->|Register| GenKeys[Generate Keys]
    GenKeys --> ExportKeys[Export Public Keys]
    ExportKeys --> SendReg[Send to Server]
    SendReg --> StorePrivate[Store Private Keys]
    StorePrivate --> ReceiveJWT[Get JWT Token]
    
    Login -->|Login| SendLogin[Send Credentials]
    SendLogin --> ReceiveJWT
    
    ReceiveJWT --> SelectChat[Select Recipient]
    SelectChat --> FetchKeys[Fetch Public Keys]
    FetchKeys --> DeriveSecret[Derive Shared Secret]
    DeriveSecret --> SignKey[Sign Public Key]
    SignKey --> SendHandshake[Send Handshake]
    SendHandshake --> ChatReady[Chat Ready]
    
    ChatReady --> TypeMsg[Type Message]
    TypeMsg --> EncryptMsg[Encrypt Message]
    EncryptMsg --> AddReplay[Add Replay Protection]
    AddReplay --> SendMsg[Send via WebSocket]
    SendMsg --> ReceiveMsg[Receive Message]
    
    ReceiveMsg --> VerifyReplay{Verify Replay?}
    VerifyReplay -->|Invalid| RejectMsg[Reject & Log]
    VerifyReplay -->|Valid| DecryptMsg[Decrypt Message]
    DecryptMsg --> DisplayMsg[Display Message]
    
    DisplayMsg --> ChatReady
    RejectMsg --> ChatReady
    
    style GenKeys fill:#C8E6C9
    style EncryptMsg fill:#C8E6C9
    style DecryptMsg fill:#BBDEFB
    style SendMsg fill:#FFE0B2
    style ReceiveMsg fill:#FFE0B2
    style VerifyReplay fill:#FFCDD2
```

---

## 4. Encryption/Decryption Workflow

```mermaid
flowchart TB
    subgraph Sender["ENCRYPTION"]
        Input[Plaintext Message]
        GetKey1[Get AES Key]
        GenIV[Generate IV]
        AddReplayProt[Add Nonce + Timestamp + Sequence]
        Encrypt[Encrypt with AES-GCM]
        CreatePacket[Create Packet]
        SendWS[Send via WebSocket]
        
        Input --> GetKey1
        GetKey1 --> GenIV
        GenIV --> AddReplayProt
        AddReplayProt --> Encrypt
        Encrypt --> CreatePacket
        CreatePacket --> SendWS
    end
    
    subgraph Network["NETWORK"]
        WSChannel[Server Relay<br/>Cannot Decrypt]
    end
    
    subgraph Receiver["DECRYPTION"]
        ReceivePacket[Receive Packet]
        VerifyReplay{Verify Replay<br/>Protection?}
        GetKey2[Get AES Key]
        Decrypt[Decrypt with AES-GCM]
        VerifyTag{Auth Tag<br/>Valid?}
        Output[Plaintext Message]
        Reject[Reject & Log]
        
        ReceivePacket --> VerifyReplay
        VerifyReplay -->|Valid| GetKey2
        VerifyReplay -->|Invalid| Reject
        GetKey2 --> Decrypt
        Decrypt --> VerifyTag
        VerifyTag -->|Valid| Output
        VerifyTag -->|Invalid| Reject
    end
    
    SendWS --> WSChannel
    WSChannel --> ReceivePacket
    
    style Sender fill:#C8E6C9
    style Receiver fill:#BBDEFB
    style Network fill:#F5F5F5
    style VerifyReplay fill:#FFCDD2
    style VerifyTag fill:#FFCDD2
```

---

## 5. Database Schema

```mermaid
classDiagram
    class Users {
        +ObjectId _id
        +String username (unique)
        +String password (bcrypt)
        +Object publicKey
        +Object signingPublicKey
        +Date createdAt
    }
    
    class PublicKey {
        +String crv "P-256"
        +String kty "EC"
        +String x
        +String y
    }
    
    class SigningPublicKey {
        +String crv "P-256"
        +String kty "EC"
        +String x
        +String y
    }
    
    class SecurityLogs {
        +String timestamp
        +String event
        +Object details
    }
    
    Users "1" --> "1" PublicKey : has
    Users "1" --> "1" SigningPublicKey : has
    
    note for Users "Private keys stored in browser localStorage only"
    note for SecurityLogs "Stored in logs/security.log file"
```

**Schema Details:**

### Users Collection (MongoDB)
- **_id**: ObjectId (Primary Key, auto-generated)
- **username**: String (unique, required, min 3 chars)
- **password**: String (bcrypt hash, required, min 6 chars)
- **publicKey**: Object (JWK format for ECDH)
  - crv: "P-256"
  - kty: "EC"
  - x: String (base64url)
  - y: String (base64url)
- **signingPublicKey**: Object (JWK format for ECDSA)
  - crv: "P-256"
  - kty: "EC"
  - x: String (base64url)
  - y: String (base64url)
- **createdAt**: Date (auto-generated)

### Security Logs (File System)
- **Location**: `server/logs/security.log`
- **Format**: `[timestamp] [event] {details}`
- **Events**:
  - AUTH_REGISTER
  - AUTH_LOGIN_SUCCESS
  - AUTH_LOGIN_FAIL
  - KEY_FETCH
  - KEY_EXCHANGE_INIT
  - KEY_EXCHANGE_SUCCESS
  - INVALID_SIGNATURE
  - REPLAY_ATTACK_DETECTED
  - DECRYPTION_FAIL

### Security Notes
- ✅ **Private keys**: NEVER stored in database (only in browser localStorage)
- ✅ **Messages**: NEVER stored (end-to-end encrypted, ephemeral)
- ✅ **Passwords**: Hashed with bcrypt (10 salt rounds)
- ✅ **Public keys**: Stored in JWK format for distribution


---

## 6. Network Architecture (Local Deployment)

```mermaid
graph TB
    subgraph Localhost["LOCALHOST"]
        subgraph Browsers["BROWSERS"]
            Alice[Alice Browser<br/>Port 5173]
            Bob[Bob Browser<br/>Port 5173]
        end
        
        Vite[Vite Dev Server<br/>Port 5173]
        
        ExpressWS[Express + Socket.io<br/>Port 5000]
        
        subgraph Storage["STORAGE"]
            Mongo[(MongoDB<br/>Port 27017)]
            FileSystem[Files & Logs]
        end
        
        Alice -->|HTTP/WS| Vite
        Bob -->|HTTP/WS| Vite
        Vite -->|Proxy| ExpressWS
        ExpressWS -->|DB| Mongo
        ExpressWS -->|I/O| FileSystem
    end
    
    style Browsers fill:#E3F2FD
    style Vite fill:#E1F5FE
    style ExpressWS fill:#E8F5E9
    style Storage fill:#FFF3E0
```

---

## How to Use:

1. Go to **https://mermaid.live/**
2. **Copy** one of the code blocks above (including the ` ```mermaid ` markers)
3. **Paste** into the left panel
4. The diagram will render on the right
5. Click **"Actions"** → **"PNG"** or **"SVG"** to download

## Tips:

- **Adjust styling**: Modify `fill` colors in the code
- **Edit text**: Change labels directly in the code
- **Resize**: Use the zoom controls in mermaid.live
- **Export**: Download as PNG, SVG, or copy the code

All diagrams are ready to use! 🎨
