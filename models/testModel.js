const mongoose = require('mongoose');

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
    // c est le methode du paramettre(une changement )
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
        type: String,
        required: false
    },
    interpretationB: {
        type: String,
        required: false
    },

}, {
    timestamps: true // Génère automatiquement les champs date_created et date_updated
});

// Création du modèle Mongoose à partir du schéma
const Test = mongoose.model('Test', testSchema);

module.exports = Test;
