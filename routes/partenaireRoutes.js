const express = require('express');
const {
    createPartenaire,
    getPartenaires,
    getPartenaireById,
    updatePartenaire,
    deletePartenaire
} = require('../controllers/partenaireController');

const router = express.Router();

router.route('/')
    .post(createPartenaire)
    .get(getPartenaires);

router.route('/:id')
    .get(getPartenaireById)
    .put(updatePartenaire)
    .delete(deletePartenaire);

module.exports = router;
