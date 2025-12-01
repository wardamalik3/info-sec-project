import { useState } from 'react';
import axios from 'axios';
import { encryptMessage } from '../../utils/crypto';

const FileUpload = ({ activeChat, currentUser }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !activeChat) return;

        setUploading(true);
        try {
            // 1. Read File
            const arrayBuffer = await file.arrayBuffer();
            const fileBytes = new Uint8Array(arrayBuffer);

            // 2. Encrypt File Content (Treat as one large message for now, or chunk it)
            // For large files, chunking is better. For this demo, we'll encrypt the whole buffer.
            // Note: encryptMessage expects string or bytes? My utils/crypto encryptMessage encodes string.
            // I need a raw encrypt function for bytes.

            // Let's use the raw Web Crypto API here or modify utils.
            // I'll use raw API here for clarity and binary support.
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                activeChat.sharedKey,
                fileBytes
            );

            // 3. Create FormData
            const blob = new Blob([encryptedContent]);
            const formData = new FormData();
            formData.append('file', blob, file.name + '.enc'); // Send as encrypted file
            formData.append('originalName', file.name);
            formData.append('sender', currentUser.username);
            formData.append('recipient', activeChat.username);
            formData.append('iv', Array.from(iv).toString()); // Store IV as comma-separated string or hex

            // 4. Upload
            await axios.post('http://localhost:5000/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('File uploaded successfully!');
            setFile(null);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="file-upload">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file || !activeChat || uploading}>
                {uploading ? 'Uploading...' : 'Send Encrypted File'}
            </button>
        </div>
    );
};

export default FileUpload;
