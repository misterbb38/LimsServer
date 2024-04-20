const express = require('express');
const {
    createEtiquettePartenaire,
    getEtiquettePartenaires,
    getEtiquettePartenaireById,
    updateEtiquettePartenaire,
    deleteEtiquettePartenaire
} = require('../controllers/etiquettePartenaireController');

const router = express.Router();

router.route('/')
    .post(createEtiquettePartenaire)
    .get(getEtiquettePartenaires);

router.route('/:id')
    .get(getEtiquettePartenaireById)
    .put(updateEtiquettePartenaire)
    .delete(deleteEtiquettePartenaire);

module.exports = router;
