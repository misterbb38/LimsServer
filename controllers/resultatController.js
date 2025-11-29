const asyncHandler = require('express-async-handler');
const Resultat = require('../models/resultatModel');
const Analyse = require('../models/analyseModel');






exports.createResultat = asyncHandler(async (req, res) => {
    const {
      analyseId,
      testId,
      patientId,
      observations,    // Observations (macroscopique, microscopique, chimie, etc.)
      culture,         // Culture
      gram,            // Résultat Gram
      conclusion,      // Conclusion
      valeur,
      interpretation,
      methode,
      statutMachine,
      statutInterpretation,
      typePrelevement,
      lieuPrelevement,
      datePrelevement,
      qualitatif,
      remarque,
      updatedBy,
      exceptions       // <- Ajout du champ "exceptions" (qbc, groupeSanguin, etc.)
    } = req.body;
  
    // Chercher le dernier résultat pour ce test/patient (pour remplir dernierResultatAnterieur)
    const dernierResultat = await Resultat
      .findOne({ testId, patientId })
      .sort({ createdAt: -1 });
  
    // Créer le nouveau résultat
    const newResultat = await Resultat.create({
      analyseId,
      testId,
      patientId,
      observations, // macrosc., microsc., chimie, etc.
      culture,      // infos culture
      gram,
      conclusion,
      valeur,
      // Remplit dernierResultatAnterieur si on en trouve un
      dernierResultatAnterieur: dernierResultat
        ? { valeur: dernierResultat.valeur, date: dernierResultat.createdAt }
        : null,
      interpretation,
      statutMachine,
      methode,
      statutInterpretation,
      typePrelevement,
      lieuPrelevement,
      datePrelevement,
      qualitatif,
      remarque,
      updatedBy,
      exceptions    // <---- insertion du champ "exceptions" dans le document
    });
  
    // Mettre à jour l’analyse en y ajoutant ce résultat
    await Analyse.findByIdAndUpdate(analyseId, {
      $push: { resultat: newResultat._id }
    });
  
    res.status(201).json({ success: true, data: newResultat });
  });

  
// Obtenir tous les résultats
exports.getAllResultats = asyncHandler(async (req, res) => {
    const resultats = await Resultat.find()
        .populate('analyseId testId patientId');
    res.status(200).json({ success: true, data: resultats });
});

// Obtenir un résultat par ID
exports.getResultatById = asyncHandler(async (req, res) => {
    const resultat = await Resultat.findById(req.params.id)
        .populate('analyseId testId patientId');
    if (!resultat) {
        return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }
    res.status(200).json({ success: true, data: resultat });
});

// Mettre à jour un résultat
exports.updateResultat = asyncHandler(async (req, res) => {
    let resultat = await Resultat.findById(req.params.id);
    if (!resultat) {
        return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }
    resultat = await Resultat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: resultat });
});

// Supprimer un résultat
exports.deleteResultat = asyncHandler(async (req, res) => {
    const resultat = await Resultat.findByIdAndDelete(req.params.id);
    if (!resultat) {
        return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }
    // Vous pourriez également vouloir supprimer la référence de ce résultat dans l'analyse correspondante ici
    await Analyse.findByIdAndUpdate(resultat.analyseId, { $pull: { resultat: resultat._id } });
    res.status(200).json({ success: true, message: 'Résultat supprimé' });
});
