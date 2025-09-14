const asyncHandler = require('express-async-handler');
const ReportTemplate = require('../models/reportTemplateModel');

/**
 * @desc    Créer un nouveau template
 * @route   POST /api/report-templates
 * @access  Private
 */
exports.createTemplate = asyncHandler(async (req, res) => {
  const templateData = {
    ...req.body,
    createdBy: req.user._id
  };

  const template = await ReportTemplate.create(templateData);
  
  res.status(201).json({
    success: true,
    data: template
  });
});

/**
 * @desc    Obtenir tous les templates
 * @route   GET /api/report-templates
 * @access  Private
 */
exports.getAllTemplates = asyncHandler(async (req, res) => {
  const { category, rendererType, isActive } = req.query;
  
  let filter = {};
  if (category) filter.category = category;
  if (rendererType) filter['renderer.type'] = rendererType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const templates = await ReportTemplate.find(filter)
    .populate('createdBy', 'nom prenom')
    .sort({ category: 1, priority: -1 });

  res.status(200).json({
    success: true,
    count: templates.length,
    data: templates
  });
});

/**
 * @desc    Obtenir un template par ID
 * @route   GET /api/report-templates/:id
 * @access  Private
 */
exports.getTemplateById = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findById(req.params.id)
    .populate('createdBy', 'nom prenom');

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouvé'
    });
  }

  res.status(200).json({
    success: true,
    data: template
  });
});

/**
 * @desc    Mettre à jour un template
 * @route   PUT /api/report-templates/:id
 * @access  Private
 */
exports.updateTemplate = asyncHandler(async (req, res) => {
  let template = await ReportTemplate.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouvé'
    });
  }

  template = await ReportTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: template
  });
});

/**
 * @desc    Supprimer un template
 * @route   DELETE /api/report-templates/:id
 * @access  Private
 */
exports.deleteTemplate = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouvé'
    });
  }

  await template.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Template supprimé'
  });
});

/**
 * @desc    Obtenir le template approprié pour un test
 * @route   GET /api/report-templates/for-test/:testName
 * @access  Private
 */
exports.getTemplateForTest = asyncHandler(async (req, res) => {
  const { testName } = req.params;
  const { category, hasExceptions, hasObservations, hasCulture } = req.query;

  const exceptionsArray = hasExceptions ? hasExceptions.split(',') : [];

  const template = await ReportTemplate.findTemplateForTest(
    testName,
    category,
    exceptionsArray,
    hasObservations === 'true',
    hasCulture === 'true'
  );

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Aucun template trouvé pour ce test'
    });
  }

  res.status(200).json({
    success: true,
    data: template
  });
});

/**
 * @desc    Créer des templates par défaut
 * @route   POST /api/report-templates/create-defaults
 * @access  Private (Admin only)
 */
exports.createDefaultTemplates = asyncHandler(async (req, res) => {
  const defaultTemplates = [
    {
      name: 'NFS Standard',
      testName: 'NFS',
      category: 'Hématologie',
      renderer: {
        type: 'NFS_COMPLEX_TABLE',
        config: {
          nfsConfig: {
            showHematies: true,
            showLeucocytes: true,
            showPlaquettes: true,
            showAutres: true,
            calculateIndices: true,
            hematiesParams: [
              { key: 'gr', label: 'Hématies', show: true, order: 1 },
              { key: 'hgb', label: 'Hémoglobine', show: true, order: 2 },
              { key: 'hct', label: 'Hématocrite', show: true, order: 3 },
              { key: 'vgm', label: 'VGM', show: true, order: 4 },
              { key: 'tcmh', label: 'TCMH', show: true, order: 5 },
              { key: 'ccmh', label: 'CCMH', show: true, order: 6 },
              { key: 'idr_cv', label: 'IDR-CV', show: true, order: 7 }
            ],
            leucocytesParams: [
              { key: 'gb', label: 'Leucocytes', showValue: true, showPercentage: false, order: 1 },
              { key: 'neut', label: 'Neutrophiles', showValue: true, showPercentage: true, order: 2 },
              { key: 'lymph', label: 'Lymphocytes', showValue: true, showPercentage: true, order: 3 },
              { key: 'mono', label: 'Monocytes', showValue: true, showPercentage: true, order: 4 },
              { key: 'eo', label: 'Eosinophiles', showValue: true, showPercentage: true, order: 5 },
              { key: 'baso', label: 'Basophiles', showValue: true, showPercentage: true, order: 6 },
              { key: 'plt', label: 'Plaquettes', showValue: true, showPercentage: false, order: 7 }
            ]
          }
        }
      },
      conditions: {
        testNames: ['NFS', 'Numération Formule Sanguine'],
        hasExceptions: ['nfs']
      },
      isDefault: true,
      priority: 10,
      createdBy: req.user._id
    },
    {
      name: 'QBC Standard',
      testName: 'QBC',
      category: 'Parasitologie',
      renderer: {
        type: 'QBC_PARASITES',
        config: {
          qbcConfig: {
            showPositivite: true,
            showCroix: true,
            showDensite: true,
            showEspeces: true,
            croixSymbol: '+'
          }
        }
      },
      conditions: {
        testNames: ['QBC', 'Quantitative Buffy Coat'],
        hasExceptions: ['qbc']
      },
      isDefault: true,
      priority: 10,
      createdBy: req.user._id
    },
    {
      name: 'Ionogramme Standard',
      testName: 'Ionogramme',
      category: 'Biochimie',
      renderer: {
        type: 'PARAMETER_GROUP',
        config: {
          groupConfig: {
            title: 'IONOGRAMME',
            showTable: true,
            parameters: [
              { key: 'exceptions.ionogramme.na', label: 'Sodium (Na+)', unit: 'mEq/L', reference: '137-145', format: 'decimal', order: 1 },
              { key: 'exceptions.ionogramme.k', label: 'Potassium (K+)', unit: 'mEq/L', reference: '3.5-5.0', format: 'decimal', order: 2 },
              { key: 'exceptions.ionogramme.cl', label: 'Chlore (Cl-)', unit: 'mEq/L', reference: '98-107', format: 'decimal', order: 3 },
              { key: 'exceptions.ionogramme.ca', label: 'Calcium (Ca2+)', unit: 'mg/L', reference: '8.5-10.5', format: 'decimal', order: 4 },
              { key: 'exceptions.ionogramme.mg', label: 'Magnésium (Mg2+)', unit: 'mg/L', reference: '1.8-2.4', format: 'decimal', order: 5 }
            ]
          }
        }
      },
      conditions: {
        testNames: ['Ionogramme'],
        hasExceptions: ['ionogramme']
      },
      isDefault: true,
      priority: 10,
      createdBy: req.user._id
    }
  ];

  const createdTemplates = await ReportTemplate.insertMany(defaultTemplates);

  res.status(201).json({
    success: true,
    message: 'Templates par défaut créés',
    data: createdTemplates
  });
});

/**
 * @desc    Dupliquer un template
 * @route   POST /api/report-templates/:id/duplicate
 * @access  Private
 */
exports.duplicateTemplate = asyncHandler(async (req, res) => {
  const originalTemplate = await ReportTemplate.findById(req.params.id);

  if (!originalTemplate) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouvé'
    });
  }

  const duplicatedTemplate = new ReportTemplate({
    ...originalTemplate.toObject(),
    _id: undefined,
    name: `${originalTemplate.name} (Copie)`,
    isDefault: false,
    priority: 0,
    createdBy: req.user._id,
    createdAt: undefined,
    updatedAt: undefined
  });

  await duplicatedTemplate.save();

  res.status(201).json({
    success: true,
    data: duplicatedTemplate
  });
});