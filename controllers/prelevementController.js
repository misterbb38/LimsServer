const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Analyse = require('../models/analyseModel');
const User = require('../models/userModel');
const Test = require('../models/testModel');
const Historique = require('../models/historiqueModel');

// Statuts possibles PAR PARAMETRE (test du dossier).
const STATUTS_PARAM = ['Prélevé', 'Non prélevé', 'À reprélever', 'À contrôler'];

// Statuts DERIVES du dossier (calcules, jamais choisis directement).
const STATUTS_DOSSIER = [
    'Non prélevé',
    'En attente',
    'Effectué',
    'À reprélever',
    'À contrôler',
];

// Derive le statut global du dossier a partir des statuts par parametre :
//  - au moins un 'À reprélever'  -> 'À reprélever'   (le plus urgent)
//  - sinon au moins un 'À contrôler' -> 'À contrôler'
//  - tous 'Prélevé'              -> 'Effectué'
//  - au moins un 'Prélevé'       -> 'En attente'     (partiel)
//  - sinon                       -> 'Non prélevé'
const deriverStatutDossier = (parametres) => {
    const statuts = parametres.map((p) => p.statut);
    if (statuts.includes('À reprélever')) return 'À reprélever';
    if (statuts.includes('À contrôler')) return 'À contrôler';
    const nbPreleves = statuts.filter((s) => s === 'Prélevé').length;
    if (statuts.length > 0 && nbPreleves === statuts.length) return 'Effectué';
    if (nbPreleves > 0) return 'En attente';
    return 'Non prélevé';
};

// Populate communs de la liste (allegee : uniquement ce que la page
// Prelevement affiche).
const LIST_POPULATE = [
    { path: 'userId', select: 'nom prenom nip telephone' },
    { path: 'tests', select: 'nom' },
    { path: 'prelevement.parametres.testId', select: 'nom' },
    { path: 'prelevement.preleveurId', select: 'nom prenom' },
];

// Echappe une chaine pour l'utiliser dans une RegExp.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/prelevement
// Query : page (1), limit (25, max 100), statut (statut DERIVE du
// dossier), search (identifiant OU nom/prenom/NIP du patient),
// dateDebut, dateFin (sur createdAt, fin de journee incluse).
exports.getPrelevements = asyncHandler(async (req, res) => {
    const { statut, search, dateDebut, dateFin } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));

    const clauses = [];

    if (statut) {
        if (statut === 'Non prélevé') {
            // Inclut le legacy : dossiers crees avant le module, sans
            // sous-document prelevement.
            clauses.push({
                $or: [
                    { 'prelevement.statut': 'Non prélevé' },
                    { 'prelevement.statut': { $exists: false } },
                    { prelevement: { $exists: false } },
                ],
            });
        } else {
            clauses.push({ 'prelevement.statut': statut });
        }
    }

    if (dateDebut || dateFin) {
        const range = {};
        if (dateDebut) range.$gte = new Date(dateDebut);
        if (dateFin) {
            const fin = new Date(dateFin);
            fin.setHours(23, 59, 59, 999);
            range.$lte = fin;
        }
        clauses.push({ createdAt: range });
    }

    if (search) {
        const rx = new RegExp(escapeRegex(search.trim()), 'i');
        // Patients correspondants (nom, prenom ou NIP)
        const users = await User.find({
            $or: [{ nom: rx }, { prenom: rx }, { nip: rx }],
        }).select('_id');
        clauses.push({
            $or: [
                { identifiant: rx },
                { userId: { $in: users.map((u) => u._id) } },
            ],
        });
    }

    const filter = clauses.length > 0 ? { $and: clauses } : {};

    const [total, data] = await Promise.all([
        Analyse.countDocuments(filter),
        Analyse.find(filter)
            .select('identifiant createdAt userId tests prelevement')
            .populate(LIST_POPULATE)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
    ]);

    res.json({
        success: true,
        data,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    });
});

// PUT /api/prelevement/:analyseId
// Body : { parametres: [{ testId, statut }], commentaire = '' }
// Chaque parametre du dossier recoit son statut ; le statut global du
// dossier est DERIVE automatiquement.
// Ecrit UNIQUEMENT le sous-document prelevement (jamais via
// findByIdAndUpdate ni updateAnalyse : les hooks/l'update d'Analyse
// alterent la tarification). findById + save() est sur (pre('save')
// idempotent).
const ORIGINES = ['Prélevé au laboratoire', 'Apporté au laboratoire'];

exports.updatePrelevement = asyncHandler(async (req, res) => {
    const { analyseId } = req.params;
    const {
        parametres,
        commentaire = '',
        origine = 'Prélevé au laboratoire',
    } = req.body;

    if (!ORIGINES.includes(origine)) {
        return res.status(400).json({
            success: false,
            message: `Origine invalide. Valeurs possibles : ${ORIGINES.join(', ')}`,
        });
    }

    if (!mongoose.Types.ObjectId.isValid(analyseId)) {
        return res
            .status(400)
            .json({ success: false, message: 'Identifiant de dossier invalide' });
    }
    if (!Array.isArray(parametres) || parametres.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'La liste des paramètres et leurs statuts est requise',
        });
    }
    for (const p of parametres) {
        if (!p || !p.testId || !STATUTS_PARAM.includes(p.statut)) {
            return res.status(400).json({
                success: false,
                message: `Chaque paramètre doit avoir un statut parmi : ${STATUTS_PARAM.join(', ')}`,
            });
        }
    }

    const analyse = await Analyse.findById(analyseId);
    if (!analyse) {
        return res
            .status(404)
            .json({ success: false, message: 'Dossier introuvable' });
    }

    // Chaque testId doit appartenir au dossier, sans doublon.
    const testsDossier = new Set(analyse.tests.map(String));
    const vus = new Set();
    for (const p of parametres) {
        const id = String(p.testId);
        if (!testsDossier.has(id)) {
            return res.status(400).json({
                success: false,
                message: 'Certains paramètres ne font pas partie de ce dossier',
            });
        }
        if (vus.has(id)) {
            return res.status(400).json({
                success: false,
                message: 'Un paramètre apparaît plusieurs fois',
            });
        }
        vus.add(id);
    }

    const statutDossier = deriverStatutDossier(parametres);

    analyse.prelevement = {
        statut: statutDossier,
        parametres: parametres.map((p) => ({
            testId: p.testId,
            statut: p.statut,
        })),
        origine,
        commentaire: String(commentaire || ''),
        // Qui a preleve / receptionne : TOUJOURS l'utilisateur connecte.
        preleveurId: req.user._id,
        datePrelevement: new Date(),
    };

    // Traçabilite : entree d'historique visible dans la fiche analyse.
    // Detail par parametre uniquement pour ceux qui ne sont pas
    // simplement preleves (sinon la description devient illisible).
    const aSignaler = parametres.filter((p) => p.statut !== 'Prélevé');
    let detail = '';
    if (aSignaler.length > 0) {
        const docs = await Test.find({
            _id: { $in: aSignaler.map((p) => p.testId) },
        }).select('nom');
        const nomById = new Map(docs.map((t) => [String(t._id), t.nom]));
        detail =
            ' — ' +
            aSignaler
                .map((p) => `${nomById.get(String(p.testId)) || p.testId} : ${p.statut}`)
                .join(', ');
    }
    // Qui a agi (preleve ou receptionne) : trace nominative explicite.
    const acteur = `${req.user.prenom || ''} ${req.user.nom || ''}`.trim();
    const verbe =
        origine === 'Apporté au laboratoire' ? 'réceptionné par' : 'prélevé par';
    const description =
        `Prélèvement : ${statutDossier} (${origine}, ${verbe} ${acteur})` +
        detail +
        (commentaire ? ` — ${commentaire}` : '');
    const hist = await Historique.create({
        analyseId: analyse._id,
        status: 'Salle de prelevement',
        description,
        updatedBy: req.user._id,
    });
    analyse.historiques.push(hist._id);

    await analyse.save();

    const data = await Analyse.findById(analyse._id)
        .select('identifiant createdAt userId tests prelevement')
        .populate(LIST_POPULATE)
        .lean();

    res.json({ success: true, data });
});
