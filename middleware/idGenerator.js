const Counter = require('../models/Counter');

// Fonction pour obtenir le prochain identifiant
async function getNextId(type) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mois en 2 chiffres
    const day = now.getDate().toString().padStart(2, '0'); // Jour en 2 chiffres
    const dateStr = year + month + day;
    const id = `${type}-${dateStr}`;

    const counter = await Counter.findOneAndUpdate(
        { _id: id },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const seqStr = counter.seq.toString().padStart(3, '0'); // Numéro séquentiel avec remplissage de 0 pour obtenir 4 chiffres
    return dateStr + seqStr; // Retourne l'identifiant complet: YYMMDD + séquence
}




// Fonction pour obtenir le prochain NIP
async function getNextNip() {
    const year = new Date().getFullYear().toString().slice(-2); // Année en 2 chiffres
    const counter = await Counter.findOneAndUpdate(
        { _id: 'nip' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const seqStr = counter.seq.toString().padStart(5, '0');
    return seqStr + year; // Retourne NIP + année
}

module.exports = { getNextId, getNextNip };
