import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));

            // Check if keys exist
            try {
                const { getKey } = await import('../../utils/keyStorage');
                const signKey = await getKey('signPrivateKey');
                if (!signKey) {
                    alert('Warning: Private keys not found on this device. You will not be able to send secure messages. Please Register again to generate new keys.');
                }
            } catch (keyErr) {
                console.error("Error checking keys:", keyErr);
            }

            navigate('/chat');
        } catch (error) {
            console.error(error);
            alert('Login failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <p className="auth-subtitle">Sign in to your account</p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
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
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                
                <button type="submit" className="submit-btn">
                    Login
                </button>
            </form>
            
            <div className="auth-footer">
                <p>
                    Don't have an account?{' '}
                    <span 
                        onClick={() => navigate('/register')} 
                        className="auth-link"
                    >
                        Register
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;