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
    }
}, { timestamps: true });

module.exports = mongoose.model('EtiquettePartenaire', EtiquettePartenaireSchema);
