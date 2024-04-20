const express = require('express');
const { protect } = require('../middleware/authMiddleware');

// Importez vos contrôleurs d'historique
const {
    createHistorique,
    getHistoriques,
    getHistorique,
    updateHistorique,
    deleteHistorique
} = require('../controllers/historiqueController');

// Importez middleware d'authentification ou d'autorisation si nécessaire
// const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Route pour créer un nouvel historique et obtenir tous les historiques
router.route('/')
    .post(protect, createHistorique) // Créer un nouvel historique
    .get(protect, getHistoriques); // Obtenir tous les historiques

// Routes pour obtenir, mettre à jour, et supprimer un historique spécifique par son ID
router.route('/:id')
    .get(protect, getHistorique) // Obtenir un historique par son ID
    .put(protect, updateHistorique) // Mettre à jour un historique
    .delete(protect, deleteHistorique); // Supprimer un historique

module.exports = router;

