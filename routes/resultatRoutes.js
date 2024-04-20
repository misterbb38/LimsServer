const express = require('express');
const { protect } = require('../middleware/authMiddleware');

// Importez vos contrôleurs de résultats
const {
    createResultat,
    getAllResultats,
    getResultatById,
    updateResultat,
    deleteResultat
} = require('../controllers/resultatController');

const router = express.Router();

// Route pour créer un nouveau résultat et obtenir tous les résultats
router.route('/')
    .post(protect, createResultat) // Créer un nouveau résultat
    .get(protect, getAllResultats); // Obtenir tous les résultats

// Routes pour obtenir, mettre à jour, et supprimer un résultat spécifique par son ID
router.route('/:id')
    .get(protect, getResultatById) // Obtenir un résultat par son ID
    .put(protect, updateResultat) // Mettre à jour un résultat
    .delete(protect, deleteResultat); // Supprimer un résultat

module.exports = router;
