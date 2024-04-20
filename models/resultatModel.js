const mongoose = require('mongoose');

const resultatSchema = new mongoose.Schema({
    analyseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analyse',
        required: true,  // Liaison obligatoire avec une analyse
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,  // Liaison obligatoire avec un test
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,  // Liaison obligatoire avec un utilisateur (patient)
    },
    valeur: {
        type: String,
        required: true,  // Valeur du résultat du test, obligatoire
    },
    dernierResultatAnterieur: {
        valeur: String,  // Dernière valeur connue pour ce test pour ce patient
        date: Date       // Date du dernier résultat
    },
    interpretation: {
        type: String,
        default: '',  // Interprétation du résultat, facultative
    },
    valeurInterpretation: {
        type: String,
        default: '',  // Valeur détaillée pour l'interprétation, facultative
    },
    statutInterpretation: {
        type: Boolean,
        default: false  // Indique si l'interprétation a été validée
    },
    statutMachine: {
        type: Boolean,
        default: false  // Indiquequelle machine  a été validée
    },
    typePrelevement: {
        type: String,
        default: '',  // Type de prélèvement effectué, facultatif
    },
    datePrelevement: {
        type: Date,
        default: null  // Date à laquelle le prélèvement a été effectué, facultatif
    },
    remarque: {
        type: String,
        default: '',  // Remarques additionnelles sur le résultat, facultatif
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Utilisateur qui a mis à jour le résultat
        required: true  // Non obligatoire, selon votre gestion des accès
    }
}, { timestamps: true });  // Crée automatiquement les propriétés createdAt et updatedAt

const Resultat = mongoose.model('Resultat', resultatSchema);

module.exports = Resultat;
