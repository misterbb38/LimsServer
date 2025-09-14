// const mongoose = require('mongoose');

// const reportTemplateSchema = new mongoose.Schema({
//   // Identification du template
//   name: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   category: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
  
//   // Configuration du rendu
//   renderer: {
//     type: {
//       type: String,
//       enum: [
//         'SIMPLE_PARAMETER',    // Test simple avec valeur + unité
//         'NFS_COMPLEX_TABLE',   // NFS avec tableaux complexes
//         'PARAMETER_GROUP',     // Groupe de paramètres (ionogramme, etc.)
//         'CULTURE_RESULTS',     // Résultats de culture avec antibiogramme
//         'OBSERVATIONS_DETAILED', // Observations macros/micros
//         'QBC_PARASITES',       // QBC avec parasites
//         'BLOOD_GROUP'          // Groupe sanguin
//       ],
//       required: true
//     },
    
//     // Configuration spécifique selon le type
//     config: {
//       // Pour SIMPLE_PARAMETER
//       unit: String,
//       reference: String,
      
//       // Pour PARAMETER_GROUP
//       title: String,
//       parameters: [{
//         key: String,        // Chemin vers la valeur dans les données
//         label: String,      // Libellé affiché
//         unit: String,       // Unité
//         reference: String,  // Valeurs de référence
//         format: String      // Format d'affichage (optionnel)
//       }],
      
//       // Pour les types complexes
//       sections: [{
//         title: String,
//         type: String,
//         parameters: mongoose.Schema.Types.Mixed
//       }],
      
//       // Configuration du style
//       style: {
//         fontSize: { type: Number, default: 10 },
//         fontFamily: { type: String, default: 'Times' },
//         showReference: { type: Boolean, default: true },
//         showUnits: { type: Boolean, default: true }
//       }
//     }
//   },
  
//   // Métadonnées
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   version: {
//     type: String,
//     default: '1.0'
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// }, {
//   timestamps: true
// });

// // Index pour les recherches
// reportTemplateSchema.index({ name: 1 });
// reportTemplateSchema.index({ category: 1 });
// reportTemplateSchema.index({ 'renderer.type': 1 });

// const ReportTemplate = mongoose.model('ReportTemplate', reportTemplateSchema);
// module.exports = ReportTemplate;



const mongoose = require('mongoose');

const reportTemplateSchema = new mongoose.Schema({
  // Identification
  name: {
    type: String,
    required: true,
    unique: true
  },
  testName: {
    type: String, // Nom exact du test (pour le matching)
    required: true
  },
  category: {
    type: String,
    required: true
  },
  
  // Configuration de rendu
  renderer: {
    type: {
      type: String,
      enum: [
        'SIMPLE_PARAMETER',
        'NFS_COMPLEX_TABLE', 
        'PARAMETER_GROUP',
        'CULTURE_RESULTS',
        'OBSERVATIONS_DETAILED',
        'QBC_PARASITES',
        'BLOOD_GROUP',
        'HGPO_RESULTS',
        'IONOGRAMME'
      ],
      required: true
    },
    
    // Configuration détaillée par type
    config: {
      // Pour SIMPLE_PARAMETER
      simpleConfig: {
        showValue: { type: Boolean, default: true },
        showUnit: { type: Boolean, default: true },
        showReference: { type: Boolean, default: true },
        showQualitative: { type: Boolean, default: true },
        showMethod: { type: Boolean, default: false },
        showInterpretation: { type: Boolean, default: false },
        valueFormat: { type: String, default: 'decimal' }, // decimal, integer, text
        valuePath: { type: String, default: 'valeur' }, // Chemin vers la valeur
        unitPath: { type: String, default: 'testId.unite' },
        referencePath: { type: String, default: 'testId.valeurMachineA' }
      },
      
      // Pour PARAMETER_GROUP (ionogramme, etc.)
      groupConfig: {
        title: String,
        showTable: { type: Boolean, default: true },
        parameters: [{
          key: String,        // exceptions.ionogramme.na
          label: String,      // "Sodium (Na+)"
          unit: String,       // "mEq/L"
          reference: String,  // "137-145"
          format: String,     // "decimal", "integer"
          required: { type: Boolean, default: false },
          order: { type: Number, default: 0 }
        }]
      },
      
      // Pour NFS
      nfsConfig: {
        showHematies: { type: Boolean, default: true },
        showLeucocytes: { type: Boolean, default: true },
        showPlaquettes: { type: Boolean, default: true },
        showAutres: { type: Boolean, default: true },
        calculateIndices: { type: Boolean, default: true }, // VGM, TCMH, CCMH
        hematiesParams: [{
          key: String,      // "gr", "hgb", "hct"
          label: String,    // "Hématies"
          show: { type: Boolean, default: true },
          order: Number
        }],
        leucocytesParams: [{
          key: String,      // "neut", "lymph"
          label: String,    // "Neutrophiles"
          showValue: { type: Boolean, default: true },
          showPercentage: { type: Boolean, default: true },
          order: Number
        }]
      },
      
      // Pour QBC
      qbcConfig: {
        showPositivite: { type: Boolean, default: true },
        showCroix: { type: Boolean, default: true },
        showDensite: { type: Boolean, default: true },
        showEspeces: { type: Boolean, default: true },
        croixSymbol: { type: String, default: '+' }
      },
      
      // Pour OBSERVATIONS
      observationsConfig: {
        showMacroscopique: { type: Boolean, default: true },
        showMicroscopique: { type: Boolean, default: true },
        showChimie: { type: Boolean, default: true },
        showGram: { type: Boolean, default: true },
        showConclusion: { type: Boolean, default: true },
        microscopiqueParams: [{
          key: String,
          label: String,
          show: { type: Boolean, default: true },
          showUnit: { type: Boolean, default: true },
          order: Number
        }]
      },
      
      // Pour CULTURE
      cultureConfig: {
        showCulture: { type: Boolean, default: true },
        showGermes: { type: Boolean, default: true },
        showDescription: { type: Boolean, default: true },
        showAntibiogramme: { type: Boolean, default: true },
        antibiogrammeLayout: { type: String, default: 'table' } // table, list
      },
      
      // Style commun
      style: {
        fontSize: { type: Number, default: 10 },
        fontFamily: { type: String, default: 'Times' },
        fontWeight: { type: String, default: 'normal' },
        showBorders: { type: Boolean, default: true },
        backgroundColor: { type: String, default: '#ffffff' },
        textColor: { type: String, default: '#000000' }
      }
    }
  },
  
  // Conditions d'application
  conditions: {
    testCategories: [String], // Catégories de tests concernées
    testNames: [String],      // Noms exacts des tests
    hasExceptions: [String],  // Si contient exceptions.nfs, exceptions.qbc, etc.
    hasObservations: { type: Boolean, default: false },
    hasCulture: { type: Boolean, default: false }
  },
  
  // Métadonnées
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  priority: { type: Number, default: 0 }, // Plus haute priorité = appliqué en premier
  version: { type: String, default: '1.0' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  laboratory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laboratory' // Si multi-laboratoire
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
reportTemplateSchema.index({ testName: 1 });
reportTemplateSchema.index({ category: 1 });
reportTemplateSchema.index({ 'renderer.type': 1 });
reportTemplateSchema.index({ 'conditions.testNames': 1 });
reportTemplateSchema.index({ priority: -1 });

// Méthode pour trouver le template approprié
reportTemplateSchema.statics.findTemplateForTest = async function(testName, category, hasExceptions, hasObservations, hasCulture) {
  const conditions = {
    isActive: true,
    $or: [
      { 'conditions.testNames': testName },
      { 'conditions.testCategories': category },
      { testName: testName }
    ]
  };
  
  // Ajouter des conditions spécifiques
  if (hasExceptions && hasExceptions.length > 0) {
    conditions['conditions.hasExceptions'] = { $in: hasExceptions };
  }
  
  if (hasObservations) {
    conditions['conditions.hasObservations'] = true;
  }
  
  if (hasCulture) {
    conditions['conditions.hasCulture'] = true;
  }
  
  return await this.findOne(conditions).sort({ priority: -1 });
};

const ReportTemplate = mongoose.model('ReportTemplate', reportTemplateSchema);
module.exports = ReportTemplate;