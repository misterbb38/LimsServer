/**
 * Migration : analyses dont partenaireId pointe vers une CLINIQUE
 * sont migrees vers le nouveau champ cliniquePartenaireId. Le champ
 * partenaireId est vide apres migration pour ces analyses.
 *
 * Les analyses dont partenaireId pointe vers assurance / ipm / sococim
 * ne sont PAS touchees.
 *
 * Le prixTotal / prixPartenaire / prixPatient deja calcules sont
 * conserves tels quels (pas de recalcul, pour ne pas modifier les
 * factures historiques).
 *
 * Usage :
 *   node scripts/migrateCliniquePartenaire.js          (dry-run, defaut)
 *   node scripts/migrateCliniquePartenaire.js --apply  (ecrit en DB)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const Analyse = require('../models/analyseModel')
const Partenaire = require('../models/PartenaireModel')

const APPLY = process.argv.includes('--apply')

;(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'lims' })
  console.log('Connecte a MongoDB (base lims)')

  // 1) Lister toutes les cliniques pour matching rapide
  const cliniques = await Partenaire.find({ typePartenaire: 'clinique' }).select('_id nom')
  const cliniqueIds = new Set(cliniques.map((c) => String(c._id)))
  console.log(`--- ${cliniques.length} cliniques en base`)

  // 2) Toutes les analyses qui ont un partenaireId pointant vers une
  //    clinique et qui n'ont pas encore de cliniquePartenaireId.
  const analyses = await Analyse.find({
    partenaireId: { $in: Array.from(cliniqueIds) },
    cliniquePartenaireId: { $exists: false },
  }).select('_id identifiant partenaireId cliniquePartenaireId')

  console.log(`--- ${analyses.length} analyses a migrer`)

  if (analyses.length === 0) {
    console.log('Rien a faire.')
    await mongoose.disconnect()
    process.exit(0)
  }

  // 3) Affichage des 10 premieres pour controle
  analyses.slice(0, 10).forEach((a) => {
    console.log(
      `  ${a.identifiant || '(no-id)'}  partenaireId=${a.partenaireId} -> cliniquePartenaireId`
    )
  })
  if (analyses.length > 10) console.log(`  ... et ${analyses.length - 10} autres`)

  if (!APPLY) {
    console.log('\n[DRY-RUN] Aucune modification. Relancer avec --apply pour ecrire.')
    await mongoose.disconnect()
    process.exit(0)
  }

  // 4) Application : deplacer partenaireId -> cliniquePartenaireId
  const bulk = analyses.map((a) => ({
    updateOne: {
      filter: { _id: a._id },
      update: {
        $set: { cliniquePartenaireId: a.partenaireId },
        $unset: { partenaireId: '' },
      },
    },
  }))

  console.log(`\n--- Application de ${bulk.length} migrations...`)
  const result = await Analyse.bulkWrite(bulk)
  console.log(`--- Termine : ${result.modifiedCount} analyses migrees.`)

  await mongoose.disconnect()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
