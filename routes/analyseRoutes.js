const express = require('express');
const upload = require('../middleware/multer');

// Importation des fonctions du contrôleur d'analyse
const {
    createAnalyse,
    getAnalyses,
    getAnalysesPatient,
    getAnalyse,
    updateAnalyse,
    deleteAnalyse,
    getTestIdsByAnalyse,
    getTopTests,
    getAnalysesCountByMonth,
    getTestUsageByMonth,

} = require('../controllers/analyseController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();



router.get('/:analyseId/tests', getTestIdsByAnalyse);
// Définir la route pour obtenir l'utilisation des tests par mois
router.get('/testusageparmois', getTestUsageByMonth);
router.get('/analyses-per-month', getAnalysesCountByMonth);
router.get('/analyseparmois', getAnalysesCountByMonth);
router.get('/toptests', getTopTests);
router.get('/patient', protect, getAnalysesPatient);



// Route pour créer une nouvelle analyse et obtenir toutes les analyses
router.route('/')
    .post(upload.single('ordonnancePdf'), createAnalyse) // Prend en charge le téléchargement de l'ordonnance PDF
    .get(getAnalyses)


// Routes pour obtenir, mettre à jour, et supprimer une analyse spécifique par son ID
router.route('/:id')
    .get(getAnalyse)
    .put(upload.single('ordonnancePdf'), updateAnalyse) // Prend en charge la mise à jour de l'ordonnance PDF
    .delete(deleteAnalyse);

module.exports = router;
