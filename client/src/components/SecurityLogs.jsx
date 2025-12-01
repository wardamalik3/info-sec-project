import { useState, useEffect } from 'react';
import axios from 'axios';

const SecurityLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/logs');
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch logs', err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>🛡️ Security Audit Logs</h2>
                <button onClick={fetchLogs} style={{ padding: '8px 16px', cursor: 'pointer' }}>Refresh</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ background: '#333', color: '#fff', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Timestamp</th>
                            <th style={{ padding: '10px' }}>Event</th>
                            <th style={{ padding: '10px' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>No logs found</td></tr>
                        ) : (
                            logs.map((log, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #ccc', background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                                    <td style={{ padding: '10px', whiteSpace: 'nowrap', fontSize: '12px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: getEventColor(log.event) }}>{log.event}</td>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(log.details, null, 2)}</pre>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getEventColor = (event) => {
    if (event.includes('FAIL') || event.includes('ERROR') || event.includes('ATTACK') || event.includes('INVALID')) return '#d32f2f'; // Red
    if (event.includes('SUCCESS')) return '#388e3c'; // Green
    if (event.includes('WARN')) return '#f57c00'; // Orange
    if (event.includes('KEY')) return '#1976d2'; // Blue
    return '#333';
};

export default SecurityLogs;
