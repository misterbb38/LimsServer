const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Analyse = require('../models/analyseModel');
const User = require('../models/userModel');
const Test = require('../models/testModel');
const Historique = require('../models/historiqueModel');

const STATUTS = [
    'Dossier non prélevé',
    'Effectué',
    'Non effectué',
    'À reprélever',
    'À contrôler',
];

// Statuts qui exigent la selection des parametres concernes.
const STATUTS_AVEC_DETAIL = ['Non effectué', 'À reprélever', 'À contrôler'];

// Populate communs de la liste (allegee : uniquement ce que la page
// Prelevement affiche).
const LIST_POPULATE = [
    { path: 'userId', select: 'nom prenom nip telephone' },
    { path: 'tests', select: 'nom' },
    { path: 'prelevement.testsConcernes', select: 'nom' },
    { path: 'prelevement.preleveurId', select: 'nom prenom' },
];

// Echappe une chaine pour l'utiliser dans une RegExp.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/prelevement
// Query : page (1), limit (25, max 100), statut, search (identifiant OU
// nom/prenom du patient), dateDebut, dateFin (sur createdAt, fin de
// journee incluse).
exports.getPrelevements = asyncHandler(async (req, res) => {
    const { statut, search, dateDebut, dateFin } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));

    const clauses = [];

    if (statut) {
        if (statut === 'Dossier non prélevé') {
            // Inclut le legacy : dossiers crees avant le module, sans
            // sous-document prelevement.
            clauses.push({
                $or: [
                    { 'prelevement.statut': 'Dossier non prélevé' },
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
// Body : { statut, testsConcernes = [], commentaire = '' }
// Ecrit UNIQUEMENT le sous-document prelevement (jamais via
// findByIdAndUpdate ni updateAnalyse : les hooks/l'update d'Analyse
// alterent la tarification). findById + save() est sur (pre('save')
// idempotent).
exports.updatePrelevement = asyncHandler(async (req, res) => {
    const { analyseId } = req.params;
    const { statut, commentaire = '' } = req.body;
    let { testsConcernes = [] } = req.body;

    if (!statut || !STATUTS.includes(statut)) {
        return res.status(400).json({
            success: false,
            message: `Statut invalide. Valeurs possibles : ${STATUTS.join(', ')}`,
        });
    }
    if (!mongoose.Types.ObjectId.isValid(analyseId)) {
        return res
            .status(400)
            .json({ success: false, message: 'Identifiant de dossier invalide' });
    }

    const analyse = await Analyse.findById(analyseId);
    if (!analyse) {
        return res
            .status(404)
            .json({ success: false, message: 'Dossier introuvable' });
    }

    if (STATUTS_AVEC_DETAIL.includes(statut)) {
        if (!Array.isArray(testsConcernes) || testsConcernes.length === 0) {
            return res.status(400).json({
                success: false,
                message: `Le statut "${statut}" exige au moins un paramètre concerné`,
            });
        }
        const testsDossier = new Set(analyse.tests.map(String));
        const invalides = testsConcernes.filter((t) => !testsDossier.has(String(t)));
        if (invalides.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Certains paramètres sélectionnés ne font pas partie de ce dossier',
            });
        }
    } else {
        // Effectué / Dossier non prélevé : pas de detail par parametre.
        testsConcernes = [];
    }

    analyse.prelevement = {
        statut,
        testsConcernes,
        commentaire: String(commentaire || ''),
        preleveurId: req.user._id,
        datePrelevement: new Date(),
    };

    // Traçabilite : entree d'historique visible dans la fiche analyse.
    let nomsTests = [];
    if (testsConcernes.length > 0) {
        const docs = await Test.find({ _id: { $in: testsConcernes } }).select('nom');
        nomsTests = docs.map((t) => t.nom);
    }
    const description =
        `Prélèvement : ${statut}` +
        (nomsTests.length > 0 ? ` — paramètres : ${nomsTests.join(', ')}` : '') +
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
