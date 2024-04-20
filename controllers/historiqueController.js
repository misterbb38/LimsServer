const asyncHandler = require('../middleware/async');
const Historique = require('../models/historiqueModel'); // Assurez-vous que le chemin vers votre modèle est correct
const Analyse = require('../models/analyseModel');
// Créer un nouvel historique
exports.createHistorique = asyncHandler(async (req, res) => {
    const { analyseId, status, description, updatedBy } = req.body;

    const historique = await Historique.create({
        analyseId,
        status,
        description,
        updatedBy // Assurez-vous que ce champ est fourni par le contexte d'authentification ou passé explicitement
    });

    // Trouver l'analyse correspondante et ajouter l'ID de l'historique au tableau d'historiques
    const analyse = await Analyse.findById(analyseId);
    if (!analyse) {
        res.status(404);
        throw new Error('Analyse non trouvée');
    }

    // Ajoutez l'historique à l'analyse
    analyse.historiques.push(historique._id);
    await analyse.save(); // Sauvegardez les modifications sur l'analyse

    // Répondre avec le nouvel historique créé
    res.status(201).json({ success: true, data: historique });

});

// Obtenir tous les historiques
exports.getHistoriques = asyncHandler(async (req, res) => {
    const historiques = await Historique.find()
        .populate('analyseId')
        .populate('updatedBy', 'nom prenom email')
    res.status(200).json({ success: true, count: historiques.length, data: historiques });
});

// Obtenir un historique spécifique par ID
exports.getHistorique = asyncHandler(async (req, res) => {
    const historique = await Historique.findById(req.params.id).populate('analyseId  updatedBy', 'nom prenom email');

    if (!historique) {
        res.status(404);
        throw new Error('Historique non trouvé');
    }

    res.status(200).json({ success: true, data: historique });
});

// Mettre à jour un historique
exports.updateHistorique = asyncHandler(async (req, res) => {
    let historique = await Historique.findById(req.params.id);

    if (!historique) {
        res.status(404);
        throw new Error('Historique non trouvé');
    }

    historique = await Historique.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: historique });
});

// Supprimer un historique
exports.deleteHistorique = asyncHandler(async (req, res) => {
    const historique = await Historique.findByIdAndDelete(req.params.id);

    if (!historique) {
        res.status(404);
        throw new Error('Historique non trouvé');
    }


    res.status(200).json({ success: true, data: {} });
});
