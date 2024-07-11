

const mongoose = require('mongoose');

const AnalyseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    }],
    resultat: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resultat',
        required: false
    }],
    fileResultat: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileResultat',
        required: false
    }],
    identifiant: {
        type: String,
        unique: true,
        required: true
    },
    historiques: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Historique'
    }],
    statusPayement: {
        type: String,
        required: [true, 'Le statut du payement est obligatoire'],
        default: 'Impayée'
    },
    typeAnalyse: {
        type: String,
        required: true,
        default: 'Interne'
    },
    ordonnancePdf: {
        type: String,
        required: false
    },
    pourcentageCouverture: {
        type: Number,
        required: false,
    },
    prixTotal: {
        type: Number,
        required: true,
        default: 0
    },

    prixPatient: {
        type: Number,
        required: true,
        default: 0
    },
    prixPartenaire: {
        type: Number,
        required: true,
        default: 0
    },
    reduction: {
        type: Number,
        required: false,
        default: 0
    },
    typeReduction: {
        type: String,
        required: false,
        enum: ['pourcentage', 'montant']
    },
    partenaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partenaire',
        required: false
    },
    pc1: {
        type: Number,
        required: false,
        default: 0
    },
    pc2: {
        type: Number,
        required: false,
        default: 0
    },
    deplacement: {
        type: Number,
        required: false,
        default: 0
    },
    montantRecus: {
        type: Number,
        required: true,
        default: 0
    },
    avance: {
        type: Number,
        required: false,
        default: 0
    },
    reliquat: {
        type: Number,
        required: false,
        default: function() {
            return this.prixPatient - this.avance;
        }
    },
    dateDeRecuperation: {
        type: Date,
        required: false,
        default: null
    },
    smsCount: {
        type: Number,
        default: 0,
      },
}, { timestamps: true });

// Middleware pour recalculer montantRecus, avance, et reliquat avant de sauvegarder un document
// Middleware pour recalculer montantRecus, avance, et reliquat avant de sauvegarder un document
AnalyseSchema.pre('save', function (next) {
    this.montantRecus = this.prixPatient + this.prixPartenaire + this.pc1 + this.pc2 + this.deplacement;
    this.reliquat = this.prixPatient - this.avance;
    next();
  });
  
  // Middleware pour recalculer prixTotal, montantRecus, avance et reliquat avant de mettre à jour un document via findOneAndUpdate
  AnalyseSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
  
    // Obtenir le document actuel pour accéder à ses valeurs
    const document = await mongoose.model('Analyse').findById(this.getQuery()._id);
  
    let updatedPrixTotal = document.prixTotal;
    let updatedMontantRecus = document.montantRecus;
    let updatedAvance = document.avance;
  
    const newPc1 = update.$set.pc1 !== undefined ? update.$set.pc1 : document.pc1;
    const newPc2 = update.$set.pc2 !== undefined ? update.$set.pc2 : document.pc2;
    const newDeplacement = update.$set.deplacement !== undefined ? update.$set.deplacement : document.deplacement;
  
    // Recalculer le prixTotal en additionnant les nouveaux pc1, pc2, et deplacement
    updatedPrixTotal = update.$set.prixTotal !== undefined ? update.$set.prixTotal : document.prixTotal;
    updatedPrixTotal += newPc1 + newPc2 + newDeplacement;
  
    // Recalculer montantRecus si nécessaire
    if (update.$set.prixPartenaire !== undefined || update.$set.prixPatient !== undefined) {
      const newPrixPartenaire = update.$set.prixPartenaire !== undefined ? update.$set.prixPartenaire : document.prixPartenaire;
      const newPrixPatient = update.$set.prixPatient !== undefined ? update.$set.prixPatient : document.prixPatient;
      updatedMontantRecus = newPrixPartenaire + newPrixPatient;
    }
  
    // Recalculer l'avance
    if (update.$set.avance !== undefined) {
      updatedAvance += update.$set.avance;
    }
  
    // Recalculer le reliquat
    const updatedReliquat = document.prixPatient - updatedAvance;
  
    // Mettre à jour les champs prixTotal, montantRecus, avance et reliquat
    this.set({ prixTotal: updatedPrixTotal, montantRecus: updatedMontantRecus, avance: updatedAvance, reliquat: updatedReliquat });
  
    next();
  });
  

module.exports = mongoose.model('Analyse', AnalyseSchema);
