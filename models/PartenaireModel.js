const mongoose = require('mongoose');

const PartenaireSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    telephone: String,
    typePartenaire: {
        type: String,
        required: true,
        enum: ['assurance', 'ipm', 'sococim', 'clinique'],
    },
    // NIP : identifiant unique permettant a la clinique partenaire
    // d'acceder a son tableau de bord et de consulter les resultats de
    // ses patients. Optionnel (les assurances / IPM / Sococim n'en ont
    // pas) ; unique grace a l'index sparse.
    nip: {
        type: String,
        unique: true,
        sparse: true,
    },

    // Autres champs pertinents pour le partenaire...
}, { timestamps: true });

module.exports = mongoose.model('Partenaire', PartenaireSchema);
