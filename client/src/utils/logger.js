import axios from 'axios';

const API_URL = 'http://localhost:5000/api/logs';

export const logSecurityEvent = async (event, details) => {
    try {
        await axios.post(API_URL, { event, details });
        console.log(`[SECURITY LOG] ${event}`, details);
    } catch (error) {
        console.error('Failed to send security log:', error);
    }
};
