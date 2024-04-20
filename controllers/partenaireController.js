const asyncHandler = require('express-async-handler');
const Partenaire = require('../models/PartenaireModel');

// Créer un nouveau partenaire
exports.createPartenaire = asyncHandler(async (req, res) => {
    const { nom, telephone, typePartenaire } = req.body;
    const partenaire = await Partenaire.create({
        nom,
        typePartenaire,
        telephone,


    });
    res.status(201).json({
        success: true,
        data: partenaire
    });
});

// Obtenir tous les partenaires
exports.getPartenaires = asyncHandler(async (req, res) => {
    const partenaires = await Partenaire.find();
    res.status(200).json({
        success: true,
        count: partenaires.length,
        data: partenaires
    });
});

// Obtenir un partenaire par ID
exports.getPartenaireById = asyncHandler(async (req, res) => {
    const partenaire = await Partenaire.findById(req.params.id);
    if (!partenaire) {
        res.status(404);
        throw new Error('Partenaire non trouvé');
    }
    res.status(200).json({
        success: true,
        data: partenaire
    });
});

// Mettre à jour un partenaire
exports.updatePartenaire = asyncHandler(async (req, res) => {
    const partenaire = await Partenaire.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!partenaire) {
        res.status(404);
        throw new Error('Partenaire non trouvé');
    }
    res.status(200).json({
        success: true,
        data: partenaire
    });
});

// Supprimer un partenaire
exports.deletePartenaire = asyncHandler(async (req, res) => {
    const partenaire = await Partenaire.findByIdAndDelete(req.params.id);
    if (!partenaire) {
        res.status(404);
        throw new Error('Partenaire non trouvé');
    }
    res.status(200).json({
        success: true,
        data: {}
    });
});
