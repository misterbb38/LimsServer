const express = require('express');
// Importation des fonctions du contrôleur de test
const {
    getTests,
    createTest,
    deleteTest,
    updateTest,
    getTest,
    importTestsFromExcel
} = require('../controllers/testController');
// Middleware pour la protection des routes, si nécessaire
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Définition des routes pour les tests
router.route('/')
    .get(getTests) // Obtenir tous les tests, accessible publiquement
    .post(protect, createTest); // Créer un nouveau test, nécessite une authentification et peut-être des vérifications de rôles

router.route('/:id') // Utiliser l'ID du test pour les opérations CRUD spécifiques
    .get(getTest) // Obtenir un test spécifique par son ID, accessible publiquement
    .delete(protect, deleteTest) // Supprimer un test spécifique par son ID, nécessite une authentification et peut-être des vérifications de rôles
    .put(protect, updateTest); // Mettre à jour un test spécifique par son ID, nécessite une authentification et peut-être des vérifications de rôles

router.post('/import', upload.single('file'), protect, importTestsFromExcel);
module.exports = router;
