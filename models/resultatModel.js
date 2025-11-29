
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
    },

    // ===================== NOUVEAUX CALCULS AJOUTÉS =====================

    // 1. Rapport PSA libre/PSA total
    psaRapport: {
      psaLibre: { valeur: Number, unite: String },   // ng/mL
      psaTotal: { valeur: Number, unite: String },   // ng/mL
      rapport: { valeur: Number, unite: String }     // % (calculé)
    },

    // 2. Taux de réticulocytes (AVEC 2 RÉSULTATS)
    reticulocytes: {
      pourcentage: { valeur: Number, unite: String },     // %
      gbRouges: { valeur: Number, unite: String },        // /µL (GR)
      valeurAbsolue: { valeur: Number, unite: String },   // /µL (calculé)
      pourcentageCalcule: { valeur: Number, unite: String } // % (calculé - redondant mais demandé)
    },

    // 3. Clairance créatinine (Cockcroft-Gault) - FORMULE CORRIGÉE
    clairanceCreatinine: {
      age: { valeur: Number, unite: String },              // années
      poids: { valeur: Number, unite: String },            // kg
      sexe: String,                                         // M/F
      creatinineMgL: { valeur: Number, unite: String },    // mg/L (CORRIGÉ)
      clairance: { valeur: Number, unite: String }         // mL/min (calculé)
    },

    // 4. DFG (CKD-EPI) - CONSTANTES CORRIGÉES
    dfg: {
      creatinineMgL: { valeur: Number, unite: String },   // mg/L (CORRIGÉ)
      age: { valeur: Number, unite: String },             // années
      sexe: String,                                        // M/F
      dfgValue: { valeur: Number, unite: String }         // mL/min/1.73m² (calculé)
    },

    // 5. Coefficient de saturation de la transferrine
    saturationTransferrine: {
      ferSerique: { valeur: Number, unite: String },      // µg/dL
      transferrine: { valeur: Number, unite: String },    // g/L
      ctff: { valeur: Number, unite: String },            // µmol/L (calculé)
      coefficient: { valeur: Number, unite: String }      // % (calculé)
    },

    // 6. Compte d'Addis - SCHÉMA CORRIGÉ
compteAddis: {
  leucocytesTotaux: { valeur: Number, unite: String },      // Nombre total
  hematiesTotales: { valeur: Number, unite: String },       // Nombre total
  dureeRecueil: { valeur: Number, unite: String },          // minutes
  leucocytesParMinute: { valeur: Number, unite: String },   // calculé
  hematiesParMinute: { valeur: Number, unite: String }      // calculé
},

    // 7. Calcium corrigé - FORMULE ENTIÈREMENT CORRIGÉE
    calciumCorrige: {
      calciumMesure: { valeur: Number, unite: String },   // mg/L
      albumine: { valeur: Number, unite: String },        // g/L
      calciumCorrige: { valeur: Number, unite: String }   // mmol/L (calculé)
    },

    // 8. Rapport albuminurie/créatininurie - UNITÉS CORRIGÉES
    rapportAlbuminurie: {
      albumineUrinaire: { valeur: Number, unite: String }, // mg/L
      creatinineUrinaire: { valeur: Number, unite: String }, // g/L
      rapport: { valeur: Number, unite: String }           // mg/g (calculé)
    },

    // 9. Rapport protéinurie/créatininurie
    rapportProteines: {
      proteinesUrinaires: { valeur: Number, unite: String }, // mg/dL
      creatinineUrinaire: { valeur: Number, unite: String },  // mg/dL
      rapport: { valeur: Number, unite: String }             // mg/mg (calculé)
    },

    // 10. Cholestérol LDL (Friedewald) - CONDITION CORRIGÉE
    cholesterolLdl: {
      cholesterolTotal: { valeur: Number, unite: String },  // g/L
      hdl: { valeur: Number, unite: String },              // g/L
      triglycerides: { valeur: Number, unite: String },    // g/L
      ldl: { valeur: Number, unite: String }               // g/L (calculé)
    },

    // 11. Lipides totaux - FORMULE SPÉCIFIQUE CORRIGÉE
    lipidesTotaux: {
      cholesterolTotal: { valeur: Number, unite: String },  // g/L
      triglycerides: { valeur: Number, unite: String },     // g/L
      lipidesTotaux: { valeur: Number, unite: String }      // g/L (calculé)
    },

    // 12. Microalbuminurie 24h
    microalbuminurie24h: {
      albumineUrinaire: { valeur: Number, unite: String },  // mg/L
      volumeUrinaire24h: { valeur: Number, unite: String }, // L
      microalbuminurie: { valeur: Number, unite: String }   // mg/24h (calculé)
    },

    // 13. Protéinurie 24h
    proteinurie24h: {
      proteinesUrinaires: { valeur: Number, unite: String }, // mg/L
      volumeUrinaire24h: { valeur: Number, unite: String },  // L
      proteinurie: { valeur: Number, unite: String }         // mg/24h (calculé)
    },

    // 14. Bilirubine indirecte
    bilirubineIndirecte: {
      bilirubineTotale: { valeur: Number, unite: String },   // mg/L
      bilirubineDirecte: { valeur: Number, unite: String },  // mg/L
      bilirubineIndirecte: { valeur: Number, unite: String } // mg/L (calculé)
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
// Fonction de calcul automatique de tous les paramètres
// -----------------------------------------------------------------------------
async function calculerParametres(doc) {
  if (!doc.exceptions) return;
  const { exceptions } = doc;

  // 1) Calcul de la NFS (conservé du code existant)
  await calculerNFS(doc);

  // 2) Nouveaux calculs avec formules corrigées

  // 1. Rapport PSA libre/PSA total
  if (exceptions.psaRapport) {
    const { psaLibre, psaTotal } = exceptions.psaRapport;
    if (psaLibre?.valeur && psaTotal?.valeur && psaTotal.valeur !== 0) {
      const rapport = (psaLibre.valeur / psaTotal.valeur) * 100;
      exceptions.psaRapport.rapport = {
        valeur: parseFloat(rapport.toFixed(2)),
        unite: '%'
      };
    }
  }

  // 2. Taux de réticulocytes (AVEC 2 RÉSULTATS)
  if (exceptions.reticulocytes) {
    const { pourcentage, gbRouges } = exceptions.reticulocytes;
    if (pourcentage?.valeur && gbRouges?.valeur) {
      const valeurAbsolue = (pourcentage.valeur / 100) * gbRouges.valeur;
      exceptions.reticulocytes.valeurAbsolue = {
        valeur: parseFloat(valeurAbsolue.toFixed(0)),
        unite: '/µL'
      };
      // Redondant mais demandé : pourcentage calculé (même que l'entrée)
      exceptions.reticulocytes.pourcentageCalcule = {
        valeur: pourcentage.valeur,
        unite: '%'
      };
    }
  }

  // 3. Clairance créatinine (Cockcroft-Gault) - FORMULE CORRIGÉE
  if (exceptions.clairanceCreatinine) {
    const { age, poids, sexe, creatinineMgL } = exceptions.clairanceCreatinine;
    if (age?.valeur && poids?.valeur && sexe && creatinineMgL?.valeur) {
      // Formule corrigée : ((140 - âge) × poids × K) / (créatinine (mg/L) × 8.84)
      const K = sexe.toLowerCase() === 'f' ? 1.04 : 1.23;
      const clairance = ((140 - age.valeur) * poids.valeur * K) / (creatinineMgL.valeur * 8.84);
      
      exceptions.clairanceCreatinine.clairance = {
        valeur: parseFloat(clairance.toFixed(2)),
        unite: 'mL/min'
      };
    }
  }

  // 4. DFG (CKD-EPI) - CONSTANTES CORRIGÉES
  if (exceptions.dfg) {
    const { creatinineMgL, age, sexe } = exceptions.dfg;
    if (creatinineMgL?.valeur && age?.valeur && sexe) {
      // Conversion créatinine mg/L vers mg/dL : mg/L × 8.84 = mg/dL
      const scrMgDl = creatinineMgL.valeur * 8.84;
      const isFemale = sexe.toLowerCase() === 'f';
      // Constantes corrigées
      const kappa = isFemale ? 1.018 : 1.159;
      const alpha = isFemale ? -0.329 : -0.411;
      
      const ratio = scrMgDl / kappa;
      const minTerm = Math.min(ratio, 1);
      const maxTerm = Math.max(ratio, 1);
      
      let dfgValue = 141 * Math.pow(minTerm, alpha) * Math.pow(maxTerm, -1.209) * Math.pow(0.993, age.valeur);
      if (isFemale) dfgValue *= 1.018;
      
      exceptions.dfg.dfgValue = {
        valeur: parseFloat(dfgValue.toFixed(2)),
        unite: 'mL/min/1.73m²'
      };
    }
  }

  // 5. Coefficient de saturation de la transferrine
  if (exceptions.saturationTransferrine) {
    const { ferSerique, transferrine } = exceptions.saturationTransferrine;
    if (ferSerique?.valeur && transferrine?.valeur) {
      const ctff = transferrine.valeur * 1.395; // CTFF = transferrine (g/L) * 1.395
      const coefficient = (ferSerique.valeur / ctff) * 100;
      
      exceptions.saturationTransferrine.ctff = {
        valeur: parseFloat(ctff.toFixed(2)),
        unite: 'µmol/L'
      };
      exceptions.saturationTransferrine.coefficient = {
        valeur: parseFloat(coefficient.toFixed(2)),
        unite: '%'
      };
    }
  }

  // 6. Compte d'Addis - CALCUL CORRIGÉ
if (exceptions.compteAddis) {
  const { leucocytesTotaux, hematiesTotales, dureeRecueil } = exceptions.compteAddis;
  
  // Calcul leucocytes par minute
  if (leucocytesTotaux?.valeur && dureeRecueil?.valeur && dureeRecueil.valeur !== 0) {
    const leucocytesParMinute = leucocytesTotaux.valeur / dureeRecueil.valeur;
    exceptions.compteAddis.leucocytesParMinute = {
      valeur: Math.round(leucocytesParMinute), // Arrondi sans décimales
      unite: 'éléments/min'
    };
  }
  
  // Calcul hématies par minute
  if (hematiesTotales?.valeur && dureeRecueil?.valeur && dureeRecueil.valeur !== 0) {
    const hematiesParMinute = hematiesTotales.valeur / dureeRecueil.valeur;
    exceptions.compteAddis.hematiesParMinute = {
      valeur: Math.round(hematiesParMinute), // Arrondi sans décimales
      unite: 'éléments/min'
    };
  }
}

  // 7. Calcium corrigé - FORMULE ENTIÈREMENT CORRIGÉE
  if (exceptions.calciumCorrige) {
    const { calciumMesure, albumine } = exceptions.calciumCorrige;
    if (calciumMesure?.valeur && albumine?.valeur) {
      // Formule corrigée : (Calcium mesuré(mg/L) × 0.025) - 0.025 × (40 - Albumine (g/L))
      const calciumCorrigeVal = (calciumMesure.valeur * 0.025) - 0.025 * (40 - albumine.valeur);
      exceptions.calciumCorrige.calciumCorrige = {
        valeur: parseFloat(calciumCorrigeVal.toFixed(3)),
        unite: 'mmol/L'
      };
    }
  }

  // 8. Rapport albuminurie/créatininurie - UNITÉS CORRIGÉES
  if (exceptions.rapportAlbuminurie) {
    const { albumineUrinaire, creatinineUrinaire } = exceptions.rapportAlbuminurie;
    if (albumineUrinaire?.valeur && creatinineUrinaire?.valeur && creatinineUrinaire.valeur !== 0) {
      // Albumine (mg/L) / Créatinine (g/L) = mg/g
      const rapport = albumineUrinaire.valeur / creatinineUrinaire.valeur;
      exceptions.rapportAlbuminurie.rapport = {
        valeur: parseFloat(rapport.toFixed(2)),
        unite: 'mg/g'
      };
    }
  }

  // 9. Rapport protéinurie/créatininurie
  if (exceptions.rapportProteines) {
    const { proteinesUrinaires, creatinineUrinaire } = exceptions.rapportProteines;
    if (proteinesUrinaires?.valeur && creatinineUrinaire?.valeur && creatinineUrinaire.valeur !== 0) {
      const rapport = proteinesUrinaires.valeur / creatinineUrinaire.valeur;
      exceptions.rapportProteines.rapport = {
        valeur: parseFloat(rapport.toFixed(3)),
        unite: 'mg/mg'
      };
    }
  }

  // 10. Cholestérol LDL (Friedewald) - CONDITION CORRIGÉE
  if (exceptions.cholesterolLdl) {
    const { cholesterolTotal, hdl, triglycerides } = exceptions.cholesterolLdl;
    if (cholesterolTotal?.valeur && hdl?.valeur && triglycerides?.valeur && triglycerides.valeur < 3.5) {
      // Condition corrigée : TG < 3.5 g/L
      const ldl = cholesterolTotal.valeur - hdl.valeur - (triglycerides.valeur / 5);
      exceptions.cholesterolLdl.ldl = {
        valeur: parseFloat(ldl.toFixed(3)),
        unite: 'g/L'
      };
    }
  }

  // 11. Lipides totaux - FORMULE SPÉCIFIQUE CORRIGÉE
  if (exceptions.lipidesTotaux) {
    const { cholesterolTotal, triglycerides } = exceptions.lipidesTotaux;
    if (cholesterolTotal?.valeur && triglycerides?.valeur) {
      // Formule corrigée : (Cholestérol total × 2.5) + Triglycérides
      const lipidesTotauxVal = (cholesterolTotal.valeur * 2.5) + triglycerides.valeur;
      
      exceptions.lipidesTotaux.lipidesTotaux = {
        valeur: parseFloat(lipidesTotauxVal.toFixed(3)),
        unite: 'g/L'
      };
    }
  }

  // 12. Microalbuminurie 24h
  if (exceptions.microalbuminurie24h) {
    const { albumineUrinaire, volumeUrinaire24h } = exceptions.microalbuminurie24h;
    if (albumineUrinaire?.valeur && volumeUrinaire24h?.valeur) {
      // Albumine (mg/L) × Volume (L) = mg/24h
      const microalbuminurie = albumineUrinaire.valeur * volumeUrinaire24h.valeur;
      exceptions.microalbuminurie24h.microalbuminurie = {
        valeur: parseFloat(microalbuminurie.toFixed(2)),
        unite: 'mg/24h'
      };
    }
  }

  // 13. Protéinurie 24h
  if (exceptions.proteinurie24h) {
    const { proteinesUrinaires, volumeUrinaire24h } = exceptions.proteinurie24h;
    if (proteinesUrinaires?.valeur && volumeUrinaire24h?.valeur) {
      // Protéines (mg/L) × Volume (L) = mg/24h
      const proteinurie = proteinesUrinaires.valeur * volumeUrinaire24h.valeur;
      exceptions.proteinurie24h.proteinurie = {
        valeur: parseFloat(proteinurie.toFixed(2)),
        unite: 'mg/24h'
      };
    }
  }

  // 14. Bilirubine indirecte
  if (exceptions.bilirubineIndirecte) {
    const { bilirubineTotale, bilirubineDirecte } = exceptions.bilirubineIndirecte;
    if (bilirubineTotale?.valeur && bilirubineDirecte?.valeur) {
      const bilirubineIndirecteVal = bilirubineTotale.valeur - bilirubineDirecte.valeur;
      exceptions.bilirubineIndirecte.bilirubineIndirecte = {
        valeur: parseFloat(bilirubineIndirecteVal.toFixed(2)),
        unite: 'mg/L'
      };
    }
  }
}

// -----------------------------------------------------------------------------
// Fonction de calcul automatique de la NFS (conservée du code existant)
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
  await calculerParametres(this);
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

  // Gérer tous les autres champs exceptions possibles
  const exceptionFields = [
    'exceptions.psaRapport', 'exceptions.reticulocytes', 'exceptions.clairanceCreatinine',
    'exceptions.dfg', 'exceptions.saturationTransferrine', 'exceptions.compteAddis',
    'exceptions.calciumCorrige', 'exceptions.rapportAlbuminurie', 'exceptions.rapportProteines',
    'exceptions.cholesterolLdl', 'exceptions.lipidesTotaux', 'exceptions.microalbuminurie24h',
    'exceptions.proteinurie24h', 'exceptions.bilirubineIndirecte'
  ];

  exceptionFields.forEach(field => {
    if (updates.$set && updates.$set[field]) {
      const fieldPath = field.split('.').slice(1); // Enlever 'exceptions'
      let current = docToUpdate.exceptions;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) current[fieldPath[i]] = {};
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = {
        ...current[fieldPath[fieldPath.length - 1]],
        ...updates.$set[field]
      };
      delete updates.$set[field];
    }
  });

  // 2) Calculer tous les paramètres sur ce docToUpdate fusionné
  await calculerParametres(docToUpdate);

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