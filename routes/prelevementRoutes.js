const express = require('express');
const {
    getPrelevements,
    updatePrelevement,
} = require('../controllers/prelevementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Liste des dossiers avec leur statut de prelevement (paginee, filtree).
router.get('/', protect, getPrelevements);

// Mise a jour du statut de prelevement d'un dossier par le preleveur.
router.put('/:analyseId', protect, updatePrelevement);

module.exports = router;
