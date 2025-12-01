const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { log } = require('../utils/logger');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { username, password, publicKey, signingPublicKey } = req.body;

    try {
        let user = await User.findOne({ username });

        if (user) {
            log('AUTH_REGISTER_FAIL', { username, reason: 'User already exists' });
            return res.status(400).json({ message: 'User already exists' });
        }

        user = await User.create({
            username,
            password,
            publicKey,
            signingPublicKey
        });

        if (user) {
            log('AUTH_REGISTER_SUCCESS', { username });
            res.status(201).json({
                _id: user._id,
                username: user.username,
                publicKey: user.publicKey,
                signingPublicKey: user.signingPublicKey,
                token: generateToken(user._id),
            });
        } else {
            log('AUTH_REGISTER_FAIL', { username, reason: 'Invalid user data' });
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        log('AUTH_REGISTER_ERROR', { username, error: error.message });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            log('AUTH_LOGIN_SUCCESS', { username });
            res.json({
                _id: user._id,
                username: user.username,
                publicKey: user.publicKey,
                signingPublicKey: user.signingPublicKey,
                token: generateToken(user._id),
            });
        } else {
            log('AUTH_LOGIN_FAIL', { username });
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        log('AUTH_LOGIN_ERROR', { username, error: error.message });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user public keys
// @route   GET /api/auth/keys/:username
// @access  Private
exports.getUserKeys = async (req, res) => {
    try {
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${req.params.username}$`, 'i') }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        log('KEY_FETCH', { requester: req.user ? req.user.username : 'unknown', target: req.params.username });
        res.json({
            username: user.username,
            publicKey: user.publicKey,
            signingPublicKey: user.signingPublicKey
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
