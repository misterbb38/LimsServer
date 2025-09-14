// =================================================================
// SCRIPT D'INITIALISATION DES TEMPLATES - VERSION CORRIGÉE
// Fichier : scripts/initTemplates.js
// =================================================================

require('dotenv').config(); // Charger les variables d'environnement
const mongoose = require('mongoose');
const path = require('path');

// Importer le modèle depuis le bon chemin
const ReportTemplate = require('../models/reportTemplateModel');

// =================================================================
// CONNEXION À LA BASE DE DONNÉES
// =================================================================
const connectDB = async () => {
  try {
    // Utiliser la variable d'environnement ou valeur par défaut
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lims-database';
    
    console.log('🔗 Tentative de connexion à MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Masquer les credentials dans les logs
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connecté à MongoDB avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:');
    console.error('   Message:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('🚨 SOLUTIONS POSSIBLES :');
      console.error('   1. Vérifiez que MongoDB est démarré sur votre machine');
      console.error('   2. Sur Windows : Ouvrez Services et démarrez "MongoDB Server"');
      console.error('   3. Ou exécutez : net start MongoDB');
      console.error('   4. Vérifiez votre fichier .env');
      console.error('');
    }
    
    process.exit(1);
  }
};

// =================================================================
// TEMPLATES DE BASE
// =================================================================
const baseTemplates = [
  // Template pour tests simples
  {
    name: 'Glycémie',
    category: 'Biochimie',
    description: 'Template pour la glycémie',
    renderer: {
      type: 'SIMPLE_PARAMETER',
      config: {
        unit: 'g/L',
        reference: '0.70-1.10',
        style: {
          fontSize: 10,
          fontFamily: 'Times',
          showReference: true,
          showUnits: true
        }
      }
    },
    isActive: true,
    version: '1.0',
    createdBy: new mongoose.Types.ObjectId() // Générer un ObjectId temporaire
  },

  // Template pour NFS
  {
    name: 'Numération Formule Sanguine',
    category: 'Hématologie',
    description: 'Template complexe pour la NFS complète',
    renderer: {
      type: 'NFS_COMPLEX_TABLE',
      config: {
        style: {
          fontSize: 10,
          fontFamily: 'Times',
          showReference: true,
          showUnits: true
        }
      }
    },
    isActive: true,
    version: '1.0',
    createdBy: new mongoose.Types.ObjectId()
  },

  // Template pour Ionogramme
  {
    name: 'Ionogramme Sanguin',
    category: 'Biochimie',
    description: 'Template pour l\'ionogramme complet',
    renderer: {
      type: 'PARAMETER_GROUP',
      config: {
        title: 'IONOGRAMME SANGUIN',
        parameters: [
          {
            key: 'exceptions.ionogramme.na',
            label: 'Sodium (Na+)',
            unit: 'mEq/L',
            reference: '137-145'
          },
          {
            key: 'exceptions.ionogramme.k',
            label: 'Potassium (K+)',
            unit: 'mEq/L',
            reference: '3.5-5.0'
          },
          {
            key: 'exceptions.ionogramme.cl',
            label: 'Chlore (Cl-)',
            unit: 'mEq/L',
            reference: '98.0-107.0'
          },
          {
            key: 'exceptions.ionogramme.ca',
            label: 'Calcium (Ca2+)',
            unit: 'mEq/L',
            reference: '2.1-2.6'
          },
          {
            key: 'exceptions.ionogramme.mg',
            label: 'Magnésium (Mg2+)',
            unit: 'mEq/L',
            reference: '0.7-1.0'
          }
        ],
        style: {
          fontSize: 10,
          fontFamily: 'Times',
          showReference: true,
          showUnits: true
        }
      }
    },
    isActive: true,
    version: '1.0',
    createdBy: new mongoose.Types.ObjectId()
  },

  // Template pour Groupe Sanguin
  {
    name: 'Groupe Sanguin ABO/Rhésus',
    category: 'Immunohématologie',
    description: 'Template pour le groupage sanguin ABO et Rhésus',
    renderer: {
      type: 'BLOOD_GROUP',
      config: {
        style: {
          fontSize: 10,
          fontFamily: 'Times',
          showReference: false,
          showUnits: false
        }
      }
    },
    isActive: true,
    version: '1.0',
    createdBy: new mongoose.Types.ObjectId()
  },

  // Template pour QBC
  {
    name: 'Recherche de Parasites QBC',
    category: 'Parasitologie',
    description: 'Template pour la recherche de parasites par QBC',
    renderer: {
      type: 'QBC_PARASITES',
      config: {
        style: {
          fontSize: 10,
          fontFamily: 'Times',
          showReference: false,
          showUnits: true
        }
      }
    },
    isActive: true,
    version: '1.0',
    createdBy: new mongoose.Types.ObjectId()
  },

  // Template pour Culture
  {
    name: 'Culture Bactériologique',
    category: 'Bactériologie',
    description: 'Template pour les résultats de culture avec antibiogramme',
    renderer: {
      type: 'CULTURE_RESULTS',
      config: {
        style: {
          fontSize: 10,
          fontFamily: 'Times'
        }
      }
    },
    isActive: true,
    version: '1.0',
    createdBy: new mongoose.Types.ObjectId()
  },

  // Template pour HGPO
  {
    name: 'HGPO',
    category: 'Biochimie',
    description: 'Template pour l\'hyperglycémie provoquée par voie orale',
    renderer: {
      type: 'HGPO_RESULTS',
      config: {
        style: {
          fontSize: 10,
          fontFamily: 'Times',
          showReference: true,
          showUnits: true
        }
      }
    },
    isActive: true,
    version: '1.0',
    createdBy: new mongoose.Types.ObjectId()
  }
];

// =================================================================
// FONCTION D'INITIALISATION
// =================================================================
const initTemplates = async () => {
  try {
    console.log('🚀 Début de l\'initialisation des templates...');
    console.log('');
    
    // Optionnel : Supprimer les anciens templates
    // const deleteCount = await ReportTemplate.deleteMany({});
    // console.log(`🗑️  ${deleteCount.deletedCount} anciens templates supprimés`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    // Insérer les nouveaux templates
    for (const templateData of baseTemplates) {
      const existingTemplate = await ReportTemplate.findOne({ 
        name: templateData.name 
      });
      
      if (existingTemplate) {
        console.log(`⚠️  Template "${templateData.name}" existe déjà, ignoré`);
        skippedCount++;
        continue;
      }

      const template = new ReportTemplate(templateData);
      await template.save();
      console.log(`✅ Template "${templateData.name}" créé avec succès`);
      createdCount++;
    }

    console.log('');
    console.log('🎉 Initialisation terminée !');
    console.log(`📊 Résumé :`);
    console.log(`   - ${createdCount} templates créés`);
    console.log(`   - ${skippedCount} templates ignorés (déjà existants)`);
    
    // Afficher un résumé final
    const totalTemplates = await ReportTemplate.countDocuments();
    console.log(`   - ${totalTemplates} templates total en base`);
    
    // Afficher tous les templates
    console.log('');
    console.log('📋 Templates disponibles :');
    const allTemplates = await ReportTemplate.find({}, 'name category renderer.type').lean();
    allTemplates.forEach(template => {
      console.log(`   • ${template.name} (${template.category}) - Type: ${template.renderer.type}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    throw error;
  }
};

// =================================================================
// FONCTION DE TEST DE CONNEXION
// =================================================================
const testConnection = async () => {
  try {
    console.log('🧪 Test de connexion à la base de données...');
    
    // Test simple
    const adminResult = await mongoose.connection.db.admin().ping();
    console.log('✅ Ping base de données réussi :', adminResult);
    
    // Test d'écriture
    const testDoc = new ReportTemplate({
      name: 'TEST_TEMPLATE_' + Date.now(),
      category: 'Test',
      renderer: { type: 'SIMPLE_PARAMETER', config: {} },
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await testDoc.save();
    await ReportTemplate.deleteOne({ _id: testDoc._id });
    console.log('✅ Test écriture/suppression réussi');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message);
    throw error;
  }
};

// =================================================================
// SCRIPT PRINCIPAL
// =================================================================
const runScript = async () => {
  try {
    await connectDB();
    await testConnection();
    await initTemplates();
    
    console.log('');
    console.log('🎯 Prochaines étapes :');
    console.log('   1. Démarrez votre serveur : npm start');
    console.log('   2. Testez la génération PDF : GET /api/pdf/analyse/{analyseId}');
    console.log('   3. Vérifiez les logs du serveur');
    console.log('');
    
  } catch (error) {
    console.error('💥 Échec du script:', error.message);
  } finally {
    process.exit(0);
  }
};

// =================================================================
// GESTION DES ARGUMENTS DE LIGNE DE COMMANDE
// =================================================================
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 AIDE - Script d'initialisation des templates

Usage: node scripts/initTemplates.js [options]

Options:
  --help, -h     Afficher cette aide
  --test, -t     Tester uniquement la connexion
  --reset, -r    Supprimer tous les templates avant création
  --verbose, -v  Mode verbeux

Exemples:
  node scripts/initTemplates.js
  node scripts/initTemplates.js --test
  node scripts/initTemplates.js --reset
  `);
  process.exit(0);
}

if (args.includes('--test') || args.includes('-t')) {
  // Mode test uniquement
  connectDB()
    .then(testConnection)
    .then(() => {
      console.log('✅ Test de connexion réussi !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test de connexion échoué:', error.message);
      process.exit(1);
    });
} else {
  // Exécution normale
  if (require.main === module) {
    runScript();
  }
}

// Export pour utilisation dans d'autres fichiers
module.exports = { initTemplates, connectDB, testConnection };