const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');
const path = require('path');
const fs = require('fs');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Encrypted file name
    }
});

const upload = multer({ storage: storage });

// @desc    Upload encrypted file
// @route   POST /api/files/upload
// @access  Private (TODO: Add auth middleware)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { sender, recipient, iv, originalName } = req.body;

        const newFile = await File.create({
            filename: req.file.filename,
            originalName,
            sender,
            recipient,
            iv,
            path: req.file.path,
            size: req.file.size
        });

        res.status(201).json(newFile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get files for user
// @route   GET /api/files/:username
// @access  Private
router.get('/:username', async (req, res) => {
    try {
        const files = await File.find({
            $or: [{ recipient: req.params.username }, { sender: req.params.username }]
        }).sort({ createdAt: -1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Download file
// @route   GET /api/files/download/:id
// @access  Private
router.get('/download/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Send file
        res.download(file.path, file.filename);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
