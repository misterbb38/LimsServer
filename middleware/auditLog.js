const jwt = require('jsonwebtoken');
const Log = require('../models/LogModel');
const User = require('../models/userModel');

// Champs sensibles a retirer du payload journalise
const SENSITIVE_KEYS = new Set([
    'password', 'newPassword', 'oldPassword', 'token', 'secret',
    'authorization', 'apiKey', 'creditCard',
]);

function sanitize(obj, depth = 0) {
    if (depth > 4) return '...';
    if (obj == null) return obj;
    if (typeof obj === 'string') {
        return obj.length > 500 ? obj.slice(0, 500) + '...' : obj;
    }
    if (Array.isArray(obj)) return obj.slice(0, 50).map((v) => sanitize(v, depth + 1));
    if (typeof obj === 'object') {
        const out = {};
        for (const k of Object.keys(obj)) {
            if (SENSITIVE_KEYS.has(k)) continue;
            out[k] = sanitize(obj[k], depth + 1);
        }
        return out;
    }
    return obj;
}

function inferResource(path) {
    const m = path.match(/^\/api\/([a-zA-Z-]+)/);
    return m ? m[1] : null;
}

async function getUserFromReq(req) {
    try {
        const auth = req.headers?.authorization;
        if (!auth?.startsWith('Bearer ')) return null;
        const token = auth.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload?.id) return null;
        return await User.findById(payload.id).select('nom prenom userType');
    } catch (_) { return null; }
}

// Champs metier suivis par ressource + libelle francais. Sert a la
// fois pour calculer le snapshot et generer un diff lisible.
const TRACKED_FIELDS = {
    analyse: {
        statusPayement: 'Statut paiement',
        avance: 'Avance (CFA)',
        reliquat: 'Reliquat (CFA)',
        reduction: 'Réduction',
        typeReduction: 'Type de réduction',
        pourcentageCouverture: 'Couverture partenaire (%)',
        prixTotal: 'Prix total (CFA)',
        prixPartenaire: 'Part partenaire (CFA)',
        prixPatient: 'Part patient (CFA)',
        pc1: 'PC1 (CFA)',
        pc2: 'PC2 (CFA)',
        deplacement: 'Déplacement (CFA)',
        dateDeRecuperation: 'Date de récupération',
        typeAnalyse: 'Type d\'analyse',
        partenaireId: 'Assurance/IPM',
        cliniquePartenaireId: 'Clinique partenaire',
    },
    partenaire: {
        nom: 'Nom',
        typePartenaire: 'Type',
        telephone: 'Téléphone',
        nip: 'NIP',
    },
    user: {
        nom: 'Nom',
        prenom: 'Prénom',
        email: 'Email',
        telephone: 'Téléphone',
        userType: 'Rôle',
        profil: 'Profil',
    },
    eti: {
        statusPayement: 'Statut facture partenaire',
        sommeAPayer: 'Somme à payer (CFA)',
    },
    test: {
        nom: 'Nom du test',
        categories: 'Catégorie',
        prixPaf: 'Prix PAF',
        prixAssurance: 'Prix Assurance',
        prixIpm: 'Prix IPM',
    },
    resultats: {
        valeur: 'Valeur',
        statutInterpretation: 'Statut interprétation',
        observations: 'Observations',
    },
};

async function fetchResourceLean(resource, id) {
    try {
        if (resource === 'analyse') {
            const Analyse = require('../models/analyseModel');
            return await Analyse.findById(id).lean();
        }
        if (resource === 'partenaire') {
            const Partenaire = require('../models/PartenaireModel');
            return await Partenaire.findById(id).lean();
        }
        if (resource === 'test') {
            const Test = require('../models/testModel');
            return await Test.findById(id).lean();
        }
        if (resource === 'user') {
            return await User.findById(id).lean();
        }
        if (resource === 'eti') {
            const Eti = require('../models/etiquettePartenaireModel');
            return await Eti.findById(id).populate('analyseId', 'identifiant').lean();
        }
        if (resource === 'resultats') {
            const Resultat = require('../models/resultatModel');
            return await Resultat.findById(id).lean();
        }
    } catch (_) { /* ignore */ }
    return null;
}

// Extrait un libelle lisible pour la ressource (ex: numero d'analyse)
function extractLabel(resource, doc) {
    if (!doc) return null;
    if (resource === 'analyse') return doc.identifiant;
    if (resource === 'partenaire' || resource === 'test') return doc.nom;
    if (resource === 'user') {
        const name = `${doc.prenom || ''} ${doc.nom || ''}`.trim();
        return doc.nip ? `${name} (NIP ${doc.nip})` : name;
    }
    if (resource === 'eti') {
        return doc.analyseId?.identifiant
            ? `Facture analyse N° ${doc.analyseId.identifiant}`
            : null;
    }
    return null;
}

// Normalise une valeur pour comparaison + affichage stable
function normalize(v) {
    if (v == null) return null;
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'object' && v._id) return String(v._id);
    if (typeof v === 'object' && Array.isArray(v)) return v.length;
    return v;
}

// Construit le diff lisible entre 2 snapshots, limite aux champs
// suivis pour la ressource concernee.
function computeChanges(resource, avant, apres) {
    const fields = TRACKED_FIELDS[resource];
    if (!fields) return [];
    const changes = [];
    for (const [key, label] of Object.entries(fields)) {
        const b = normalize(avant?.[key]);
        const a = normalize(apres?.[key]);
        if (b !== a) {
            changes.push({ field: key, label, before: b, after: a });
        }
    }
    return changes;
}

function auditLog(req, res, next) {
    if (req.method === 'GET' || req.method === 'OPTIONS') return next();
    const fullUrl = (req.originalUrl || req.url || '').split('?')[0];
    if (!fullUrl.startsWith('/api/')) return next();
    if (fullUrl.startsWith('/api/log')) return next();

    const start = Date.now();
    const resource = inferResource(fullUrl);
    const segments = fullUrl.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    const resourceId = /^[a-f0-9]{24}$/.test(last) ? last : undefined;

    // Snapshot AVANT (PUT/PATCH/DELETE avec un ID dans l'URL)
    let snapAvantPromise = Promise.resolve(null);
    if (
        resourceId &&
        ['PUT', 'PATCH', 'DELETE'].includes(req.method) &&
        resource
    ) {
        snapAvantPromise = fetchResourceLean(resource, resourceId);
    }

    res.on('finish', async () => {
        try {
            const [user, snapAvant] = await Promise.all([
                getUserFromReq(req),
                snapAvantPromise,
            ]);

            // Snapshot APRES : PUT/PATCH/POST (pas DELETE car
            // l'objet n'existe plus). Pour POST, on essaie de
            // recuperer le dernier doc cree par cet utilisateur
            // (best-effort, non garanti).
            let snapApres = null;
            if (
                resource &&
                resourceId &&
                ['PUT', 'PATCH'].includes(req.method)
            ) {
                snapApres = await fetchResourceLean(resource, resourceId);
            }

            // Calcul du diff
            let changes = [];
            if (snapAvant && snapApres) {
                changes = computeChanges(resource, snapAvant, snapApres);
            }

            // Libelle (nouveau si dispo, sinon ancien)
            const resourceLabel = extractLabel(resource, snapApres || snapAvant);

            const desc = `${req.method} ${fullUrl} (${res.statusCode}) — ${Date.now() - start}ms`;

            await Log.create({
                userId: user?._id,
                userNom: user?.nom,
                userPrenom: user?.prenom,
                userType: user?.userType,
                method: req.method,
                path: fullUrl,
                resource,
                resourceId,
                resourceLabel,
                statusCode: res.statusCode,
                description: desc,
                ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
                userAgent: req.headers['user-agent'],
                payload: sanitize(req.body),
                changes,
            });
        } catch (err) {
            console.error('[auditLog] echec ecriture log :', err.message);
        }
    });
    next();
}

module.exports = auditLog;
