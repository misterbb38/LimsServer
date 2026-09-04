// Correction ciblee : analyses saisies en mode test avec un numero
// ANTIDATE (ex. 260813019 = dossier du 13/08) mais createdAt au jour de
// la saisie. Le dossier tombe alors dans le mauvais mois partout :
// Facture(Partenaire), Compta, statistiques.
//
// Le script remet createdAt a la date encodee dans le numero
// (AAMMJJ + sequence), en CONSERVANT l'heure d'origine, puis realigne
// l'etiquette partenaire du dossier (la facture partenaire est groupee
// par mois sur etiquette.createdAt).
//
// Usage :
//   node scripts/corrigerDateAnalyse.js                        # dry-run, dossiers par defaut
//   node scripts/corrigerDateAnalyse.js --apply                # applique
//   node scripts/corrigerDateAnalyse.js 260901012 --apply      # dossier(s) precis
//   node scripts/corrigerDateAnalyse.js --scan                 # liste TOUS les dossiers antidates
//   node scripts/corrigerDateAnalyse.js --restore <fichier>    # annule
//
// ATTENTION : deplace aussi le dossier dans Compta (chiffre d'affaires
// et encaissement suivent analyse.createdAt).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const SCAN = argv.includes('--scan');
const RESTORE = argv.includes('--restore') ? argv[argv.indexOf('--restore') + 1] : null;

// Dossiers valides par l'utilisateur (2026-09-04) : saisis en septembre
// avec un numero d'aout.
const PAR_DEFAUT = ['260813019', '260814024'];
const cibles = argv.filter((a) => /^\d{9}$/.test(a));
const identifiants = cibles.length > 0 ? cibles : PAR_DEFAUT;

const iso = (d) => (d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) : '-');

// Date encodee dans le numero de dossier (AAMMJJ), avec l'heure de
// createdAt conservee pour garder l'ordre de saisie dans la journee.
function dateDepuisIdentifiant(identifiant, createdAt) {
  const m = /^(\d{2})(\d{2})(\d{2})\d{3}$/.exec(String(identifiant));
  if (!m) return null;
  const [, aa, mm, jj] = m;
  const src = new Date(createdAt);
  const d = new Date(
    Date.UTC(
      2000 + Number(aa),
      Number(mm) - 1,
      Number(jj),
      src.getUTCHours(),
      src.getUTCMinutes(),
      src.getUTCSeconds(),
      src.getUTCMilliseconds()
    )
  );
  return isNaN(d.getTime()) ? null : d;
}

const memeJour = (a, b) =>
  new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'lims' });
  const Analyses = mongoose.connection.collection('analyses');
  const Etiquettes = mongoose.connection.collection('etiquettepartenaires');

  // --- Restauration ---
  if (RESTORE) {
    const sauvegarde = JSON.parse(fs.readFileSync(RESTORE, 'utf8'));
    let n = 0;
    for (const s of sauvegarde) {
      n += (
        await Analyses.updateOne(
          { _id: new mongoose.Types.ObjectId(s.analyseId) },
          { $set: { createdAt: new Date(s.ancienCreatedAt) } }
        )
      ).modifiedCount;
      if (s.etiquetteId) {
        await Etiquettes.updateOne(
          { _id: new mongoose.Types.ObjectId(s.etiquetteId) },
          { $set: { createdAt: new Date(s.ancienCreatedAt) } }
        );
      }
    }
    console.log(`RESTAURE : ${n} analyses remises a leur date d'origine.`);
    await mongoose.disconnect();
    return;
  }

  // --- Scan : tous les dossiers dont le numero ne colle pas au createdAt ---
  if (SCAN) {
    const toutes = await Analyses.find({ identifiant: /^\d{9}$/ })
      .project({ identifiant: 1, createdAt: 1 })
      .toArray();
    const antidates = toutes.filter((a) => {
      const d = dateDepuisIdentifiant(a.identifiant, a.createdAt);
      return d && !memeJour(d, a.createdAt);
    });
    console.log(`Dossiers dont le numero ne correspond pas au createdAt : ${antidates.length}`);
    antidates
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 40)
      .forEach((a) =>
        console.log(
          `  ${a.identifiant} | createdAt ${iso(a.createdAt)} -> numero ${iso(
            dateDepuisIdentifiant(a.identifiant, a.createdAt)
          )}`
        )
      );
    await mongoose.disconnect();
    return;
  }

  // --- Correction des dossiers cibles ---
  const plan = [];
  for (const identifiant of identifiants) {
    const a = await Analyses.findOne({ identifiant });
    if (!a) {
      console.log(`  ${identifiant} : INTROUVABLE, ignore`);
      continue;
    }
    const nouvelle = dateDepuisIdentifiant(identifiant, a.createdAt);
    if (!nouvelle) {
      console.log(`  ${identifiant} : numero non exploitable, ignore`);
      continue;
    }
    if (memeJour(nouvelle, a.createdAt)) {
      console.log(`  ${identifiant} : deja a la bonne date, ignore`);
      continue;
    }
    const eti = await Etiquettes.findOne({ analyseId: a._id });
    plan.push({
      identifiant,
      analyseId: a._id,
      etiquetteId: eti?._id ?? null,
      ancienCreatedAt: a.createdAt,
      nouveauCreatedAt: nouvelle,
      sommeAPayer: eti?.sommeAPayer ?? null,
    });
  }

  console.log(`Dossiers a corriger : ${plan.length}`);
  plan.forEach((p) =>
    console.log(
      `  ${p.identifiant} | ${iso(p.ancienCreatedAt)} -> ${iso(p.nouveauCreatedAt)}` +
        (p.etiquetteId ? ` | etiquette ${p.sommeAPayer} F realignee` : ' | pas d etiquette')
    )
  );

  if (!APPLY) {
    console.log('DRY-RUN : aucune ecriture. Relancer avec --apply pour appliquer.');
    await mongoose.disconnect();
    return;
  }

  const dossierExports = path.join(__dirname, '..', 'exports');
  fs.mkdirSync(dossierExports, { recursive: true });
  const fichier = path.join(
    dossierExports,
    `backup-date-analyse-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(
    fichier,
    JSON.stringify(
      plan.map((p) => ({
        identifiant: p.identifiant,
        analyseId: p.analyseId.toString(),
        etiquetteId: p.etiquetteId ? p.etiquetteId.toString() : null,
        ancienCreatedAt: p.ancienCreatedAt,
      })),
      null,
      2
    )
  );
  console.log(`Sauvegarde ecrite : ${fichier}`);

  let n = 0;
  for (const p of plan) {
    n += (
      await Analyses.updateOne(
        { _id: p.analyseId },
        { $set: { createdAt: p.nouveauCreatedAt } }
      )
    ).modifiedCount;
    if (p.etiquetteId) {
      await Etiquettes.updateOne(
        { _id: p.etiquetteId },
        { $set: { createdAt: p.nouveauCreatedAt } }
      );
    }
  }
  console.log(`APPLIQUE : ${n} analyses redatees (etiquettes realignees).`);

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
