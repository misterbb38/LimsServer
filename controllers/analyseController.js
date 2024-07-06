const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const Analyse = require('../models/analyseModel'); // Assurez-vous que le chemin est correct
const Historique = require('../models/historiqueModel'); // Assurez-vous que le chemin est correct
const Test = require('../models/testModel'); // Chemin à ajuster selon votre structure
const Partenaire = require('../models/PartenaireModel'); // Chemin à ajuster selon votre structure
const EtiquettePartenaire = require('../models/etiquettePartenaireModel'); // Chemin à ajuster selon votre structure
const { getNextId } = require('../middleware/idGenerator');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


  

// exports.createAnalyse = asyncHandler(async (req, res) => {
//     const { userId, userOwn, tests, typeAnalyse, partenaireId, statusPayement, avance = 0, pourcentageCouverture = 0, reduction = 0, typeReduction, pc1 = 0, pc2 = 0, deplacement = 0, dateDeRecuperation } = req.body;

//     let ordonnancePdfPath = req.file ? req.file.path : null;
//     let prixTotal = 0;
//     let prixPartenaire = 0;
//     let prixPatient = 0;

//     const identifiant = await getNextId('analyseId'); // Générer l'identifiant

//     // Récupérer les détails des tests
//     const testsDetails = await Test.find({ '_id': { $in: tests } });

//     // Vérifier si un partenaire est choisi
//     let typePartenaire = null;
//     if (partenaireId) {
//       const partenaire = await Partenaire.findById(partenaireId);
//       typePartenaire = partenaire.typePartenaire;
//     }

//     // Calcul du prix total en fonction du type de partenaire
//     testsDetails.forEach(test => {
//       if (typePartenaire === 'assurance') {
//         prixTotal += test.coeficiantB * test.prixAssurance;
//       } else if (typePartenaire === 'ipm') {
//         prixTotal += test.coeficiantB * test.prixIpm;
//       } else if (typePartenaire === 'sococim') {
//         prixTotal += test.coeficiantB * test.prixSococim;
//       } else if (typePartenaire === 'clinique') {
//         prixTotal += test.prixClinique;
//       } else {
//         prixTotal += test.coeficiantB * test.prixPaf;
//       }
//     });

//     // Ajouter pc1, pc2 et deplacement au prix total
//     prixTotal += Number(pc1) + Number(pc2) + Number(deplacement);

//     // Calcul du prix partenaire et du prix patient
//     if (typePartenaire) {
//         if (typePartenaire === 'clinique') {
//           prixPartenaire = prixTotal;
//           prixPatient = prixTotal;
//         } else {
//           prixPartenaire = (prixTotal * pourcentageCouverture) / 100;
//           prixPatient = prixTotal - prixPartenaire;
//         }
//       } else {
//         prixPatient = prixTotal;
//       }

//     // Appliquer la réduction sur le prixPatient si applicable
//     if (reduction && typeReduction) {
//       if (typeReduction === 'montant') {
//         prixPatient = Math.max(0, prixPatient - reduction);
//       } else if (typeReduction === 'pourcentage') {
//         prixPatient = Math.max(0, prixPatient - (prixPatient * reduction / 100));
//       }
//     }

//     // Calcul du reliquat
//     const reliquat = prixPatient - avance;

//     // Création de l'analyse
//     const nouvelleAnalyse = await Analyse.create({
//       userId,
//       tests,
//       typeAnalyse,
//       identifiant,
//       partenaireId: partenaireId || undefined,
//       statusPayement,
//       avance,
//       prixTotal,
//       prixPartenaire,
//       prixPatient,
//       reduction,
//       pc1,
//       pc2,
//       deplacement,
//       pourcentageCouverture,
//       dateDeRecuperation,
//       ordonnancePdf: ordonnancePdfPath,
//       reliquat,
//     });

//     // Création d'une étiquette partenaire si nécessaire
//     if (partenaireId && prixPartenaire > 0) {
//       await EtiquettePartenaire.create({
//         analyseId: nouvelleAnalyse._id,
//         partenaireId,
//         sommeAPayer: prixPartenaire,
//       });
//     }

//     // Créer un nouvel historique avec le statut initial et l'associer à l'analyse créée
//     const historique = await Historique.create({
//       analyseId: nouvelleAnalyse._id,
//       status: "Création",
//       description: "Création du processus",
//       updatedBy: userOwn, // Supposant que l'utilisateur créant l'analyse est celui qui met à jour l'historique
//     });

//     // Assurez-vous d'ajouter l'historique créé à l'analyse
//     nouvelleAnalyse.historiques.push(historique._id);
//     await nouvelleAnalyse.save(); // Sauvegardez l'analyse avec la référence à l'historique

//     res.status(201).json({
//       success: true,
//       message: "Analyse créée avec succès",
//       data: nouvelleAnalyse,
//     });
// });


exports.createAnalyse = asyncHandler(async (req, res) => {
    const { userId, userOwn, tests, typeAnalyse, partenaireId, statusPayement, avance = 0, pourcentageCouverture = 0, reduction = 0, typeReduction, pc1 = 0, pc2 = 0, deplacement = 0, dateDeRecuperation } = req.body;

    let ordonnancePdfPath = null;
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'ordonnances',
            use_filename: true,
            unique_filename: false,
            type: 'upload'
        });
        ordonnancePdfPath = result.secure_url;
    }

    let prixTotal = 0;
    let prixPartenaire = 0;
    let prixPatient = 0;

    const identifiant = await getNextId('analyseId'); // Générer l'identifiant

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
      } else if (typePartenaire === 'clinique') {
        prixTotal += test.prixClinique;
      } else {
        prixTotal += test.coeficiantB * test.prixPaf;
      }
    });

    // Ajouter pc1, pc2 et deplacement au prix total
    prixTotal += Number(pc1) + Number(pc2) + Number(deplacement);

    // Calcul du prix partenaire et du prix patient
    if (typePartenaire) {
        if (typePartenaire === 'clinique') {
          prixPartenaire = prixTotal;
          prixPatient = prixTotal;
        } else {
          prixPartenaire = (prixTotal * pourcentageCouverture) / 100;
          prixPatient = prixTotal - prixPartenaire;
        }
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

    // Calcul du reliquat
    const reliquat = prixPatient - avance;

    // Création de l'analyse
    const nouvelleAnalyse = await Analyse.create({
      userId,
      tests,
      typeAnalyse,
      identifiant,
      partenaireId: partenaireId || undefined,
      statusPayement,
      avance,
      prixTotal,
      prixPartenaire,
      prixPatient,
      reduction,
      pc1,
      pc2,
      deplacement,
      pourcentageCouverture,
      dateDeRecuperation,
      ordonnancePdf: ordonnancePdfPath,
      reliquat,
    });

    // Création d'une étiquette partenaire si nécessaire
    if (partenaireId && prixPartenaire > 0) {
      await EtiquettePartenaire.create({
        analyseId: nouvelleAnalyse._id,
        partenaireId,
        sommeAPayer: prixPartenaire,
      });
    }

    // Créer un nouvel historique avec le statut initial et l'associer à l'analyse créée
    const historique = await Historique.create({
      analyseId: nouvelleAnalyse._id,
      status: "Création",
      description: "Création du processus",
      updatedBy: userOwn, // Supposant que l'utilisateur créant l'analyse est celui qui met à jour l'historique
    });

    // Assurez-vous d'ajouter l'historique créé à l'analyse
    nouvelleAnalyse.historiques.push(historique._id);
    await nouvelleAnalyse.save(); // Sauvegardez l'analyse avec la référence à l'historique

    res.status(201).json({
      success: true,
      message: "Analyse créée avec succès",
      data: nouvelleAnalyse,
    });
});
// Obtenir toutes les analyses

exports.getAnalyses = asyncHandler(async (req, res) => {
    const analyses = await Analyse.find()
        .populate('userId', 'nom prenom email adresse  telephone dateNaissance age nip createdAt updatedAt sexe') // Inclure createdAt et updatedAt
        .populate('tests', 'nom description categories machineA machineB valeurMachineA valeurMachineB interpretationA interpretationB prixAssurance prixPaf prixSococim  prixClinique prixIpm coeficiantB  montantRecus') // Inclure createdAt et updatedAt
        .populate('partenaireId', 'nom typePartenaire')
        .populate({
            path: 'historiques',
            select: 'status description date createdAt updatedAt', // Inclure createdAt et updatedAt pour historiques
            populate: {
                path: 'updatedBy',
                select: 'nom prenom logo createdAt updatedAt' // Inclure createdAt et updatedAt pour updatedBy
            },

        })

        .populate({
            path: 'resultat', // Modifier ici pour correspondre au champ de votre schéma Analyse qui contient les ID des résultats
            select: 'valeur remarque qualitatif interpretationA interpretationB methode dernierResultatAnterieur testId statutInterpretation typePrelevement lieuPrelevement statutMachine datePrelevement updatedBy createdAt updatedAt observations culture gram conclusion remarque',
            populate: [
                {
                    path: 'testId',
                    select: 'nom categories machineA machineB valeurMachineA valeurMachineB  valeur interpretationA interpretationB' // Assurez-vous que 'nom' est le champ du schéma Test contenant le nom du test
                },
                {
                    path: 'updatedBy',
                    select: 'nom prenom' // Sélection des champs 'nom' et 'prenom' de l'utilisateur qui a mis à jour
                }
            ]
        })
        .populate({
            path: 'fileResultat', // Ajouter le chemin vers fileResultat
            select: 'createdAt path updatedBy', // Sélectionner les champs nécessaires
            populate: {
                path: 'updatedBy',
                select: 'nom prenom' // Sélectionner les champs de l'utilisateur qui a mis à jour
            }
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
        .populate('userId', 'nom prenom email adresse  telephone dateNaissance age nip createdAt updatedAt sexe') // Inclure createdAt et updatedAt
        .populate('tests', 'nom description categories machineA machineB valeurMachineA valeurMachineB interpretationA interpretationB prixAssurance prixPaf prixIpm prixSococim  prixClinique coeficiantB  montantRecus') // Inclure createdAt et updatedAt
        .populate('partenaireId', 'nom typePartenaire')
        .populate({
            path: 'historiques',
            select: 'status description date createdAt updatedAt', // Inclure createdAt et updatedAt pour historiques
            populate: {
                path: 'updatedBy',
                select: 'nom prenom logo createdAt updatedAt' // Inclure createdAt et updatedAt pour updatedBy
            },

        })

        .populate({
            path: 'resultat', // Modifier ici pour correspondre au champ de votre schéma Analyse qui contient les ID des résultats
            select: 'valeur remarque qualitatif interpretationA interpretationB methode dernierResultatAnterieur testId statutInterpretation typePrelevement lieuPrelevement statutMachine datePrelevement updatedBy createdAt updatedAt observations culture gram conclusion',
            populate: [
                {
                    path: 'testId',
                    select: 'nom categories machineA machineB valeurMachineA valeurMachineB  valeur interpretationA interpretationB' // Assurez-vous que 'nom' est le champ du schéma Test contenant le nom du test
                },
                {
                    path: 'updatedBy',
                    select: 'nom prenom' // Sélection des champs 'nom' et 'prenom' de l'utilisateur qui a mis à jour
                }
            ]
        })
        .populate({
            path: 'fileResultat', // Ajouter le chemin vers fileResultat
            select: 'createdAt path updatedBy', // Sélectionner les champs nécessaires
            populate: {
                path: 'updatedBy',
                select: 'nom prenom' // Sélectionner les champs de l'utilisateur qui a mis à jour
            }
        });

    res.status(200).json({
        success: true,
        count: analyses.length,
        data: analyses
    });
});


// analyse  par clinique

exports.getAnalysesClinique = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.userType !== 'partenaire') {
        return res.status(403).json({
            success: false,
            message: "Access forbidden: Clinique user type required"
        });
    }

    const partenaireId = req.user.partenaireId; // Récupérer le partenaire ID de l'utilisateur connecté

    if (!partenaireId) {
        return res.status(400).json({
            success: false,
            message: "Partenaire ID is required for clinique users"
        });
    }

    const analyses = await Analyse.find({ partenaireId: partenaireId })
        .populate('userId', 'nom prenom email adresse telephone dateNaissance age nip createdAt updatedAt sexe')
        .populate('tests', 'nom description categories machineA machineB valeurMachineA valeurMachineB interpretationA interpretationB prixAssurance prixPaf prixIpm prixSococim  prixClinique coeficiantB montantRecus')
        .populate('partenaireId', 'nom typePartenaire')
        .populate({
            path: 'historiques',
            select: 'status description date createdAt updatedAt',
            populate: {
                path: 'updatedBy',
                select: 'nom prenom logo createdAt updatedAt'
            }
        })
        .populate({
            path: 'resultat',
            select: 'valeur remarque qualitatif interpretationA interpretationB methode dernierResultatAnterieur testId statutInterpretation typePrelevement lieuPrelevement statutMachine datePrelevement updatedBy createdAt updatedAt observations culture gram conclusion',
            populate: [
                {
                    path: 'testId',
                    select: 'nom categories machineA machineB valeurMachineA valeurMachineB valeur interpretationA interpretationB'
                },
                {
                    path: 'updatedBy',
                    select: 'nom prenom'
                }
            ]
        })
        .populate({
            path: 'fileResultat', // Ajouter le chemin vers fileResultat
            select: 'createdAt path updatedBy', // Sélectionner les champs nécessaires
            populate: {
                path: 'updatedBy',
                select: 'nom prenom' // Sélectionner les champs de l'utilisateur qui a mis à jour
            }
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
        .populate('userId', 'nom prenom email  adresse dateNaissance age nip telephone createdAt updatedAt sexe ')
        .populate('tests', 'nom description categories machineA machineB machineA machineB valeurMachineA valeurMachineB interpretationA interpretationB prixSococime prixAssurance prixPaf prixIpm prixClinique coeficiantB  montantRecus categorie')
        .populate('partenaireId', 'nom typePartenaire')
        .populate({
            path: 'historiques',
            select: 'status description date createdAt updatedAt', // Inclure createdAt et updatedAt pour historiques
            populate: {
                path: 'updatedBy',
                select: 'nom prenom logo createdAt updatedAt' // Inclure createdAt et updatedAt pour updatedBy
            },

        })

        .populate({
            path: 'resultat', // Modifier ici pour correspondre au champ de votre schéma Analyse qui contient les ID des résultats
            select: 'valeur remarque qualitatif interpretation dernierResultatAnterieur methode testId statutInterpretation interpretationA interpretationB typePrelevement lieuPrelevement statutMachine datePrelevement updatedBy createdAt updatedAt observations culture gram conclusion',
            populate: [
                {
                    path: 'testId',
                    select: 'nom categories machineA machineB valeurMachineA valeurMachineB valeur interpretationA interpretationB ' // Assurez-vous que 'nom' est le champ du schéma Test contenant le nom du test
                },
                {
                    path: 'updatedBy',
                    select: 'nom prenom' // Sélection des champs 'nom' et 'prenom' de l'utilisateur qui a mis à jour
                }
            ]
        })
        .populate({
            path: 'fileResultat', // Ajouter le chemin vers fileResultat
            select: 'createdAt path updatedBy', // Sélectionner les champs nécessaires
            populate: {
                path: 'updatedBy',
                select: 'nom prenom' // Sélectionner les champs de l'utilisateur qui a mis à jour
            }
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



  
// exports.updateAnalyse = asyncHandler(async (req, res) => {
//     const { userOwn, tests, typeAnalyse, partenaireId, statusPayement, avance = 0, pourcentageCouverture = 0, reduction = 0, typeReduction, pc1 = 0, pc2 = 0, deplacement = 0, dateDeRecuperation } = req.body;
//     let ordonnancePdfPath = req.file ? req.file.path : null;

//     let analyse = await Analyse.findById(req.params.id);
//     if (!analyse) {
//         return res.status(404).send('Analyse non trouvée');
//     }

//     let prixTotal = 0;
//     let prixPartenaire = 0;
//     let prixPatient = 0;
//     let typePartenaire = analyse.partenaireId ? (await Partenaire.findById(analyse.partenaireId)).typePartenaire : null;

//     if (partenaireId && mongoose.Types.ObjectId.isValid(partenaireId) && (!analyse.partenaireId || analyse.partenaireId.toString() !== partenaireId)) {
//         const partenaire = await Partenaire.findById(partenaireId);
//         if (!partenaire) {
//             return res.status(404).send('Partenaire non trouvé');
//         }
//         analyse.partenaireId = partenaire._id;
//         typePartenaire = partenaire.typePartenaire;
//     }

//     if (pourcentageCouverture !== undefined && analyse.pourcentageCouverture !== pourcentageCouverture) {
//         analyse.pourcentageCouverture = pourcentageCouverture;
//         if (analyse.pourcentageCouverture === 0) {
//             analyse.partenaireId = undefined;
//         }
//     }

//     const testsDetails = tests ? await Test.find({ '_id': { $in: tests } }) : analyse.tests;
//     testsDetails.forEach(test => {
//         if (typePartenaire === 'assurance') {
//             prixTotal += test.coeficiantB * test.prixAssurance;
//         } else if (typePartenaire === 'ipm') {
//             prixTotal += test.coeficiantB * test.prixIpm;
//         } else if (typePartenaire === 'sococim') {
//             prixTotal += test.coeficiantB * test.prixSococim;
//         } else if (typePartenaire === 'clinique') {
//             prixTotal += test.prixClinique;
//         } else {
//             prixTotal += test.coeficiantB * test.prixPaf;
//         }
//     });

//     // Ajouter pc1, pc2 et deplacement au prix total
//     prixTotal += Number(pc1) + Number(pc2) + Number(deplacement);

//     // Calcul du prix partenaire et du prix patient
//     if (typePartenaire) {
//         if (typePartenaire === 'clinique') {
//             prixPartenaire = prixTotal;
//             prixPatient = prixTotal;
//         } else {
//             prixPartenaire = (prixTotal * pourcentageCouverture) / 100;
//             prixPatient = prixTotal - prixPartenaire;
//         }
//     } else {
//         prixPatient = prixTotal;
//     }

//     if (reduction && typeReduction) {
//         if (typeReduction === 'montant') {
//             prixPatient = Math.max(0, prixPatient - reduction);
//         } else if (typeReduction === 'pourcentage') {
//             prixPatient = Math.max(0, prixPatient - (prixPatient * reduction / 100));
//         }
//     }

//     if (ordonnancePdfPath) {
//         analyse.ordonnancePdf = ordonnancePdfPath;
//     }
//     if (statusPayement) {
//         analyse.statusPayement = statusPayement;
//     }
//     if(typeAnalyse){
//         analyse.typeAnalyse = typeAnalyse;
//     }

//     // Ajout de la logique pour mettre à jour pc1, pc2, et deplacement
//     analyse.pc1 = Number(pc1);
//     analyse.pc2 = Number(pc2);
//     analyse.deplacement = Number(deplacement);
//     // Convertir la chaîne de caractères en Date, si dateDeRecuperation est fournie
//     if (dateDeRecuperation) {
//         analyse.dateDeRecuperation = new Date(dateDeRecuperation);
//     }

//     // Calcul du reliquat
//     const reliquat = prixPatient - avance;

//     analyse.tests = testsDetails.map(test => test._id); // Mise à jour des tests
//     analyse.prixTotal = prixTotal;
//     analyse.prixPartenaire = prixPartenaire;
//     analyse.prixPatient = prixPatient;
//     analyse.reduction = reduction;
//     analyse.typeReduction = typeReduction;
//     analyse.avance = avance;
//     analyse.reliquat = reliquat;

//     await analyse.save();

//     let etiquettePartenaire = await EtiquettePartenaire.findOne({ analyseId: analyse._id });
//     if (etiquettePartenaire) {
//         if (partenaireId && prixPartenaire > 0) {
//             // Mise à jour de l'étiquette existante même si le partenaire change
//             etiquettePartenaire.partenaireId = partenaireId;
//             etiquettePartenaire.sommeAPayer = prixPartenaire;
//             await etiquettePartenaire.save();
//         } else {
//             // Suppression de l'étiquette si l'analyse n'a plus de partenaire
//             await EtiquettePartenaire.findByIdAndDelete(etiquettePartenaire._id);
//         }
//     } else if (partenaireId) {
//         // Création d'une nouvelle étiquette si elle n'existe pas et qu'un partenaire est défini
//         await EtiquettePartenaire.create({
//             analyseId: analyse._id,
//             partenaireId,
//             sommeAPayer: prixPartenaire,
//         });
//     }

//     const historique = await Historique.create({
//         analyseId: analyse._id,
//         status: "Modification",
//         description: "Les informations de l'analyse ont été modifiées.",
//         updatedBy: userOwn,
//     });

//     analyse.historiques.push(historique._id);
//     await analyse.save();

//     res.status(200).json({
//         success: true,
//         data: analyse,
//     });
// });


exports.updateAnalyse = asyncHandler(async (req, res) => {
    const { userOwn, tests, typeAnalyse, partenaireId, statusPayement, avance = 0, pourcentageCouverture = 0, reduction = 0, typeReduction, pc1 = 0, pc2 = 0, deplacement = 0, dateDeRecuperation } = req.body;

    let ordonnancePdfPath = null;
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'ordonnances',
            use_filename: true,
            unique_filename: false,
            type: 'upload'
        });
        ordonnancePdfPath = result.secure_url;
    }

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
        } else if (typePartenaire === 'clinique') {
            prixTotal += test.prixClinique;
        } else {
            prixTotal += test.coeficiantB * test.prixPaf;
        }
    });

    // Ajouter pc1, pc2 et deplacement au prix total
    prixTotal += Number(pc1) + Number(pc2) + Number(deplacement);

    // Calcul du prix partenaire et du prix patient
    if (typePartenaire) {
        if (typePartenaire === 'clinique') {
            prixPartenaire = prixTotal;
            prixPatient = prixTotal;
        } else {
            prixPartenaire = (prixTotal * pourcentageCouverture) / 100;
            prixPatient = prixTotal - prixPartenaire;
        }
    } else {
        prixPatient = prixTotal;
    }

    if (reduction && typeReduction) {
        if (typeReduction === 'montant') {
            prixPatient = Math.max(0, prixPatient - reduction);
        } else if (typeReduction === 'pourcentage') {
            prixPatient = Math.max(0, prixPatient - (prixPatient * reduction / 100));
        }
    }

    if (ordonnancePdfPath) {
        analyse.ordonnancePdf = ordonnancePdfPath;
    }
    if (statusPayement) {
        analyse.statusPayement = statusPayement;
    }
    if(typeAnalyse){
        analyse.typeAnalyse = typeAnalyse;
    }

    // Ajout de la logique pour mettre à jour pc1, pc2, et deplacement
    analyse.pc1 = Number(pc1);
    analyse.pc2 = Number(pc2);
    analyse.deplacement = Number(deplacement);
    // Convertir la chaîne de caractères en Date, si dateDeRecuperation est fournie
    if (dateDeRecuperation) {
        analyse.dateDeRecuperation = new Date(dateDeRecuperation);
    }

    // Calcul du reliquat
    const reliquat = prixPatient - avance;

    analyse.tests = testsDetails.map(test => test._id); // Mise à jour des tests
    analyse.prixTotal = prixTotal;
    analyse.prixPartenaire = prixPartenaire;
    analyse.prixPatient = prixPatient;
    analyse.reduction = reduction;
    analyse.typeReduction = typeReduction;
    analyse.avance = avance;
    analyse.reliquat = reliquat;

    await analyse.save();

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
    } else if (partenaireId) {
        // Création d'une nouvelle étiquette si elle n'existe pas et qu'un partenaire est défini
        await EtiquettePartenaire.create({
            analyseId: analyse._id,
            partenaireId,
            sommeAPayer: prixPartenaire,
        });
    }

    const historique = await Historique.create({
        analyseId: analyse._id,
        status: "Modification",
        description: "Les informations de l'analyse ont été modifiées.",
        updatedBy: userOwn,
    });

    analyse.historiques.push(historique._id);
    await analyse.save();

    res.status(200).json({
        success: true,
        data: analyse,
    });
});






// Supprimer une analyse
// exports.deleteAnalyse = asyncHandler(async (req, res) => {
//     const analyse = await Analyse.findByIdAndDelete(req.params.id);

//     if (!analyse) {
//         res.status(404);
//         throw new Error('Analyse non trouvée');
//     }


//     res.status(200).json({
//         success: true,
//         data: {},
//         message: 'Analyse supprimée avec succès'
//     });
// });

exports.deleteAnalyse = asyncHandler(async (req, res) => {
    // Rechercher l'analyse par ID
    const analyse = await Analyse.findByIdAndDelete(req.params.id);

    if (!analyse) {
        res.status(404);
        throw new Error('Analyse non trouvée');
    }

    // Supprimer l'étiquette associée si elle existe
    await EtiquettePartenaire.deleteMany({ analyseId: analyse._id });

    res.status(200).json({
        success: true,
        data: {},
        message: 'Analyse et étiquette associée supprimées avec succès'
    });
});



exports.getTestIdsByAnalyse = asyncHandler(async (req, res) => {
    const { analyseId } = req.params;

    if (!mongoose.isValidObjectId(analyseId)) {
        return res.status(400).json({ success: false, message: 'Invalid Analyse ID' });
    }

    try {
        // Ajoutez les champs 'machineA' et 'machineB' dans le populate pour les récupérer
        const analyse = await Analyse.findById(analyseId)
            .populate('tests', '_id nom machineA machineB conclusions');

        if (!analyse) {
            return res.status(404).json({ success: false, message: 'Analyse not found' });
        }

        res.status(200).json({ success: true, data: analyse.tests });
    } catch (error) {
        console.error("Error retrieving test IDs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


exports.getTopTests = asyncHandler(async (req, res) => {
    try {
        // Aggrégation pour compter les occurrences de chaque test
        const topTests = await Analyse.aggregate([
            // Décomposer le tableau de tests pour chaque analyse
            { $unwind: '$tests' },
            // Grouper par test et compter les occurrences
            {
                $group: {
                    _id: '$tests',
                    count: { $sum: 1 }
                }
            },
            // Trier par le nombre d'occurrences décroissant
            { $sort: { count: -1 } },
            // Limiter à 5 résultats
            { $limit: 5 },
            // Optionnel: joindre avec la collection de tests pour obtenir des détails supplémentaires
            {
                $lookup: {
                    from: 'tests', // Assurez-vous que ce nom correspond à votre collection de tests
                    localField: '_id',
                    foreignField: '_id',
                    as: 'testDetails'
                }
            },
            // Déplier les détails du test (nécessaire si vous utilisez $lookup)
            {
                $unwind: {
                    path: '$testDetails',
                    preserveNullAndEmptyArrays: false
                }
            },
            // Projeter le format désiré
            {
                $project: {
                    _id: 0,
                    testId: '$_id',
                    name: '$testDetails.nom',
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: topTests
        });
    } catch (error) {
        console.error('Failed to retrieve top tests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving top tests'
        });
    }
});


// Contrôleur pour obtenir le nombre d'analyses par mois
exports.getAnalysesCountByMonth = asyncHandler(async (req, res) => {
    const year = req.query.year || new Date().getFullYear(); // Prendre l'année courante si aucune année n'est spécifiée

    const analysesPerMonth = await Analyse.aggregate([
        {
            $project: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
            }
        },
        {
            $match: {
                year: parseInt(year) // Assurer que l'année est un entier
            }
        },
        {
            $group: {
                _id: "$month",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 } // Trier par mois de façon ascendante
        }
    ]);

    res.status(200).json({
        success: true,
        data: analysesPerMonth
    });
});

// Contrôleur pour obtenir le nombre d'utilisations de chaque test par mois
exports.getTestUsageByMonth = asyncHandler(async (req, res) => {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear(); // Utiliser l'année courante si non spécifiée

    const testUsagePerMonth = await Analyse.aggregate([
        {
            // Filtre par année si spécifiée
            $match: {
                createdAt: {
                    $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                }
            }
        },
        {
            // Décomposer le tableau 'tests' pour travailler avec chaque test individuellement
            $unwind: '$tests'
        },
        {
            // Grouper par mois et par test
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    test: '$tests'
                },
                count: { $sum: 1 }
            }
        },
        {
            // Joindre les détails du test à partir de la collection de tests
            $lookup: {
                from: 'tests', // Assurez-vous que ce nom correspond à votre collection de tests
                localField: '_id.test',
                foreignField: '_id',
                as: 'testDetails'
            }
        },
        {
            // Déplier les détails du test pour faciliter l'accès
            $unwind: '$testDetails'
        },
        {
            // Trier par mois et par test pour une lecture ordonnée
            $sort: {
                '_id.month': 1,
                'count': -1
            }
        },
        {
            // Reformater les résultats pour inclure les noms des tests et le mois
            $project: {
                _id: 0,
                month: '$_id.month',
                testName: '$testDetails.nom',
                testCount: '$count'
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: testUsagePerMonth
    });
});




