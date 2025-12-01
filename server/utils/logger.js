const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/security.log');

// Ensure log directory exists
if (!fs.existsSync(path.dirname(logFile))) {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

const log = (event, details) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${event}] ${JSON.stringify(details)}\n`;

    fs.appendFile(logFile, logEntry, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });

    console.log(`[LOG] ${event}:`, details);
};

module.exports = { log };
