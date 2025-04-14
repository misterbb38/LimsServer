
const asyncHandler = require('express-async-handler');
const FileResultat = require('../models/fileResultatModel');
const Analyse = require('../models/analyseModel');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');
const path = require('path');

// Fonction pour ajouter un nouveau fichier résultat
exports.uploadFile = asyncHandler(async (req, res) => {
    const { analyseId, patientId, updatedBy } = req.body;
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'resultatExterne',
        use_filename: true,
        unique_filename: false,
        type: 'upload'
    });

    const file = new FileResultat({
        filename: result.public_id,
        originalname: req.file.originalname,
        path: result.secure_url, // Utiliser l'URL Cloudinary
        analyseId,
        patientId,
        updatedBy,
    });

    await file.save();

    // Ajouter le fileResultat à l'analyse correspondante
    await Analyse.findByIdAndUpdate(
        analyseId,
        { $push: { fileResultat: file._id } },
        { new: true, useFindAndModify: false }
    );

    res.status(201).json({ success: true, data: file });
});

// Fonction pour obtenir un fichier résultat par ID
exports.getFileById = asyncHandler(async (req, res) => {
    const file = await FileResultat.findById(req.params.id);
    if (!file) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
    }
    res.status(200).json({ success: true, data: file });
});

// Fonction pour mettre à jour un fichier résultat
exports.updateFile = asyncHandler(async (req, res) => {
    const { updatedBy } = req.body;
    const file = await FileResultat.findById(req.params.id);
    if (!file) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
    }

    // Remove the old file from Cloudinary if it exists
    if (file.filename) {
        await cloudinary.uploader.destroy(file.filename);
    }

    // Upload the new file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'resultatExterne',
    });

    // Update file details
    file.filename = result.public_id;
    file.originalname = req.file.originalname;
    file.path = result.secure_url;
    file.updatedBy = updatedBy;

    await file.save();
    res.status(200).json({ success: true, data: file });
});

// Fonction pour supprimer un fichier résultat
exports.deleteFile = asyncHandler(async (req, res) => {
    const file = await FileResultat.findByIdAndDelete(req.params.id);
    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Remove the file from Cloudinary
    if (file.filename) {
        await cloudinary.uploader.destroy(file.filename);
    }

    // Supprimer la référence du fileResultat de l'analyse correspondante
    await Analyse.findByIdAndUpdate(
        file.analyseId,
        { $pull: { fileResultat: file._id } },
        { new: true, useFindAndModify: false }
    );

    res.status(200).json({ success: true, message: 'File deleted successfully' });
});
