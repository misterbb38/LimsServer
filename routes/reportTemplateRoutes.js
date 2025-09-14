const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getTemplateForTest,
  createDefaultTemplates,
  duplicateTemplate
} = require('../controllers/reportTemplateController');

const router = express.Router();

/**
 * @route   GET/POST /api/report-templates
 * @desc    Obtenir tous les templates / Créer un nouveau template
 * @access  Private
 */
router.route('/')
  .get(protect, getAllTemplates)
  .post(protect, createTemplate);

/**
 * @route   POST /api/report-templates/create-defaults
 * @desc    Créer les templates par défaut
 * @access  Private (Admin only)
 */
router.post('/create-defaults', protect,  createDefaultTemplates);

/**
 * @route   GET /api/report-templates/for-test/:testName
 * @desc    Obtenir le template approprié pour un test
 * @access  Private
 */
router.get('/for-test/:testName', protect, getTemplateForTest);

/**
 * @route   GET/PUT/DELETE /api/report-templates/:id
 * @desc    Obtenir/Mettre à jour/Supprimer un template par ID
 * @access  Private
 */
router.route('/:id')
  .get(protect, getTemplateById)
  .put(protect, updateTemplate)
  .delete(protect, deleteTemplate);

/**
 * @route   POST /api/report-templates/:id/duplicate
 * @desc    Dupliquer un template
 * @access  Private
 */
router.post('/:id/duplicate', protect, duplicateTemplate);

module.exports = router;