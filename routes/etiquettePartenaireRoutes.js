const express = require('express');
const {
    createEtiquettePartenaire,
    getEtiquettePartenaires,
    getEtiquettePartenaireById,
    updateEtiquettePartenaire,
    deleteEtiquettePartenaire,
    getEtiquettesStats,
    getEtiquettesByPartenaire,
    getFactureReference,
    saveFactureReference
} = require('../controllers/etiquettePartenaireController');

const router = express.Router();

// Fichier : routes/etiquettePartenaireRoutes.js
router.get('/stats', getEtiquettesStats);
router.get('/etiquettes', getEtiquettesByPartenaire);
// Reference de facture partenaire (enregistree une seule fois par
// partenaire + periode, reutilisee a chaque reimpression).
router.get('/facture-reference', getFactureReference);
router.post('/facture-reference', saveFactureReference);

router.route('/')
    .post(createEtiquettePartenaire)
    .get(getEtiquettePartenaires);

router.route('/:id')
    .get(getEtiquettePartenaireById)
    .put(updateEtiquettePartenaire)
    .delete(deleteEtiquettePartenaire);

module.exports = router;
