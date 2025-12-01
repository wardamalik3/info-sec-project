import { useState } from 'react';
import axios from 'axios';
import { generateKeyPair, exportKey } from '../../utils/crypto';
import { storeKey } from '../../utils/keyStorage';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Generate Keys
            const encKeyPair = await generateKeyPair('ECDH');
            const signKeyPair = await generateKeyPair('ECDSA');

            // 2. Export Public Keys
            const publicKey = await exportKey(encKeyPair.publicKey);
            const signingPublicKey = await exportKey(signKeyPair.publicKey);

            // 3. Store Keys Locally (IndexedDB) - both private and public
            await storeKey('encPrivateKey', encKeyPair.privateKey);
            await storeKey('signPrivateKey', signKeyPair.privateKey);
            await storeKey('encPublicKey', publicKey); // Store public key as JWK
            await storeKey('signPublicKey', signingPublicKey);

            // 4. Register User
            await axios.post('http://localhost:5000/api/auth/register', {
                username: formData.username,
                password: formData.password,
                publicKey,
                signingPublicKey
            });

            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <p className="auth-subtitle">Create a new account</p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                
                <button type="submit" className="submit-btn">
                    Register
                </button>
            </form>
            
            <div className="auth-footer">
                <p>
                    Already have an account?{' '}
                    <span 
                        onClick={() => navigate('/login')} 
                        className="auth-link"
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;