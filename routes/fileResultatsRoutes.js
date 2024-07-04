const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const fileResultatMulter = require('../middleware/fileResultatMulter');

const {
    uploadFile,
    getFileById,
    updateFile,
    deleteFile
} = require('../controllers/fileResultatController');

const router = express.Router();

router.route('/')
    .post(protect, fileResultatMulter.single('file'), uploadFile);
    

router.route('/:id')
    .get(protect, getFileById)
    .put(protect, fileResultatMulter.single('file'), updateFile)
    .delete(protect, deleteFile);

module.exports = router;
