const asyncHandler = require('express-async-handler');
const EtiquettePartenaire = require('../models/etiquettePartenaireModel');

// Créer une nouvelle étiquette partenaire
exports.createEtiquettePartenaire = asyncHandler(async (req, res) => {
    const { partenaireId, analyseId, sommeAPayer } = req.body;
    const etiquettePartenaire = await EtiquettePartenaire.create({
        partenaireId,
        analyseId,
        sommeAPayer
    });
    res.status(201).json({
        success: true,
        data: etiquettePartenaire
    });
});

// Obtenir toutes les étiquettes partenaires
exports.getEtiquettePartenaires = asyncHandler(async (req, res) => {
    const etiquettes = await EtiquettePartenaire.find()
        .populate('partenaireId', 'nom typePartenaire')
        .populate('analyseId', 'identifiant ');
    res.status(200).json({
        success: true,
        count: etiquettes.length,
        data: etiquettes
    });
});

// Obtenir une étiquette partenaire par ID
exports.getEtiquettePartenaireById = asyncHandler(async (req, res) => {
    const etiquette = await EtiquettePartenaire.findById(req.params.id)
        .populate('partenaireId', 'nom typePartenaire')
        .populate('analyseId', 'identifiant ');
    if (!etiquette) {
        res.status(404);
        throw new Error('Etiquette partenaire non trouvée');
    }
    res.status(200).json({
        success: true,
        data: etiquette
    });
});

// Mettre à jour une étiquette partenaire
exports.updateEtiquettePartenaire = asyncHandler(async (req, res) => {
    const etiquette = await EtiquettePartenaire.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!etiquette) {
        res.status(404);
        throw new Error('Etiquette partenaire non trouvée');
    }
    res.status(200).json({
        success: true,
        data: etiquette
    });
});

// Supprimer une étiquette partenaire
exports.deleteEtiquettePartenaire = asyncHandler(async (req, res) => {
    const etiquette = await EtiquettePartenaire.findByIdAndDelete(req.params.id);
    if (!etiquette) {
        res.status(404);
        throw new Error('Etiquette partenaire non trouvée');
    }
    res.status(200).json({
        success: true,
        data: {}
    });
});
