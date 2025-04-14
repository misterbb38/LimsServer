// controllers/calculer-nfsController.js
const Resultat = require('../models/resultatModel');
exports.calculerNFS = async (req, res) => {
  try {
    const { nfs } = req.body
    if (!nfs) {
      return res
        .status(400)
        .json({ success: false, message: 'NFS manquant dans la requête' })
    }

    const hematies = nfs.hematiesEtConstantes
    const leucocytes = nfs.leucocytesEtFormules

    // Convert string values to numeric if needed
    const GR = parseFloat(hematies.gr?.valeur) || 0
    const HGB = parseFloat(hematies.hgb?.valeur) || 0
    const HCT = parseFloat(hematies.hct?.valeur) || 0
    const GB = parseFloat(leucocytes.gb?.valeur) || 0

    // Calculs hématies
    if (GR > 0 && HGB > 0 && HCT > 0) {
      hematies.vgm.valeur = parseFloat(((HCT / GR) * 10).toFixed(1)) // VGM
      hematies.tcmh.valeur = parseFloat(((HGB / GR) * 10).toFixed(1)) // TCMH
      hematies.ccmh.valeur = parseFloat(((HGB / HCT) * 100).toFixed(1)) // CCMH
    }

    // Calculs leucocytes (pourcentages et flags)
    if (GB > 0) {
      ;['neut', 'lymph', 'mono', 'eo', 'baso'].forEach((cell) => {
        const c = leucocytes[cell]
        if (c && c.valeur !== '') {
          const cellVal = parseFloat(c.valeur) || 0
          c.pourcentage = parseFloat(((cellVal / GB) * 100).toFixed(1))
          // On regarde s’il y a une plage de référence
          if (c.referencePourcentage) {
            const [min, max] = c.referencePourcentage.split('-').map(Number)
            c.flag = c.pourcentage < min || c.pourcentage > max ? '*' : ''
          }
        }
      })

      // Flag sur GB
      if (leucocytes.gb.reference) {
        const [min, max] = leucocytes.gb.reference.split('-').map(Number)
        leucocytes.gb.flag = GB < min || GB > max ? '*' : ''
      }

      // Flag sur PLT
      const PLT = parseFloat(leucocytes.plt?.valeur) || 0
      if (leucocytes.plt.reference) {
        const [min, max] = leucocytes.plt.reference.split('-').map(Number)
        leucocytes.plt.flag = PLT < min || PLT > max ? '*' : ''
      }
    }

    // Return the updated nfs to the client
    return res.status(200).json({ success: true, nfs })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ success: false, message: 'Erreur serveur lors du calcul NFS' })
  }
}
