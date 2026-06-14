const asyncHandler = require('express-async-handler');
const DemandePayement = require('../models/DemandePayementModel');
const EtiquettePartenaire = require('../models/etiquettePartenaireModel');

// Genere une reference lisible : DP-AAAAMMJJ-NNN (N seq incrementale
// du jour). Best-effort, ignore les collisions (unique sparse).
const generateReference = async () => {
    const d = new Date();
    const stamp =
        d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0');
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const count = await DemandePayement.countDocuments({
        createdAt: { $gte: startOfDay },
    });
    return `DP-${stamp}-${String(count + 1).padStart(3, '0')}`;
};

// GET /api/demande-payement/preview?partenaireId=...&dateDebut=...&dateFin=...
// Liste les etiquettes ELIGIBLES (non encore incluses dans une autre
// demande, du partenaire, dans la periode). Sert au formulaire pour
// montrer ce qui sera inclus avant validation.
exports.previewDemande = asyncHandler(async (req, res) => {
    const { partenaireId, dateDebut, dateFin } = req.query;
    if (!partenaireId || !dateDebut || !dateFin) {
        return res.status(400).json({
            success: false,
            message: 'partenaireId, dateDebut et dateFin sont requis',
        });
    }
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    fin.setHours(23, 59, 59, 999);

    // Toutes les etiquettes du partenaire dans la periode
    const toutes = await EtiquettePartenaire.find({
        partenaireId,
        createdAt: { $gte: debut, $lte: fin },
    })
        .populate({
            path: 'analyseId',
            select: 'identifiant userId createdAt',
            populate: { path: 'userId', select: 'nom prenom' },
        })
        .populate('partenaireId', 'nom typePartenaire')
        .sort({ createdAt: 1 });

    // Etiquettes deja incluses dans une demande (set d'IDs string)
    const dejaIncluses = new Set(
        (await DemandePayement.distinct('etiquettes')).map(String)
    );

    let nbDejaIncluses = 0;
    let nbDejaPayees = 0;
    const eligibles = [];
    toutes.forEach((e) => {
        if (dejaIncluses.has(String(e._id))) {
            nbDejaIncluses++;
        } else if (e.statusPayement === 'Payée') {
            nbDejaPayees++;
        } else {
            eligibles.push(e);
        }
    });

    const sommeTotale = eligibles.reduce(
        (s, e) => s + Number(e.sommeAPayer || 0),
        0
    );

    res.json({
        success: true,
        nombreFactures: eligibles.length,
        sommeTotale,
        etiquettes: eligibles,
        // Diagnostic : explique pourquoi certaines sont exclues
        nbTotalPeriode: toutes.length,
        nbDejaIncluses,
        nbDejaPayees,
    });
});

// POST /api/demande-payement
exports.createDemande = asyncHandler(async (req, res) => {
    const { partenaireId, dateDebut, dateFin, note } = req.body;
    if (!partenaireId || !dateDebut || !dateFin) {
        return res
            .status(400)
            .json({ success: false, message: 'Champs manquants' });
    }
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    fin.setHours(23, 59, 59, 999);

    const dejaIncluses = await DemandePayement.distinct('etiquettes');
    // Meme filtre que le preview : uniquement les factures non payees
    const etiquettes = await EtiquettePartenaire.find({
        partenaireId,
        createdAt: { $gte: debut, $lte: fin },
        _id: { $nin: dejaIncluses },
        $or: [
            { statusPayement: 'Impayée' },
            { statusPayement: { $exists: false } },
            { statusPayement: null },
        ],
    }).select('_id sommeAPayer');

    if (etiquettes.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Aucune facture éligible pour ce partenaire sur cette période',
        });
    }

    const sommeTotale = etiquettes.reduce(
        (s, e) => s + Number(e.sommeAPayer || 0),
        0
    );
    const reference = await generateReference();

    const demande = await DemandePayement.create({
        partenaireId,
        dateDebut: debut,
        dateFin: fin,
        etiquettes: etiquettes.map((e) => e._id),
        sommeTotale,
        nombreFactures: etiquettes.length,
        statusPayement: 'Impayée',
        reference,
        createdBy: req.user?._id,
        note,
    });

    const populated = await DemandePayement.findById(demande._id)
        .populate('partenaireId', 'nom typePartenaire')
        .populate('createdBy', 'nom prenom');

    res.status(201).json({ success: true, data: populated });
});

// GET /api/demande-payement
// Filtres : partenaireId, statusPayement, dateDebut, dateFin (sur createdAt)
exports.getDemandes = asyncHandler(async (req, res) => {
    const { partenaireId, statusPayement, dateDebut, dateFin } = req.query;
    const filter = {};
    if (partenaireId) filter.partenaireId = partenaireId;
    if (statusPayement) filter.statusPayement = statusPayement;
    if (dateDebut || dateFin) {
        filter.createdAt = {};
        if (dateDebut) filter.createdAt.$gte = new Date(dateDebut);
        if (dateFin) {
            const d = new Date(dateFin);
            d.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = d;
        }
    }

    const demandes = await DemandePayement.find(filter)
        .populate('partenaireId', 'nom typePartenaire')
        .populate('createdBy', 'nom prenom')
        .sort({ createdAt: -1 });

    res.json({ success: true, count: demandes.length, data: demandes });
});

// GET /api/demande-payement/:id (avec details etiquettes)
exports.getDemandeById = asyncHandler(async (req, res) => {
    const demande = await DemandePayement.findById(req.params.id)
        .populate('partenaireId', 'nom typePartenaire telephone')
        .populate('createdBy', 'nom prenom')
        .populate({
            path: 'etiquettes',
            populate: {
                path: 'analyseId',
                select: 'identifiant userId createdAt pourcentageCouverture',
                populate: { path: 'userId', select: 'nom prenom' },
            },
        });

    if (!demande) {
        return res
            .status(404)
            .json({ success: false, message: 'Demande introuvable' });
    }
    res.json({ success: true, data: demande });
});

// PUT /api/demande-payement/:id
// Si statusPayement passe a 'Payée', on propage aux etiquettes
// incluses (elles deviennent Payee + datePayement = now).
exports.updateDemande = asyncHandler(async (req, res) => {
    const { statusPayement, note } = req.body;
    const demande = await DemandePayement.findById(req.params.id);
    if (!demande) {
        return res
            .status(404)
            .json({ success: false, message: 'Demande introuvable' });
    }
    const ancienStatus = demande.statusPayement;
    if (statusPayement) demande.statusPayement = statusPayement;
    if (note !== undefined) demande.note = note;

    if (statusPayement === 'Payée' && ancienStatus !== 'Payée') {
        demande.datePayement = new Date();
        // Propagation aux etiquettes incluses
        await EtiquettePartenaire.updateMany(
            { _id: { $in: demande.etiquettes } },
            { $set: { statusPayement: 'Payée', datePayement: new Date() } }
        );
    } else if (statusPayement === 'Impayée' && ancienStatus === 'Payée') {
        demande.datePayement = null;
        // On NE depropage PAS automatiquement le statut des etiquettes
        // (un partenaire peut changer d'avis sans qu'on annule le
        // paiement d'une etiquette individuelle qui aurait ete reglee
        // ailleurs). L'utilisateur doit basculer manuellement si besoin.
    }

    await demande.save();
    const populated = await DemandePayement.findById(demande._id)
        .populate('partenaireId', 'nom typePartenaire')
        .populate('createdBy', 'nom prenom');
    res.json({ success: true, data: populated });
});

// DELETE /api/demande-payement/:id
// Supprime la demande. Les etiquettes ne sont PAS impactees.
exports.deleteDemande = asyncHandler(async (req, res) => {
    const demande = await DemandePayement.findByIdAndDelete(req.params.id);
    if (!demande) {
        return res
            .status(404)
            .json({ success: false, message: 'Demande introuvable' });
    }
    res.json({ success: true, data: {} });
});
