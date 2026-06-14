const mongoose = require('mongoose');

// Journal d'audit : trace les actions effectuees par les utilisateurs
// (creation, modification, suppression) sur les ressources de l'app.
// Les GET ne sont PAS logges (volume).
const LogSchema = new mongoose.Schema({
    // Snapshot de l'utilisateur (pas de ref pour eviter les
    // populates et garder la trace meme si le user est supprime)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    userNom: String,
    userPrenom: String,
    userType: String, // patient / superadmin / medecin / etc.

    // Requete
    method: { type: String, enum: ['POST', 'PUT', 'PATCH', 'DELETE'], required: true },
    path: { type: String, required: true }, // ex: /api/analyse/123
    resource: { type: String }, // analyse / partenaire / test / user / eti / etc.
    resourceId: { type: String }, // ID de l'objet concerne
    // Libelle lisible de la ressource (numero d'analyse, nom du
    // partenaire/test, NIP du user...) recupere apres l'action via
    // un fetch en base. Permet un affichage 100% metier.
    resourceLabel: { type: String },

    // Resultat
    statusCode: Number,
    description: String, // libelle lisible : "Création analyse 250619001"

    // Contexte
    ipAddress: String,
    userAgent: String,
    // Snapshot partiel du body envoye (filtre pour ne pas stocker
    // mots de passe / fichiers). Sert au diagnostic / preuve.
    payload: mongoose.Schema.Types.Mixed,
    // Diff explicite des changements : pour les modifications, on
    // snapshote la ressource AVANT et APRES l'operation et on liste
    // les champs qui ont change ("avance : 0 -> 50 000").
    changes: [{
        field: String,
        label: String, // libelle francais (ex: "Avance")
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
    }],
}, { timestamps: true });

// Index pour requetes courantes
LogSchema.index({ createdAt: -1 });
LogSchema.index({ userId: 1, createdAt: -1 });
LogSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model('Log', LogSchema);
