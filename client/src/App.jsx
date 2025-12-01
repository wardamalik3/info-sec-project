import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatWindow from './components/Chat/ChatWindow';
import SecurityLogs from './components/SecurityLogs';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <h1>SECURE-CHAT</h1>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/chat" element={<ChatWindow />} />
                    <Route path="/logs" element={<SecurityLogs />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
