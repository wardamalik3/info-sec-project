import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { initiateKeyExchange, respondToKeyExchange, exportSessionKeyForDemo } from '../../utils/protocol';
import { logSecurityEvent } from '../../utils/logger';
import { encryptMessage, decryptMessage } from '../../utils/crypto';
import FileUpload from '../FileShare/FileUpload';
import FileDownload from '../FileShare/FileDownload';
import { replayProtection } from '../../utils/replayProtection';

const socket = io('http://localhost:5000');

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [recipient, setRecipient] = useState('');
    const [activeChat, setActiveChat] = useState(null); // { username, sharedKey }
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [debugLogs, setDebugLogs] = useState([]);
    const [sessionKeyInfo, setSessionKeyInfo] = useState(null); // For displaying key derivation info
    const messagesEndRef = useRef(null);

    const addLog = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [msg, ...prev].slice(0, 50));
    };

    useEffect(() => {
        if (currentUser) {
            socket.emit('register_socket', currentUser.username);
            addLog(`Registered socket for ${currentUser.username}`);
        }

        socket.on('receive_message', async (data) => {
            addLog(`Received ${data.type} from ${data.sender}`);

            if (data.type === 'handshake') {
                handleHandshake(data);
            } else if (data.type === 'text') {
                handleIncomingMessage(data);
            }
        });

        return () => socket.off('receive_message');
    }, [currentUser, activeChat]);

    const handleHandshake = async (data) => {
        try {
            addLog(`Processing handshake from ${data.sender}`);
            console.log('🔍 Handshake data received:', {
                sender: data.sender,
                hasEphemeralKey: !!data.ephemeralPublicKey,
                hasSignature: !!data.signature,
                ephemeralKeyPreview: data.ephemeralPublicKey ? JSON.stringify(data.ephemeralPublicKey).substring(0, 100) : 'missing'
            });

            // Fetch sender's signing key from server
            addLog(`Fetching ${data.sender}'s public keys from server...`);
            const res = await axios.get(`http://localhost:5000/api/auth/keys/${data.sender}`);
            const senderSigningKey = res.data.signingPublicKey;

            if (!senderSigningKey) {
                throw new Error(`Server did not return signing key for ${data.sender}`);
            }
            addLog(`✓ Retrieved ${data.sender}'s signing key`);

            addLog('🔐 Deriving AES-GCM 256-bit session key using ECDH...');
            const sharedKey = await respondToKeyExchange(
                data.ephemeralPublicKey,
                senderSigningKey,
                data.signature
            );
            addLog('✅ Session key derived successfully!');

            // Export key info for demonstration
            const keyInfo = await exportSessionKeyForDemo(sharedKey);
            if (keyInfo) {
                setSessionKeyInfo({ ...keyInfo, role: 'Responder', peer: data.sender });
                addLog(`📊 Key: ${keyInfo.algorithm}-${keyInfo.keyLength} | Preview: ${keyInfo.keyPreview}`);
            }

            addLog(`Shared Key Established with ${data.sender}`);
            logSecurityEvent('KEY_EXCHANGE_SUCCESS', { with: data.sender, role: 'Responder' });
            setActiveChat({ username: data.sender, sharedKey });
            alert(`Secure connection established with ${data.sender}`);
        } catch (err) {
            // Enhanced error handling with specific error types
            let errorMessage = `Handshake failed: ${err.message}`;
            let troubleshooting = '';

            if (err.message.includes('Invalid signature')) {
                troubleshooting = '\n\n🔧 Troubleshooting:\n- The sender may have re-registered with new keys\n- Try having both users logout and login again\n- Clear browser data and re-register if issue persists';
            } else if (err.message.includes('not found')) {
                troubleshooting = `\n\n🔧 Troubleshooting:\n- User "${data.sender}" may not be registered\n- Check the username spelling\n- Ask ${data.sender} to register an account`;
            } else if (err.message.includes('Encryption Private Key not found')) {
                troubleshooting = '\n\n🔧 Troubleshooting:\n- Your private keys are missing from this device\n- You need to logout and register again on this device\n- Keys are stored locally and cannot be transferred';
            } else {
                troubleshooting = '\n\n🔧 Troubleshooting:\n- Check browser console for detailed error\n- Ensure both users are registered properly\n- Try refreshing the page';
            }

            addLog(`❌ ${errorMessage}`);
            console.error('🚨 Handshake failed - Full error details:', err);
            console.error('Error stack:', err.stack);
            console.error('Handshake data that caused error:', data);

            alert(`❌ Handshake Failed!\n\nError: ${err.message}${troubleshooting}`);
            logSecurityEvent('KEY_EXCHANGE_FAIL', {
                with: data.sender,
                role: 'Responder',
                error: err.message,
                errorStack: err.stack
            });
        }
    };


    const handleIncomingMessage = async (data) => {
        addLog(`Handling text from ${data.sender}. ActiveChat: ${activeChat?.username}`);

        if (!activeChat || activeChat.username !== data.sender) {
            addLog(`IGNORED: ActiveChat mismatch. Expected ${activeChat?.username}, got ${data.sender}`);
            return;
        }

        // ============================================
        // REPLAY ATTACK PROTECTION: Verify message
        // ============================================
        const verification = replayProtection.verifyMessage(data, data.sender);
        if (!verification.valid) {
            console.error('%c🚨 REPLAY ATTACK BLOCKED', 'background: #F44336; color: white; font-weight: bold; padding: 5px;');
            console.error('Reason:', verification.reason);
            console.error('Message:', data);
            addLog(`🚨 REPLAY ATTACK BLOCKED: ${verification.reason}`);
            logSecurityEvent('REPLAY_ATTACK_DETECTED', { sender: data.sender, reason: verification.reason, message: data });
            alert(`⚠️ Security Alert: Message rejected!\n\nReason: ${verification.reason}\n\nThis message was blocked to protect you from a replay attack.`);
            return; // REJECT THE MESSAGE - Don't decrypt or display it
        }

        try {
            // Log received encrypted message for demonstration
            console.log('%c📥 RECEIVED ENCRYPTED MESSAGE', 'background: #2196F3; color: white; font-weight: bold; padding: 5px;');
            console.log('Encrypted Message Object:', {
                sender: data.sender,
                type: data.type,
                ciphertext: data.ciphertext,
                iv: data.iv,
                nonce: data.nonce?.substring(0, 16) + '...',
                timestamp: new Date(data.timestamp).toLocaleString(),
                sequence: data.sequence
            });
            console.log('Ciphertext (first 20 bytes):', data.ciphertext.slice(0, 20));
            console.log('IV (12 bytes):', data.iv);

            const decrypted = await decryptMessage(activeChat.sharedKey, data.ciphertext, data.iv);

            console.log('✅ Decrypted plaintext:', decrypted);
            console.log('✅ Message verified - No replay attack detected');
            console.log('---');

            addLog(`Decrypted: ${decrypted}`);
            setMessages(prev => [...prev, { sender: data.sender, text: decrypted, timestamp: Date.now() }]);
        } catch (err) {
            addLog(`Decryption failed: ${err.message}`);
            logSecurityEvent('DECRYPTION_FAIL', { sender: data.sender, error: err.message });
            console.error('Decryption failed:', err);
            alert(`Failed to decrypt message from ${data.sender}: ${err.message}`);
        }
    };

    const startChat = async () => {
        try {
            if (!recipient || recipient.trim() === '') {
                alert('❌ Please enter a username to connect with');
                return;
            }

            addLog(`Starting chat with ${recipient}`);
            console.log('🔍 Initiating handshake with:', recipient);

            // Fetch recipient's public keys
            addLog(`Fetching ${recipient}'s public keys from server...`);
            const res = await axios.get(`http://localhost:5000/api/auth/keys/${recipient}`);
            const { publicKey, signingPublicKey } = res.data;

            if (!publicKey || !signingPublicKey) {
                throw new Error(`User "${recipient}" is registered but has no public keys. They may need to re-register.`);
            }
            addLog(`✓ Retrieved ${recipient}'s public keys`);
            console.log('Retrieved keys:', {
                hasPublicKey: !!publicKey,
                hasSigningKey: !!signingPublicKey,
                publicKeyPreview: JSON.stringify(publicKey).substring(0, 100)
            });

            addLog('🔐 Deriving AES-GCM 256-bit session key using ECDH...');
            const { ephemeralPublicKey, signature, sharedSecretKey } = await initiateKeyExchange(publicKey, signingPublicKey);
            addLog('✅ Session key derived successfully!');

            // Export key info for demonstration
            const keyInfo = await exportSessionKeyForDemo(sharedSecretKey);
            if (keyInfo) {
                setSessionKeyInfo({ ...keyInfo, role: 'Initiator', peer: recipient });
                addLog(`📊 Key: ${keyInfo.algorithm}-${keyInfo.keyLength} | Preview: ${keyInfo.keyPreview}`);
            }

            console.log('📤 Sending handshake message:', {
                to: recipient,
                type: 'handshake',
                sender: currentUser.username,
                hasEphemeralKey: !!ephemeralPublicKey,
                hasSignature: !!signature
            });

            socket.emit('send_message', {
                to: recipient,
                type: 'handshake',
                sender: currentUser.username,
                ephemeralPublicKey,
                signature
            });

            setActiveChat({ username: recipient, sharedKey: sharedSecretKey });
            addLog(`Handshake sent to ${recipient}`);
            logSecurityEvent('KEY_EXCHANGE_INIT', { with: recipient, role: 'Initiator' });
            alert(`Handshake sent to ${recipient}! Waiting for reply...`);
        } catch (err) {
            // Enhanced error handling
            let errorMessage = err.message;
            let troubleshooting = '';

            if (err.response?.status === 404) {
                errorMessage = `User "${recipient}" not found`;
                troubleshooting = '\n\n🔧 Troubleshooting:\n- Check the username spelling (case-sensitive)\n- Ask the user to register an account\n- Verify the username is correct';
            } else if (err.message.includes('Encryption keys not found')) {
                errorMessage = 'Your encryption keys are missing';
                troubleshooting = '\n\n🔧 Troubleshooting:\n- You need to logout and register again on this device\n- Keys are stored locally in your browser\n- Clearing browser data will delete your keys';
            } else if (err.message.includes('Signing Key not found')) {
                errorMessage = 'Your signing key is missing';
                troubleshooting = '\n\n🔧 Troubleshooting:\n- You need to logout and register again on this device\n- Keys are stored locally in your browser';
            } else if (err.message.includes('no public keys')) {
                troubleshooting = `\n\n🔧 Troubleshooting:\n- Ask "${recipient}" to logout and register again\n- Their keys may be corrupted`;
            } else {
                troubleshooting = '\n\n🔧 Troubleshooting:\n- Check browser console for detailed error\n- Ensure you are registered and logged in\n- Try refreshing the page';
            }

            addLog(`❌ Start chat failed: ${errorMessage}`);
            console.error('🚨 Failed to start chat - Full error details:', err);
            console.error('Error response:', err.response);
            console.error('Error stack:', err.stack);

            alert(`❌ Connection Failed!\n\nError: ${errorMessage}${troubleshooting}`);
            logSecurityEvent('KEY_EXCHANGE_INIT_FAIL', {
                with: recipient,
                error: errorMessage,
                errorStack: err.stack
            });
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input || !activeChat) return;

        try {
            const { ciphertext, iv } = await encryptMessage(activeChat.sharedKey, input);

            // REPLAY ATTACK PROTECTION: Add nonce, timestamp, and sequence number
            const messageData = replayProtection.prepareMessage(currentUser.username, {
                to: activeChat.username,
                type: 'text',
                sender: currentUser.username,
                ciphertext,
                iv
            });

            // Log encrypted message for demonstration
            console.log('%c📤 SENDING ENCRYPTED MESSAGE', 'background: #4CAF50; color: white; font-weight: bold; padding: 5px;');
            console.log('Plaintext:', input);
            console.log('Encrypted Message Object:', messageData);
            console.log('Replay Protection:', {
                nonce: messageData.nonce.substring(0, 16) + '...',
                timestamp: new Date(messageData.timestamp).toLocaleString(),
                sequence: messageData.sequence
            });
            console.log('Ciphertext (first 20 bytes):', ciphertext.slice(0, 20));
            console.log('IV (12 bytes):', iv);
            console.log('Ciphertext length:', ciphertext.length, 'bytes');
            console.log('---');

            socket.emit('send_message', messageData);

            setMessages(prev => [...prev, { sender: 'Me', text: input, timestamp: Date.now() }]);
            setInput('');
        } catch (err) {
            addLog(`Send failed: ${err.message}`);
            console.error('Send failed:', err);
        }
    };

    return (
        <div className="chat-container">
            <div className="sidebar">
                <div>
                    <h3>Start Chat</h3>
                    <input
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        placeholder="Enter username"
                    />
                    <button onClick={startChat}>Connect</button>
                </div>

                <div className="debug-section">
                    <h4>Debug Logs</h4>
                    <div className="debug-logs">
                        {debugLogs.map((log, i) => (
                            <div key={i}>{`> ${log}`}</div>
                        ))}
                    </div>
                </div>

                {/* Session Key Information Panel */}
                {sessionKeyInfo && (
                    <div className="session-key-panel">
                        <h3>🔐 SESSION KEY DERIVED</h3>
                        <div className="key-info">
                            <div className="key-info-row">
                                <span className="key-info-label">Role:</span>
                                <span className={`key-role-badge ${sessionKeyInfo.role === 'Initiator' ? 'key-role-initiator' : 'key-role-responder'}`}>
                                    {sessionKeyInfo.role}
                                </span>
                            </div>
                            <div className="key-info-row">
                                <span className="key-info-label">Peer:</span>
                                <span className="key-value">{sessionKeyInfo.peer}</span>
                            </div>
                            <div className="key-info-row">
                                <span className="key-info-label">Algorithm:</span>
                                <span className="key-value key-value-highlight">{sessionKeyInfo.algorithm}</span>
                            </div>
                            <div className="key-info-row">
                                <span className="key-info-label">Key Length:</span>
                                <span className="key-value key-value-highlight">{sessionKeyInfo.keyLength} bits</span>
                            </div>
                            <div style={{ marginTop: '0.75rem' }}>
                                <span className="key-info-label">Key Preview:</span>
                                <div className="key-preview-box">
                                    {sessionKeyInfo.keyPreview}
                                </div>
                            </div>
                            <div className="key-info-note">
                                ℹ️ This key was derived using ECDH and NEVER transmitted over the network!
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="chat-area">
                {activeChat ? (
                    <>
                        <div className="messages">
                            {messages.map((m, i) => (
                                <div key={i} className={`message ${m.sender === 'Me' ? 'sent' : 'received'}`}>
                                    <strong>{m.sender}:</strong> {m.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={sendMessage}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button type="submit">Send</button>
                        </form>

                        {/* File Upload Component */}
                        <div className="file-section">
                            <h4>📎 Send Encrypted File</h4>
                            <FileUpload activeChat={activeChat} currentUser={currentUser} />
                        </div>

                        {/* File Download Component */}
                        <FileDownload activeChat={activeChat} currentUser={currentUser} />
                    </>
                ) : (
                    <div className="no-chat">Enter a username to start a secure chat</div>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;