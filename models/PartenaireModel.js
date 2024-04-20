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
        enum: ['assurance', 'ipm', 'sococim'],
    }


    // Autres champs pertinents pour le partenaire...
}, { timestamps: true });

module.exports = mongoose.model('Partenaire', PartenaireSchema);
