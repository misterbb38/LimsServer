const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const {
    signup,
    login,
    getProfile,
    updateProfile,
    deleteUser,
    getSimpleUsers,
    getSimplePartenaireClinique,
    getNonPatientUsers,
    updateProfileUser,
    getPatientStatistics,
    getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Supposons que vous avez un middleware pour vérifier si l'utilisateur est admin



const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
// Ajoutez cette route dans votre fichier de routeurs, par exemple `userRoutes.js`
router.get('/patient-stats/:year?', protect, getPatientStatistics);
router.put('/profile', protect, upload.single('logo'), updateProfileUser);
router.get('/profile', protect, getProfile);
router.get('/simpleusers', protect, getSimpleUsers);
router.get('/partenaireclinique', protect, getSimplePartenaireClinique);
router.get('/personnel', protect, getNonPatientUsers);
router.route('/:id').
    get(protect, getUserById)
    .put(protect, updateProfile)
    .delete(protect, deleteUser);


module.exports = router