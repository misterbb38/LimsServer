const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const Analyse = require('../models/analyseModel'); // Assurez-vous que le chemin est correct
const Historique = require('../models/historiqueModel'); // Assurez-vous que le chemin est correct
const Test = require('../models/testModel'); // Chemin à ajuster selon votre structure
const Partenaire = require('../models/PartenaireModel'); // Chemin à ajuster selon votre structure
const EtiquettePartenaire = require('../models/etiquettePartenaireModel'); // Chemin à ajuster selon votre structure


const Counter = require('../models/Counter');


// Fonction pour obtenir le prochain identifiant séquentiel
async function getNextId() {
    const counter = await Counter.findByIdAndUpdate('analyseId', { $inc: { seq: 1 } }, { new: true, upsert: true });
    return counter.seq.toString(36).padStart(5, '0').toUpperCase();
}


// Créer une nouvelle analyse, avec possibilité d'ajouter un fichier PDF d'ordonnance
// Créer une nouvelle analyse et un historique initial
// exports.createAnalyse = asyncHandler(async (req, res) => {
//     const { userId, tests } = req.body;
//     let ordonnancePdfPath = req.file ? req.file.path : null;

//     const identifiant = await getNextId(); // Générer l'identifiant


//     // Créer la nouvelle analyse
//     const analyse = await Analyse.create({
//         userId,
//         tests,
//         identifiant,
//         ordonnancePdf: ordonnancePdfPath
//     });

//     // Créer un nouvel historique avec le statut initial et l'associer à l'analyse créée
//     const historique = await Historique.create({
//         analyseId: analyse._id,
//         status: "Création",
//         description: "Création du processus",
//         updatedBy: userId // Supposant que l'utilisateur créant l'analyse est celui qui met à jour l'historique
//     });

//     // Assurez-vous d'ajouter l'historique créé à l'analyse
//     analyse.historiques.push(historique._id);
//     await analyse.save(); // Sauvegardez l'analyse avec la référence à l'historique

//     res.status(201).json({
//         success: true,
//         data: analyse
//     });
// });

exports.createAnalyse = asyncHandler(async (req, res) => {
    const { userId, tests, partenaireId, pourcentageCouverture, reduction, typeReduction, pc1, pc2, deplacement, dateDeRecuperation } = req.body;

    let ordonnancePdfPath = req.file ? req.file.path : null;
    let prixTotal = 0;
    let prixPartenaire = 0;
    let prixPatient = 0;

    const identifiant = await getNextId(); // Générer l'identifiant

    // Récupérer les détails des tests
    const testsDetails = await Test.find({ '_id': { $in: tests } });

    // Vérifier si un partenaire est choisi
    let typePartenaire = null;
    if (partenaireId) {
        const partenaire = await Partenaire.findById(partenaireId);
        typePartenaire = partenaire.typePartenaire;
    }

    // Calcul du prix total en fonction du type de partenaire
    testsDetails.forEach(test => {
        if (typePartenaire === 'assurance') {
            prixTotal += test.coeficiantB * test.prixAssurance;
        } else if (typePartenaire === 'ipm') {
            prixTotal += test.coeficiantB * test.prixIpm;
        } else if (typePartenaire === 'sococim') {
            prixTotal += test.coeficiantB * test.prixSococim;
        }
        else { // Pas de partenaire ou autre type
            prixTotal += test.coeficiantB * test.prixPaf;
        }
    });

    // Calcul du prix partenaire et du prix patient
    if (pourcentageCouverture > 0 && typePartenaire) {
        prixPartenaire = (prixTotal * pourcentageCouverture) / 100;
        prixPatient = prixTotal - prixPartenaire;
    } else {
        prixPatient = prixTotal;
    }

    // Appliquer la réduction sur le prixPatient si applicable
    if (reduction && typeReduction) {
        if (typeReduction === 'montant') {
            prixPatient = Math.max(0, prixPatient - reduction);
        } else if (typeReduction === 'pourcentage') {
            prixPatient = Math.max(0, prixPatient - (prixPatient * reduction / 100));
        }
    }

    // Création de l'analyse
    const nouvelleAnalyse = await Analyse.create({
        userId,
        tests,
        identifiant,
        partenaireId: partenaireId || undefined,
        prixTotal,
        prixPartenaire,
        prixPatient,
        reduction,
        pc1,
        pc2,
        deplacement,
        pourcentageCouverture,
        dateDeRecuperation,
        ordonnancePdf: ordonnancePdfPath
    });

    // Création d'une étiquette partenaire si nécessaire
    if (partenaireId && prixPartenaire > 0) {
        await EtiquettePartenaire.create({
            analyseId: nouvelleAnalyse._id,
            partenaireId,
            sommeAPayer: prixPartenaire
        });
    }

    // Créer un nouvel historique avec le statut initial et l'associer à l'analyse créée
    const historique = await Historique.create({
        analyseId: nouvelleAnalyse._id,
        status: "Création",
        description: "Création du processus",
        updatedBy: userId // Supposant que l'utilisateur créant l'analyse est celui qui met à jour l'historique
    });

    // Assurez-vous d'ajouter l'historique créé à l'analyse
    nouvelleAnalyse.historiques.push(historique._id);
    await nouvelleAnalyse.save(); // Sauvegardez l'analyse avec la référence à l'historique

    res.status(201).json({
        success: true,
        message: "Analyse créée avec succès",
        data: nouvelleAnalyse
    });
});


// Obtenir toutes les analyses

exports.getAnalyses = asyncHandler(async (req, res) => {
    const analyses = await Analyse.find()
        .populate('userId', 'nom prenom email adresse telephone dateNaissance age nip createdAt updatedAt') // Inclure createdAt et updatedAt
        .populate('tests', 'nom description machineA machineB  interpretation prixAssurance prixPaf, prixIpm coeficiantB  montantRecus') // Inclure createdAt et updatedAt
        .populate('partenaireId', 'nom typePartenaire')
        .populate({
            path: 'historiques',
            select: 'status description date createdAt updatedAt', // Inclure createdAt et updatedAt pour historiques
            populate: {
                path: 'updatedBy',
                select: 'nom prenom createdAt updatedAt' // Inclure createdAt et updatedAt pour updatedBy
            },

        })

        .populate({
            path: 'resultat', // Modifier ici pour correspondre au champ de votre schéma Analyse qui contient les ID des résultats
            select: 'valeur interpretation dernierResultatAnterieur testId statutInterpretation typePrelevement datePrelevement updatedBy createdAt updatedAt',
            populate: [
                {
                    path: 'testId',
                    select: 'nom categories valeur interpretation' // Assurez-vous que 'nom' est le champ du schéma Test contenant le nom du test
                },
                {
                    path: 'updatedBy',
                    select: 'nom prenom' // Sélection des champs 'nom' et 'prenom' de l'utilisateur qui a mis à jour
                }
            ]
        });


    res.status(200).json({
        success: true,
        count: analyses.length,
        data: analyses
    });
});

// obtenir les analyse d un patient

exports.getAnalysesPatient = asyncHandler(async (req, res) => {
    if (!req.user) {
        // Si aucun utilisateur n'est connecté, renvoyer une erreur ou une réponse indiquant que l'authentification est nécessaire
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const userId = req.user._id; // Utilisez l'ID de l'utilisateur connecté

    const analyses = await Analyse.find({ userId: userId }) // Assurez-vous que ce champ correspond à votre modèle de base de données
        .populate('userId', 'nom prenom email adresse telephone dateNaissance age nip createdAt updatedAt')
        .populate('tests', 'nom description machineA machineB interpretation prixAssurance prixPaf, prixIpm coeficiantB montantRecus')
        .populate('partenaireId', 'nom typePartenaire')
        .populate({
            path: 'historiques',
            select: 'status description date createdAt updatedAt',
            populate: {
                path: 'updatedBy',
                select: 'nom prenom createdAt updatedAt'
            },
        })
        .populate({
            path: 'resultat',
            select: 'valeur interpretation dernierResultatAnterieur testId statutInterpretation typePrelevement datePrelevement updatedBy createdAt updatedAt',
            populate: [
                {
                    path: 'testId',
                    select: 'nom categories valeur interpretation'
                },
                {
                    path: 'updatedBy',
                    select: 'nom prenom'
                }
            ]
        });

    res.status(200).json({
        success: true,
        count: analyses.length,
        data: analyses
    });
});





// Obtenir une analyse spécifique par ID


exports.getAnalyse = asyncHandler(async (req, res) => {
    const analyse = await Analyse.findById(req.params.id)
        .populate('userId', 'nom prenom email adresse dateNaissance age nip telephone')
        .populate('tests', 'nom description machineA machineB interpretation prixAssurance prixPaf, prixIpm coeficiantB  montantRecus')
        .populate('partenaireId', 'nom typePartenaire')
        .populate({
            path: 'historiques',
            select: 'status description date createdAt updatedAt', // Inclure createdAt et updatedAt pour historiques
            populate: {
                path: 'updatedBy',
                select: 'nom prenom createdAt updatedAt' // Inclure createdAt et updatedAt pour updatedBy
            },

        })

        .populate({
            path: 'resultat', // Modifier ici pour correspondre au champ de votre schéma Analyse qui contient les ID des résultats
            select: 'valeur interpretation dernierResultatAnterieur testId statutInterpretation typePrelevement datePrelevement updatedBy createdAt updatedAt',
            populate: [
                {
                    path: 'testId',
                    select: 'nom categories valeur interpretation' // Assurez-vous que 'nom' est le champ du schéma Test contenant le nom du test
                },
                {
                    path: 'updatedBy',
                    select: 'nom prenom' // Sélection des champs 'nom' et 'prenom' de l'utilisateur qui a mis à jour
                }
            ]
        });


    if (!analyse) {
        res.status(404);
        throw new Error('Analyse non trouvée');
    }

    res.status(200).json({
        success: true,
        data: analyse
    });
});


// Mettre à jour une analyse (seulement la date, les tests ou l'ordonnancePdf)

// exports.updateAnalyse = asyncHandler(async (req, res) => {
//     const { userId, tests, partenaireId, pourcentageCouverture, reduction, typeReduction } = req.body;
//     let ordonnancePdfPath = req.file ? req.file.path : null;

//     // Récupérer l'analyse existante
//     let analyse = await Analyse.findById(req.params.id);

//     if (!analyse) {
//         res.status(404);
//         throw new Error('Analyse non trouvée');
//     }

//     let prixTotal = 0;
//     let prixPartenaire = 0;
//     let prixPatient = 0;
//     let typePartenaire = null;

//     // Vérifier si un partenaire est choisi
//     if (partenaireId) {
//         const partenaire = await Partenaire.findById(partenaireId);
//         typePartenaire = partenaire ? partenaire.typePartenaire : null;
//     }

//     // Récupérer les détails des tests si les tests sont mis à jour
//     const testsDetails = tests ? await Test.find({ '_id': { $in: tests } }) : analyse.tests;

//     // Calcul du prix total en fonction du type de partenaire
//     testsDetails.forEach(test => {
//         if (typePartenaire === 'assurance') {
//             prixTotal += test.coeficiantB * test.prixAssurance;
//         } else if (typePartenaire === 'ipm') {
//             prixTotal += test.coeficiantB * test.prixIpm;
//         } else {
//             prixTotal += test.coeficiantB * test.prixPaf;
//         }
//     });

//     // Calcul du prix partenaire et du prix patient
//     if (pourcentageCouverture > 0 && typePartenaire) {
//         prixPartenaire = (prixTotal * pourcentageCouverture) / 100;
//         prixPatient = prixTotal - prixPartenaire;
//     } else {
//         prixPatient = prixTotal;
//         prixPartenaire = 0;
//     }

//     // Appliquer la réduction sur le prixPatient si applicable
//     if (reduction && typeReduction) {
//         if (typeReduction === 'montant') {
//             prixPatient = Math.max(0, prixPatient - reduction);
//         } else if (typeReduction === 'pourcentage') {
//             prixPatient = Math.max(0, prixPatient - (prixPatient * reduction / 100));
//         }
//     }

//     // Préparer les données mises à jour
//     let updateData = {
//         tests,
//         partenaireId: partenaireId || undefined,
//         prixTotal,
//         prixPartenaire,
//         pourcentageCouverture,
//         prixPatient,
//         reduction, // inclure la réduction dans les données mises à jour
//         typeReduction // inclure le type de réduction dans les données mises à jour

//     };

//     if (ordonnancePdfPath) {
//         updateData.ordonnancePdf = ordonnancePdfPath;
//     }

//     // Mise à jour de l'analyse avec les nouvelles valeurs
//     analyse = await Analyse.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

//     // Créer ou mettre à jour l'étiquette partenaire si nécessaire
//     if (partenaireId && prixPartenaire > 0) {
//         const etiquetteExistante = await EtiquettePartenaire.findOne({ analyseId: analyse._id, partenaireId });
//         if (etiquetteExistante) {
//             await EtiquettePartenaire.findByIdAndUpdate(etiquetteExistante._id, { sommeAPayer: prixPartenaire }, { new: true });
//         } else {
//             await EtiquettePartenaire.create({
//                 analyseId: analyse._id,
//                 partenaireId,
//                 sommeAPayer: prixPartenaire
//             });
//         }
//     }

//     // Ajouter un historique d'update
//     const historique = await Historique.create({
//         analyseId: analyse._id,
//         status: "Modification",
//         description: "les information de l'analyse a été modifiée",
//         updatedBy: userId
//     });

//     // Assurez-vous d'ajouter l'historique créé à l'analyse
//     analyse.historiques.push(historique._id);
//     await analyse.save(); // Sauvegardez l'analyse avec la référence à l'historique

//     res.status(200).json({
//         success: true,
//         data: analyse
//     });
// });

exports.updateAnalyse = asyncHandler(async (req, res) => {
    const { userId, tests, partenaireId, pourcentageCouverture, reduction, typeReduction, pc1, pc2, deplacement, dateDeRecuperation } = req.body;
    let ordonnancePdfPath = req.file ? req.file.path : null;

    let analyse = await Analyse.findById(req.params.id);
    if (!analyse) {
        return res.status(404).send('Analyse non trouvée');
    }

    let prixTotal = 0;
    let prixPartenaire = 0;
    let prixPatient = 0;
    let typePartenaire = analyse.partenaireId ? (await Partenaire.findById(analyse.partenaireId)).typePartenaire : null;

    if (partenaireId && mongoose.Types.ObjectId.isValid(partenaireId) && (!analyse.partenaireId || analyse.partenaireId.toString() !== partenaireId)) {
        const partenaire = await Partenaire.findById(partenaireId);
        if (!partenaire) {
            return res.status(404).send('Partenaire non trouvé');
        }
        analyse.partenaireId = partenaire._id;
        typePartenaire = partenaire.typePartenaire;
    }

    if (pourcentageCouverture !== undefined && analyse.pourcentageCouverture !== pourcentageCouverture) {
        analyse.pourcentageCouverture = pourcentageCouverture;
        if (analyse.pourcentageCouverture === 0) {
            analyse.partenaireId = undefined;
        }

    }


    const testsDetails = tests ? await Test.find({ '_id': { $in: tests } }) : analyse.tests;
    testsDetails.forEach(test => {
        if (typePartenaire === 'assurance') {
            prixTotal += test.coeficiantB * test.prixAssurance;
        } else if (typePartenaire === 'ipm') {
            prixTotal += test.coeficiantB * test.prixIpm;
        } else if (typePartenaire === 'sococim') {
            prixTotal += test.coeficiantB * test.prixSococim;
        } else {
            prixTotal += test.coeficiantB * test.prixPaf;
        }
    });

    if (pourcentageCouverture > 0 && typePartenaire) {
        prixPartenaire = (prixTotal * pourcentageCouverture) / 100;
        prixPatient = prixTotal - prixPartenaire;
    } else {
        prixPatient = prixTotal;
        prixPartenaire = 0;
    }

    if (reduction && typeReduction) {
        if (typeReduction === 'montant') {
            prixPatient -= reduction;
        } else if (typeReduction === 'pourcentage') {
            prixPatient -= prixPatient * reduction / 100;
        }
        prixPatient = Math.max(0, prixPatient);
    }

    if (ordonnancePdfPath) {
        analyse.ordonnancePdf = ordonnancePdfPath;
    }

    // Ajout de la logique pour mettre à jour pc1, pc2, et deplacement
    analyse.pc1 = Number(pc1);
    analyse.pc2 = Number(pc2);
    analyse.deplacement = Number(deplacement);
    // Convertir la chaîne de caractères en Date, si dateDeRecuperation est fournie
    if (dateDeRecuperation) {
        analyse.dateDeRecuperation = new Date(dateDeRecuperation);
    }


    analyse.tests = testsDetails.map(test => test._id); // Mise à jour des tests
    analyse.prixTotal = prixTotal;
    analyse.prixPartenaire = prixPartenaire;
    analyse.prixPatient = prixPatient;
    analyse.reduction = reduction;
    analyse.typeReduction = typeReduction;

    await analyse.save();

    // if (partenaireId && prixPartenaire > 0) {
    //     let etiquettePartenaire = await EtiquettePartenaire.findOne({ analyseId: analyse._id, partenaireId });
    //     if (etiquettePartenaire) {
    //         etiquettePartenaire.sommeAPayer = prixPartenaire;
    //         await etiquettePartenaire.save();
    //     } else {
    //         await EtiquettePartenaire.create({
    //             analyseId: analyse._id,
    //             partenaireId,
    //             sommeAPayer: prixPartenaire
    //         });
    //     }
    // }

    // Logique pour mise à jour ou suppression de l'étiquette partenaire
    let etiquettePartenaire = await EtiquettePartenaire.findOne({ analyseId: analyse._id });
    if (etiquettePartenaire) {
        if (partenaireId && prixPartenaire > 0) {
            // Mise à jour de l'étiquette existante même si le partenaire change
            etiquettePartenaire.partenaireId = partenaireId;
            etiquettePartenaire.sommeAPayer = prixPartenaire;
            await etiquettePartenaire.save();
        } else {
            // Suppression de l'étiquette si l'analyse n'a plus de partenaire
            await EtiquettePartenaire.findByIdAndDelete(etiquettePartenaire._id);
        }
    } else if (partenaireId && prixPartenaire > 0) {
        // Création d'une nouvelle étiquette si elle n'existe pas et qu'un partenaire est défini
        await EtiquettePartenaire.create({
            analyseId: analyse._id,
            partenaireId,
            sommeAPayer: prixPartenaire
        });
    }

    const historique = await Historique.create({
        analyseId: analyse._id,
        status: "Modification",
        description: "Les informations de l'analyse ont été modifiées.",
        updatedBy: userId
    });

    analyse.historiques.push(historique._id);
    await analyse.save();

    res.status(200).json({
        success: true,
        data: analyse
    });
});





// Supprimer une analyse
exports.deleteAnalyse = asyncHandler(async (req, res) => {
    const analyse = await Analyse.findByIdAndDelete(req.params.id);

    if (!analyse) {
        res.status(404);
        throw new Error('Analyse non trouvée');
    }


    res.status(200).json({
        success: true,
        data: {},
        message: 'Analyse supprimée avec succès'
    });
});


// Contrôleur pour obtenir les IDs de tests d'une analyse spécifique
// exports.getTestIdsByAnalyse = asyncHandler(async (req, res) => {
//     const { analyseId } = req.params;

//     if (!mongoose.isValidObjectId(analyseId)) {
//         return res.status(400).json({ success: false, message: 'Invalid Analyse ID' });
//     }

//     try {
//         const analyse = await Analyse.findById(analyseId).populate('tests', '_id nom machineA machineB');

//         if (!analyse) {
//             return res.status(404).json({ success: false, message: 'Analyse not found' });
//         }

//         res.status(200).json({ success: true, data: analyse.tests });
//     } catch (error) {
//         console.error("Error retrieving test IDs:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

exports.getTestIdsByAnalyse = asyncHandler(async (req, res) => {
    const { analyseId } = req.params;

    if (!mongoose.isValidObjectId(analyseId)) {
        return res.status(400).json({ success: false, message: 'Invalid Analyse ID' });
    }

    try {
        // Ajoutez les champs 'machineA' et 'machineB' dans le populate pour les récupérer
        const analyse = await Analyse.findById(analyseId)
            .populate('tests', '_id nom machineA machineB');

        if (!analyse) {
            return res.status(404).json({ success: false, message: 'Analyse not found' });
        }

        res.status(200).json({ success: true, data: analyse.tests });
    } catch (error) {
        console.error("Error retrieving test IDs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

