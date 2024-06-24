const asyncHandler = require('express-async-handler');
const EtiquettePartenaire = require('../models/etiquettePartenaireModel');
const mongoose = require('mongoose');

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


// Fichier : controllers/etiquettePartenaireController.js

// Fichier : controllers/etiquettePartenaireController.js



exports.getEtiquettesStats = asyncHandler(async (req, res) => {
    const { year, partenaireId } = req.query;

    let matchQuery = {};
    if (year) {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }
    if (partenaireId) {
        // Utilisez le mot-clé `new` pour créer un ObjectId
        matchQuery.partenaireId = new mongoose.Types.ObjectId(partenaireId);
    }

    const stats = await EtiquettePartenaire.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    partenaire: "$partenaireId"
                },
                totalSomme: { $sum: "$sommeAPayer" },
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "partenaires", // Assurez-vous que ce nom de collection est correct selon votre base de données MongoDB
                localField: "_id.partenaire",
                foreignField: "_id",
                as: "partenaireDetails"
            }
        },
        {
            $unwind: {
                path: "$partenaireDetails",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $sort: { "_id.month": 1 }
        },
        {
            $project: {
                month: "$_id.month",
                partenaire: "$partenaireDetails.nom",
                totalSomme: 1,
                count: 1,
                telephone: "$partenaireDetails.telephone",
                typePartenaire: "$partenaireDetails.typePartenaire"
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats
    });
});


// Contrôleur pour obtenir les étiquettes de chaque partenaire filtrables par mois et par année



// exports.getEtiquettesByPartenaire = asyncHandler(async (req, res) => {
//     const { mois, annee } = req.query;

//     let matchQuery = {};

//     if (annee) {
//         const startDate = new Date(`${annee}-01-01`);
//         const endDate = new Date(`${annee}-12-31`);
//         matchQuery.createdAt = { $gte: startDate, $lte: endDate };
//     }

//     if (mois) {
//         matchQuery['$expr'] = {
//             $eq: [{ $month: "$createdAt" }, parseInt(mois, 10)]
//         };
//     }

//     const stats = await EtiquettePartenaire.aggregate([
//         { $match: matchQuery },
//         {
//             $lookup: {
//                 from: "partenaires",
//                 localField: "partenaireId",
//                 foreignField: "_id",
//                 as: "partenaireDetails"
//             }
//         },
//         {
//             $unwind: {
//                 path: "$partenaireDetails",
//                 preserveNullAndEmptyArrays: false
//             }
//         },
//         {
//             $lookup: {
//                 from: "analyses",
//                 localField: "analyseId",
//                 foreignField: "_id",
//                 as: "analyseDetails"
//             }
//         },
//         {
//             $unwind: {
//                 path: "$analyseDetails",
//                 preserveNullAndEmptyArrays: true
//             }
//         },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "analyseDetails.userId",
//                 foreignField: "_id",
//                 as: "userDetails"
//             }
//         },
//         {
//             $unwind: {
//                 path: "$userDetails",
//                 preserveNullAndEmptyArrays: true
//             }
//         },
//         {
//             $group: {
//                 _id: "$partenaireId",
//                 totalSomme: { $sum: "$sommeAPayer" },
//                 count: { $sum: 1 },
//                 etiquettes: {
//                     $push: {
//                         _id: "$_id",
//                         sommeAPayer: "$sommeAPayer",
//                         createdAt: "$createdAt",
//                         analyse: {
//                             _id: "$analyseDetails._id",
//                             identifiant: "$analyseDetails.identifiant",
//                             user: {
//                                 _id: "$userDetails._id",
//                                 nom: "$userDetails.nom",
//                                 prenom: "$userDetails.prenom",
//                                 identifiant: "$userDetails.identifiant"
//                             }
//                         },
//                         partenaireId: "$partenaireId"
//                     }
//                 },
//                 partenaireDetails: { $first: "$partenaireDetails" }
//             }
//         },
//         {
//             $project: {
//                 partenaireId: "$_id",
//                 partenaire: "$partenaireDetails.nom",
//                 totalSomme: 1,
//                 count: 1,
//                 etiquettes: 1,
//                 telephone: "$partenaireDetails.telephone",
//                 typePartenaire: "$partenaireDetails.typePartenaire"
//             }
//         }
//     ]);

//     res.status(200).json({
//         success: true,
//         data: stats
//     });
// });

exports.getEtiquettesByPartenaire = asyncHandler(async (req, res) => {
    const { mois, annee } = req.query;

    let matchQuery = {};

    if (annee) {
        const startDate = new Date(`${annee}-01-01`);
        const endDate = new Date(`${annee}-12-31`);
        matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (mois) {
        matchQuery['$expr'] = {
            $eq: [{ $month: "$createdAt" }, parseInt(mois, 10)]
        };
    }

    const stats = await EtiquettePartenaire.aggregate([
        { $match: matchQuery },
        {
            $lookup: {
                from: "partenaires",
                localField: "partenaireId",
                foreignField: "_id",
                as: "partenaireDetails"
            }
        },
        {
            $unwind: {
                path: "$partenaireDetails",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $lookup: {
                from: "analyses",
                localField: "analyseId",
                foreignField: "_id",
                as: "analyseDetails"
            }
        },
        {
            $unwind: {
                path: "$analyseDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "analyseDetails.userId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$partenaireId",
                totalSomme: { $sum: "$sommeAPayer" },
                count: { $sum: 1 },
                etiquettes: {
                    $push: {
                        _id: "$_id",
                        sommeAPayer: "$sommeAPayer",
                        createdAt: "$createdAt",
                        pourcentageCouverture: "$analyseDetails.pourcentageCouverture", // Ajouter ce champ
                        analyse: {
                            _id: "$analyseDetails._id",
                            identifiant: "$analyseDetails.identifiant",
                            user: {
                                _id: "$userDetails._id",
                                nom: "$userDetails.nom",
                                prenom: "$userDetails.prenom",
                                identifiant: "$userDetails.identifiant"
                            }
                        },
                        partenaireId: "$partenaireId"
                    }
                },
                partenaireDetails: { $first: "$partenaireDetails" }
            }
        },
        {
            $project: {
                partenaireId: "$_id",
                partenaire: "$partenaireDetails.nom",
                totalSomme: 1,
                count: 1,
                etiquettes: 1,
                telephone: "$partenaireDetails.telephone",
                typePartenaire: "$partenaireDetails.typePartenaire"
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats
    });
});


