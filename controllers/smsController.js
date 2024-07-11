// const asyncHandler = require('express-async-handler');
// const { SmsOrange } = require('smsorange');
// const SMS = require('../models/smsModel');

// const smsWrapper = new SmsOrange({
//   authorization_header: process.env.ORANGE_API_AUTH_HEADER,
//   yourNumber: process.env.ORANGE_API_YOUR_NUMBER,
//   senderName: process.env.ORANGE_API_SENDER_NAME,
// });

// // Fonction pour envoyer un SMS
// exports.sendSMS = asyncHandler(async (req, res) => {
//   const { phoneNumber } = req.body;
//   const message = "Bonjour, vos résultats d'analyse sont disponibles. Veuillez entrer sur notre site afin de consulter ou télécharger vos résultats www.bioram.org ou venir dans nos offices.";

//   try {
//     const response = await smsWrapper.sendSms({
//       numberTo: phoneNumber,
//       message: message,
//     });

//     const sms = new SMS({
//       phoneNumber,
//       message,
//       status: 'sent',
//     });
//     await sms.save();

//     res.status(200).json({ success: true, data: sms, response });
//   } catch (error) {
//     const sms = new SMS({
//       phoneNumber,
//       message,
//       status: 'failed',
//     });
//     await sms.save();

//     res.status(500).json({ success: false, error: error.message });
//   }
// });


const asyncHandler = require('express-async-handler');
const { SmsOrange } = require('smsorange');
const SMS = require('../models/smsModel');
const Analyse = require('../models/analyseModel');

const smsWrapper = new SmsOrange({
  authorization_header: process.env.ORANGE_API_AUTH_HEADER,
  yourNumber: process.env.ORANGE_API_YOUR_NUMBER,
  senderName: process.env.ORANGE_API_SENDER_NAME,
});

// Fonction pour envoyer un SMS
exports.sendSMS = asyncHandler(async (req, res) => {
  const { phoneNumber, analyseId } = req.body;
  const message = `Bonjour, 
Vos résultats d'analyses médicales sont disponibles. Veuillez vous connecter sur notre site www.bioram.org afin de consulter et télécharger vos résultats. 
Vous pouvez aussi les récupérer dans nos locaux.
Bien à vous,
Votre laboratoire d’analyses médicales Bioram.`

  try {
    const response = await smsWrapper.sendSms({
      numberTo: phoneNumber,
      message: message,
    });

    const sms = new SMS({
      phoneNumber,
      message,
      status: 'sent',
      analyseId,
    });
    await sms.save();

    // Incrémenter le compteur de SMS envoyés pour l'analyse
    await Analyse.findByIdAndUpdate(analyseId, { $inc: { smsCount: 1 } });

    res.status(200).json({ success: true, data: sms, response });
  } catch (error) {
    const sms = new SMS({
      phoneNumber,
      message,
      status: 'failed',
      analyseId,
    });
    await sms.save();

    res.status(500).json({ success: false, error: error.message });
  }
});

// Fonction pour obtenir un SMS par ID
exports.getSMSById = asyncHandler(async (req, res) => {
  const sms = await SMS.findById(req.params.id);

  if (!sms) {
    res.status(404).json({ success: false, message: 'SMS not found' });
    return;
  }

  res.status(200).json({ success: true, data: sms });
});

// Fonction pour obtenir tous les SMS
exports.getAllSMS = asyncHandler(async (req, res) => {
  const smsList = await SMS.find();

  res.status(200).json({ success: true, data: smsList });
});
