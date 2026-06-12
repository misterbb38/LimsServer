// Partage d'un PDF de resultat.
//   - WhatsApp : upload sur Cloudinary -> renvoie URL publique (cote front,
//                ouverture de wa.me avec lien pre-rempli).
//   - Email    : envoi direct via l'API Resend (HTTPS), PDF en piece jointe.
//                Nodemailer/SMTP a ete retire car Render bloque les ports
//                465 et 587 sortants.
//
// Pas d'enregistrement en base : these are one-shot operations.

const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinaryConfig');
const { sendMail } = require('../config/mailerConfig');
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

// Envoi direct par email avec le PDF en piece jointe.
// Body attendu (multipart/form-data) :
//   - pdf      : fichier (multer)
//   - to       : adresse destinataire
//   - subject  : sujet du mail
//   - body     : corps texte
//   - identifiant : optionnel, sert pour nommer la piece jointe
exports.sendResultatByEmail = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Aucun fichier PDF reçu');
  }
  const { to, subject, body, identifiant } = req.body;
  if (!to || !to.includes('@')) {
    if (req.file.path) fs.unlink(req.file.path, () => {});
    res.status(400);
    throw new Error('Adresse email destinataire invalide');
  }

  const attachmentName = identifiant
    ? `resultat-${identifiant}.pdf`
    : `resultat.pdf`;
  // Reply-To independant de l'expediteur : si SMTP_USER pointe sur le
  // sandbox Resend (onboarding@resend.dev), on garde quand meme l'adresse
  // contact@bioram.org pour les reponses, via MAIL_REPLY_TO en priorite.
  const replyTo =
    process.env.MAIL_REPLY_TO || 'contact@bioram.org';

  try {
    // Resend attend le contenu de la piece jointe en Buffer, pas un path.
    const pdfBuffer = fs.readFileSync(req.file.path);

    await sendMail({
      to,
      replyTo,
      subject: subject || `Résultats d'analyses - Laboratoire Bioram`,
      text: body || 'Veuillez trouver vos résultats en pièce jointe.',
      attachments: [
        {
          filename: attachmentName,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    fs.unlink(req.file.path, () => {});
    res.status(200).json({ success: true });
  } catch (error) {
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
    console.error('Erreur envoi email:', error);
    res.status(500);
    throw new Error("Échec de l'envoi du mail : " + error.message);
  }
});
