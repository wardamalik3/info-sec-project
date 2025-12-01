import { useState, useEffect } from 'react';
import axios from 'axios';

const FileDownload = ({ activeChat, currentUser }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchFiles();
        }
    }, [currentUser]);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/files/${currentUser.username}`);
            setFiles(res.data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    const handleDownload = async (file) => {
        if (!activeChat) {
            alert('Please establish a secure connection first!');
            return;
        }

        setLoading(true);
        try {
            console.log('%c📥 DOWNLOADING ENCRYPTED FILE', 'background: #FF9800; color: white; font-weight: bold; padding: 5px;');
            console.log('File metadata:', file);

            // 1. Download encrypted file
            const response = await axios.get(`http://localhost:5000/api/files/download/${file._id}`, {
                responseType: 'arraybuffer'
            });

            console.log('Encrypted file downloaded, size:', response.data.byteLength, 'bytes');

            // 2. Parse IV from comma-separated string
            const iv = file.iv.split(',').map(Number);
            console.log('IV:', iv);

            // 3. Decrypt file using shared session key
            console.log('🔓 Decrypting file with AES-256-GCM...');
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                activeChat.sharedKey,
                response.data
            );

            console.log('✅ File decrypted successfully!');
            console.log('Decrypted size:', decrypted.byteLength, 'bytes');

            // 4. Create blob and download
            const blob = new Blob([decrypted]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.originalName; // Use original filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('💾 File saved as:', file.originalName);
            console.log('---');

            alert(`File "${file.originalName}" decrypted and downloaded!`);
        } catch (error) {
            console.error('Download/Decrypt failed:', error);
            alert('Failed to download/decrypt file. Make sure you have the correct session key.');
        } finally {
            setLoading(false);
        }
    };

    // Filter files for current chat
    const relevantFiles = files.filter(f =>
        (f.sender === activeChat?.username && f.recipient === currentUser.username) ||
        (f.sender === currentUser.username && f.recipient === activeChat?.username)
    );

    return (
        <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '5px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1976D2' }}>📂 Received Files</h4>

            {!activeChat ? (
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    Establish a secure connection to view files
                </p>
            ) : relevantFiles.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    No files shared in this conversation
                </p>
            ) : (
                <div>
                    {relevantFiles.map((file) => (
                        <div
                            key={file._id}
                            style={{
                                padding: '10px',
                                marginBottom: '8px',
                                background: 'white',
                                borderRadius: '4px',
                                border: '1px solid #90CAF9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: '#1565C0' }}>
                                    {file.originalName}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    From: {file.sender} | {new Date(file.createdAt).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                    Size: {(file.size / 1024).toFixed(2)} KB (encrypted)
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(file)}
                                disabled={loading}
                                style={{
                                    padding: '8px 16px',
                                    background: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {loading ? 'Decrypting...' : '🔓 Download & Decrypt'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={fetchFiles}
                style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
            >
                🔄 Refresh Files
            </button>
        </div>
    );
};

export default FileDownload;
