const express = require('express');
const router = express.Router();
const { reportLog, getLogs } = require('../controllers/logController');

router.post('/', reportLog);
router.get('/', getLogs);

module.exports = router;
