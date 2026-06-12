// Route d'upload PDF de resultat pour partage (WhatsApp, email...)
const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileResultatMulter'); // accepte application/pdf
const { protect } = require('../middleware/authMiddleware');
const { uploadResultatPdf } = require('../controllers/shareResultatController');

router.post('/upload', protect, upload.single('pdf'), uploadResultatPdf);

module.exports = router;
