const mongoose = require('mongoose');

// Référence de facture partenaire saisie manuellement.
//
// La référence est enregistrée UNE SEULE FOIS par partenaire et par
// période (mois/annee) : les impressions suivantes de la même facture
// réutilisent la même référence au lieu d'en générer une nouvelle
// (une référence différente à chaque impression causerait des
// incohérences comptables côté partenaire).
const factureReferenceSchema = new mongoose.Schema(
    {
        partenaireId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partenaire',
            required: true,
        },
        // Période de la facture ('' si facture générée sans filtre).
        mois: { type: String, default: '' },
        annee: { type: String, default: '' },
        reference: { type: String, required: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// Une seule référence par partenaire + période.
factureReferenceSchema.index(
    { partenaireId: 1, mois: 1, annee: 1 },
    { unique: true }
);

module.exports = mongoose.model('FactureReference', factureReferenceSchema);
