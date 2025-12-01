const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/logs', require('./routes/logs'));

app.get('/', (req, res) => {
    res.send('Secure Messaging Server is running');
});

module.exports = app;
