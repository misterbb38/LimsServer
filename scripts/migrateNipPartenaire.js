/**
 * Migration : copie le NIP des comptes utilisateurs (User type='partenaire')
 * vers la collection Partenaire referencee (typePartenaire='clinique').
 *
 * Objectif : permettre a chaque clinique partenaire d'avoir son propre
 * NIP directement sur l'entree Partenaire, pour acceder au dashboard
 * cabinet (consultation des resultats de leurs patients).
 *
 * Pour chaque User type='partenaire' avec un partenaireId :
 *   - si le Partenaire cible n'a pas de NIP, on copie celui du User
 *   - si le Partenaire cible a deja un NIP different, on ignore et log
 *     (cas a verifier manuellement)
 *   - si l'User n'a pas de NIP, on ignore
 *
 * Le NIP reste aussi present sur le User (rien n'est supprime cote
 * User pour ne pas casser l'authentification existante).
 *
 * Usage :
 *   node scripts/migrateNipPartenaire.js          (dry-run, defaut)
 *   node scripts/migrateNipPartenaire.js --apply  (ecrit en DB)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const Partenaire = require('../models/PartenaireModel')
const User = require('../models/userModel')

const APPLY = process.argv.includes('--apply')

;(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'lims' })
  console.log('Connecte a MongoDB (base lims)')

  // Tous les comptes "partenaire" qui ont un partenaireId
  const users = await User.find({
    userType: 'partenaire',
    partenaireId: { $exists: true, $ne: null },
  }).select('_id nip partenaireId nom prenom email')

  console.log(`--- ${users.length} comptes partenaire trouves`)

  const updates = []
  const skipped = []
  const conflicts = []

  for (const u of users) {
    if (!u.nip) {
      skipped.push({ user: u, reason: 'User sans NIP' })
      continue
    }
    const partenaire = await Partenaire.findById(u.partenaireId)
    if (!partenaire) {
      skipped.push({ user: u, reason: 'Partenaire introuvable' })
      continue
    }
    if (partenaire.nip && partenaire.nip === u.nip) {
      skipped.push({ user: u, reason: 'Deja a jour' })
      continue
    }
    if (partenaire.nip && partenaire.nip !== u.nip) {
      conflicts.push({
        user: u,
        partenaire,
        message: `Conflit : User NIP="${u.nip}" vs Partenaire NIP="${partenaire.nip}"`,
      })
      continue
    }
    updates.push({ user: u, partenaire })
  }

  console.log(`\n=== A MIGRER : ${updates.length} ===`)
  updates.slice(0, 20).forEach((x) => {
    console.log(
      `  ${x.partenaire.nom}  <-  NIP "${x.user.nip}"  (compte: ${x.user.email || x.user._id})`
    )
  })
  if (updates.length > 20) console.log(`  ... et ${updates.length - 20} autres`)

  if (conflicts.length > 0) {
    console.log(`\n=== CONFLITS : ${conflicts.length} ===`)
    conflicts.slice(0, 10).forEach((c) => {
      console.log(`  ${c.partenaire.nom} :: ${c.message}`)
    })
  }

  if (skipped.length > 0) {
    const reasons = {}
    skipped.forEach((s) => {
      reasons[s.reason] = (reasons[s.reason] || 0) + 1
    })
    console.log(`\n=== SAUTES ===`)
    Object.entries(reasons).forEach(([r, n]) => console.log(`  ${n} - ${r}`))
  }

  if (!APPLY) {
    console.log(
      `\n[DRY-RUN] ${updates.length} migrations possibles. Relancer avec --apply.`
    )
    await mongoose.disconnect()
    process.exit(0)
  }

  if (updates.length === 0) {
    console.log('\nRien a migrer.')
    await mongoose.disconnect()
    process.exit(0)
  }

  // Application en bulk
  const ops = updates.map((x) => ({
    updateOne: {
      filter: { _id: x.partenaire._id },
      update: { $set: { nip: x.user.nip } },
    },
  }))
  console.log(`\n--- Application de ${ops.length} migrations...`)
  const result = await Partenaire.bulkWrite(ops)
  console.log(`--- Termine : ${result.modifiedCount} Partenaire(s) mis a jour.`)

  await mongoose.disconnect()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
