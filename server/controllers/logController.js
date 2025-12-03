const { log } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

exports.reportLog = (req, res) => {
    const { event, details } = req.body;
    log(event, details);
    res.status(200).json({ message: 'Log received' });
};
//
exports.getLogs = (req, res) => {
    const logFile = path.join(__dirname, '../../logs/security.log');
    if (fs.existsSync(logFile)) {
        fs.readFile(logFile, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Error reading log file' });
            }
            // Parse logs into array
            const logs = data.trim().split('\n').map(line => {
                const match = line.match(/^\[(.*?)\] \[(.*?)\] (.*)$/);
                if (match) {
                    try {
                        return {
                            timestamp: match[1],
                            event: match[2],
                            details: JSON.parse(match[3])
                        };
                    } catch (e) {
                        return {
                            timestamp: match[1],
                            event: match[2],
                            details: match[3] // Fallback if JSON parse fails
                        };
                    }
                }
                return null;
            }).filter(l => l !== null).reverse(); // Newest first
            res.json(logs);
        });
    } else {
        res.json([]);
    }
};
