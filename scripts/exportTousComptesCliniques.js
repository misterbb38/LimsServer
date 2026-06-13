/**
 * Genere un PDF recapitulatif COMPLET de tous les comptes cliniques
 * partenaires : nom de la clinique, NIP, mot de passe.
 *
 * Comportement :
 *   - Pour chaque Partenaire(typePartenaire='clinique'), on cherche
 *     son compte utilisateur (User type='partenaire' avec
 *     partenaireId vers ce Partenaire).
 *   - Si le compte n'existe pas : il est CREE (NIP genere via
 *     getNextNip()).
 *   - Si le compte existe : son mot de passe est RESET avec une
 *     nouvelle valeur aleatoire (les anciens hashes ne sont pas
 *     recuperables).
 *   - Tous les comptes (anciens + nouveaux) sont compiles dans un
 *     unique PDF stocke dans LimsServer/exports/.
 *
 * Le mot de passe en clair n'apparait QUE dans le PDF genere. A la
 * fin du script, il est irrecuperable.
 *
 * Usage :
 *   node scripts/exportTousComptesCliniques.js          (dry-run)
 *   node scripts/exportTousComptesCliniques.js --apply  (reset + PDF)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const PDFDocument = require('pdfkit')
const Partenaire = require('../models/PartenaireModel')
const User = require('../models/userModel')
const { getNextNip } = require('../middleware/idGenerator')

const APPLY = process.argv.includes('--apply')

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
const randomPassword = (length = 8) => {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += PASSWORD_ALPHABET[Math.floor(Math.random() * PASSWORD_ALPHABET.length)]
  }
  return out
}

;(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'lims' })
  console.log('Connecte a MongoDB (base lims)')

  const cliniques = await Partenaire.find({ typePartenaire: 'clinique' })
    .select('_id nom telephone')
    .sort({ nom: 1 })
  console.log(`--- ${cliniques.length} cliniques en base`)

  const partenaireIds = cliniques.map((c) => c._id)
  const users = await User.find({
    userType: 'partenaire',
    partenaireId: { $in: partenaireIds },
  })
  const userByPartId = new Map()
  users.forEach((u) => userByPartId.set(String(u.partenaireId), u))
  console.log(`--- ${users.length} comptes existants`)
  console.log(`--- ${cliniques.length - users.length} cliniques sans compte (a creer)\n`)

  if (!APPLY) {
    console.log('[DRY-RUN] Aucun reset ni creation. Relancer avec --apply.')
    cliniques.slice(0, 10).forEach((c) => {
      const u = userByPartId.get(String(c._id))
      console.log(
        `  ${c.nom.padEnd(40)} ${u ? 'reset mdp NIP=' + u.nip : 'creation compte'}`
      )
    })
    if (cliniques.length > 10) {
      console.log(`  ... et ${cliniques.length - 10} autres`)
    }
    await mongoose.disconnect()
    process.exit(0)
  }

  console.log('=== TRAITEMENT ===')
  const records = [] // { nom, nip, password }
  for (const c of cliniques) {
    const password = randomPassword(8)
    let existing = userByPartId.get(String(c._id))

    try {
      if (existing) {
        // Reset du mot de passe : on assigne en clair, le hook
        // pre('save') le hashera. findByIdAndUpdate court-circuite
        // le hook, donc on passe par .save().
        existing.password = password
        await existing.save()
        records.push({ nom: c.nom, nip: existing.nip, password })
        console.log(`  [RESET]  ${c.nom.padEnd(40)} NIP=${existing.nip}`)
      } else {
        const nip = await getNextNip()
        const telephone =
          c.telephone && String(c.telephone).trim() !== ''
            ? c.telephone
            : `clinique-${nip}`
        const email = `clinique-${nip}@bioram.local`
        const newUser = await User.create({
          nom: c.nom,
          prenom: '-',
          password,
          nip,
          telephone,
          email,
          userType: 'partenaire',
          partenaireId: c._id,
        })
        records.push({ nom: c.nom, nip: newUser.nip, password })
        console.log(`  [CREATE] ${c.nom.padEnd(40)} NIP=${newUser.nip}`)
      }
    } catch (err) {
      console.error(`  [ERREUR] ${c.nom} : ${err.message}`)
    }
  }

  console.log(
    `\n--- ${records.length}/${cliniques.length} comptes traites. Generation PDF...`
  )

  if (records.length === 0) {
    console.log('Rien a exporter.')
    await mongoose.disconnect()
    process.exit(0)
  }

  // === Generation PDF ===
  const outDir = path.join(__dirname, '..', 'exports')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const pdfPath = path.join(outDir, `comptes-cliniques-COMPLET-${stamp}.pdf`)

  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  doc.pipe(fs.createWriteStream(pdfPath))

  doc.font('Helvetica-Bold').fontSize(16).text('Comptes cliniques partenaires', {
    align: 'center',
  })
  doc.moveDown(0.3)
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Genere le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' })
  doc.moveDown(0.3)
  doc
    .font('Helvetica-Oblique')
    .fontSize(9)
    .fillColor('red')
    .text(
      'CONFIDENTIEL. Les mots de passe en clair ci-dessous ne sont PAS recuperables ailleurs.',
      { align: 'center' }
    )
  doc.fillColor('black')
  doc.moveDown(0.6)
  doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Nombre total : ${records.length} cliniques`, { align: 'center' })
  doc.moveDown(0.6)

  const startX = 40
  let y = doc.y
  const colNomW = 280
  const colNipW = 90
  const colPwdW = 130
  const rowH = 20

  const drawRow = (nom, nip, password, isHeader = false) => {
    if (y + rowH > 800) {
      doc.addPage()
      y = 40
    }
    if (isHeader) {
      doc.rect(startX, y, colNomW + colNipW + colPwdW, rowH).fill('#0f766e')
      doc.fillColor('white').font('Helvetica-Bold').fontSize(11)
    } else {
      doc.fillColor('black').font('Helvetica').fontSize(10)
    }
    doc.text(nom, startX + 5, y + 5, { width: colNomW - 10, ellipsis: true })
    doc.text(nip, startX + colNomW + 5, y + 5, { width: colNipW - 10 })
    doc
      .font(isHeader ? 'Helvetica-Bold' : 'Courier')
      .text(password, startX + colNomW + colNipW + 5, y + 5, {
        width: colPwdW - 10,
      })
    doc.lineWidth(0.3).strokeColor(isHeader ? '#0f766e' : '#cccccc')
    doc.rect(startX, y, colNomW + colNipW + colPwdW, rowH).stroke()
    doc
      .moveTo(startX + colNomW, y)
      .lineTo(startX + colNomW, y + rowH)
      .stroke()
    doc
      .moveTo(startX + colNomW + colNipW, y)
      .lineTo(startX + colNomW + colNipW, y + rowH)
      .stroke()
    y += rowH
  }

  drawRow('Nom de la clinique', 'NIP', 'Mot de passe', true)
  records
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    .forEach((r) => drawRow(r.nom, r.nip, r.password))

  doc.end()
  console.log(`\nPDF genere : ${pdfPath}`)
  console.log(`Total : ${records.length} cliniques exportees.`)

  await mongoose.disconnect()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
