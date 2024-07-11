const express = require('express');
const { sendSMS } = require('../controllers/smsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', protect, sendSMS);

module.exports = router;
