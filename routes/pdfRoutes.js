const express = require('express');
const { protect } = require('../middleware/authMiddleware');

// Importez vos contrôleurs PDF
const {
    generateAnalysePDF,
    generateAndUploadPDF,
    previewAnalyseHTML  // ⚠️ CETTE FONCTION ÉTAIT MANQUANTE !
} = require('../controllers/pdfController');

const router = express.Router();

/**
 * @route   GET /api/pdf/analyse/:analyseId
 * @desc    Génère et renvoie un PDF pour une analyse spécifique
 * @access  Private
 */
router.get('/analyse/:analyseId',  generateAnalysePDF);

/**
 * @route   GET /api/pdf/analyse/:analyseId/preview
 * @desc    Prévisualise le HTML avant génération PDF
 * @access  Private
 */
router.get('/analyse/:analyseId/preview',  previewAnalyseHTML);

/**
 * @route   POST /api/pdf/analyse/:analyseId/upload
 * @desc    Génère un PDF et l'upload sur Cloudinary
 * @access  Private
 */
router.post('/analyse/:analyseId/upload',  generateAndUploadPDF);

/**
 * @route   GET /api/pdf/test
 * @desc    Route de test pour vérifier le fonctionnement
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Service PDF opérationnel',
    routes: {
      generate: 'GET /api/pdf/analyse/:analyseId',
      preview: 'GET /api/pdf/analyse/:analyseId/preview',
      upload: 'POST /api/pdf/analyse/:analyseId/upload'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;