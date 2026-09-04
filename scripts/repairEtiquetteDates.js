// Reparation : etiquettes partenaire dont le createdAt est la date du
// CHANGEMENT de partenaire au lieu de la date de creation de l'analyse.
// La facture partenaire etant groupee par mois sur etiquette.createdAt,
// ces dossiers apparaissent dans le mauvais mois de facturation.
//
// Ce script realigne etiquette.createdAt sur analyse.createdAt.
//
// Usage :
//   node scripts/repairEtiquetteDates.js          # dry-run (aucune ecriture)
//   node scripts/repairEtiquetteDates.js --apply  # applique la reparation
//
// Reversible : --apply ecrit d'abord une sauvegarde des anciennes dates
// dans exports/backup-etiquette-dates-<timestamp>.json. Pour revenir en
// arriere : node scripts/repairEtiquetteDates.js --restore <fichier>
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const RESTORE = process.argv.includes('--restore')
  ? process.argv[process.argv.indexOf('--restore') + 1]
  : null;
const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'lims' });
  const Etiquettes = mongoose.connection.collection('etiquettepartenaires');

  // --- Restauration d'une sauvegarde ---
  if (RESTORE) {
    const sauvegarde = JSON.parse(fs.readFileSync(RESTORE, 'utf8'));
    let restaurees = 0;
    for (const s of sauvegarde) {
      const res = await Etiquettes.updateOne(
        { _id: new mongoose.Types.ObjectId(s._id) },
        { $set: { createdAt: new Date(s.ancienCreatedAt) } }
      );
      restaurees += res.modifiedCount;
    }
    console.log(`RESTAURE : ${restaurees} etiquettes remises a leur date d'origine.`);
    await mongoose.disconnect();
    return;
  }

  // Jointure avec l'analyse pour comparer les deux dates.
  const decalees = await Etiquettes.aggregate([
    {
      $lookup: {
        from: 'analyses',
        localField: 'analyseId',
        foreignField: '_id',
        as: 'analyse',
      },
    },
    { $unwind: '$analyse' },
    {
      $match: {
        'analyse.createdAt': { $ne: null },
        $expr: { $ne: ['$createdAt', '$analyse.createdAt'] },
      },
    },
    {
      $project: {
        createdAt: 1,
        analyseCreatedAt: '$analyse.createdAt',
        identifiant: '$analyse.identifiant',
        sommeAPayer: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]).toArray();

  // Les etiquettes reellement problematiques sont celles qui changent de
  // mois de facturation (les autres = simple decalage d'horodatage).
  const moisCle = (d) => `${new Date(d).getFullYear()}-${new Date(d).getMonth()}`;
  const changentDeMois = decalees.filter(
    (e) => moisCle(e.createdAt) !== moisCle(e.analyseCreatedAt)
  );

  console.log(`Etiquettes mal datees          : ${decalees.length}`);
  console.log(`  dont changement de mois      : ${changentDeMois.length}`);
  console.log('Echantillon (changement de mois) :');
  changentDeMois.slice(0, 15).forEach((e) =>
    console.log(
      `  - ${e.identifiant ?? '?'} | etiquette=${fmt(e.createdAt)} -> analyse=${fmt(
        e.analyseCreatedAt
      )} | ${e.sommeAPayer} F`
    )
  );

  if (!APPLY) {
    console.log('DRY-RUN : aucune ecriture. Relancer avec --apply pour appliquer.');
    await mongoose.disconnect();
    return;
  }

  // Sauvegarde des anciennes dates avant ecriture (permet --restore).
  const dossierExports = path.join(__dirname, '..', 'exports');
  fs.mkdirSync(dossierExports, { recursive: true });
  const fichierSauvegarde = path.join(
    dossierExports,
    `backup-etiquette-dates-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(
    fichierSauvegarde,
    JSON.stringify(
      decalees.map((e) => ({ _id: e._id.toString(), ancienCreatedAt: e.createdAt })),
      null,
      2
    )
  );
  console.log(`Sauvegarde ecrite : ${fichierSauvegarde}`);

  // On realigne TOUTES les etiquettes decalees (pas seulement celles qui
  // changent de mois) pour que la date affichee sur la facture soit bien
  // celle du dossier.
  let modifiees = 0;
  for (const e of decalees) {
    const res = await Etiquettes.updateOne(
      { _id: e._id },
      { $set: { createdAt: e.analyseCreatedAt } }
    );
    modifiees += res.modifiedCount;
  }
  console.log(`APPLIQUE : ${modifiees} etiquettes realignees sur la date de l'analyse.`);

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
