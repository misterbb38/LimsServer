const mongoose = require('mongoose');

// Demande de paiement adressee a un partenaire (assurance/IPM) pour
// une periode donnee. Regroupe les EtiquettePartenaire eligibles du
// partenaire sur l'intervalle [dateDebut, dateFin]. Quand la demande
// est marquee Payee, toutes les etiquettes incluses passent aussi
// en Payee automatiquement (cf. controller).
const DemandePayementSchema = new mongoose.Schema({
    partenaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partenaire',
        required: true,
    },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },

    // Etiquettes (factures partenaire individuelles) incluses
    etiquettes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EtiquettePartenaire',
    }],

    sommeTotale: { type: Number, required: true, default: 0 },
    nombreFactures: { type: Number, required: true, default: 0 },

    statusPayement: {
        type: String,
        enum: ['Impayée', 'Payée'],
        default: 'Impayée',
    },
    datePayement: { type: Date },

    // Reference autogeneree pour l'identification (DP-AAAAMMJJ-NNN)
    reference: { type: String, unique: true, sparse: true },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    note: String,
}, { timestamps: true });

DemandePayementSchema.index({ partenaireId: 1, createdAt: -1 });
DemandePayementSchema.index({ statusPayement: 1, createdAt: -1 });

module.exports = mongoose.model('DemandePayement', DemandePayementSchema);
