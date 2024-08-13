// const mongoose = require('mongoose');

// // Définition du schéma pour les tests
// const testSchema = new mongoose.Schema({
//     nom: {
//         type: String,
//         required: [true, 'Le nom du test est obligatoire'],
//         trim: true
//     },
//     description: {
//         type: String,
//         required: [true, 'La description du test est obligatoire'],
//         trim: true
//     },
//     prixAssurance: {
//         type: Number,
//         required: [false, 'Le coût du test est obligatoire'],
//         min: [0, 'Le coût du test ne peut pas être négatif'],
//         default: 260,
//     },
//     prixIpm: {
//         type: Number,
//         required: [false, 'Le coût du test est obligatoire'],
//         min: [0, 'Le coût du test ne peut pas être négatif'],
//         default: 220,
//     },
//     prixSococim: {
//         type: Number,
//         required: [false, 'Le coût du test est obligatoire'],
//         min: [0, 'Le coût du test ne peut pas être négatif'],
//         default: 180,
//     },
//     prixPaf: {
//         type: Number,
//         required: [false, 'Le coût du test est obligatoire'],
//         min: [0, 'Le coût du test ne peut pas être négatif'],
//         default: 200,
//     },
//     prixClinique: {
//         type: Number,
//         required: [false, 'Le coût du test est obligatoire'],
//         min: [0, 'Le coût du test ne peut pas être négatif'],
//         default: 200,
//     },
//     coeficiantB: {
//         type: Number,
//         required: [true, 'Le coût du test est obligatoire'],
//         min: [0, 'Le coût du test ne peut pas être négatif']
//     },
//     status: {
//         type: Boolean,
//         required: [true, 'Le statut du test est obligatoire'],
//         default: true // Par défaut, les tests sont activés
//     },
//     // c est le matiere du paramettre(une changement )
//     categories: {
//         type: String,
//         required: false
//     },
//     conclusions: {
//         type: [String], // Tableau de chaînes pour stocker les conclusions possibles
//         required: false
//     },
//     machineA: {
//         type: String,
//         required: false
//     },
//     valeurMachineA: {
//         type: String,
//         required: false
//     },
//     machineB: {
//         type: String,
//         required: false
//     },
//     valeurMachineB: {
//         type: String,
//         required: false
//     },
//     interpretationA: {
//         type: String,
//         required: false
//     },
//     interpretationB: {
//         type: String,
//         required: false
//     },

// }, {
//     timestamps: true // Génère automatiquement les champs date_created et date_updated
// });

// // Création du modèle Mongoose à partir du schéma
// const Test = mongoose.model('Test', testSchema);

// module.exports = Test;

const mongoose = require('mongoose');

// Définition du sous-schéma pour les interprétations
const interpretationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'table'],
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Cela permet de stocker différents types de données (texte ou tableau)
        required: true
    }
});

// Définition du schéma pour les tests
const testSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du test est obligatoire'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La description du test est obligatoire'],
        trim: true
    },
    prixAssurance: {
        type: Number,
        required: [false, 'Le coût du test est obligatoire'],
        min: [0, 'Le coût du test ne peut pas être négatif'],
        default: 260,
    },
    prixIpm: {
        type: Number,
        required: [false, 'Le coût du test est obligatoire'],
        min: [0, 'Le coût du test ne peut pas être négatif'],
        default: 220,
    },
    prixSococim: {
        type: Number,
        required: [false, 'Le coût du test est obligatoire'],
        min: [0, 'Le coût du test ne peut pas être négatif'],
        default: 180,
    },
    prixPaf: {
        type: Number,
        required: [false, 'Le coût du test est obligatoire'],
        min: [0, 'Le coût du test ne peut pas être négatif'],
        default: 200,
    },
    prixClinique: {
        type: Number,
        required: [false, 'Le coût du test est obligatoire'],
        min: [0, 'Le coût du test ne peut pas être négatif'],
        default: 200,
    },
    coeficiantB: {
        type: Number,
        required: [true, 'Le coût du test est obligatoire'],
        min: [0, 'Le coût du test ne peut pas être négatif']
    },
    status: {
        type: Boolean,
        required: [true, 'Le statut du test est obligatoire'],
        default: true // Par défaut, les tests sont activés
    },
    categories: {
        type: String,
        required: false
    },
    conclusions: {
        type: [String], // Tableau de chaînes pour stocker les conclusions possibles
        required: false
    },
    machineA: {
        type: String,
        required: false
    },
    valeurMachineA: {
        type: String,
        required: false
    },
    machineB: {
        type: String,
        required: false
    },
    valeurMachineB: {
        type: String,
        required: false
    },
    interpretationA: {
        type: interpretationSchema, // Utilisation du sous-schéma pour stocker les données d'interprétation
        required: false
    },
    interpretationB: {
        type: interpretationSchema, // Utilisation du sous-schéma pour stocker les données d'interprétation
        required: false
    },

}, {
    timestamps: true // Génère automatiquement les champs date_created et date_updated
});

// Création du modèle Mongoose à partir du schéma
const Test = mongoose.model('Test', testSchema);

module.exports = Test;
