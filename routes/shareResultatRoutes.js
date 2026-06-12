// Routes de partage des PDF de resultat
//   POST /upload     -> Cloudinary, renvoie l'URL (utilise par WhatsApp)
//   POST /send-email -> envoi direct par SMTP avec PDF en piece jointe
const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileResultatMulter'); // accepte application/pdf
const { protect } = require('../middleware/authMiddleware');
const {
  uploadResultatPdf,
  sendResultatByEmail,
} = require('../controllers/shareResultatController');

router.post('/upload', protect, upload.single('pdf'), uploadResultatPdf);
router.post('/send-email', protect, upload.single('pdf'), sendResultatByEmail);

module.exports = router;
