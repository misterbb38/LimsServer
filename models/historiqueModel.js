const mongoose = require('mongoose');

const HistoriqueSchema = new mongoose.Schema({
    analyseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analyse', // Référence à l'Analyse

    },
    status: {
        type: String,
        enum: ["Modification", "Création", "En attente", "Approuvé", "Échantillon collecté", "salle de prelevement", "Livré au laboratoire", "Validé", "Annulé", " "],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    updatedBy: { // Utilisateur qui a effectué la mise à jour
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true }); // Activation de l'option timestamps

module.exports = mongoose.model('Historique', HistoriqueSchema);
