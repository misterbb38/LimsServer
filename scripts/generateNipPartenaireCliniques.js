/**
 * Pour chaque Partenaire(typePartenaire='clinique') qui n'a PAS encore
 * de compte utilisateur (User type='partenaire' avec partenaireId
 * pointant vers lui), on cree le compte associe avec :
 *   - nip   : genere via getNextNip() (format existant : 5 chiffres + 2
 *             chiffres annee, ex "0000125")
 *   - password : genere aleatoirement, 8 caracteres alphanumeriques.
 *                Hashe automatiquement par le hook pre-save du modele.
 *
 * Le User cree :
 *   nom            = nom de la clinique
 *   prenom         = "-"
 *   userType       = "partenaire"
 *   partenaireId   = _id du Partenaire
 *
 * IMPORTANT : le mot de passe en clair est affiche dans le log et
 * doit etre communique a la clinique (impossible de le recuperer
 * ensuite, le hash est irreversible). Pensez a noter / exporter la
 * sortie de la commande --apply.
 *
 * Usage :
 *   node scripts/generateNipPartenaireCliniques.js          (dry-run)
 *   node scripts/generateNipPartenaireCliniques.js --apply  (cree en DB)
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

// Mot de passe aleatoire 8 caracteres (alphabet sans caracteres
// confusables : pas de O/0, I/l/1).
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

  // 1) Toutes les cliniques
  const cliniques = await Partenaire.find({ typePartenaire: 'clinique' })
    .select('_id nom telephone nip')
  console.log(`--- ${cliniques.length} cliniques en base`)

  // 2) Tous les Users type='partenaire' avec leur partenaireId
  const existingUsers = await User.find({ userType: 'partenaire' })
    .select('partenaireId nip')
  const cliniquesAvecUser = new Set(
    existingUsers
      .filter((u) => u.partenaireId)
      .map((u) => String(u.partenaireId))
  )
  console.log(
    `--- ${cliniquesAvecUser.size} cliniques ont deja un compte utilisateur`
  )

  // 3) Cliniques sans compte
  const aCreer = cliniques.filter(
    (c) => !cliniquesAvecUser.has(String(c._id))
  )
  console.log(`--- ${aCreer.length} comptes a creer\n`)

  if (aCreer.length === 0) {
    console.log('Rien a faire.')
    await mongoose.disconnect()
    process.exit(0)
  }

  // 4) Liste des creations prevues (sans nip ni password en dry-run :
  //    on ne consomme pas le compteur Counter pour rien)
  console.log('=== Cliniques sans compte ===')
  aCreer.slice(0, 30).forEach((c) => {
    console.log(`  ${c.nom}`)
  })
  if (aCreer.length > 30) console.log(`  ... et ${aCreer.length - 30} autres`)

  if (!APPLY) {
    console.log(
      `\n[DRY-RUN] ${aCreer.length} comptes a creer. Relancer avec --apply.`
    )
    await mongoose.disconnect()
    process.exit(0)
  }

  // 5) Creation reelle. On y va une par une (le pre-save hook hash
  //    le password, donc bulkWrite n'est pas utilisable). Le NIP vient
  //    de getNextNip() (compteur partage avec les autres NIP).
  console.log('\n=== CREATION ===')
  console.log('Nom de la clinique'.padEnd(40), 'NIP'.padEnd(10), 'Mot de passe')
  console.log('-'.repeat(70))

  const created = []
  for (const c of aCreer) {
    const nip = await getNextNip()
    const password = randomPassword(8)
    // Index unique legacy sur User.telephone ET User.email : on
    // recupere les valeurs du Partenaire si presentes, sinon on
    // genere un placeholder unique base sur le NIP (lui-meme unique).
    const telephone =
      c.telephone && String(c.telephone).trim() !== ''
        ? c.telephone
        : `clinique-${nip}`
    const email = `clinique-${nip}@bioram.local`
    try {
      const user = await User.create({
        nom: c.nom,
        prenom: '-',
        password,
        nip,
        telephone,
        email,
        userType: 'partenaire',
        partenaireId: c._id,
      })
      created.push({ clinique: c.nom, nip, password, userId: user._id })
      console.log(`${c.nom.padEnd(40)} ${nip.padEnd(10)} ${password}`)
    } catch (err) {
      console.error(`  [ERREUR] ${c.nom} : ${err.message}`)
    }
  }

  console.log(`\n--- Termine : ${created.length} comptes crees / ${aCreer.length} attendus`)

  // === Generation du PDF recapitulatif des comptes crees ===
  if (created.length > 0) {
    const outDir = path.join(__dirname, '..', 'exports')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19)
    const pdfPath = path.join(outDir, `comptes-cliniques-${stamp}.pdf`)

    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    doc.pipe(fs.createWriteStream(pdfPath))

    // Titre
    doc.font('Helvetica-Bold').fontSize(16).text('Comptes cliniques partenaires', { align: 'center' })
    doc.moveDown(0.3)
    doc.font('Helvetica').fontSize(10).text(`Generes le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' })
    doc.moveDown(0.3)
    doc
      .font('Helvetica-Oblique')
      .fontSize(9)
      .fillColor('red')
      .text(
        'Document confidentiel. Les mots de passe sont en clair et ne sont PAS recuperables ailleurs. A communiquer en main propre puis a detruire / archiver en lieu sur.',
        { align: 'center' }
      )
    doc.fillColor('black')
    doc.moveDown(0.8)

    // Tableau
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
      doc.font(isHeader ? 'Helvetica-Bold' : 'Courier').text(password, startX + colNomW + colNipW + 5, y + 5, {
        width: colPwdW - 10,
      })
      // bordures
      doc.lineWidth(0.3).strokeColor(isHeader ? '#0f766e' : '#cccccc')
      doc.rect(startX, y, colNomW + colNipW + colPwdW, rowH).stroke()
      doc.moveTo(startX + colNomW, y).lineTo(startX + colNomW, y + rowH).stroke()
      doc.moveTo(startX + colNomW + colNipW, y).lineTo(startX + colNomW + colNipW, y + rowH).stroke()
      y += rowH
    }

    drawRow('Nom de la clinique', 'NIP', 'Mot de passe', true)
    created.forEach((c) => drawRow(c.clinique, c.nip, c.password))

    doc.end()
    console.log(`\nPDF genere : ${pdfPath}`)
  } else {
    console.log(
      '/!\\ Aucun nouveau compte cree, pas de PDF genere.'
    )
  }
  console.log('/!\\ Les mots de passe ne sont PAS recuperables apres cette execution.')

  await mongoose.disconnect()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
