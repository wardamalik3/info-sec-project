const express = require('express');
const router = express.Router();
const { register, login, getUserKeys } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/keys/:username', getUserKeys);

module.exports = router;
