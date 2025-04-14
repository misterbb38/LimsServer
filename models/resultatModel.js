// const mongoose = require('mongoose');

// const resultatSchema = new mongoose.Schema({
//   analyseId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Analyse',
//     required: true
//   },
//   testId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Test',
//     required: true
//   },
//   patientId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },

//   observations: {
//     macroscopique: [{
//       type: String
//     }],
//     microscopique: {
//       leucocytes: String,
//       hematies: String,
//       unite: String,
//       cellulesEpitheliales: String,
//       elementsLevuriforme: String,
//       filamentsMyceliens: String,
//       trichomonasVaginalis: String,
//       parasitesDetails: [{ type: String }],
//       cristauxDetails: [{ type: String }],
//       cristaux: String,
//       parasites: String,
//       cylindres: String,
//       trichomonasIntestinales: String,
//       oeufsDeBilharzies: String,
//       clueCells: String,
//       gardnerellaVaginalis: String,
//       bacillesDeDoderlein: String,
//       typeDeFlore: String,
//       ph: String,
//       rechercheDeStreptocoqueB: String,
//       monocytes: String,
//       polynucleairesNeutrophilesAlterees: String,
//       polynucleairesNeutrophilesNonAlterees: String,
//       eosinophiles: String,
//       basophiles: String
//     },
//     chimie: {
//       proteinesTotales: String,
//       proteinesArochies: String,
//       glycorachie: String,
//       acideUrique: String,
//       LDH: String,
//     },
//     rechercheChlamydia: {
//       naturePrelevement: String,
//       rechercheAntigeneChlamydiaTrochomatis: String,
//     },
//     rechercheMycoplasmes: {
//       naturePrelevement: String,
//       rechercheUreaplasmaUrealyticum: String,
//       rechercheMycoplasmaHominis: String,
//     },
//   },

//   culture: {
//     culture: String,
//     description: String,
//     germeIdentifie: [{
//       nom: { type: String, required: true },
//       antibiogramme: {
//         type: Map,
//         of: String
//       }
//     }]
//   },

//   gram: String,
//   conclusion: {
//     type: String,
//     default: ''
//   },
//   valeur: {
//     type: String,
//   },

//   // ========================================================================
//   // Les exceptions, y compris la NFS
//   // ========================================================================
//   exceptions: {
//     groupeSanguin: {
//       abo: String,
//       rhesus: String
//     },
//     qbc: {
//       positivite: String,
//       nombreCroix: Number,
//       densiteParasitaire: String,
//       especes: [String],
//     },
//     hgpo: {
//       t0: String,
//       t60: String,
//       t120: String,
//     },
//     ionogramme: {
//       na: String,
//       k: String,
//       cl: String,
//       ca: String,
//       mg: String,
//     },

//     // --------------------- Section NFS ---------------------
//     nfs: {
//       hematiesEtConstantes: {
//         gr:    { valeur: Number, unite: String, reference: String },
//         hgb:   { valeur: Number, unite: String, reference: String },
//         hct:   { valeur: Number, unite: String, reference: String },
//         vgm:   { valeur: Number, unite: String, reference: String },
//         tcmh:  { valeur: Number, unite: String, reference: String },
//         ccmh:  { valeur: Number, unite: String, reference: String },
//         // Pour IDR-CV, on stocke la valeur finale
//         // + si vous voulez un champ "ecartType" pour le calcul
//         idr_cv: { 
//           valeur: Number, 
//           unite: String, 
//           reference: String,
//           ecartType: Number, // si vous voulez stocker l’écart-type
//         },
//       },
//       leucocytesEtFormules: {
//         gb:   { valeur: Number, unite: String, reference: String, flag: String },

//         neut: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         lymph: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         mono: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         eo: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         baso: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         plt:  { valeur: Number, unite: String, reference: String, flag: String },

//         // ============= Blastes / cellules immatures =============
//         proerythroblastes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         erythroblastes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         myeloblastes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         promyelocytes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         myelocytes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         metamyelocytes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         monoblastes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//         lymphoblastes: {
//           valeur: Number,
//           unite: String,
//           pourcentage: Number,
//           referenceValeur: String,
//           referencePourcentage: String,
//           flag: String
//         },
//       }
//     }
//   },

//   methode: String,
//   dernierResultatAnterieur: {
//     valeur: String,
//     date: Date
//   },
//   interpretation: {
//     type: String,
//     default: ''
//   },
//   statutInterpretation: {
//     type: Boolean,
//     default: false
//   },
//   statutMachine: {
//     type: Boolean,
//     default: false
//   },
//   typePrelevement: {
//     type: String,
//     default: ''
//   },
//   matiere: {
//     type: String,
//     default: ''
//   },
//   qualitatif: {
//     type: String,
//     default: ''
//   },
//   lieuPrelevement: {
//     type: String,
//     default: ''
//   },
//   datePrelevement: Date,

//   remarque: {
//     type: String,
//     default: ''
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// },{
//   timestamps: true
// });

// // -----------------------------------------------------------------------------
// // FONCTION DE CALCUL DE LA NFS
// // -----------------------------------------------------------------------------
// async function calculerNFS(doc) {
//   if (!doc.exceptions || !doc.exceptions.nfs) {
//     return;
//   }
//   const { nfs } = doc.exceptions;

//   // ----- 1) Indices érythrocytaires -----
//   if (nfs.hematiesEtConstantes) {
//     const { gr, hgb, hct, idr_cv } = nfs.hematiesEtConstantes;
//     const grVal  = parseFloat(gr?.valeur)  || null;
//     const hgbVal = parseFloat(hgb?.valeur) || null;
//     const hctVal = parseFloat(hct?.valeur) || null;

//     // VGM = (HCT (%) / GR) * 10
//     if (grVal && hctVal && grVal !== 0) {
//       const vgmCalc = (hctVal / grVal) * 10;
//       nfs.hematiesEtConstantes.vgm.valeur = parseFloat(vgmCalc.toFixed(2));
//     }

//     // TCMH = (HGB (g/dL) / GR) * 10
//     if (grVal && hgbVal && grVal !== 0) {
//       const tcmhCalc = (hgbVal / grVal) * 10;
//       nfs.hematiesEtConstantes.tcmh.valeur = parseFloat(tcmhCalc.toFixed(2));
//     }

//     // CCMH = (HGB (g/dL) / HCT (%)) * 100
//     if (hctVal && hgbVal && hctVal !== 0) {
//       const ccmhCalc = (hgbVal / hctVal) * 100;
//       nfs.hematiesEtConstantes.ccmh.valeur = parseFloat(ccmhCalc.toFixed(2));
//     }

//     // IDR-CV = (ecartType / VGM) * 100
//     // S'il y a un champ "ecartType" quelque part (ex: idr_cv.ecartType)
    
//     if (idr_cv && idr_cv.ecartType) {
//       const et = parseFloat(idr_cv.ecartType);
//       const vgmVal = parseFloat(nfs.hematiesEtConstantes.vgm.valeur);
//       if (vgmVal && vgmVal !== 0 && !Number.isNaN(et)) {
//         idr_cv.valeur = parseFloat(((et / vgmVal) * 100).toFixed(2));
//       }
//     }
    
//   }

//   // ----- 2) Valeurs absolues leucocytaires -----
//   if (nfs.leucocytesEtFormules) {
//     const { gb } = nfs.leucocytesEtFormules;
//     const gbVal = parseFloat(gb?.valeur) || null;

//     // On liste tous les champs leucocytaires
//     const fieldsToProcess = [
//       'neut','lymph','mono','eo','baso','proerythroblastes','erythroblastes',
//       'myeloblastes','promyelocytes','myelocytes','metamyelocytes',
//       'monoblastes','lymphoblastes'
//     ];

//     if (gbVal && gbVal !== 0) {
//       fieldsToProcess.forEach((fieldKey) => {
//         const fieldObj = nfs.leucocytesEtFormules[fieldKey];
//         if (fieldObj?.pourcentage !== undefined) {
//           const pct = parseFloat(fieldObj.pourcentage);
//           if (!Number.isNaN(pct)) {
//             // Valeur = GB * (%/100)
//             fieldObj.valeur = parseFloat((gbVal * (pct / 100)).toFixed(2));
//           }
//         }
//       });
//     }
//   }
// }

// // -----------------------------------------------------------------------------
// // HOOK PRE('save') : s'exécute avant .save()
// // -----------------------------------------------------------------------------
// resultatSchema.pre('save', async function(next) {
//   await calculerNFS(this);
//   next();
// });

// // -----------------------------------------------------------------------------
// // HOOK PRE('findOneAndUpdate') : s'exécute avant findOneAndUpdate()
// // -----------------------------------------------------------------------------
// resultatSchema.pre('findOneAndUpdate', async function(next) {
//   // Récupération du document avant update
//   const docToUpdate = await this.model.findOne(this.getQuery());
//   if (!docToUpdate) return next();

//   // Appliquer la mise à jour sur docToUpdate
//   // pour simuler ce qu'il sera après update
//   // (puisqu'on veut calculer sur les nouvelles données)
//   const updates = this.getUpdate();
//   if (updates && updates.$set && updates.$set['exceptions.nfs']) {
//     // On fusionne le nfs actuel et le nfs envoyé dans $set
//     docToUpdate.exceptions.nfs = {
//       ...docToUpdate.exceptions.nfs,
//       ...updates.$set['exceptions.nfs'],
//     };
//   } 
//   else if (updates && updates['exceptions.nfs']) {
//     // Cas simple d'un update direct 
//     docToUpdate.exceptions.nfs = {
//       ...docToUpdate.exceptions.nfs,
//       ...updates['exceptions.nfs'],
//     };
//   }
  
//   // Ensuite, on calcule
//   await calculerNFS(docToUpdate);

//   // On réinjecte dans this
//   // -> pour prendre en compte dans le "updateOne"
//   // ATTENTION : findOneAndUpdate n'applique pas direct docToUpdate au DB
//   // Il faut injecter via .setUpdate() la structure la plus récente
//   this.setUpdate({
//     ...updates,
//     $set: {
//       ...updates.$set,
//       'exceptions.nfs': docToUpdate.exceptions.nfs
//     }
//   });

//   next();
// });

// // -----------------------------------------------------------------------------
// // Export
// // -----------------------------------------------------------------------------
// const Resultat = mongoose.model('Resultat', resultatSchema);
// module.exports = Resultat;



// ============================================================================
// Modèle "Resultat" Mongoose avec gestion de la NFS et fusion des données
// pour éviter le conflit "Updating the path 'exceptions' would create a conflict"
// ============================================================================
const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Définition du Schéma
// -----------------------------------------------------------------------------
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
    macroscopique: [{
      type: String
    }],
    microscopique: {
      leucocytes: String,
      hematies: String,
      unite: String,
      cellulesEpitheliales: String,
      elementsLevuriforme: String,
      filamentsMyceliens: String,
      trichomonasVaginalis: String,
      parasitesDetails: [{ type: String }],
      cristauxDetails: [{ type: String }],
      cristaux: String,
      parasites: String,
      cylindres: String,
      trichomonasIntestinales: String,
      oeufsDeBilharzies: String,
      clueCells: String,
      gardnerellaVaginalis: String,
      bacillesDeDoderlein: String,
      typeDeFlore: String,
      ph: String,
      rechercheDeStreptocoqueB: String,
      monocytes: String,
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
      naturePrelevement: String,
      rechercheAntigeneChlamydiaTrochomatis: String,
    },
    rechercheMycoplasmes: {
      naturePrelevement: String,
      rechercheUreaplasmaUrealyticum: String,
      rechercheMycoplasmaHominis: String,
    },
  },

  culture: {
    culture: String,
    description: String,
    germeIdentifie: [{
      nom: { type: String, required: true },
      antibiogramme: {
        type: Map,
        of: String // par ex : "S", "I", "R"
      }
    }]
  },

  gram: {
    type: String
  },
  conclusion: {
    type: String,
    default: ''
  },
  valeur: {
    type: String
  },

  // ========================================================================
  // exceptions : contient la NFS et autres paramètres spéciaux
  // ========================================================================
  exceptions: {
    groupeSanguin: {
      abo: String,
      rhesus: String
    },
    qbc: {
      positivite: String,
      nombreCroix: Number,
      densiteParasitaire: String,
      especes: [String],
    },
    hgpo: {
      t0: String,
      t60: String,
      t120: String,
    },
    ionogramme: {
      na: String,
      k: String,
      cl: String,
      ca: String,
      mg: String,
    },

    // --------------------- Section NFS ---------------------
    nfs: {
      hematiesEtConstantes: {
        gr:    { valeur: Number, unite: String, reference: String },
        hgb:   { valeur: Number, unite: String, reference: String },
        hct:   { valeur: Number, unite: String, reference: String },
        vgm:   { valeur: Number, unite: String, reference: String },
        tcmh:  { valeur: Number, unite: String, reference: String },
        ccmh:  { valeur: Number, unite: String, reference: String },
        // On peut stocker la valeur finale d'IDR-CV et/ou un champ ecartType
        idr_cv: {
          valeur: Number,
          unite: String,
          reference: String,
          ecartType: Number,
        },
      },

      leucocytesEtFormules: {
        gb:   { valeur: Number, unite: String, reference: String, flag: String },

        neut: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        lymph: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        mono: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        eo: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        baso: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        plt:  { valeur: Number, unite: String, reference: String, flag: String },

        // ============= Blastes / cellules immatures =============
        proerythroblastes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        erythroblastes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        myeloblastes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        promyelocytes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        myelocytes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        metamyelocytes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        monoblastes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
        lymphoblastes: {
          valeur: Number,
          unite: String,
          pourcentage: Number,
          referenceValeur: String,
          referencePourcentage: String,
          flag: String
        },
      }
    }
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
  statutMachine: {
    type: Boolean,
    default: false
  },
  typePrelevement: {
    type: String,
    default: ''
  },
  matiere: {
    type: String,
    default: ''
  },
  qualitatif: {
    type: String,
    default: ''
  },
  lieuPrelevement: {
    type: String,
    default: ''
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
},{
  timestamps: true
});

// -----------------------------------------------------------------------------
// Fonction de calcul automatique de la NFS
// -----------------------------------------------------------------------------
async function calculerNFS(doc) {
  if (!doc.exceptions || !doc.exceptions.nfs) return;
  const { nfs } = doc.exceptions;

  // 1) Calcul des indices érythrocytaires
  if (nfs.hematiesEtConstantes) {
    const { gr, hgb, hct, idr_cv } = nfs.hematiesEtConstantes;
    const grVal  = parseFloat(gr?.valeur)  || null;
    const hgbVal = parseFloat(hgb?.valeur) || null;
    const hctVal = parseFloat(hct?.valeur) || null;

    // VGM = (HCT (%) / GR) * 10
    if (grVal && hctVal && grVal !== 0) {
      const vgmCalc = (hctVal / grVal) * 10;
      nfs.hematiesEtConstantes.vgm.valeur = parseFloat(vgmCalc.toFixed(2));
    }

    // TCMH = (HGB (g/dL) / GR) * 10
    if (grVal && hgbVal && grVal !== 0) {
      const tcmhCalc = (hgbVal / grVal) * 10;
      nfs.hematiesEtConstantes.tcmh.valeur = parseFloat(tcmhCalc.toFixed(2));
    }

    // CCMH = (HGB (g/dL) / HCT (%) ) * 100
    if (hctVal && hgbVal && hctVal !== 0) {
      const ccmhCalc = (hgbVal / hctVal) * 100;
      nfs.hematiesEtConstantes.ccmh.valeur = parseFloat(ccmhCalc.toFixed(2));
    }

    // IDR-CV = (ecartType / VGM) * 100 (si ecartType est défini)
    if (idr_cv && idr_cv.ecartType) {
      const et = parseFloat(idr_cv.ecartType);
      const vgmVal = parseFloat(nfs.hematiesEtConstantes.vgm.valeur);
      if (vgmVal && vgmVal !== 0 && !Number.isNaN(et)) {
        idr_cv.valeur = parseFloat(((et / vgmVal) * 100).toFixed(2));
      }
    }
  }

  // 2) Calcul des valeurs absolues leucocytaires
  if (nfs.leucocytesEtFormules) {
    const { gb } = nfs.leucocytesEtFormules;
    const gbVal = parseFloat(gb?.valeur) || null;

    const fieldsToProcess = [
      'neut','lymph','mono','eo','baso',
      'proerythroblastes','erythroblastes','myeloblastes','promyelocytes',
      'myelocytes','metamyelocytes','monoblastes','lymphoblastes'
    ];

    if (gbVal && gbVal !== 0) {
      fieldsToProcess.forEach(fieldKey => {
        const fieldObj = nfs.leucocytesEtFormules[fieldKey];
        if (fieldObj && fieldObj.pourcentage !== undefined) {
          const pct = parseFloat(fieldObj.pourcentage);
          if (!Number.isNaN(pct)) {
            fieldObj.valeur = parseFloat((gbVal * (pct / 100)).toFixed(2));
          }
        }
      });
    }
  }
}

// -----------------------------------------------------------------------------
// Hook PRE('save') : avant d'enregistrer
// -----------------------------------------------------------------------------
resultatSchema.pre('save', async function(next) {
  await calculerNFS(this);
  next();
});

// -----------------------------------------------------------------------------
// Hook PRE('findOneAndUpdate') : avant toute mise à jour avec findOneAndUpdate
// -----------------------------------------------------------------------------
resultatSchema.pre('findOneAndUpdate', async function(next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (!docToUpdate) return next();

  const updates = this.getUpdate() || {};

  // 1) Fusionner TOUTES les mises à jour de "exceptions"
  //    pour éviter le double $set sur "exceptions" et "exceptions.nfs"
  // ---------------------------------------------------------------------------
  // S'il y a un $set.exceptions complet
  if (updates.$set && updates.$set.exceptions) {
    docToUpdate.exceptions = {
      ...docToUpdate.exceptions,
      ...updates.$set.exceptions
    };
    // On peut ensuite retirer le $set.exceptions pour éviter les conflits
    delete updates.$set.exceptions;
  }

  // S'il y a un $set["exceptions.nfs"] seulement
  if (updates.$set && updates.$set['exceptions.nfs']) {
    docToUpdate.exceptions.nfs = {
      ...docToUpdate.exceptions.nfs,
      ...updates.$set['exceptions.nfs']
    };
    delete updates.$set['exceptions.nfs'];
  }

  // Cas où on fait findOneAndUpdate({}, { exceptions: {...} }) sans $set
  if (updates.exceptions) {
    docToUpdate.exceptions = {
      ...docToUpdate.exceptions,
      ...updates.exceptions
    };
    delete updates.exceptions;
  }

  // Cas où on ferait findOneAndUpdate({}, { "exceptions.nfs": {...} }) direct
  if (updates['exceptions.nfs']) {
    docToUpdate.exceptions.nfs = {
      ...docToUpdate.exceptions.nfs,
      ...updates['exceptions.nfs']
    };
    delete updates['exceptions.nfs'];
  }

  // 2) Calculer la NFS sur ce docToUpdate fusionné
  await calculerNFS(docToUpdate);

  // 3) Finalement on met tout dans un unique $set sur "exceptions"
  this.setUpdate({
    ...updates,
    $set: {
      ...updates.$set, // on recopie ce qui reste du $set éventuel
      exceptions: docToUpdate.exceptions
    }
  });

  return next();
});

// -----------------------------------------------------------------------------
// Export du modèle
// -----------------------------------------------------------------------------
const Resultat = mongoose.model('Resultat', resultatSchema);
module.exports = Resultat;
