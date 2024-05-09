const asyncHandler = require('express-async-handler');
const Partenaire = require('../models/PartenaireModel');
const readExcelFile = require('read-excel-file/node');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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

// Importation des partenaires à partir d'un fichier Excel
exports.importPartenairesFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Aucun fichier n'a été téléchargé.");
    }

    const filePath = req.file.path; // Chemin du fichier Excel téléchargé

    readExcelFile(filePath).then(async (rows) => {
        // Supposons que la première ligne contient les en-têtes
        const partenaires = rows.slice(1).map(row => ({
            nom: row[0], // Première colonne pour le nom
            telephone: row[1], // Deuxième colonne pour le téléphone
            typePartenaire: row[2] // Troisième colonne pour le type de partenaire
        }));

        await Partenaire.insertMany(partenaires);

        res.status(200).json({
            success: true,
            message: "Les partenaires ont été importés avec succès",
            data: partenaires.length
        });
    }).catch(error => {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la lecture du fichier Excel",
            error: error.toString()
        });
    });
});
