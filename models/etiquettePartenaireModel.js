const mongoose = require('mongoose');

const EtiquettePartenaireSchema = new mongoose.Schema({
    analyseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analyse',
        required: true
    },
    partenaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partenaire',
        required: true
    },
    sommeAPayer: {
        type: Number,
        required: true
    },
    // Statut de paiement de la facture partenaire. Distinct du
    // statusPayement de l'Analyse (qui couvre la part patient).
    // L'utilisateur peut le passer manuellement a 'Payée' depuis la
    // page Ettiquette / Facture(Partenaire) quand le partenaire a
    // regle sa part.
    statusPayement: {
        type: String,
        enum: ['Impayée', 'Payée'],
        default: 'Impayée',
    },
    datePayement: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('EtiquettePartenaire', EtiquettePartenaireSchema);
