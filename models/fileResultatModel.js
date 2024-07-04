const mongoose = require('mongoose');

const fileResultatSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    originalname: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    analyseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analyse',
        required: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const FileResultat = mongoose.model('FileResultat', fileResultatSchema);

module.exports = FileResultat;
