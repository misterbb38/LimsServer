
// const asyncHandler = require('express-async-handler');
// const FileResultat = require('../models/fileResultatModel');
// const Analyse = require('../models/analyseModel');
// const fs = require('fs');
// const path = require('path');

// // Fonction pour ajouter un nouveau fichier résultat
// exports.uploadFile = asyncHandler(async (req, res) => {
//     const { analyseId, patientId, updatedBy } = req.body;
//     const file = new FileResultat({
//         filename: req.file.filename,
//         originalname: req.file.originalname,
//         path: req.file.path,
//         analyseId,
//         patientId,
//         updatedBy
//     });
    
//     await file.save();

//     // Ajouter le fileResultat à l'analyse correspondante
//     await Analyse.findByIdAndUpdate(
//         analyseId,
//         { $push: { fileResultat: file._id } },
//         { new: true, useFindAndModify: false }
//     );

//     res.status(201).json({ success: true, data: file });
// });

// // Fonction pour obtenir un fichier résultat par ID
// exports.getFileById = asyncHandler(async (req, res) => {
//     const file = await FileResultat.findById(req.params.id);
//     if (!file) {
//         res.status(404).json({ success: false, message: 'File not found' });
//         return;
//     }
//     res.status(200).json({ success: true, data: file });
// });

// // Fonction pour mettre à jour un fichier résultat
// exports.updateFile = asyncHandler(async (req, res) => {
//     const { analyseId, patientId, updatedBy } = req.body;
//     const file = await FileResultat.findById(req.params.id);
//     if (!file) {
//         res.status(404).json({ success: false, message: 'File not found' });
//         return;
//     }

//     // Remove the old file
//     fs.unlinkSync(path.join(__dirname, '..', file.path));

//     // Update file details
//     file.filename = req.file.filename;
//     file.originalname = req.file.originalname;
//     file.path = req.file.path;
//     file.analyseId = analyseId;
//     file.patientId = patientId;
//     file.updatedBy = updatedBy;

//     await file.save();
//     res.status(200).json({ success: true, data: file });
// });

// // Fonction pour supprimer un fichier résultat
// exports.deleteFile = asyncHandler(async (req, res) => {
//     const file = await FileResultat.findById(req.params.id);
//     if (!file) {
//         res.status(404).json({ success: false, message: 'File not found' });
//         return;
//     }

//     // Remove the file from the filesystem
//     fs.unlinkSync(path.join(__dirname, '..', file.path));

//     await file.remove();

//     // Supprimer la référence du fileResultat de l'analyse correspondante
//     await Analyse.findByIdAndUpdate(
//         file.analyseId,
//         { $pull: { fileResultat: file._id } },
//         { new: true, useFindAndModify: false }
//     );

//     res.status(200).json({ success: true, message: 'File deleted successfully' });
// });


const asyncHandler = require('express-async-handler');
const FileResultat = require('../models/fileResultatModel');
const Analyse = require('../models/analyseModel');
const fs = require('fs');
const path = require('path');

// Fonction pour ajouter un nouveau fichier résultat
exports.uploadFile = asyncHandler(async (req, res) => {
    const { analyseId, patientId, updatedBy } = req.body;
    const file = new FileResultat({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        analyseId,
        patientId,
        updatedBy
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

    // Remove the old file if it exists
    if (file.path) {
        const oldFilePath = path.resolve(__dirname, '..', file.path);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
    }

    // Update file details
    file.filename = req.file.filename;
    file.originalname = req.file.originalname;
    file.path = req.file.path;
    file.updatedBy = updatedBy;

    await file.save();
    res.status(200).json({ success: true, data: file });
});

// Fonction pour supprimer un fichier résultat
// Fonction pour supprimer un fichier résultat
exports.deleteFile = asyncHandler(async (req, res) => {
    const file = await FileResultat.findByIdAndDelete(req.params.id);
    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Supprimer la référence du fileResultat de l'analyse correspondante
    await Analyse.findByIdAndUpdate(
        file.analyseId,
        { $pull: { fileResultat: file._id } },
        { new: true, useFindAndModify: false }
    );

    res.status(200).json({ success: true, message: 'File deleted successfully' });
});
