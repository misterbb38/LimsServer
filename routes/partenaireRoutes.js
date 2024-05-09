const express = require('express');
const {
    createPartenaire,
    getPartenaires,
    getPartenaireById,
    updatePartenaire,
    deletePartenaire,
    importPartenairesFromExcel
} = require('../controllers/partenaireController');

const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/import', upload.single('file'), protect, importPartenairesFromExcel);

router.route('/')
    .post(createPartenaire)
    .get(getPartenaires);

router.route('/:id')
    .get(getPartenaireById)
    .put(updatePartenaire)
    .delete(deletePartenaire);

module.exports = router;
