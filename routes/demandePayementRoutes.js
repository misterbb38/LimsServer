const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    previewDemande,
    createDemande,
    getDemandes,
    getDemandeById,
    updateDemande,
    deleteDemande,
} = require('../controllers/demandePayementController');

const router = express.Router();

router.get('/preview', protect, previewDemande);
router.post('/', protect, createDemande);
router.get('/', protect, getDemandes);
router.get('/:id', protect, getDemandeById);
router.put('/:id', protect, updateDemande);
router.delete('/:id', protect, deleteDemande);

module.exports = router;
