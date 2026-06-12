// Upload temporaire d'un PDF de resultat sur Cloudinary pour le partage
// (WhatsApp, email patient/docteur/partenaire). Le fichier est uploade
// dans le dossier "resultats-partages" avec une nomenclature lisible
// pour suivi.
//
// Pas d'enregistrement en base : c'est juste un upload d'un PDF deja
// genere cote client, qu'on veut rendre accessible via une URL publique.

const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');

exports.uploadResultatPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Aucun fichier PDF reçu');
  }

  try {
    const { analyseId, identifiant } = req.body;
    // Nom public lisible : "resultats-partages/260414001" pour identifier
    // facilement le dossier dans Cloudinary. resource_type 'raw' force
    // Cloudinary a servir le PDF en tant que fichier (pas image).
    const publicId = identifiant
      ? `${identifiant}_${Date.now()}`
      : `pdf_${analyseId || Date.now()}`;

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'resultats-partages',
      public_id: publicId,
      resource_type: 'raw',
      use_filename: false,
      unique_filename: false,
      type: 'upload',
    });

    // Nettoyage du fichier local apres upload
    fs.unlink(req.file.path, () => {});

    res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
    console.error('Erreur upload PDF partage:', error);
    res.status(500);
    throw new Error("Échec de l'upload du PDF vers Cloudinary");
  }
});
