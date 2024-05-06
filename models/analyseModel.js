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
        default: 'Impayée'// Par défaut, les tests sont activés
    },
    ordonnancePdf: {
        type: String,
        required: false // Ce champ est optionnel
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
        required: false, // Ce champ peut être optionnel selon votre logique d'application
        enum: ['pourcentage', 'montant']
    },
    partenaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partenaire',
        required: false // Ce champ peut être optionnel selon votre logique d'application
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
    dateDeRecuperation: {
        type: Date,
        required: false, // Mettez à true si la date de récupération est obligatoire
        default: null // Vous pouvez spécifier une valeur par défaut ou laisser vide
    },
}, { timestamps: true });
// Middleware pour recalculer montantRecus avant de sauvegarder un document
AnalyseSchema.pre('save', function (next) {
    // Calculer le nouveau montantRecus
    this.montantRecus = this.prixPatient + this.prixPartenaire + this.pc1 + this.pc2 + this.deplacement;
    next();
});

// Middleware pour recalculer prixTotal et montantRecus avant de mettre à jour un document via findOneAndUpdate
AnalyseSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    // Obtenir le document actuel pour accéder à ses valeurs
    const document = await mongoose.model('Analyse').findById(this.getQuery()._id);

    let updatedPrixTotal = document.prixTotal;
    let updatedMontantRecus = document.montantRecus;

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
    // Mettre à jour les champs prixTotal et montantRecus
    this.set({ prixTotal: updatedPrixTotal, montantRecus: updatedMontantRecus });

    next();

});







module.exports = mongoose.model('Analyse', AnalyseSchema);