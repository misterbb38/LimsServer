const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getLogs, purgeLogs } = require('../controllers/logController');

const router = express.Router();

router.get('/', protect, getLogs);
router.delete('/purge', protect, purgeLogs);

module.exports = router;
