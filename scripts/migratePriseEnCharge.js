// Migration : anciennes analyses "Payée" avec part patient = 0 et un
// partenaire a 100% (clinique, ou assurance/IPM avec couverture >= 100)
// -> statut "Prise en charge".
//
// Usage :
//   node scripts/migratePriseEnCharge.js          # dry-run (aucune ecriture)
//   node scripts/migratePriseEnCharge.js --apply  # applique la migration
//
// Reversible : updateMany({statusPayement:'Prise en charge'},
//   {$set:{statusPayement:'Payée'}})
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'lims' });
  const Analyse = mongoose.connection.collection('analyses');

  const filtre = {
    statusPayement: 'Payée',
    prixPatient: { $lte: 0 },
    $or: [
      { cliniquePartenaireId: { $exists: true, $ne: null } },
      {
        partenaireId: { $exists: true, $ne: null },
        pourcentageCouverture: { $gte: 100 },
      },
    ],
  };

  const count = await Analyse.countDocuments(filtre);
  console.log(`Analyses concernees : ${count}`);

  const echantillon = await Analyse.find(filtre)
    .project({ identifiant: 1, prixTotal: 1, prixPatient: 1, pourcentageCouverture: 1 })
    .limit(8)
    .toArray();
  console.log('Echantillon :');
  echantillon.forEach((a) =>
    console.log(
      `  - ${a.identifiant} | prixTotal=${a.prixTotal} | prixPatient=${a.prixPatient} | couv=${a.pourcentageCouverture ?? '-'}`
    )
  );

  if (APPLY) {
    const res = await Analyse.updateMany(filtre, {
      $set: { statusPayement: 'Prise en charge' },
    });
    console.log(`APPLIQUE : ${res.modifiedCount} analyses -> "Prise en charge"`);
  } else {
    console.log('DRY-RUN : aucune ecriture. Relancer avec --apply pour appliquer.');
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
