// const mongoose = require('mongoose');

// const resultatSchema = new mongoose.Schema({
//     analyseId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Analyse',
//         required: true,  // Liaison obligatoire avec une analyse
//     },
//     testId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Test',
//         required: true,  // Liaison obligatoire avec un test
//     },
//     patientId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,  // Liaison obligatoire avec un utilisateur (patient)
//     },
//     valeur: {
//         type: String,
//         required: true,  // Valeur du résultat du test, obligatoire
//     },
//     methode: {
//         type: String,
//         required: false,  // methode du résultat du test, obligatoire
//     },
//     dernierResultatAnterieur: {
//         valeur: String,  // Dernière valeur connue pour ce test pour ce patient
//         date: Date       // Date du dernier résultat
//     },
//     interpretation: {
//         type: String,
//         default: '',  // Interprétation du résultat, facultative
//     },
//     valeurInterpretation: {
//         type: String,
//         default: '',  // Valeur détaillée pour l'interprétation, facultative
//     },
//     statutInterpretation: {
//         type: Boolean,
//         default: false  // Indique si l'interprétation a été validée
//     },
//     statutMachine: {
//         type: Boolean,
//         default: false  // Indiquequelle machine  a été validée
//     },
//     typePrelevement: {
//         type: String,
//         default: '',  // Type de prélèvement effectué, facultatif
//     },
//     datePrelevement: {
//         type: Date,
//         default: null  // Date à laquelle le prélèvement a été effectué, facultatif
//     },
//     remarque: {
//         type: String,
//         default: '',  // Remarques additionnelles sur le résultat, facultatif
//     },
//     updatedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',  // Utilisateur qui a mis à jour le résultat
//         required: true  // Non obligatoire, selon votre gestion des accès
//     }
// }, { timestamps: true });  // Crée automatiquement les propriétés createdAt et updatedAt

// const Resultat = mongoose.model('Resultat', resultatSchema);

// module.exports = Resultat;


const mongoose = require('mongoose');

const resultatSchema = new mongoose.Schema({
    analyseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analyse',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    observations: {
        macroscopique: String,
        microscopique: {
            leucocytes: String,
            hematies: String,
            unite: String,
            cellulesEpitheliales: {
                type: String,
            },
            elementsLevuriforme: {
                type: String,
            },
            filamentsMyceliens: {
                type: String,
            },
            trichomonasVaginalis: {
                type: String,
            },
            // autres champs microscopiques...
            parasitesDetails: [{ type: String }],
            cristauxDetails: [{ type: String }],
            cristaux: {
                type: String,
            },
            parasites: {
                type: String,
            },
            cylindres: {
                type: String,
            },

            trichomonasIntestinales: {
                type: String,
            },
            oeufsDeBilharzies: {
                type: String,
            },
            clueCells: {
                type: String,
            },
            gardnerellaVaginalis: {
                type: String,
            },
            bacillesDeDoderlein: {
                type: String,
            },
            typeDeFlore: {
                type: String,
            },
            ph: {
                type: String,
            },
            rechercheDeStreptocoqueB: {
                type: String,
            },
            monocytes: {
                type: String,
            },

            polynucleairesNeutrophilesAlterees: String,
            polynucleairesNeutrophilesNonAlterees: String,
            eosinophiles: String,
            basophiles: String
        },
        chimie: {
            proteinesTotales: String,
            proteinesArochies: String,
            glycorachie: String,
            acideUrique: String,
            LDH: String,
        },
        rechercheChlamydia: {
            naturePrelevement: { type: String },
            rechercheAntigeneChlamydiaTrochomatis: { type: String },
        },
        rechercheMycoplasmes: {
            naturePrelevement: String, // Ceci pourrait également être une énumération si nécessaire
            rechercheUreaplasmaUrealyticum: { type: String },
            rechercheMycoplasmaHominis: { type: String },
        },

        antibiogramme: {
            type: Map,
            of: String // 'S', 'I', 'R' pour sensible, intermédiaire, résistant
        }
    },

    culture: {
        culture: String,
        description: String, // Par exemple "DGU > 104"
        germeIdentifie: String, // Par exemple "Klebsiella pneumoniae ssp pneumoniae 1"
    },

    gram: {
        type: String, // Ex: 'Présence de Cocci Gram positif' ou 'Absence de germes'

    },
    conclusion: {
        type: String,
        default: ''
    },

    valeur: {
        type: String,
    },
    methode: String,
    dernierResultatAnterieur: {
        valeur: String,
        date: Date
    },
    interpretation: {
        type: String,
        default: ''
    },
    statutInterpretation: {
        type: Boolean,
        default: false
    },
    typePrelevement: {
        type: String,
        default: ''
    },
    lieuPrelevement: {
        type: String,
        default: ''
    },
    datePrelevement: {
        type: Date,

    },
    datePrelevement: Date,
    remarque: {
        type: String,
        default: ''
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Resultat = mongoose.model('Resultat', resultatSchema);

module.exports = Resultat;
