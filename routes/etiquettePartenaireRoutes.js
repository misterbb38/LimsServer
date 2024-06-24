const express = require('express');
const {
    createEtiquettePartenaire,
    getEtiquettePartenaires,
    getEtiquettePartenaireById,
    updateEtiquettePartenaire,
    deleteEtiquettePartenaire,
    getEtiquettesStats,
    getEtiquettesByPartenaire
} = require('../controllers/etiquettePartenaireController');

const router = express.Router();

// Fichier : routes/etiquettePartenaireRoutes.js
router.get('/stats', getEtiquettesStats);
router.get('/etiquettes', getEtiquettesByPartenaire);

router.route('/')
    .post(createEtiquettePartenaire)
    .get(getEtiquettePartenaires);

router.route('/:id')
    .get(getEtiquettePartenaireById)
    .put(updateEtiquettePartenaire)
    .delete(deleteEtiquettePartenaire);

module.exports = router;
