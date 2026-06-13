/*
 * Script de seed : remplit valeurMachineA, valeurMachineB, machineA,
 * machineB et interpretationA / B pour les tests de Test (collection
 * 'tests') selon les normes labo standards (OMS, SFBC, fabricants).
 *
 * Mode dry-run par defaut : preview les changements sans rien
 * sauvegarder. Mode reel : `node scripts/seedReferences.js --apply`.
 *
 * MAPPING : matching strict par NOM EXACT (apres normalisation
 * case-insensitive + sans accents). Pas d'inclusion partielle.
 *
 * Usage :
 *   cd LimsServer
 *   node scripts/seedReferences.js              # dry-run
 *   node scripts/seedReferences.js --apply      # ecrit en DB
 *   node scripts/seedReferences.js --apply --force  # ecrase meme si deja rempli
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const Test = require('../models/testModel')

const APPLY = process.argv.includes('--apply')
const FORCE = process.argv.includes('--force')

// ---------------------------------------------------------------------------
// Helpers de matching
// ---------------------------------------------------------------------------
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const texte = (s) => ({ type: 'text', content: s })
const mixte = (cols, rows, text) => ({
  type: 'mixed',
  content: { columns: cols, rows, text },
})

// ---------------------------------------------------------------------------
// SKIP : essais internes, jamais a remplir
// ---------------------------------------------------------------------------
const SKIP = new Set([
  norm('mon essai'),
  norm('essai01'),
  norm('essai02'),
  norm('essaitest'),
  norm('testessai'),
])

// ---------------------------------------------------------------------------
// MAPPING : nom EXACT du test -> infos machines et references
// (la cle est normalisee dans refsByNormName plus bas)
// ---------------------------------------------------------------------------
const REFS = {
  // =====================================================================
  // HEMATOLOGIE (Hemax 530AL)
  // =====================================================================
  'hematies': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (x10^6/µL)'],
      [
        ['Homme', '4,6 - 6,2'],
        ['Femme', '4,2 - 5,4'],
      ],
      'Chez l\'homme, le nombre d\'hématies est normalement compris entre 4,6 et 6,2 x10^6/µL. Chez la femme, il est compris entre 4,2 et 5,4 x10^6/µL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (x10^6/µL)'],
      [
        ['Homme', '4,6 - 6,2'],
        ['Femme', '4,2 - 5,4'],
      ],
      'Chez l\'homme, le nombre d\'hématies est normalement compris entre 4,6 et 6,2 x10^6/µL. Chez la femme, il est compris entre 4,2 et 5,4 x10^6/µL.'
    ),
  },
  'hemoglobine': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (g/dL)'],
      [
        ['Homme', '13,5 - 17,5'],
        ['Femme', '12,0 - 16,0'],
      ],
      'Chez l\'homme, le taux d\'hémoglobine est normalement compris entre 13,5 et 17,5 g/dL. Chez la femme, il est compris entre 12,0 et 16,0 g/dL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (g/dL)'],
      [
        ['Homme', '13,5 - 17,5'],
        ['Femme', '12,0 - 16,0'],
      ],
      'Chez l\'homme, le taux d\'hémoglobine est normalement compris entre 13,5 et 17,5 g/dL. Chez la femme, il est compris entre 12,0 et 16,0 g/dL.'
    ),
  },
  'hematocrite': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (%)'],
      [
        ['Homme', '40 - 52'],
        ['Femme', '36 - 48'],
      ],
      'Chez l\'homme, l\'hématocrite est normalement compris entre 40 et 52 %. Chez la femme, il est compris entre 36 et 48 %.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (%)'],
      [
        ['Homme', '40 - 52'],
        ['Femme', '36 - 48'],
      ],
      'Chez l\'homme, l\'hématocrite est normalement compris entre 40 et 52 %. Chez la femme, il est compris entre 36 et 48 %.'
    ),
  },
  'vgm': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '80 - 97 fL', valeurMachineB: '80 - 97 fL',
    interpretationA: texte('Le volume globulaire moyen est normalement compris entre 80 et 97 fL.'),
    interpretationB: texte('Le volume globulaire moyen est normalement compris entre 80 et 97 fL.'),
  },
  'tcmh': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '26 - 32 pg', valeurMachineB: '26 - 32 pg',
    interpretationA: texte('La teneur corpusculaire moyenne en hémoglobine est normalement comprise entre 26 et 32 pg.'),
    interpretationB: texte('La teneur corpusculaire moyenne en hémoglobine est normalement comprise entre 26 et 32 pg.'),
  },
  'ccmh': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '30 - 36 g/dL', valeurMachineB: '30 - 36 g/dL',
    interpretationA: texte('La concentration corpusculaire moyenne en hémoglobine est normalement comprise entre 30 et 36 g/dL.'),
    interpretationB: texte('La concentration corpusculaire moyenne en hémoglobine est normalement comprise entre 30 et 36 g/dL.'),
  },
  'idr-cv': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '11 - 16 %', valeurMachineB: '11 - 16 %',
    interpretationA: texte('L\'indice de distribution des hématies (IDR-CV) est normalement compris entre 11 et 16 %.'),
    interpretationB: texte('L\'indice de distribution des hématies (IDR-CV) est normalement compris entre 11 et 16 %.'),
  },
  'leucocytes': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '4,0 - 10,0 x10^3/uL', valeurMachineB: '4,0 - 10,0 x10^3/uL',
    interpretationA: texte('Le nombre de leucocytes est normalement compris entre 4,0 et 10,0 x10^3/µL.'),
    interpretationB: texte('Le nombre de leucocytes est normalement compris entre 4,0 et 10,0 x10^3/µL.'),
  },
  'plaquettes': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '150 - 450 x10^3/uL', valeurMachineB: '150 - 450 x10^3/uL',
    interpretationA: texte('Le nombre de plaquettes est normalement compris entre 150 et 450 x10^3/µL.'),
    interpretationB: texte('Le nombre de plaquettes est normalement compris entre 150 et 450 x10^3/µL.'),
  },
  'numeration formule sanguine': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'Voir details NFS', valeurMachineB: 'Voir details NFS',
    interpretationA: texte('Les valeurs de référence sont détaillées par paramètre dans le rapport (hématies, hémoglobine, hématocrite, indices, formule leucocytaire, plaquettes).'),
    interpretationB: texte('Les valeurs de référence sont détaillées par paramètre dans le rapport (hématies, hémoglobine, hématocrite, indices, formule leucocytaire, plaquettes).'),
  },
  'nfs': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'Voir details NFS', valeurMachineB: 'Voir details NFS',
    interpretationA: texte('Les valeurs de référence sont détaillées par paramètre dans le rapport (hématies, hémoglobine, hématocrite, indices, formule leucocytaire, plaquettes).'),
    interpretationB: texte('Les valeurs de référence sont détaillées par paramètre dans le rapport (hématies, hémoglobine, hématocrite, indices, formule leucocytaire, plaquettes).'),
  },
  'vitesse de sedimentation': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (mm/1h)'],
      [
        ['Homme', '< 15'],
        ['Femme', '< 20'],
      ],
      'Chez l\'homme, la vitesse de sédimentation à la 1ère heure est normalement inférieure à 15 mm. Chez la femme, elle est inférieure à 20 mm.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (mm/1h)'],
      [
        ['Homme', '< 15'],
        ['Femme', '< 20'],
      ],
      'Chez l\'homme, la vitesse de sédimentation à la 1ère heure est normalement inférieure à 15 mm. Chez la femme, elle est inférieure à 20 mm.'
    ),
  },
  'vs': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (mm/1h)'],
      [
        ['Homme', '< 15'],
        ['Femme', '< 20'],
      ],
      'Chez l\'homme, la vitesse de sédimentation à la 1ère heure est normalement inférieure à 15 mm. Chez la femme, elle est inférieure à 20 mm.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (mm/1h)'],
      [
        ['Homme', '< 15'],
        ['Femme', '< 20'],
      ],
      'Chez l\'homme, la vitesse de sédimentation à la 1ère heure est normalement inférieure à 15 mm. Chez la femme, elle est inférieure à 20 mm.'
    ),
  },
  'reticulocytes': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '0,5 - 1,5 % (20 000 - 120 000/mm³)',
    valeurMachineB: '0,5 - 1,5 % (20 000 - 120 000/mm³)',
    interpretationA: texte('Le taux de réticulocytes est normalement compris entre 0,5 et 1,5 %, soit 20 000 à 120 000/mm³.'),
    interpretationB: texte('Le taux de réticulocytes est normalement compris entre 0,5 et 1,5 %, soit 20 000 à 120 000/mm³.'),
  },

  // =====================================================================
  // BIOCHIMIE SANGUINE (Balio AX300 / CBS 400)
  // =====================================================================
  'glycemie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,70 - 1,10 g/L', valeurMachineB: '0,70 - 1,10 g/L',
    interpretationA: texte('Une glycémie à jeun comprise entre 0,70 et 1,10 g/L est considérée comme normale.'),
    interpretationB: texte('Une glycémie à jeun comprise entre 0,70 et 1,10 g/L est considérée comme normale.'),
  },
  'glycemie a jeun': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,70 - 1,10 g/L', valeurMachineB: '0,70 - 1,10 g/L',
    interpretationA: texte('Une glycémie à jeun comprise entre 0,70 et 1,10 g/L est considérée comme normale.'),
    interpretationB: texte('Une glycémie à jeun comprise entre 0,70 et 1,10 g/L est considérée comme normale.'),
  },
  'uree': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,15 - 0,45 g/L', valeurMachineB: '0,15 - 0,45 g/L',
    interpretationA: texte('L\'urémie est normalement comprise entre 0,15 et 0,45 g/L.'),
    interpretationB: texte('L\'urémie est normalement comprise entre 0,15 et 0,45 g/L.'),
  },
  'creatinine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (mg/L)'],
      [
        ['Homme', '7 - 13'],
        ['Femme', '6 - 12'],
      ],
      'Chez l\'homme, la créatininémie est normalement comprise entre 7 et 13 mg/L. Chez la femme, elle est comprise entre 6 et 12 mg/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (mg/L)'],
      [
        ['Homme', '7 - 13'],
        ['Femme', '6 - 12'],
      ],
      'Chez l\'homme, la créatininémie est normalement comprise entre 7 et 13 mg/L. Chez la femme, elle est comprise entre 6 et 12 mg/L.'
    ),
  },
  'creatininemie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (mg/L)'],
      [
        ['Homme', '7 - 13'],
        ['Femme', '6 - 12'],
      ],
      'Chez l\'homme, la créatininémie est normalement comprise entre 7 et 13 mg/L. Chez la femme, elle est comprise entre 6 et 12 mg/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (mg/L)'],
      [
        ['Homme', '7 - 13'],
        ['Femme', '6 - 12'],
      ],
      'Chez l\'homme, la créatininémie est normalement comprise entre 7 et 13 mg/L. Chez la femme, elle est comprise entre 6 et 12 mg/L.'
    ),
  },
  'acide urique': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (mg/L)'],
      [
        ['Homme', '35 - 72'],
        ['Femme', '26 - 60'],
      ],
      'Chez l\'homme, l\'uricémie est normalement comprise entre 35 et 72 mg/L. Chez la femme, elle est comprise entre 26 et 60 mg/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (mg/L)'],
      [
        ['Homme', '35 - 72'],
        ['Femme', '26 - 60'],
      ],
      'Chez l\'homme, l\'uricémie est normalement comprise entre 35 et 72 mg/L. Chez la femme, elle est comprise entre 26 et 60 mg/L.'
    ),
  },
  'asat': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
    interpretationA: texte('Une activité ASAT inférieure à 40 UI/L est considérée comme normale.'),
    interpretationB: texte('Une activité ASAT inférieure à 40 UI/L est considérée comme normale.'),
  },
  'transaminases asat': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
    interpretationA: texte('Une activité ASAT inférieure à 40 UI/L est considérée comme normale.'),
    interpretationB: texte('Une activité ASAT inférieure à 40 UI/L est considérée comme normale.'),
  },
  'alat': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
    interpretationA: texte('Une activité ALAT inférieure à 40 UI/L est considérée comme normale.'),
    interpretationB: texte('Une activité ALAT inférieure à 40 UI/L est considérée comme normale.'),
  },
  'transaminases alat': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
    interpretationA: texte('Une activité ALAT inférieure à 40 UI/L est considérée comme normale.'),
    interpretationB: texte('Une activité ALAT inférieure à 40 UI/L est considérée comme normale.'),
  },
  'ggt': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (UI/L)'],
      [
        ['Homme', '< 60'],
        ['Femme', '< 40'],
      ],
      'Chez l\'homme, l\'activité des gamma-GT est normalement inférieure à 60 UI/L. Chez la femme, elle est inférieure à 40 UI/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (UI/L)'],
      [
        ['Homme', '< 60'],
        ['Femme', '< 40'],
      ],
      'Chez l\'homme, l\'activité des gamma-GT est normalement inférieure à 60 UI/L. Chez la femme, elle est inférieure à 40 UI/L.'
    ),
  },
  'gamma gt': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (UI/L)'],
      [
        ['Homme', '< 60'],
        ['Femme', '< 40'],
      ],
      'Chez l\'homme, l\'activité des gamma-GT est normalement inférieure à 60 UI/L. Chez la femme, elle est inférieure à 40 UI/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (UI/L)'],
      [
        ['Homme', '< 60'],
        ['Femme', '< 40'],
      ],
      'Chez l\'homme, l\'activité des gamma-GT est normalement inférieure à 60 UI/L. Chez la femme, elle est inférieure à 40 UI/L.'
    ),
  },
  'phosphatases alcalines': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '40 - 130 UI/L', valeurMachineB: '40 - 130 UI/L',
    interpretationA: texte('L\'activité des phosphatases alcalines est normalement comprise entre 40 et 130 UI/L.'),
    interpretationB: texte('L\'activité des phosphatases alcalines est normalement comprise entre 40 et 130 UI/L.'),
  },
  'bilirubine totale': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 10 mg/L', valeurMachineB: '< 10 mg/L',
    interpretationA: texte('La bilirubine totale est normalement inférieure à 10 mg/L.'),
    interpretationB: texte('La bilirubine totale est normalement inférieure à 10 mg/L.'),
  },
  'bilirubine directe': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 3 mg/L', valeurMachineB: '< 3 mg/L',
    interpretationA: texte('La bilirubine directe (conjuguée) est normalement inférieure à 3 mg/L.'),
    interpretationB: texte('La bilirubine directe (conjuguée) est normalement inférieure à 3 mg/L.'),
  },
  'bilirubine indirecte': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 10 mg/L', valeurMachineB: '< 10 mg/L',
    interpretationA: texte('La bilirubine indirecte (non conjuguée) est normalement inférieure à 10 mg/L.'),
    interpretationB: texte('La bilirubine indirecte (non conjuguée) est normalement inférieure à 10 mg/L.'),
  },
  'calcium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '85 - 105 mg/L  (2,15 - 2,55 mmol/L)',
    valeurMachineB: '85 - 105 mg/L  (2,15 - 2,55 mmol/L)',
    interpretationA: texte('La calcémie est normalement comprise entre 85 et 105 mg/L (2,15 à 2,55 mmol/L).'),
    interpretationB: texte('La calcémie est normalement comprise entre 85 et 105 mg/L (2,15 à 2,55 mmol/L).'),
  },
  'calcium ionise': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '1,15 - 1,35 mmol/L', valeurMachineB: '1,15 - 1,35 mmol/L',
    interpretationA: texte('Le calcium ionisé est normalement compris entre 1,15 et 1,35 mmol/L.'),
    interpretationB: texte('Le calcium ionisé est normalement compris entre 1,15 et 1,35 mmol/L.'),
  },
  'phosphore': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '25 - 45 mg/L', valeurMachineB: '25 - 45 mg/L',
    interpretationA: texte('La phosphorémie est normalement comprise entre 25 et 45 mg/L.'),
    interpretationB: texte('La phosphorémie est normalement comprise entre 25 et 45 mg/L.'),
  },
  'magnesium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '17 - 25 mg/L  (0,7 - 1,1 mmol/L)',
    valeurMachineB: '17 - 25 mg/L  (0,7 - 1,1 mmol/L)',
    interpretationA: texte('La magnésémie est normalement comprise entre 17 et 25 mg/L (0,7 à 1,1 mmol/L).'),
    interpretationB: texte('La magnésémie est normalement comprise entre 17 et 25 mg/L (0,7 à 1,1 mmol/L).'),
  },
  'sodium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '135 - 145 mmol/L', valeurMachineB: '135 - 145 mmol/L',
    interpretationA: texte('La natrémie est normalement comprise entre 135 et 145 mmol/L.'),
    interpretationB: texte('La natrémie est normalement comprise entre 135 et 145 mmol/L.'),
  },
  'potassium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '3,5 - 5,0 mmol/L', valeurMachineB: '3,5 - 5,0 mmol/L',
    interpretationA: texte('La kaliémie est normalement comprise entre 3,5 et 5,0 mmol/L.'),
    interpretationB: texte('La kaliémie est normalement comprise entre 3,5 et 5,0 mmol/L.'),
  },
  'chlore': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '95 - 105 mmol/L', valeurMachineB: '95 - 105 mmol/L',
    interpretationA: texte('La chlorémie est normalement comprise entre 95 et 105 mmol/L.'),
    interpretationB: texte('La chlorémie est normalement comprise entre 95 et 105 mmol/L.'),
  },
  'crp': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 6 mg/L', valeurMachineB: '< 6 mg/L',
    interpretationA: texte('Une protéine C réactive inférieure à 6 mg/L est considérée comme normale, sans syndrome inflammatoire biologique.'),
    interpretationB: texte('Une protéine C réactive inférieure à 6 mg/L est considérée comme normale, sans syndrome inflammatoire biologique.'),
  },
  'proteine c reactive': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 6 mg/L', valeurMachineB: '< 6 mg/L',
    interpretationA: texte('Une protéine C réactive inférieure à 6 mg/L est considérée comme normale, sans syndrome inflammatoire biologique.'),
    interpretationB: texte('Une protéine C réactive inférieure à 6 mg/L est considérée comme normale, sans syndrome inflammatoire biologique.'),
  },
  'ldh': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '130 - 460 UI/L', valeurMachineB: '130 - 460 UI/L',
    interpretationA: texte('L\'activité des LDH est normalement comprise entre 130 et 460 UI/L.'),
    interpretationB: texte('L\'activité des LDH est normalement comprise entre 130 et 460 UI/L.'),
  },
  'cholesterol total': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 2,00 g/L', valeurMachineB: '< 2,00 g/L',
    interpretationA: texte('Un cholestérol total inférieur à 2,00 g/L est considéré comme souhaitable.'),
    interpretationB: texte('Un cholestérol total inférieur à 2,00 g/L est considéré comme souhaitable.'),
  },
  'hdl cholesterol': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '> 0,40 g/L', valeurMachineB: '> 0,40 g/L',
    interpretationA: texte('Un cholestérol HDL supérieur à 0,40 g/L est considéré comme souhaitable.'),
    interpretationB: texte('Un cholestérol HDL supérieur à 0,40 g/L est considéré comme souhaitable.'),
  },
  'cholesterol hdl': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '> 0,40 g/L', valeurMachineB: '> 0,40 g/L',
    interpretationA: texte('Un cholestérol HDL supérieur à 0,40 g/L est considéré comme souhaitable.'),
    interpretationB: texte('Un cholestérol HDL supérieur à 0,40 g/L est considéré comme souhaitable.'),
  },
  'ldl cholesterol': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 1,60 g/L', valeurMachineB: '< 1,60 g/L',
    interpretationA: texte('Un cholestérol LDL inférieur à 1,60 g/L est considéré comme souhaitable.'),
    interpretationB: texte('Un cholestérol LDL inférieur à 1,60 g/L est considéré comme souhaitable.'),
  },
  'cholesterol ldl': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 1,60 g/L', valeurMachineB: '< 1,60 g/L',
    interpretationA: texte('Un cholestérol LDL inférieur à 1,60 g/L est considéré comme souhaitable.'),
    interpretationB: texte('Un cholestérol LDL inférieur à 1,60 g/L est considéré comme souhaitable.'),
  },
  'cholesterol ldl dosage': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 1,60 g/L', valeurMachineB: '< 1,60 g/L',
    interpretationA: texte('Un cholestérol LDL inférieur à 1,60 g/L est considéré comme souhaitable.'),
    interpretationB: texte('Un cholestérol LDL inférieur à 1,60 g/L est considéré comme souhaitable.'),
  },
  'triglycerides': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 1,50 g/L', valeurMachineB: '< 1,50 g/L',
    interpretationA: texte('Un taux de triglycérides inférieur à 1,50 g/L est considéré comme souhaitable.'),
    interpretationB: texte('Un taux de triglycérides inférieur à 1,50 g/L est considéré comme souhaitable.'),
  },
  'lipides totaux': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '4 - 10 g/L', valeurMachineB: '4 - 10 g/L',
    interpretationA: texte('Les lipides totaux sont normalement compris entre 4 et 10 g/L.'),
    interpretationB: texte('Les lipides totaux sont normalement compris entre 4 et 10 g/L.'),
  },
  'lipidogramme': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur souhaitable'],
      [
        ['Cholestérol total', '< 2,00 g/L'],
        ['Cholestérol LDL', '< 1,60 g/L'],
        ['Cholestérol HDL', '> 0,40 g/L (H) / > 0,50 (F)'],
        ['Triglycérides', '< 1,50 g/L'],
      ],
      "La valeur souhaitable du cholestérol total est inférieure à 2,00 g/L. Le cholestérol LDL est souhaitable en dessous de 1,60 g/L. Le cholestérol HDL doit être supérieur à 0,40 g/L chez l'homme et supérieur à 0,50 g/L chez la femme. Les triglycérides sont souhaitables en dessous de 1,50 g/L."
    ),
  },
  'proteines totales': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '60 - 80 g/L', valeurMachineB: '60 - 80 g/L',
    interpretationA: texte('Les protéines totales sont normalement comprises entre 60 et 80 g/L.'),
    interpretationB: texte('Les protéines totales sont normalement comprises entre 60 et 80 g/L.'),
  },
  'protidemie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '60 - 80 g/L', valeurMachineB: '60 - 80 g/L',
    interpretationA: texte('La protidémie est normalement comprise entre 60 et 80 g/L.'),
    interpretationB: texte('La protidémie est normalement comprise entre 60 et 80 g/L.'),
  },
  'albumine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '35 - 50 g/L', valeurMachineB: '35 - 50 g/L',
    interpretationA: texte('L\'albuminémie est normalement comprise entre 35 et 50 g/L.'),
    interpretationB: texte('L\'albuminémie est normalement comprise entre 35 et 50 g/L.'),
  },
  'albuminemie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '35 - 50 g/L', valeurMachineB: '35 - 50 g/L',
    interpretationA: texte('L\'albuminémie est normalement comprise entre 35 et 50 g/L.'),
    interpretationB: texte('L\'albuminémie est normalement comprise entre 35 et 50 g/L.'),
  },
  'fer serique': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (µg/dL)'],
      [
        ['Homme', '65 - 175'],
        ['Femme', '50 - 170'],
      ],
      'Chez l\'homme, le fer sérique est normalement compris entre 65 et 175 µg/dL. Chez la femme, il est compris entre 50 et 170 µg/dL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (µg/dL)'],
      [
        ['Homme', '65 - 175'],
        ['Femme', '50 - 170'],
      ],
      'Chez l\'homme, le fer sérique est normalement compris entre 65 et 175 µg/dL. Chez la femme, il est compris entre 50 et 170 µg/dL.'
    ),
  },
  'ferritine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '30 - 400'],
        ['Femme', '13 - 150'],
      ],
      'Chez l\'homme, la ferritine est normalement comprise entre 30 et 400 ng/mL. Chez la femme, elle est comprise entre 13 et 150 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '30 - 400'],
        ['Femme', '13 - 150'],
      ],
      'Chez l\'homme, la ferritine est normalement comprise entre 30 et 400 ng/mL. Chez la femme, elle est comprise entre 13 et 150 ng/mL.'
    ),
  },
  'reserves alcalines (hco3)': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '22 - 26 mmol/L', valeurMachineB: '22 - 26 mmol/L',
    interpretationA: texte('Les réserves alcalines (HCO3-) sont normalement comprises entre 22 et 26 mmol/L.'),
    interpretationB: texte('Les réserves alcalines (HCO3-) sont normalement comprises entre 22 et 26 mmol/L.'),
  },
  'corps cetoniques': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de corps cétoniques.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de corps cétoniques.'),
  },
  'procalcitonine (pct)': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (ng/mL)', 'Interprétation'],
      [
        ['< 0,05', 'Normal'],
        ['0,05 - 0,5', 'Infection bactérienne improbable'],
        ['0,5 - 2', 'Infection bactérienne possible'],
        ['2 - 10', 'Infection bactérienne probable / sepsis'],
        ['> 10', 'Sepsis sévère / choc septique'],
      ],
      "Une procalcitonine inférieure à 0,05 ng/mL est considérée comme normale. Une valeur comprise entre 0,05 et 0,5 ng/mL rend une infection bactérienne improbable. Entre 0,5 et 2 ng/mL, une infection bactérienne est possible. Entre 2 et 10 ng/mL, une infection bactérienne est probable et évoque un sepsis. Au-delà de 10 ng/mL, le résultat est en faveur d'un sepsis sévère ou d'un choc septique."
    ),
  },
  'troponine': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 14 ng/L (HS)', valeurMachineB: '< 14 ng/L (HS)',
    interpretationA: texte('Une troponine hypersensible inférieure à 14 ng/L est considérée comme normale.'),
    interpretationB: texte('Une troponine hypersensible inférieure à 14 ng/L est considérée comme normale.'),
  },
  'ck-mb (cpk-mb)': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 25 UI/L (< 5% CPK)', valeurMachineB: '< 25 UI/L (< 5% CPK)',
    interpretationA: texte('L\'activité CK-MB est normalement inférieure à 25 UI/L et représente moins de 5 % de l\'activité CPK totale.'),
    interpretationB: texte('L\'activité CK-MB est normalement inférieure à 25 UI/L et représente moins de 5 % de l\'activité CPK totale.'),
  },
  'cpk': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (UI/L)'],
      [
        ['Homme', '< 190'],
        ['Femme', '< 170'],
      ],
      'Chez l\'homme, l\'activité CPK totale est normalement inférieure à 190 UI/L. Chez la femme, elle est inférieure à 170 UI/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (UI/L)'],
      [
        ['Homme', '< 190'],
        ['Femme', '< 170'],
      ],
      'Chez l\'homme, l\'activité CPK totale est normalement inférieure à 190 UI/L. Chez la femme, elle est inférieure à 170 UI/L.'
    ),
  },
  'nt probnp': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Âge', 'Norme (pg/mL)'],
      [
        ['< 75 ans', '< 125'],
        ['≥ 75 ans', '< 450'],
      ],
      'Chez le sujet de moins de 75 ans, le NT-proBNP est normalement inférieur à 125 pg/mL. Au-delà de 75 ans, le seuil de normalité s\'élève à 450 pg/mL.'
    ),
    interpretationB: mixte(
      ['Âge', 'Norme (pg/mL)'],
      [
        ['< 75 ans', '< 125'],
        ['≥ 75 ans', '< 450'],
      ],
      'Chez le sujet de moins de 75 ans, le NT-proBNP est normalement inférieur à 125 pg/mL. Au-delà de 75 ans, le seuil de normalité s\'élève à 450 pg/mL.'
    ),
  },
  'myoglobine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '25 - 72'],
        ['Femme', '25 - 58'],
      ],
      'Chez l\'homme, la myoglobinémie est normalement comprise entre 25 et 72 ng/mL. Chez la femme, elle est comprise entre 25 et 58 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '25 - 72'],
        ['Femme', '25 - 58'],
      ],
      'Chez l\'homme, la myoglobinémie est normalement comprise entre 25 et 72 ng/mL. Chez la femme, elle est comprise entre 25 et 58 ng/mL.'
    ),
  },
  'lipase': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 60 UI/L', valeurMachineB: '< 60 UI/L',
    interpretationA: texte('L\'activité lipase est normalement inférieure à 60 UI/L.'),
    interpretationB: texte('L\'activité lipase est normalement inférieure à 60 UI/L.'),
  },
  'amylase': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 100 UI/L', valeurMachineB: '< 100 UI/L',
    interpretationA: texte('L\'activité amylase est normalement inférieure à 100 UI/L.'),
    interpretationB: texte('L\'activité amylase est normalement inférieure à 100 UI/L.'),
  },
  'acide vanilique mandelique': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 6,8 mg/24h', valeurMachineB: '< 6,8 mg/24h',
    interpretationA: texte('L\'excrétion urinaire d\'acide vanyl-mandélique est normalement inférieure à 6,8 mg/24h.'),
    interpretationB: texte('L\'excrétion urinaire d\'acide vanyl-mandélique est normalement inférieure à 6,8 mg/24h.'),
  },
  'metanephrines plasmatiques': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur normale (pg/mL)'],
      [
        ['Métanéphrine', '< 90'],
        ['Normétanéphrine', '< 200'],
      ],
      "La valeur normale de la métanéphrine plasmatique est inférieure à 90 pg/mL. La valeur normale de la normétanéphrine plasmatique est inférieure à 200 pg/mL."
    ),
  },
  'metanephrines urinaires': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur normale (mg/24h)'],
      [
        ['Métanéphrine', '< 0,35'],
        ['Normétanéphrine', '< 0,60'],
      ],
      "La valeur normale de la métanéphrine urinaire est inférieure à 0,35 mg/24h. La valeur normale de la normétanéphrine urinaire est inférieure à 0,60 mg/24h."
    ),
  },
  'homocysteine': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '5 - 15 umol/L', valeurMachineB: '5 - 15 umol/L',
    interpretationA: texte('L\'homocystéinémie est normalement comprise entre 5 et 15 µmol/L.'),
    interpretationB: texte('L\'homocystéinémie est normalement comprise entre 5 et 15 µmol/L.'),
  },
  'transferrine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '2,0 - 3,6 g/L', valeurMachineB: '2,0 - 3,6 g/L',
    interpretationA: texte('La transferrine est normalement comprise entre 2,0 et 3,6 g/L.'),
    interpretationB: texte('La transferrine est normalement comprise entre 2,0 et 3,6 g/L.'),
  },
  'recepteur soluble de la transferrine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,76 - 1,76 mg/L', valeurMachineB: '0,76 - 1,76 mg/L',
    interpretationA: texte('Le récepteur soluble de la transferrine est normalement compris entre 0,76 et 1,76 mg/L.'),
    interpretationB: texte('Le récepteur soluble de la transferrine est normalement compris entre 0,76 et 1,76 mg/L.'),
  },
  'coefficient de saturation de la transferrine (cst)': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '20 - 40 %', valeurMachineB: '20 - 40 %',
    interpretationA: texte('Le coefficient de saturation de la transferrine est normalement compris entre 20 et 40 %.'),
    interpretationB: texte('Le coefficient de saturation de la transferrine est normalement compris entre 20 et 40 %.'),
  },
  'haptoglobine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,30 - 2,00 g/L', valeurMachineB: '0,30 - 2,00 g/L',
    interpretationA: texte('L\'haptoglobinémie est normalement comprise entre 0,30 et 2,00 g/L.'),
    interpretationB: texte('L\'haptoglobinémie est normalement comprise entre 0,30 et 2,00 g/L.'),
  },
  'b2 microglobuline': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,8 - 2,4 mg/L', valeurMachineB: '0,8 - 2,4 mg/L',
    interpretationA: texte('La β2-microglobulinémie est normalement comprise entre 0,8 et 2,4 mg/L.'),
    interpretationB: texte('La β2-microglobulinémie est normalement comprise entre 0,8 et 2,4 mg/L.'),
  },
  'orosomucoide': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,50 - 1,20 g/L', valeurMachineB: '0,50 - 1,20 g/L',
    interpretationA: texte('L\'orosomucoïde sérique est normalement compris entre 0,50 et 1,20 g/L.'),
    interpretationB: texte('L\'orosomucoïde sérique est normalement compris entre 0,50 et 1,20 g/L.'),
  },
  'scc': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 1,5 ng/mL', valeurMachineB: '< 1,5 ng/mL',
    interpretationA: texte('Un antigène SCC inférieur à 1,5 ng/mL est considéré comme normal.'),
    interpretationB: texte('Un antigène SCC inférieur à 1,5 ng/mL est considéré comme normal.'),
  },
  'alfa 1 antitrypsine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,90 - 2,00 g/L', valeurMachineB: '0,90 - 2,00 g/L',
    interpretationA: texte('L\'alpha-1 antitrypsine sérique est normalement comprise entre 0,90 et 2,00 g/L.'),
    interpretationB: texte('L\'alpha-1 antitrypsine sérique est normalement comprise entre 0,90 et 2,00 g/L.'),
  },
  'cholinesterase': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '5 320 - 12 920 UI/L', valeurMachineB: '5 320 - 12 920 UI/L',
    interpretationA: texte('L\'activité cholinestérase sérique est normalement comprise entre 5 320 et 12 920 UI/L.'),
    interpretationB: texte('L\'activité cholinestérase sérique est normalement comprise entre 5 320 et 12 920 UI/L.'),
  },
  'adenosine desaminase (ada)': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 30 UI/L', valeurMachineB: '< 30 UI/L',
    interpretationA: texte('L\'activité de l\'adénosine désaminase est normalement inférieure à 30 UI/L.'),
    interpretationB: texte('L\'activité de l\'adénosine désaminase est normalement inférieure à 30 UI/L.'),
  },
  'apo a': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (g/L)'],
      [
        ['Homme', '1,15 - 1,90'],
        ['Femme', '1,15 - 2,20'],
      ],
      'Chez l\'homme, l\'apolipoprotéine A est normalement comprise entre 1,15 et 1,90 g/L. Chez la femme, elle est comprise entre 1,15 et 2,20 g/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (g/L)'],
      [
        ['Homme', '1,15 - 1,90'],
        ['Femme', '1,15 - 2,20'],
      ],
      'Chez l\'homme, l\'apolipoprotéine A est normalement comprise entre 1,15 et 1,90 g/L. Chez la femme, elle est comprise entre 1,15 et 2,20 g/L.'
    ),
  },
  'apo b': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,55 - 1,40 g/L', valeurMachineB: '0,55 - 1,40 g/L',
    interpretationA: texte('L\'apolipoprotéine B est normalement comprise entre 0,55 et 1,40 g/L.'),
    interpretationB: texte('L\'apolipoprotéine B est normalement comprise entre 0,55 et 1,40 g/L.'),
  },
  'aldolase': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 7,6 UI/L', valeurMachineB: '< 7,6 UI/L',
    interpretationA: texte('L\'activité aldolase sérique est normalement inférieure à 7,6 UI/L.'),
    interpretationB: texte('L\'activité aldolase sérique est normalement inférieure à 7,6 UI/L.'),
  },
  'enzyme de conversion': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '8 - 52 UI/L', valeurMachineB: '8 - 52 UI/L',
    interpretationA: texte('L\'activité de l\'enzyme de conversion de l\'angiotensine est normalement comprise entre 8 et 52 UI/L.'),
    interpretationB: texte('L\'activité de l\'enzyme de conversion de l\'angiotensine est normalement comprise entre 8 et 52 UI/L.'),
  },
  'complement c2': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '1,4 - 2,5 mg/dL', valeurMachineB: '1,4 - 2,5 mg/dL',
    interpretationA: texte('La fraction C2 du complément est normalement comprise entre 1,4 et 2,5 mg/dL.'),
    interpretationB: texte('La fraction C2 du complément est normalement comprise entre 1,4 et 2,5 mg/dL.'),
  },
  'complement c3': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,90 - 1,80 g/L', valeurMachineB: '0,90 - 1,80 g/L',
    interpretationA: texte('La fraction C3 du complément est normalement comprise entre 0,90 et 1,80 g/L.'),
    interpretationB: texte('La fraction C3 du complément est normalement comprise entre 0,90 et 1,80 g/L.'),
  },
  'complement c4': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,10 - 0,40 g/L', valeurMachineB: '0,10 - 0,40 g/L',
    interpretationA: texte('La fraction C4 du complément est normalement comprise entre 0,10 et 0,40 g/L.'),
    interpretationB: texte('La fraction C4 du complément est normalement comprise entre 0,10 et 0,40 g/L.'),
  },
  'complement c5': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '75 - 160 ug/mL', valeurMachineB: '75 - 160 ug/mL',
    interpretationA: texte('La fraction C5 du complément est normalement comprise entre 75 et 160 µg/mL.'),
    interpretationB: texte('La fraction C5 du complément est normalement comprise entre 75 et 160 µg/mL.'),
  },
  'complement ch50': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '70 - 150 U/mL', valeurMachineB: '70 - 150 U/mL',
    interpretationA: texte('L\'activité hémolytique CH50 du complément est normalement comprise entre 70 et 150 U/mL.'),
    interpretationB: texte('L\'activité hémolytique CH50 du complément est normalement comprise entre 70 et 150 U/mL.'),
  },
  'complement c1 inhibiteur': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,21 - 0,39 g/L', valeurMachineB: '0,21 - 0,39 g/L',
    interpretationA: texte('L\'inhibiteur du C1 estérase est normalement compris entre 0,21 et 0,39 g/L.'),
    interpretationB: texte('L\'inhibiteur du C1 estérase est normalement compris entre 0,21 et 0,39 g/L.'),
  },
  'fibrotest actitest': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Score calculé pour évaluation de la fibrose et de l\'activité hépatique (METAVIR).'),
  },
  'tacrolimus': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '5 - 20 ng/mL (cible)', valeurMachineB: '5 - 20 ng/mL (cible)',
    interpretationA: texte('La concentration cible de tacrolimus est généralement comprise entre 5 et 20 ng/mL selon l\'indication.'),
    interpretationB: texte('La concentration cible de tacrolimus est généralement comprise entre 5 et 20 ng/mL selon l\'indication.'),
  },
  'pyruvate kinase': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '8,8 - 20,5 UI/g Hb', valeurMachineB: '8,8 - 20,5 UI/g Hb',
    interpretationA: texte('L\'activité érythrocytaire de la pyruvate kinase est normalement comprise entre 8,8 et 20,5 UI/g d\'hémoglobine.'),
    interpretationB: texte('L\'activité érythrocytaire de la pyruvate kinase est normalement comprise entre 8,8 et 20,5 UI/g d\'hémoglobine.'),
  },
  'g6pd': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '7,0 - 20,5 UI/g Hb', valeurMachineB: '7,0 - 20,5 UI/g Hb',
    interpretationA: texte('L\'activité érythrocytaire de la G6PD est normalement comprise entre 7,0 et 20,5 UI/g d\'hémoglobine.'),
    interpretationB: texte('L\'activité érythrocytaire de la G6PD est normalement comprise entre 7,0 et 20,5 UI/g d\'hémoglobine.'),
  },
  'hematies leucocytes minute (hlm ou compte d\'addis)': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Élément', 'Valeur normale (/min)'],
      [
        ['Hématies', '< 5 000 /min'],
        ['Leucocytes', '< 5 000 /min'],
      ],
      "Le débit normal d'hématies est inférieur à 5 000 par minute. Le débit normal de leucocytes est inférieur à 5 000 par minute."
    ),
  },
  'parathormone (pth intacte)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '15 - 65 pg/mL', valeurMachineB: '15 - 65 pg/mL',
    interpretationA: texte('La parathormone intacte (PTH 1-84) est normalement comprise entre 15 et 65 pg/mL.'),
    interpretationB: texte('La parathormone intacte (PTH 1-84) est normalement comprise entre 15 et 65 pg/mL.'),
  },
  'medullogramme': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytologique de la moelle osseuse après ponction sternale ou iliaque.'),
  },
  'immunofixation': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Recherche et caractérisation d\'immunoglobulines monoclonales.'),
  },
  'electrophorese proteines': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Fraction', 'Valeur normale (g/L)'],
      [
        ['Albumine', '38 - 51'],
        ['Alpha-1 globulines', '1 - 4'],
        ['Alpha-2 globulines', '5 - 11'],
        ['Beta globulines', '6 - 13'],
        ['Gamma globulines', '8 - 16'],
      ],
      "La fraction albumine est normalement comprise entre 38 et 51 g/L. La fraction alpha-1 globulines est comprise entre 1 et 4 g/L. La fraction alpha-2 globulines se situe entre 5 et 11 g/L. La fraction béta globulines varie entre 6 et 13 g/L. La fraction gamma globulines est comprise entre 8 et 16 g/L."
    ),
  },
  'electrophorese des proteines urinaires': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Caractérisation qualitative des protéines urinaires (glomérulaire / tubulaire / mixte).'),
  },
  'albumine/sucre': {
    machineA: 'GH-900Plus', machineB: 'GH-900Plus',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'albumine et de sucre dans les urines à la bandelette.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'albumine et de sucre dans les urines à la bandelette.'),
  },
  'alpha lactalbumine': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 0,35 kUA/L', valeurMachineB: '< 0,35 kUA/L',
    interpretationA: texte('Un taux d\'IgE spécifiques anti-alpha-lactalbumine inférieur à 0,35 kUA/L est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'IgE spécifiques anti-alpha-lactalbumine inférieur à 0,35 kUA/L est considéré comme négatif.'),
  },
  'alpha lactalbumine lait': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 0,35 kUA/L', valeurMachineB: '< 0,35 kUA/L',
    interpretationA: texte('Un taux d\'IgE spécifiques anti-alpha-lactalbumine du lait inférieur à 0,35 kUA/L est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'IgE spécifiques anti-alpha-lactalbumine du lait inférieur à 0,35 kUA/L est considéré comme négatif.'),
  },
  'alpha lact': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 0,35 kUA/L', valeurMachineB: '< 0,35 kUA/L',
    interpretationA: texte('Un taux d\'IgE spécifiques anti-alpha-lactalbumine inférieur à 0,35 kUA/L est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'IgE spécifiques anti-alpha-lactalbumine inférieur à 0,35 kUA/L est considéré comme négatif.'),
  },
  'apl': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps antiphospholipides détectables.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps antiphospholipides détectables.'),
  },
  'albuminurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 30 mg/24h', valeurMachineB: '< 30 mg/24h',
    interpretationA: texte('Une albuminurie inférieure à 30 mg/24h est considérée comme normale.'),
    interpretationB: texte('Une albuminurie inférieure à 30 mg/24h est considérée comme normale.'),
  },
  'creatinurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (g/24h)'],
      [
        ['Homme', '0,8 - 2,0'],
        ['Femme', '0,6 - 1,8'],
      ],
      'Chez l\'homme, la créatininurie des 24 heures est normalement comprise entre 0,8 et 2,0 g/24h. Chez la femme, elle est comprise entre 0,6 et 1,8 g/24h.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (g/24h)'],
      [
        ['Homme', '0,8 - 2,0'],
        ['Femme', '0,6 - 1,8'],
      ],
      'Chez l\'homme, la créatininurie des 24 heures est normalement comprise entre 0,8 et 2,0 g/24h. Chez la femme, elle est comprise entre 0,6 et 1,8 g/24h.'
    ),
  },
  'proteinurie de bence jones': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de protéines de Bence Jones (chaînes légères libres) dans les urines.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de protéines de Bence Jones (chaînes légères libres) dans les urines.'),
  },
  'hyperglycemie provoquee par voie orale (hgpo)': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Temps', 'Seuil (g/L)'],
      [
        ['T0 (à jeun)', '< 0,92'],
        ['T60 (1h)', '< 1,80'],
        ['T120 (2h)', '< 1,53'],
      ],
      "À jeun (T0), la glycémie doit être inférieure à 0,92 g/L. À une heure (T60), elle doit rester inférieure à 1,80 g/L. À deux heures (T120), elle doit être inférieure à 1,53 g/L."
    ),
    interpretationB: mixte(
      ['Temps', 'Seuil (g/L)'],
      [
        ['T0 (à jeun)', '< 0,92'],
        ['T60 (1h)', '< 1,80'],
        ['T120 (2h)', '< 1,53'],
      ],
      "À jeun (T0), la glycémie doit être inférieure à 0,92 g/L. À une heure (T60), elle doit rester inférieure à 1,80 g/L. À deux heures (T120), elle doit être inférieure à 1,53 g/L."
    ),
  },
  'ionogramme sanguin (na, k, cl)': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur normale'],
      [
        ['Sodium (Na)', '135 - 145 mmol/L'],
        ['Potassium (K)', '3,5 - 5,0 mmol/L'],
        ['Chlore (Cl)', '95 - 105 mmol/L'],
      ],
      "La natrémie normale est comprise entre 135 et 145 mmol/L. La kaliémie normale se situe entre 3,5 et 5,0 mmol/L. La chlorémie normale est comprise entre 95 et 105 mmol/L."
    ),
    interpretationB: mixte(
      ['Paramètre', 'Valeur normale'],
      [
        ['Sodium (Na)', '135 - 145 mmol/L'],
        ['Potassium (K)', '3,5 - 5,0 mmol/L'],
        ['Chlore (Cl)', '95 - 105 mmol/L'],
      ],
      "La natrémie normale est comprise entre 135 et 145 mmol/L. La kaliémie normale se situe entre 3,5 et 5,0 mmol/L. La chlorémie normale est comprise entre 95 et 105 mmol/L."
    ),
  },
  'ionogramme urinaire': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur normale (mmol/24h)'],
      [
        ['Sodium', '100 - 300'],
        ['Potassium', '40 - 100'],
        ['Chlore', '100 - 250'],
      ],
      "L'excrétion urinaire normale de sodium est comprise entre 100 et 300 mmol/24h. L'excrétion urinaire normale de potassium se situe entre 40 et 100 mmol/24h. L'excrétion urinaire normale de chlore est comprise entre 100 et 250 mmol/24h."
    ),
  },
  'gaz du sang': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur normale'],
      [
        ['pH', '7,35 - 7,45'],
        ['pCO2', '35 - 45 mmHg'],
        ['pO2', '70 - 115 mmHg'],
        ['HCO3', '22 - 26 mmol/L'],
        ['SaO2', '95 - 99 %'],
      ],
      "Le pH artériel normal est compris entre 7,35 et 7,45. La pCO2 normale se situe entre 35 et 45 mmHg. La pO2 normale est comprise entre 70 et 115 mmHg. La concentration en HCO3 normale est comprise entre 22 et 26 mmol/L. La saturation artérielle en oxygène (SaO2) normale se situe entre 95 et 99 %."
    ),
    interpretationB: mixte(
      ['Paramètre', 'Valeur normale'],
      [
        ['pH', '7,35 - 7,45'],
        ['pCO2', '35 - 45 mmHg'],
        ['pO2', '70 - 115 mmHg'],
        ['HCO3', '22 - 26 mmol/L'],
        ['SaO2', '95 - 99 %'],
      ],
      "Le pH artériel normal est compris entre 7,35 et 7,45. La pCO2 normale se situe entre 35 et 45 mmHg. La pO2 normale est comprise entre 70 et 115 mmHg. La concentration en HCO3 normale est comprise entre 22 et 26 mmol/L. La saturation artérielle en oxygène (SaO2) normale se situe entre 95 et 99 %."
    ),
  },
  'calciurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '100 - 300 mg/24h', valeurMachineB: '100 - 300 mg/24h',
    interpretationA: texte('La calciurie des 24 heures est normalement comprise entre 100 et 300 mg/24h.'),
    interpretationB: texte('La calciurie des 24 heures est normalement comprise entre 100 et 300 mg/24h.'),
  },
  'glucosurie': {
    machineA: 'GH-900Plus', machineB: 'GH-900Plus',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de glucose dans les urines.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de glucose dans les urines.'),
  },
  'corps cetoniques ': {
    machineA: 'GH-900Plus', machineB: 'GH-900Plus',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de corps cétoniques dans les urines.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de corps cétoniques dans les urines.'),
  },

  // =====================================================================
  // BIOCHIMIE URINAIRE (deja existants)
  // =====================================================================
  'microalbuminurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 30 mg/24h', valeurMachineB: '< 30 mg/24h',
    interpretationA: texte('Une microalbuminurie inférieure à 30 mg/24h est considérée comme normale.'),
    interpretationB: texte('Une microalbuminurie inférieure à 30 mg/24h est considérée comme normale.'),
  },
  'proteinurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 150 mg/24h', valeurMachineB: '< 150 mg/24h',
    interpretationA: texte('Une protéinurie inférieure à 150 mg/24h est considérée comme normale.'),
    interpretationB: texte('Une protéinurie inférieure à 150 mg/24h est considérée comme normale.'),
  },
  'rapport albuminurie creatinurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'N : < 30 mg/g', valeurMachineB: 'N : < 30 mg/g',
    interpretationA: texte('Un rapport albuminurie/créatinurie inférieur à 30 mg/g est considéré comme normal.'),
    interpretationB: texte('Un rapport albuminurie/créatinurie inférieur à 30 mg/g est considéré comme normal.'),
  },
  'rapport proteinurie creatinurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'N : < 150 mg/g', valeurMachineB: 'N : < 150 mg/g',
    interpretationA: texte('Un rapport protéinurie/créatinurie inférieur à 150 mg/g est considéré comme normal.'),
    interpretationB: texte('Un rapport protéinurie/créatinurie inférieur à 150 mg/g est considéré comme normal.'),
  },
  'calcium corrige': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '2,20 - 2,60 mmol/L', valeurMachineB: '2,20 - 2,60 mmol/L',
    interpretationA: texte('La calcémie corrigée par l\'albumine est normalement comprise entre 2,20 et 2,60 mmol/L.'),
    interpretationB: texte('La calcémie corrigée par l\'albumine est normalement comprise entre 2,20 et 2,60 mmol/L.'),
  },
  'clairance creatinine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '> 90 mL/min', valeurMachineB: '> 90 mL/min',
    interpretationA: texte('Une clairance de la créatinine supérieure à 90 mL/min est considérée comme normale.'),
    interpretationB: texte('Une clairance de la créatinine supérieure à 90 mL/min est considérée comme normale.'),
  },
  'dfg': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '≥ 90 mL/min/1,73 m²', valeurMachineB: '≥ 90 mL/min/1,73 m²',
    interpretationA: texte('Un débit de filtration glomérulaire supérieur ou égal à 90 mL/min/1,73 m² est considéré comme normal.'),
    interpretationB: texte('Un débit de filtration glomérulaire supérieur ou égal à 90 mL/min/1,73 m² est considéré comme normal.'),
  },
  'debit de filtration glomerulaire': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '≥ 90 mL/min/1,73 m²', valeurMachineB: '≥ 90 mL/min/1,73 m²',
    interpretationA: texte('Un débit de filtration glomérulaire supérieur ou égal à 90 mL/min/1,73 m² est considéré comme normal.'),
    interpretationB: texte('Un débit de filtration glomérulaire supérieur ou égal à 90 mL/min/1,73 m² est considéré comme normal.'),
  },

  // =====================================================================
  // COAGULATION (Start Max / CA104)
  // =====================================================================
  'taux de prothrombine': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '> 70 %', valeurMachineB: '> 70 %',
    interpretationA: texte('Un taux de prothrombine supérieur à 70 % est considéré comme normal.'),
    interpretationB: texte('Un taux de prothrombine supérieur à 70 % est considéré comme normal.'),
  },
  'tp': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '> 70 %', valeurMachineB: '> 70 %',
    interpretationA: texte('Un taux de prothrombine supérieur à 70 % est considéré comme normal.'),
    interpretationB: texte('Un taux de prothrombine supérieur à 70 % est considéré comme normal.'),
  },
  'inr': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '0,9 - 1,2', valeurMachineB: '0,9 - 1,2',
    interpretationA: texte('Un INR compris entre 0,9 et 1,2 est considéré comme normal hors traitement anticoagulant.'),
    interpretationB: texte('Un INR compris entre 0,9 et 1,2 est considéré comme normal hors traitement anticoagulant.'),
  },
  'tck': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '20 - 40 secondes', valeurMachineB: '20 - 40 secondes',
    interpretationA: texte('Le temps de céphaline-kaolin est normalement compris entre 20 et 40 secondes.'),
    interpretationB: texte('Le temps de céphaline-kaolin est normalement compris entre 20 et 40 secondes.'),
  },
  'tca': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '20 - 40 secondes', valeurMachineB: '20 - 40 secondes',
    interpretationA: texte('Le temps de céphaline activé est normalement compris entre 20 et 40 secondes.'),
    interpretationB: texte('Le temps de céphaline activé est normalement compris entre 20 et 40 secondes.'),
  },
  'temps de cephaline active': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '20 - 40 secondes', valeurMachineB: '20 - 40 secondes',
    interpretationA: texte('Le temps de céphaline activé est normalement compris entre 20 et 40 secondes.'),
    interpretationB: texte('Le temps de céphaline activé est normalement compris entre 20 et 40 secondes.'),
  },
  'fibrinogene': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '2,0 - 4,0 g/L', valeurMachineB: '2,0 - 4,0 g/L',
    interpretationA: texte('Le fibrinogène plasmatique est normalement compris entre 2,0 et 4,0 g/L.'),
    interpretationB: texte('Le fibrinogène plasmatique est normalement compris entre 2,0 et 4,0 g/L.'),
  },
  'fibrinemie': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '2,0 - 4,0 g/L', valeurMachineB: '2,0 - 4,0 g/L',
    interpretationA: texte('La fibrinémie est normalement comprise entre 2,0 et 4,0 g/L.'),
    interpretationB: texte('La fibrinémie est normalement comprise entre 2,0 et 4,0 g/L.'),
  },
  'd dimeres': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '< 500 ng/mL', valeurMachineB: '< 500 ng/mL',
    interpretationA: texte('Un taux de D-dimères inférieur à 500 ng/mL est considéré comme normal.'),
    interpretationB: texte('Un taux de D-dimères inférieur à 500 ng/mL est considéré comme normal.'),
  },
  'produits de degradation fibrine': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '< 5 ug/mL', valeurMachineB: '< 5 ug/mL',
    interpretationA: texte('Les produits de dégradation de la fibrine sont normalement inférieurs à 5 µg/mL.'),
    interpretationB: texte('Les produits de dégradation de la fibrine sont normalement inférieurs à 5 µg/mL.'),
  },
  'facteur v': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '70 - 120 %', valeurMachineB: '70 - 120 %',
    interpretationA: texte('L\'activité du facteur V est normalement comprise entre 70 et 120 %.'),
    interpretationB: texte('L\'activité du facteur V est normalement comprise entre 70 et 120 %.'),
  },
  'facteur viii': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '50 - 150 %', valeurMachineB: '50 - 150 %',
    interpretationA: texte('L\'activité du facteur VIII est normalement comprise entre 50 et 150 %.'),
    interpretationB: texte('L\'activité du facteur VIII est normalement comprise entre 50 et 150 %.'),
  },
  'facteur ix': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '60 - 150 %', valeurMachineB: '60 - 150 %',
    interpretationA: texte('L\'activité du facteur IX est normalement comprise entre 60 et 150 %.'),
    interpretationB: texte('L\'activité du facteur IX est normalement comprise entre 60 et 150 %.'),
  },
  'facteur xiii': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '70 - 140 %', valeurMachineB: '70 - 140 %',
    interpretationA: texte('L\'activité du facteur XIII est normalement comprise entre 70 et 140 %.'),
    interpretationB: texte('L\'activité du facteur XIII est normalement comprise entre 70 et 140 %.'),
  },
  'facteur von willebrand fvwf': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '50 - 160 %', valeurMachineB: '50 - 160 %',
    interpretationA: texte('L\'activité du facteur von Willebrand est normalement comprise entre 50 et 160 %.'),
    interpretationB: texte('L\'activité du facteur von Willebrand est normalement comprise entre 50 et 160 %.'),
  },
  'antithrombine (atiii)': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '80 - 120 %', valeurMachineB: '80 - 120 %',
    interpretationA: texte('L\'activité antithrombine III est normalement comprise entre 80 et 120 %.'),
    interpretationB: texte('L\'activité antithrombine III est normalement comprise entre 80 et 120 %.'),
  },
  'proteine c': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '70 - 140 %', valeurMachineB: '70 - 140 %',
    interpretationA: texte('L\'activité de la protéine C est normalement comprise entre 70 et 140 %.'),
    interpretationB: texte('L\'activité de la protéine C est normalement comprise entre 70 et 140 %.'),
  },
  'proteine s': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (%)'],
      [
        ['Homme', '70 - 140'],
        ['Femme', '60 - 130'],
      ],
      'Chez l\'homme, l\'activité de la protéine S est normalement comprise entre 70 et 140 %. Chez la femme, elle est comprise entre 60 et 130 %.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (%)'],
      [
        ['Homme', '70 - 140'],
        ['Femme', '60 - 130'],
      ],
      'Chez l\'homme, l\'activité de la protéine S est normalement comprise entre 70 et 140 %. Chez la femme, elle est comprise entre 60 et 130 %.'
    ),
  },
  'lupus anticoagulant': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticoagulant circulant de type lupique.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticoagulant circulant de type lupique.'),
  },
  'adamts 13': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '50 - 150 %', valeurMachineB: '50 - 150 %',
    interpretationA: texte('L\'activité ADAMTS13 est normalement comprise entre 50 et 150 %.'),
    interpretationB: texte('L\'activité ADAMTS13 est normalement comprise entre 50 et 150 %.'),
  },
  'temps de saignement (ts)': {
    machineA: 'Méthode Ivy', machineB: 'Méthode Ivy',
    valeurMachineA: '2 - 8 minutes', valeurMachineB: '2 - 8 minutes',
    interpretationA: texte('Le temps de saignement par méthode d\'Ivy est normalement compris entre 2 et 8 minutes.'),
    interpretationB: texte('Le temps de saignement par méthode d\'Ivy est normalement compris entre 2 et 8 minutes.'),
  },
  'test d\'emmel': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un test d\'Emmel négatif traduit l\'absence de falciformation des hématies.'),
    interpretationB: texte('Un test d\'Emmel négatif traduit l\'absence de falciformation des hématies.'),
  },
  'aslo': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 200 UI/mL', valeurMachineB: '< 200 UI/mL',
    interpretationA: texte('Un taux d\'antistreptolysines O inférieur à 200 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'antistreptolysines O inférieur à 200 UI/mL est considéré comme négatif.'),
  },
  'asdor': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 200 UI/mL', valeurMachineB: '< 200 UI/mL',
    interpretationA: texte('Un taux d\'anti-streptodornase B inférieur à 200 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anti-streptodornase B inférieur à 200 UI/mL est considéré comme négatif.'),
  },
  'recherche d\'agglutinines irregulieres (rai)': {
    machineA: 'Grifols DG gel', machineB: 'Grifols DG gel',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'agglutinines irrégulières détectées.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'agglutinines irrégulières détectées.'),
  },

  // =====================================================================
  // HbA1c (HumaMeter A1c)
  // =====================================================================
  'hba1c': {
    machineA: 'HumaMeter A1c', machineB: 'HumaMeter A1c',
    valeurMachineA: '4 - 5,6 %', valeurMachineB: '4 - 5,6 %',
    interpretationA: mixte(
      ['Valeur HbA1c', 'Interprétation'],
      [
        ['< 5,7 %', 'Normal'],
        ['5,7 - 6,4 %', 'Prédiabète'],
        ['≥ 6,5 %', 'Diabète'],
        ['< 7 %', 'Objectif chez diabétique contrôlé'],
      ],
      "Une valeur d'HbA1c inférieure à 5,7 % est considérée comme normale. Entre 5,7 et 6,4 %, le résultat évoque un prédiabète. Une valeur supérieure ou égale à 6,5 % est en faveur d'un diabète. Chez le patient diabétique connu, une HbA1c inférieure à 7 % traduit l'objectif d'équilibre glycémique."
    ),
    interpretationB: mixte(
      ['Valeur HbA1c', 'Interprétation'],
      [
        ['< 5,7 %', 'Normal'],
        ['5,7 - 6,4 %', 'Prédiabète'],
        ['≥ 6,5 %', 'Diabète'],
        ['< 7 %', 'Objectif chez diabétique contrôlé'],
      ],
      "Une valeur d'HbA1c inférieure à 5,7 % est considérée comme normale. Entre 5,7 et 6,4 %, le résultat évoque un prédiabète. Une valeur supérieure ou égale à 6,5 % est en faveur d'un diabète. Chez le patient diabétique connu, une HbA1c inférieure à 7 % traduit l'objectif d'équilibre glycémique."
    ),
  },
  'hemoglobine glyquee': {
    machineA: 'HumaMeter A1c', machineB: 'HumaMeter A1c',
    valeurMachineA: '4 - 5,6 %', valeurMachineB: '4 - 5,6 %',
    interpretationA: texte('Une hémoglobine glyquée comprise entre 4 et 5,6 % est considérée comme normale.'),
    interpretationB: texte('Une hémoglobine glyquée comprise entre 4 et 5,6 % est considérée comme normale.'),
  },

  // =====================================================================
  // GROUPE SANGUIN (Grifols carte DG gel Coombs)
  // =====================================================================
  'groupe sanguin abo': {
    machineA: 'Grifols DG gel', machineB: 'Grifols DG gel',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Détermination du groupe ABO sur carte gel Coombs Grifols.'),
  },
  'groupe sanguin rhesus': {
    machineA: 'Grifols DG gel', machineB: 'Grifols DG gel',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Détermination du Rhésus D sur carte gel Coombs Grifols.'),
  },
  'test de coombs': {
    machineA: 'Grifols DG gel', machineB: 'Grifols DG gel',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un test de Coombs négatif traduit l\'absence d\'anticorps anti-érythrocytaires détectés.'),
    interpretationB: texte('Un test de Coombs négatif traduit l\'absence d\'anticorps anti-érythrocytaires détectés.'),
  },
  'phenotype rhesus kell': {
    machineA: 'Grifols DG gel', machineB: 'Grifols DG gel',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Phénotype Rhésus standard (D, C, c, E, e) et Kell (K, k).'),
  },
  'phenotypes etendus': {
    machineA: 'Grifols DG gel', machineB: 'Grifols DG gel',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Phénotypes érythrocytaires étendus (Duffy, Kidd, MNSs, Lewis...).'),
  },

  // =====================================================================
  // PARASITOLOGIE / PALUDISME (QBC Paralens Advance)
  // =====================================================================
  'goutte epaisse': {
    machineA: 'QBC Paralens Advance', machineB: 'QBC Paralens Advance',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Une goutte épaisse négative traduit l\'absence de Plasmodium détecté.'),
    interpretationB: texte('Une goutte épaisse négative traduit l\'absence de Plasmodium détecté.'),
  },
  'paludisme': {
    machineA: 'QBC Paralens Advance', machineB: 'QBC Paralens Advance',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de Plasmodium détecté.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de Plasmodium détecté.'),
  },
  'qbc': {
    machineA: 'QBC Paralens Advance', machineB: 'QBC Paralens Advance',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un QBC négatif traduit l\'absence de Plasmodium détecté en fluorescence.'),
    interpretationB: texte('Un QBC négatif traduit l\'absence de Plasmodium détecté en fluorescence.'),
  },

  // =====================================================================
  // ELECTROPHORESE (Minicap / Hydrasys 2 sebia)
  // =====================================================================
  'electrophorese des proteines': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Fraction', 'Valeur normale (g/L)'],
      [
        ['Albumine', '38 - 51'],
        ['Alpha-1 globulines', '1 - 4'],
        ['Alpha-2 globulines', '5 - 11'],
        ['Beta globulines', '6 - 13'],
        ['Gamma globulines', '8 - 16'],
      ],
      "La fraction albumine est normalement comprise entre 38 et 51 g/L. La fraction alpha-1 globulines se situe entre 1 et 4 g/L. La fraction alpha-2 globulines varie entre 5 et 11 g/L. La fraction béta globulines est comprise entre 6 et 13 g/L. La fraction gamma globulines est comprise entre 8 et 16 g/L."
    ),
  },
  'electrophorese de l hemoglobine': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Hémoglobine', 'Adulte (%)'],
      [
        ['HbA', '95 - 98'],
        ['HbA2', '2,0 - 3,3'],
        ['HbF', '< 1'],
      ],
      "Chez l'adulte, la fraction HbA représente normalement 95 à 98 % de l'hémoglobine totale. La fraction HbA2 est comprise entre 2,0 et 3,3 %. La fraction HbF est inférieure à 1 %."
    ),
  },

  // =====================================================================
  // HORMONOLOGIE (CLIA Minividas / Maglumi)
  // =====================================================================
  't3 libre': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '3,0 - 8,3 pmol/L', valeurMachineB: '3,0 - 8,3 pmol/L',
    interpretationA: texte('La T3 libre est normalement comprise entre 3,0 et 8,3 pmol/L.'),
    interpretationB: texte('La T3 libre est normalement comprise entre 3,0 et 8,3 pmol/L.'),
  },
  't4 libre': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '8,6 - 25 pmol/L', valeurMachineB: '8,6 - 25 pmol/L',
    interpretationA: texte('La T4 libre est normalement comprise entre 8,6 et 25 pmol/L.'),
    interpretationB: texte('La T4 libre est normalement comprise entre 8,6 et 25 pmol/L.'),
  },
  'tsh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '0,4 - 4,0 mUI/L', valeurMachineB: '0,4 - 4,0 mUI/L',
    interpretationA: texte('Le taux de TSH est normalement compris entre 0,4 et 4,0 mUI/L.'),
    interpretationB: texte('Le taux de TSH est normalement compris entre 0,4 et 4,0 mUI/L.'),
  },
  'fsh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Phase / Sexe', 'FSH (UI/L)'],
      [
        ['Folliculaire (F)', '3,5 - 12,5'],
        ['Ovulatoire (F)', '4,7 - 21,5'],
        ['Lutéale (F)', '1,7 - 7,7'],
        ['Ménopause (F)', '25,8 - 134,8'],
        ['Adulte (H)', '1,5 - 12,4'],
      ],
      "Chez la femme en phase folliculaire, la FSH est normalement comprise entre 3,5 et 12,5 UI/L. En phase ovulatoire, elle se situe entre 4,7 et 21,5 UI/L. En phase lutéale, elle varie entre 1,7 et 7,7 UI/L. Après la ménopause, elle est comprise entre 25,8 et 134,8 UI/L. Chez l'homme adulte, la FSH est comprise entre 1,5 et 12,4 UI/L."
    ),
  },
  'lh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Phase / Sexe', 'LH (UI/L)'],
      [
        ['Folliculaire (F)', '2,4 - 12,6'],
        ['Ovulatoire (F)', '14,0 - 95,6'],
        ['Lutéale (F)', '1,0 - 11,4'],
        ['Ménopause (F)', '7,7 - 58,5'],
        ['Adulte (H)', '1,7 - 8,6'],
      ],
      "Chez la femme en phase folliculaire, la LH est normalement comprise entre 2,4 et 12,6 UI/L. En phase ovulatoire, elle se situe entre 14,0 et 95,6 UI/L. En phase lutéale, elle varie entre 1,0 et 11,4 UI/L. Après la ménopause, elle est comprise entre 7,7 et 58,5 UI/L. Chez l'homme adulte, la LH est comprise entre 1,7 et 8,6 UI/L."
    ),
  },
  'estradiol': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Phase / Sexe', 'Estradiol (pg/mL)'],
      [
        ['Folliculaire (F)', '12,5 - 166'],
        ['Ovulatoire (F)', '85,8 - 498'],
        ['Lutéale (F)', '43,8 - 211'],
        ['Ménopause (F)', '< 54,7'],
        ['Adulte (H)', '7,6 - 42,6'],
      ],
      "Chez la femme en phase folliculaire, l'estradiol est normalement compris entre 12,5 et 166 pg/mL. En phase ovulatoire, il se situe entre 85,8 et 498 pg/mL. En phase lutéale, il varie entre 43,8 et 211 pg/mL. Après la ménopause, il est inférieur à 54,7 pg/mL. Chez l'homme adulte, l'estradiol est compris entre 7,6 et 42,6 pg/mL."
    ),
  },
  'progesterone': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Phase / Sexe', 'Progestérone (ng/mL)'],
      [
        ['Folliculaire (F)', '0,2 - 1,5'],
        ['Lutéale (F)', '1,7 - 27'],
        ['Ménopause (F)', '< 0,4'],
        ['Adulte (H)', '< 0,2 - 1,4'],
      ],
      "Chez la femme en phase folliculaire, la progestérone est normalement comprise entre 0,2 et 1,5 ng/mL. En phase lutéale, elle se situe entre 1,7 et 27 ng/mL. Après la ménopause, elle est inférieure à 0,4 ng/mL. Chez l'homme adulte, la progestérone est comprise entre moins de 0,2 et 1,4 ng/mL."
    ),
  },
  'prolactine': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '< 18'],
        ['Femme', '< 25'],
      ],
      'Chez l\'homme, la prolactinémie est normalement inférieure à 18 ng/mL. Chez la femme, elle est inférieure à 25 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '< 18'],
        ['Femme', '< 25'],
      ],
      'Chez l\'homme, la prolactinémie est normalement inférieure à 18 ng/mL. Chez la femme, elle est inférieure à 25 ng/mL.'
    ),
  },
  'testosterone': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '3,0 - 10,0'],
        ['Femme', '< 1,0'],
      ],
      'Chez l\'homme, la testostéronémie est normalement comprise entre 3,0 et 10,0 ng/mL. Chez la femme, elle est inférieure à 1,0 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '3,0 - 10,0'],
        ['Femme', '< 1,0'],
      ],
      'Chez l\'homme, la testostéronémie est normalement comprise entre 3,0 et 10,0 ng/mL. Chez la femme, elle est inférieure à 1,0 ng/mL.'
    ),
  },
  'testosterone totale': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '3,0 - 10,0'],
        ['Femme', '0,1 - 0,8'],
      ],
      'Chez l\'homme, la testostérone totale est normalement comprise entre 3,0 et 10,0 ng/mL. Chez la femme, elle est comprise entre 0,1 et 0,8 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '3,0 - 10,0'],
        ['Femme', '0,1 - 0,8'],
      ],
      'Chez l\'homme, la testostérone totale est normalement comprise entre 3,0 et 10,0 ng/mL. Chez la femme, elle est comprise entre 0,1 et 0,8 ng/mL.'
    ),
  },
  'testosterone libre': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (pg/mL)'],
      [
        ['Homme', '8,8 - 27'],
        ['Femme', '0,3 - 3,2'],
      ],
      'Chez l\'homme, la testostérone libre est normalement comprise entre 8,8 et 27 pg/mL. Chez la femme, elle est comprise entre 0,3 et 3,2 pg/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (pg/mL)'],
      [
        ['Homme', '8,8 - 27'],
        ['Femme', '0,3 - 3,2'],
      ],
      'Chez l\'homme, la testostérone libre est normalement comprise entre 8,8 et 27 pg/mL. Chez la femme, elle est comprise entre 0,3 et 3,2 pg/mL.'
    ),
  },
  'testosterone biodisponible': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '1,0 - 3,6'],
        ['Femme', '0,03 - 0,30'],
      ],
      'Chez l\'homme, la testostérone biodisponible est normalement comprise entre 1,0 et 3,6 ng/mL. Chez la femme, elle est comprise entre 0,03 et 0,30 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '1,0 - 3,6'],
        ['Femme', '0,03 - 0,30'],
      ],
      'Chez l\'homme, la testostérone biodisponible est normalement comprise entre 1,0 et 3,6 ng/mL. Chez la femme, elle est comprise entre 0,03 et 0,30 ng/mL.'
    ),
  },
  'dihydrotestosterone': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (pg/mL)'],
      [
        ['Homme', '250 - 990'],
        ['Femme', '24 - 450'],
      ],
      'Chez l\'homme, la dihydrotestostérone est normalement comprise entre 250 et 990 pg/mL. Chez la femme, elle est comprise entre 24 et 450 pg/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (pg/mL)'],
      [
        ['Homme', '250 - 990'],
        ['Femme', '24 - 450'],
      ],
      'Chez l\'homme, la dihydrotestostérone est normalement comprise entre 250 et 990 pg/mL. Chez la femme, elle est comprise entre 24 et 450 pg/mL.'
    ),
  },
  'amh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Tranche d\'âge', '2,5 pctl', 'Médiane', '97,5 pctl (ng/mL)'],
      [
        ['20 - 24 ans', '1,13', '3,94', '11,46'],
        ['25 - 29 ans', '0,77', '3,01', '9,75'],
        ['30 - 34 ans', '0,33', '2,74', '7,83'],
        ['35 - 39 ans', '0,13', '1,93', '6,65'],
        ['40 - 44 ans', '0,027', '0,85', '5,26'],
        ['45 - 50 ans', '0,02', '0,17', '2,82'],
      ],
      "Entre 20 et 24 ans, la médiane de l'AMH est de 3,94 ng/mL avec un intervalle (2,5e - 97,5e percentile) de 1,13 à 11,46 ng/mL. Entre 25 et 29 ans, la médiane est de 3,01 ng/mL (0,77 à 9,75). Entre 30 et 34 ans, la médiane est de 2,74 ng/mL (0,33 à 7,83). Entre 35 et 39 ans, la médiane est de 1,93 ng/mL (0,13 à 6,65). Entre 40 et 44 ans, la médiane est de 0,85 ng/mL (0,027 à 5,26). Entre 45 et 50 ans, la médiane est de 0,17 ng/mL (0,02 à 2,82)."
    ),
  },
  'hormone antimullerienne': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Les valeurs de référence de l\'hormone antimüllérienne varient selon l\'âge et le sexe.'),
    interpretationB: texte('Les valeurs de référence de l\'hormone antimüllérienne varient selon l\'âge et le sexe.'),
  },
  'hormone antimullerienne (amh)': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Tranche d\'âge (F)', 'AMH (ng/mL)'],
      [
        ['20 - 29 ans', '1,5 - 9,8'],
        ['30 - 39 ans', '0,4 - 6,8'],
        ['40 - 50 ans', '< 2,8'],
      ],
      "Chez la femme entre 20 et 29 ans, l'AMH est normalement comprise entre 1,5 et 9,8 ng/mL. Entre 30 et 39 ans, elle se situe entre 0,4 et 6,8 ng/mL. Entre 40 et 50 ans, elle est inférieure à 2,8 ng/mL."
    ),
  },
  'amh homme': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '1,3 - 14,8 ng/mL', valeurMachineB: '1,3 - 14,8 ng/mL',
    interpretationA: texte('Chez l\'homme, l\'AMH est normalement comprise entre 1,3 et 14,8 ng/mL.'),
    interpretationB: texte('Chez l\'homme, l\'AMH est normalement comprise entre 1,3 et 14,8 ng/mL.'),
  },
  '17 oh progesterone': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Phase / Sexe', '17-OHP (ng/mL)'],
      [
        ['Folliculaire (F)', '0,2 - 1,0'],
        ['Lutéale (F)', '1,0 - 4,5'],
        ['Ménopause (F)', '< 0,5'],
        ['Adulte (H)', '0,3 - 2,5'],
      ],
      "Chez la femme en phase folliculaire, la 17-OH progestérone est normalement comprise entre 0,2 et 1,0 ng/mL. En phase lutéale, elle se situe entre 1,0 et 4,5 ng/mL. Après la ménopause, elle est inférieure à 0,5 ng/mL. Chez l'homme adulte, elle est comprise entre 0,3 et 2,5 ng/mL."
    ),
  },
  '11 desoxycortisol': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 8 ng/mL', valeurMachineB: '< 8 ng/mL',
    interpretationA: texte('Le 11-désoxycortisol est normalement inférieur à 8 ng/mL.'),
    interpretationB: texte('Le 11-désoxycortisol est normalement inférieur à 8 ng/mL.'),
  },
  'tri test 1er trimestre 14-17,6sa': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Marqueurs sériques du 2e trimestre (AFP, hCG, uE3) avec calcul du risque de trisomie 21.'),
  },
  'tri test 1er trimestre 11-13,6sa': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Marqueurs sériques du 1er trimestre (PAPP-A, β-hCG libre) avec calcul du risque de trisomie 21.'),
  },
  'vitamine d 25-oh, d3': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (ng/mL)', 'Interprétation'],
      [
        ['< 10', 'Carence sévère'],
        ['10 - 20', 'Insuffisance'],
        ['20 - 30', 'Sub-optimal'],
        ['30 - 60', 'Optimal'],
        ['> 100', 'Risque d\'intoxication'],
      ],
      "Une 25-OH vitamine D inférieure à 10 ng/mL traduit une carence sévère. Entre 10 et 20 ng/mL, le résultat correspond à une insuffisance. Entre 20 et 30 ng/mL, le statut est considéré comme sub-optimal. Entre 30 et 60 ng/mL, le statut est optimal. Au-delà de 100 ng/mL, il existe un risque d'intoxication."
    ),
  },
  'vitamine d 1, 25- 2oh': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '20 - 65 pg/mL', valeurMachineB: '20 - 65 pg/mL',
    interpretationA: texte('La 1,25-dihydroxyvitamine D est normalement comprise entre 20 et 65 pg/mL.'),
    interpretationB: texte('La 1,25-dihydroxyvitamine D est normalement comprise entre 20 et 65 pg/mL.'),
  },
  'vitamine b12': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '200 - 900 pg/mL', valeurMachineB: '200 - 900 pg/mL',
    interpretationA: texte('La vitamine B12 sérique est normalement comprise entre 200 et 900 pg/mL.'),
    interpretationB: texte('La vitamine B12 sérique est normalement comprise entre 200 et 900 pg/mL.'),
  },
  'vitamine b9 (folates)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '3,1 - 17,5 ng/mL', valeurMachineB: '3,1 - 17,5 ng/mL',
    interpretationA: texte('Les folates sériques sont normalement compris entre 3,1 et 17,5 ng/mL.'),
    interpretationB: texte('Les folates sériques sont normalement compris entre 3,1 et 17,5 ng/mL.'),
  },
  'beta-hcg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['État / Semaine d\'aménorrhée', 'Norme (UI/L)'],
      [
        ['Femme non enceinte', '< 5'],
        ['Homme', '< 2'],
        ['3 SA', '5 - 50'],
        ['4 SA', '50 - 500'],
        ['5 SA', '500 - 10 000'],
        ['6 SA', '3 000 - 30 000'],
        ['7 - 8 SA', '15 000 - 200 000'],
        ['9 - 12 SA', '20 000 - 200 000'],
        ['2e trimestre', '5 000 - 50 000'],
        ['3e trimestre', '3 000 - 50 000'],
      ],
      'Chez la femme non enceinte, la β-HCG est inférieure à 5 UI/L et chez l\'homme inférieure à 2 UI/L. Au cours de la grossesse, le taux augmente rapidement : 5 à 50 UI/L à 3 SA, 50 à 500 UI/L à 4 SA, 500 à 10 000 UI/L à 5 SA, 3 000 à 30 000 UI/L à 6 SA, 15 000 à 200 000 UI/L entre 7 et 8 SA, puis se stabilise entre 5 000 et 50 000 UI/L au 2e trimestre et entre 3 000 et 50 000 UI/L au 3e trimestre.'
    ),
    interpretationB: mixte(
      ['État / Semaine d\'aménorrhée', 'Norme (UI/L)'],
      [
        ['Femme non enceinte', '< 5'],
        ['Homme', '< 2'],
        ['3 SA', '5 - 50'],
        ['4 SA', '50 - 500'],
        ['5 SA', '500 - 10 000'],
        ['6 SA', '3 000 - 30 000'],
        ['7 - 8 SA', '15 000 - 200 000'],
        ['9 - 12 SA', '20 000 - 200 000'],
        ['2e trimestre', '5 000 - 50 000'],
        ['3e trimestre', '3 000 - 50 000'],
      ],
      'Chez la femme non enceinte, la β-HCG est inférieure à 5 UI/L et chez l\'homme inférieure à 2 UI/L. Au cours de la grossesse, le taux augmente rapidement : 5 à 50 UI/L à 3 SA, 50 à 500 UI/L à 4 SA, 500 à 10 000 UI/L à 5 SA, 3 000 à 30 000 UI/L à 6 SA, 15 000 à 200 000 UI/L entre 7 et 8 SA, puis se stabilise entre 5 000 et 50 000 UI/L au 2e trimestre et entre 3 000 et 50 000 UI/L au 3e trimestre.'
    ),
  },
  'hcg total': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['État / Semaine d\'aménorrhée', 'Norme (UI/L)'],
      [
        ['Femme non enceinte', '< 5'],
        ['Homme', '< 2'],
        ['3 SA', '5 - 50'],
        ['4 SA', '50 - 500'],
        ['5 SA', '500 - 10 000'],
        ['6 SA', '3 000 - 30 000'],
        ['7 - 8 SA', '15 000 - 200 000'],
        ['9 - 12 SA', '20 000 - 200 000'],
        ['2e trimestre', '5 000 - 50 000'],
        ['3e trimestre', '3 000 - 50 000'],
      ],
      'Chez la femme non enceinte, l\'HCG totale est inférieure à 5 UI/L et chez l\'homme inférieure à 2 UI/L. Au cours de la grossesse, le taux augmente rapidement : 5 à 50 UI/L à 3 SA, 50 à 500 UI/L à 4 SA, 500 à 10 000 UI/L à 5 SA, 3 000 à 30 000 UI/L à 6 SA, 15 000 à 200 000 UI/L entre 7 et 8 SA, puis se stabilise entre 5 000 et 50 000 UI/L au 2e trimestre et entre 3 000 et 50 000 UI/L au 3e trimestre.'
    ),
    interpretationB: mixte(
      ['État / Semaine d\'aménorrhée', 'Norme (UI/L)'],
      [
        ['Femme non enceinte', '< 5'],
        ['Homme', '< 2'],
        ['3 SA', '5 - 50'],
        ['4 SA', '50 - 500'],
        ['5 SA', '500 - 10 000'],
        ['6 SA', '3 000 - 30 000'],
        ['7 - 8 SA', '15 000 - 200 000'],
        ['9 - 12 SA', '20 000 - 200 000'],
        ['2e trimestre', '5 000 - 50 000'],
        ['3e trimestre', '3 000 - 50 000'],
      ],
      'Chez la femme non enceinte, l\'HCG totale est inférieure à 5 UI/L et chez l\'homme inférieure à 2 UI/L. Au cours de la grossesse, le taux augmente rapidement : 5 à 50 UI/L à 3 SA, 50 à 500 UI/L à 4 SA, 500 à 10 000 UI/L à 5 SA, 3 000 à 30 000 UI/L à 6 SA, 15 000 à 200 000 UI/L entre 7 et 8 SA, puis se stabilise entre 5 000 et 50 000 UI/L au 2e trimestre et entre 3 000 et 50 000 UI/L au 3e trimestre.'
    ),
  },
  'calcitonine': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (pg/mL)'],
      [
        ['Homme', '< 11,5'],
        ['Femme', '< 4,6'],
      ],
      'Chez l\'homme, la calcitonine est normalement inférieure à 11,5 pg/mL. Chez la femme, elle est inférieure à 4,6 pg/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (pg/mL)'],
      [
        ['Homme', '< 11,5'],
        ['Femme', '< 4,6'],
      ],
      'Chez l\'homme, la calcitonine est normalement inférieure à 11,5 pg/mL. Chez la femme, elle est inférieure à 4,6 pg/mL.'
    ),
  },
  'catecholamines': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur normale (pg/mL)'],
      [
        ['Adrénaline', '< 100'],
        ['Noradrénaline', '100 - 600'],
        ['Dopamine', '< 100'],
      ],
      "La valeur normale de l'adrénaline plasmatique est inférieure à 100 pg/mL. La noradrénaline plasmatique est normalement comprise entre 100 et 600 pg/mL. La dopamine plasmatique est normalement inférieure à 100 pg/mL."
    ),
  },
  'aldosterone': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Position', 'Aldostérone (pg/mL)'],
      [
        ['Couché', '30 - 160'],
        ['Debout', '70 - 350'],
      ],
      "En position couchée, l'aldostéronémie normale est comprise entre 30 et 160 pg/mL. En position debout, elle se situe entre 70 et 350 pg/mL."
    ),
  },
  'adh': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '1 - 5 pg/mL', valeurMachineB: '1 - 5 pg/mL',
    interpretationA: texte('L\'hormone antidiurétique plasmatique est normalement comprise entre 1 et 5 pg/mL.'),
    interpretationB: texte('L\'hormone antidiurétique plasmatique est normalement comprise entre 1 et 5 pg/mL.'),
  },
  'adh u': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '5 - 50 pg/24h', valeurMachineB: '5 - 50 pg/24h',
    interpretationA: texte('L\'excrétion urinaire d\'ADH des 24 heures est normalement comprise entre 5 et 50 pg/24h.'),
    interpretationB: texte('L\'excrétion urinaire d\'ADH des 24 heures est normalement comprise entre 5 et 50 pg/24h.'),
  },
  'aldosterone u': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '2 - 26 ug/24h', valeurMachineB: '2 - 26 ug/24h',
    interpretationA: texte('L\'excrétion urinaire d\'aldostérone des 24 heures est normalement comprise entre 2 et 26 µg/24h.'),
    interpretationB: texte('L\'excrétion urinaire d\'aldostérone des 24 heures est normalement comprise entre 2 et 26 µg/24h.'),
  },
  'renine plasmatique': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Position', 'Rénine (pg/mL)'],
      [
        ['Couché', '2,8 - 39,9'],
        ['Debout', '4,4 - 46,1'],
      ],
      "En position couchée, la rénine plasmatique normale est comprise entre 2,8 et 39,9 pg/mL. En position debout, elle se situe entre 4,4 et 46,1 pg/mL."
    ),
  },
  'rapport aldosterone/renine': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 23 (ng/dL)/(ng/mL/h)', valeurMachineB: '< 23 (ng/dL)/(ng/mL/h)',
    interpretationA: texte('Un rapport aldostérone/rénine inférieur à 23 (ng/dL)/(ng/mL/h) est considéré comme normal.'),
    interpretationB: texte('Un rapport aldostérone/rénine inférieur à 23 (ng/dL)/(ng/mL/h) est considéré comme normal.'),
  },
  'acth': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '7,2 - 63,3 pg/mL (8h)', valeurMachineB: '7,2 - 63,3 pg/mL (8h)',
    interpretationA: texte('Le taux d\'ACTH plasmatique à 8h est normalement compris entre 7,2 et 63,3 pg/mL.'),
    interpretationB: texte('Le taux d\'ACTH plasmatique à 8h est normalement compris entre 7,2 et 63,3 pg/mL.'),
  },
  'cortisol': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Horaire', 'Cortisol (ug/dL)'],
      [
        ['8h', '5 - 25'],
        ['16h', '3 - 16'],
        ['Minuit', '< 5'],
      ],
      "À 8h du matin, la cortisolémie normale est comprise entre 5 et 25 µg/dL. À 16h, elle se situe entre 3 et 16 µg/dL. À minuit, elle est normalement inférieure à 5 µg/dL."
    ),
  },
  'cortisol urinaire': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '10 - 100 ug/24h', valeurMachineB: '10 - 100 ug/24h',
    interpretationA: texte('L\'excrétion urinaire de cortisol libre des 24 heures est normalement comprise entre 10 et 100 µg/24h.'),
    interpretationB: texte('L\'excrétion urinaire de cortisol libre des 24 heures est normalement comprise entre 10 et 100 µg/24h.'),
  },
  'hormone de croissance gh': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '< 3'],
        ['Femme', '< 8'],
      ],
      'Chez l\'homme, l\'hormone de croissance basale est normalement inférieure à 3 ng/mL. Chez la femme, elle est inférieure à 8 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '< 3'],
        ['Femme', '< 8'],
      ],
      'Chez l\'homme, l\'hormone de croissance basale est normalement inférieure à 3 ng/mL. Chez la femme, elle est inférieure à 8 ng/mL.'
    ),
  },
  'igf1': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Tranche d\'âge', 'IGF1 (ng/mL)'],
      [
        ['20 - 30 ans', '100 - 500'],
        ['30 - 50 ans', '90 - 350'],
        ['50 - 70 ans', '75 - 250'],
        ['> 70 ans', '50 - 200'],
      ],
      "Entre 20 et 30 ans, l'IGF-1 est normalement comprise entre 100 et 500 ng/mL. Entre 30 et 50 ans, elle se situe entre 90 et 350 ng/mL. Entre 50 et 70 ans, elle est comprise entre 75 et 250 ng/mL. Au-delà de 70 ans, elle est comprise entre 50 et 200 ng/mL."
    ),
  },
  'insuline libre': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '2,6 - 24,9 uUI/mL (à jeun)', valeurMachineB: '2,6 - 24,9 uUI/mL (à jeun)',
    interpretationA: texte('L\'insuline libre à jeun est normalement comprise entre 2,6 et 24,9 µUI/mL.'),
    interpretationB: texte('L\'insuline libre à jeun est normalement comprise entre 2,6 et 24,9 µUI/mL.'),
  },
  'insuline totale': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '2,6 - 24,9 uUI/mL (à jeun)', valeurMachineB: '2,6 - 24,9 uUI/mL (à jeun)',
    interpretationA: texte('L\'insuline totale à jeun est normalement comprise entre 2,6 et 24,9 µUI/mL.'),
    interpretationB: texte('L\'insuline totale à jeun est normalement comprise entre 2,6 et 24,9 µUI/mL.'),
  },
  'homa': {
    machineA: 'Calcul', machineB: 'Calcul',
    valeurMachineA: '< 2,5 (normal)', valeurMachineB: '< 2,5 (normal)',
    interpretationA: texte('Un index HOMA inférieur à 2,5 est considéré comme normal.'),
    interpretationB: texte('Un index HOMA inférieur à 2,5 est considéré comme normal.'),
  },
  'androstenedione delta4': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '0,4 - 3,1'],
        ['Femme', '0,3 - 3,5'],
      ],
      'Chez l\'homme, l\'androstènedione delta-4 est normalement comprise entre 0,4 et 3,1 ng/mL. Chez la femme, elle est comprise entre 0,3 et 3,5 ng/mL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (ng/mL)'],
      [
        ['Homme', '0,4 - 3,1'],
        ['Femme', '0,3 - 3,5'],
      ],
      'Chez l\'homme, l\'androstènedione delta-4 est normalement comprise entre 0,4 et 3,1 ng/mL. Chez la femme, elle est comprise entre 0,3 et 3,5 ng/mL.'
    ),
  },
  'dehydroepiandrostenedione': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '1,3 - 9,8 ng/mL', valeurMachineB: '1,3 - 9,8 ng/mL',
    interpretationA: texte('La déhydroépiandrostérone est normalement comprise entre 1,3 et 9,8 ng/mL.'),
    interpretationB: texte('La déhydroépiandrostérone est normalement comprise entre 1,3 et 9,8 ng/mL.'),
  },
  'sulfate dehydroepiandrosterone (sdhea)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (µg/dL)'],
      [
        ['Homme', '80 - 560'],
        ['Femme', '35 - 430'],
      ],
      'Chez l\'homme, le sulfate de déhydroépiandrostérone (SDHEA) est normalement compris entre 80 et 560 µg/dL. Chez la femme, il est compris entre 35 et 430 µg/dL.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (µg/dL)'],
      [
        ['Homme', '80 - 560'],
        ['Femme', '35 - 430'],
      ],
      'Chez l\'homme, le sulfate de déhydroépiandrostérone (SDHEA) est normalement compris entre 80 et 560 µg/dL. Chez la femme, il est compris entre 35 et 430 µg/dL.'
    ),
  },
  'inhibine b': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe / Phase', 'Norme (pg/mL)'],
      [
        ['Homme adulte', '< 273'],
        ['Femme phase folliculaire', '< 90'],
        ['Femme phase lutéale', '< 60'],
        ['Femme ménopausée', '< 10'],
      ],
      'Chez l\'homme adulte, l\'inhibine B est inférieure à 273 pg/mL. Chez la femme en phase folliculaire, elle est inférieure à 90 pg/mL ; en phase lutéale, inférieure à 60 pg/mL ; après la ménopause, inférieure à 10 pg/mL.'
    ),
    interpretationB: mixte(
      ['Sexe / Phase', 'Norme (pg/mL)'],
      [
        ['Homme adulte', '< 273'],
        ['Femme phase folliculaire', '< 90'],
        ['Femme phase lutéale', '< 60'],
        ['Femme ménopausée', '< 10'],
      ],
      'Chez l\'homme adulte, l\'inhibine B est inférieure à 273 pg/mL. Chez la femme en phase folliculaire, elle est inférieure à 90 pg/mL ; en phase lutéale, inférieure à 60 pg/mL ; après la ménopause, inférieure à 10 pg/mL.'
    ),
  },
  'testosterone estradiol binding globulin (tebg)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe', 'Norme (nmol/L)'],
      [
        ['Homme', '18 - 54'],
        ['Femme', '32 - 128'],
      ],
      'Chez l\'homme, la TeBG est normalement comprise entre 18 et 54 nmol/L. Chez la femme, elle est comprise entre 32 et 128 nmol/L.'
    ),
    interpretationB: mixte(
      ['Sexe', 'Norme (nmol/L)'],
      [
        ['Homme', '18 - 54'],
        ['Femme', '32 - 128'],
      ],
      'Chez l\'homme, la TeBG est normalement comprise entre 18 et 54 nmol/L. Chez la femme, elle est comprise entre 32 et 128 nmol/L.'
    ),
  },
  'ige totales': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 100 UI/mL', valeurMachineB: '< 100 UI/mL',
    interpretationA: texte('Un taux d\'IgE totales inférieur à 100 UI/mL est considéré comme normal chez l\'adulte.'),
    interpretationB: texte('Un taux d\'IgE totales inférieur à 100 UI/mL est considéré comme normal chez l\'adulte.'),
  },
  'ige specifiques (pneumallergenes)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Classe', 'IgE (kUA/L)', 'Interprétation'],
      [
        ['0', '< 0,35', 'Négatif'],
        ['1', '0,35 - 0,7', 'Faible'],
        ['2', '0,7 - 3,5', 'Modéré'],
        ['3', '3,5 - 17,5', 'Élevé'],
        ['4', '17,5 - 50', 'Très élevé'],
        ['5-6', '> 50', 'Extrêmement élevé'],
      ],
      "Un taux d'IgE inférieur à 0,35 kUA/L (classe 0) est négatif. Entre 0,35 et 0,7 kUA/L (classe 1), la sensibilisation est faible. Entre 0,7 et 3,5 kUA/L (classe 2), elle est modérée. Entre 3,5 et 17,5 kUA/L (classe 3), elle est élevée. Entre 17,5 et 50 kUA/L (classe 4), elle est très élevée. Au-delà de 50 kUA/L (classes 5-6), elle est extrêmement élevée."
    ),
  },
  'ige specifiques (trophallergenes )': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Classe', 'IgE (kUA/L)', 'Interprétation'],
      [
        ['0', '< 0,35', 'Négatif'],
        ['1', '0,35 - 0,7', 'Faible'],
        ['2', '0,7 - 3,5', 'Modéré'],
        ['3', '3,5 - 17,5', 'Élevé'],
        ['4', '17,5 - 50', 'Très élevé'],
        ['5-6', '> 50', 'Extrêmement élevé'],
      ],
      "Un taux d'IgE inférieur à 0,35 kUA/L (classe 0) est négatif. Entre 0,35 et 0,7 kUA/L (classe 1), la sensibilisation est faible. Entre 0,7 et 3,5 kUA/L (classe 2), elle est modérée. Entre 3,5 et 17,5 kUA/L (classe 3), elle est élevée. Entre 17,5 et 50 kUA/L (classe 4), elle est très élevée. Au-delà de 50 kUA/L (classes 5-6), elle est extrêmement élevée."
    ),
  },
  'cla30 pneumallergenes': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de sensibilisation aux pneumallergènes testés du panel CLA30.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de sensibilisation aux pneumallergènes testés du panel CLA30.'),
  },
  'cla 30 trophallergenes': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de sensibilisation aux trophallergènes testés du panel CLA30.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de sensibilisation aux trophallergènes testés du panel CLA30.'),
  },
  'phadiatop ig e': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: 'Négatif : < 0,35 kUA/L', valeurMachineB: 'Négatif : < 0,35 kUA/L',
    interpretationA: texte('Un Phadiatop inférieur à 0,35 kUA/L est considéré comme négatif et traduit l\'absence de sensibilisation aux pneumallergènes courants.'),
    interpretationB: texte('Un Phadiatop inférieur à 0,35 kUA/L est considéré comme négatif et traduit l\'absence de sensibilisation aux pneumallergènes courants.'),
  },
  'trophatop ig e': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: 'Négatif : < 0,35 kUA/L', valeurMachineB: 'Négatif : < 0,35 kUA/L',
    interpretationA: texte('Un Trophatop inférieur à 0,35 kUA/L est considéré comme négatif et traduit l\'absence de sensibilisation aux trophallergènes courants.'),
    interpretationB: texte('Un Trophatop inférieur à 0,35 kUA/L est considéré comme négatif et traduit l\'absence de sensibilisation aux trophallergènes courants.'),
  },
  'ig g 4 specifiques': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '0,03 - 2,01 g/L', valeurMachineB: '0,03 - 2,01 g/L',
    interpretationA: texte('Les IgG4 spécifiques sont normalement comprises entre 0,03 et 2,01 g/L.'),
    interpretationB: texte('Les IgG4 spécifiques sont normalement comprises entre 0,03 et 2,01 g/L.'),
  },

  // =====================================================================
  // MARQUEURS TUMORAUX
  // =====================================================================
  'psa total': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 4,0 ng/mL', valeurMachineB: '< 4,0 ng/mL',
    interpretationA: texte('Un PSA total inférieur à 4,0 ng/mL est considéré comme normal.'),
    interpretationB: texte('Un PSA total inférieur à 4,0 ng/mL est considéré comme normal.'),
  },
  'psa libre': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Le PSA libre est interprété en rapport avec le PSA total (rapport PSA libre/total).'),
    interpretationB: texte('Le PSA libre est interprété en rapport avec le PSA total (rapport PSA libre/total).'),
  },
  'rapport psa libre psa total': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '> 15 %', valeurMachineB: '> 15 %',
    interpretationA: texte('Un rapport PSA libre/PSA total supérieur à 15 % est considéré comme normal.'),
    interpretationB: texte('Un rapport PSA libre/PSA total supérieur à 15 % est considéré comme normal.'),
  },
  'afp': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 7,25 UI/mL', valeurMachineB: '< 7,25 UI/mL',
    interpretationA: texte('Une alpha-fœto-protéine inférieure à 7,25 UI/mL est considérée comme normale.'),
    interpretationB: texte('Une alpha-fœto-protéine inférieure à 7,25 UI/mL est considérée comme normale.'),
  },
  'alpha foeto protein': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 7,25 UI/mL', valeurMachineB: '< 7,25 UI/mL',
    interpretationA: texte('Une alpha-fœto-protéine inférieure à 7,25 UI/mL est considérée comme normale.'),
    interpretationB: texte('Une alpha-fœto-protéine inférieure à 7,25 UI/mL est considérée comme normale.'),
  },
  'ace': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 5 ng/mL (non-fumeur)', valeurMachineB: '< 5 ng/mL (non-fumeur)',
    interpretationA: texte('Un antigène carcino-embryonnaire inférieur à 5 ng/mL chez le non-fumeur est considéré comme normal.'),
    interpretationB: texte('Un antigène carcino-embryonnaire inférieur à 5 ng/mL chez le non-fumeur est considéré comme normal.'),
  },
  'ca 125': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 35 UI/mL', valeurMachineB: '< 35 UI/mL',
    interpretationA: texte('Un CA 125 inférieur à 35 UI/mL est considéré comme normal.'),
    interpretationB: texte('Un CA 125 inférieur à 35 UI/mL est considéré comme normal.'),
  },
  'ca 15 3': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 30 UI/mL', valeurMachineB: '< 30 UI/mL',
    interpretationA: texte('Un CA 15-3 inférieur à 30 UI/mL est considéré comme normal.'),
    interpretationB: texte('Un CA 15-3 inférieur à 30 UI/mL est considéré comme normal.'),
  },
  'ca 19 9': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 37 UI/mL', valeurMachineB: '< 37 UI/mL',
    interpretationA: texte('Un CA 19-9 inférieur à 37 UI/mL est considéré comme normal.'),
    interpretationB: texte('Un CA 19-9 inférieur à 37 UI/mL est considéré comme normal.'),
  },

  // =====================================================================
  // SEROLOGIE INFECTIEUSE (Minividas / Maglumi)
  // =====================================================================
  'bw': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un BW négatif traduit l\'absence d\'anticorps anti-Treponema pallidum détectés.'),
    interpretationB: texte('Un BW négatif traduit l\'absence d\'anticorps anti-Treponema pallidum détectés.'),
  },
  'hiv': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VIH détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VIH détectés.'),
  },
  'hbs ag': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif : < 1,0 index/mL', valeurMachineB: 'Négatif : < 1,0 index/mL',
    interpretationA: texte('Un antigène HBs inférieur à 1,0 index/mL est considéré comme négatif et traduit l\'absence d\'infection active par le VHB.'),
    interpretationB: texte('Un antigène HBs inférieur à 1,0 index/mL est considéré comme négatif et traduit l\'absence d\'infection active par le VHB.'),
  },
  'antigene hbs': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif : < 1,0 index/mL', valeurMachineB: 'Négatif : < 1,0 index/mL',
    interpretationA: texte('Un antigène HBs inférieur à 1,0 index/mL est considéré comme négatif et traduit l\'absence d\'infection active par le VHB.'),
    interpretationB: texte('Un antigène HBs inférieur à 1,0 index/mL est considéré comme négatif et traduit l\'absence d\'infection active par le VHB.'),
  },
  'hcv': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHC.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHC.'),
  },
  'toxoplasmose igg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (UI/mL)', 'Interprétation'],
      [
        ['< 4', 'Négatif - Absence d\'immunité'],
        ['4 - 7', 'Douteux - Contrôler à 3 semaines'],
        ['≥ 7', 'Positif - Immunisé'],
      ],
      "Un taux d'IgG anti-Toxoplasma inférieur à 4 UI/mL est négatif et traduit l'absence d'immunité. Un résultat compris entre 4 et 7 UI/mL est douteux et impose un contrôle à 3 semaines. Un taux supérieur ou égal à 7 UI/mL est positif et signe une immunisation."
    ),
    interpretationB: mixte(
      ['Seuil (UI/mL)', 'Interprétation'],
      [
        ['< 4', 'Négatif - Absence d\'immunité'],
        ['4 - 7', 'Douteux - Contrôler à 3 semaines'],
        ['≥ 7', 'Positif - Immunisé'],
      ],
      "Un taux d'IgG anti-Toxoplasma inférieur à 4 UI/mL est négatif et traduit l'absence d'immunité. Un résultat compris entre 4 et 7 UI/mL est douteux et impose un contrôle à 3 semaines. Un taux supérieur ou égal à 7 UI/mL est positif et signe une immunisation."
    ),
  },
  'toxoplasmose igm': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (UI/mL)', 'Interprétation'],
      [
        ['< 0,55', 'Négatif - Pas d\'infection récente'],
        ['0,55 - 0,65', 'Douteux'],
        ['> 0,65', 'Positif - Infection récente probable'],
      ],
      "Un taux d'IgM anti-Toxoplasma inférieur à 0,55 UI/mL est négatif et traduit l'absence d'infection récente. Un résultat compris entre 0,55 et 0,65 UI/mL est douteux. Un taux supérieur à 0,65 UI/mL est positif et évoque une infection récente probable."
    ),
    interpretationB: mixte(
      ['Seuil (AU/mL)', 'Interprétation'],
      [
        ['< 2', 'Négatif'],
        ['2 - 2,6', 'Douteux'],
        ['≥ 2,6', 'Positif'],
      ],
      "Un taux d'IgM anti-Toxoplasma inférieur à 2 AU/mL est négatif. Un résultat compris entre 2 et 2,6 AU/mL est douteux. Un taux supérieur ou égal à 2,6 AU/mL est positif."
    ),
  },
  'rubeole igg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '≥ 10 UI/mL : Immunisé', valeurMachineB: '≥ 10 UI/mL : Immunisé',
    interpretationA: texte('Un taux d\'IgG anti-rubéole supérieur ou égal à 10 UI/mL signe une immunisation.'),
    interpretationB: texte('Un taux d\'IgG anti-rubéole supérieur ou égal à 10 UI/mL signe une immunisation.'),
  },
  'rubeole igm': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'IgM anti-rubéole, écartant une infection récente.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'IgM anti-rubéole, écartant une infection récente.'),
  },
  'cytomegalovirus (igm)': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (UA/mL)', 'Interprétation'],
      [
        ['< 0,7', 'Négatif'],
        ['0,7 - 1,0', 'Douteux'],
        ['≥ 1,0', 'Positif - Infection récente probable'],
      ],
      "Un taux d'IgM anti-CMV inférieur à 0,7 UA/mL est négatif. Un résultat compris entre 0,7 et 1,0 UA/mL est douteux. Un taux supérieur ou égal à 1,0 UA/mL est positif et évoque une infection récente probable."
    ),
  },
  'cytomegalovirus (igg)': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (UA/mL)', 'Interprétation'],
      [
        ['< 4', 'Négatif - Non immunisé'],
        ['4 - 6', 'Douteux'],
        ['> 6', 'Positif - Immunisé'],
      ],
      "Un taux d'IgG anti-CMV inférieur à 4 UA/mL est négatif et traduit l'absence d'immunisation. Un résultat compris entre 4 et 6 UA/mL est douteux. Un taux supérieur à 6 UA/mL est positif et signe une immunisation."
    ),
  },
  'anticorps anti hav igm': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'IgM anti-VHA, écartant une infection récente par le virus de l\'hépatite A.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'IgM anti-VHA, écartant une infection récente par le virus de l\'hépatite A.'),
  },
  'anticorps anti hav totaux': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps totaux anti-VHA, c\'est-à-dire l\'absence d\'immunité.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps totaux anti-VHA, c\'est-à-dire l\'absence d\'immunité.'),
  },
  'anticorps anti hav igg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'IgG anti-VHA, c\'est-à-dire l\'absence d\'immunité contre le virus de l\'hépatite A.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'IgG anti-VHA, c\'est-à-dire l\'absence d\'immunité contre le virus de l\'hépatite A.'),
  },
  'anticorps anti hbs': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (UI/L)', 'Interprétation'],
      [
        ['< 10', 'Non protégé'],
        ['10 - 100', 'Protection faible'],
        ['> 100', 'Protection efficace'],
      ],
      "Un taux d'anticorps anti-HBs inférieur à 10 UI/L traduit l'absence de protection. Entre 10 et 100 UI/L, la protection est considérée comme faible. Au-delà de 100 UI/L, la protection est efficace."
    ),
  },
  'anticorps anti hbc igm': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'IgM anti-HBc, écartant une infection aiguë récente par le VHB.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'IgM anti-HBc, écartant une infection aiguë récente par le VHB.'),
  },
  'anticorps anti hbc igg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'IgG anti-HBc, sans contact antérieur avec le VHB.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'IgG anti-HBc, sans contact antérieur avec le VHB.'),
  },
  'anticorps anti hbc totaux': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HBc totaux, sans contact antérieur avec le VHB.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HBc totaux, sans contact antérieur avec le VHB.'),
  },
  'antigene hbe': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de l\'antigène HBe, en faveur d\'une faible réplication virale.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de l\'antigène HBe, en faveur d\'une faible réplication virale.'),
  },
  'anticorps anti hbe': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HBe.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HBe.'),
  },
  'anticorps anti-hepatite delta': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHD, écartant une co-infection ou surinfection delta.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHD, écartant une co-infection ou surinfection delta.'),
  },
  'anticorps anti-hepatite e': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHE.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHE.'),
  },
  'hepatite c arn viral': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: '< 15 UI/mL : Indétectable', valeurMachineB: '< 15 UI/mL : Indétectable',
    interpretationA: texte('Une charge virale VHC inférieure à 15 UI/mL est considérée comme indétectable.'),
    interpretationB: texte('Une charge virale VHC inférieure à 15 UI/mL est considérée comme indétectable.'),
  },
  'hepatite c genotypage': {
    machineA: 'PCR + séquençage', machineB: 'PCR + séquençage',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Identification du génotype VHC (1a, 1b, 2, 3, 4, 5, 6) par séquençage.'),
  },
  'hepatite delta (arn viral - recherche et quantification)': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: 'Indétectable', valeurMachineB: 'Indétectable',
    interpretationA: texte('Une charge virale ARN-VHD indétectable traduit l\'absence de réplication virale détectable.'),
    interpretationB: texte('Une charge virale ARN-VHD indétectable traduit l\'absence de réplication virale détectable.'),
  },
  'hepatite e (arn viral - recherche et quantification)': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: 'Indétectable', valeurMachineB: 'Indétectable',
    interpretationA: texte('Une charge virale ARN-VHE indétectable traduit l\'absence de réplication virale détectable.'),
    interpretationB: texte('Une charge virale ARN-VHE indétectable traduit l\'absence de réplication virale détectable.'),
  },
  'charge virale hepatite b (adnvhb)': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: '< 20 UI/mL : Indétectable', valeurMachineB: '< 20 UI/mL : Indétectable',
    interpretationA: texte('Une charge virale ADN-VHB inférieure à 20 UI/mL est considérée comme indétectable.'),
    interpretationB: texte('Une charge virale ADN-VHB inférieure à 20 UI/mL est considérée comme indétectable.'),
  },
  'recherche de mycoplasmes (pcr)': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de génome de mycoplasme détecté par PCR.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de génome de mycoplasme détecté par PCR.'),
  },
  'recherche de neisseria gonorrhoeae (pcr)': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de génome de Neisseria gonorrhoeae détecté par PCR.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de génome de Neisseria gonorrhoeae détecté par PCR.'),
  },
  'recherche de chlamydia trachomatis (pcr)': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de génome de Chlamydia trachomatis détecté par PCR.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de génome de Chlamydia trachomatis détecté par PCR.'),
  },
  'recherche de chlamydia': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de Chlamydia détectée.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de Chlamydia détectée.'),
  },
  'hpv papilloma virus genitaux': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'ADN de papillomavirus humain détecté par PCR.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'ADN de papillomavirus humain détecté par PCR.'),
  },
  'hsv1/2': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HSV 1/2 détectables.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HSV 1/2 détectables.'),
  },
  'htlv 1/2': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HTLV 1/2 détectables.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-HTLV 1/2 détectables.'),
  },
  'parvovirus b19 pcr': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'ADN de parvovirus B19 détecté par PCR.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'ADN de parvovirus B19 détecté par PCR.'),
  },
  'rougeole ig g et ig m specifiques': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Anticorps', 'Interprétation'],
      [
        ['IgM positif', 'Infection récente'],
        ['IgG positif', 'Immunité acquise'],
        ['Tous deux négatifs', 'Non immunisé'],
      ],
      "Une positivité des IgM rougeole traduit une infection récente. Une positivité des IgG signe une immunité acquise. Lorsque les IgM et les IgG sont tous deux négatifs, le sujet est considéré comme non immunisé."
    ),
  },
  'oreillon ig g et ig m specifiques': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Anticorps', 'Interprétation'],
      [
        ['IgM positif', 'Infection récente'],
        ['IgG positif', 'Immunité acquise'],
        ['Tous deux négatifs', 'Non immunisé'],
      ],
      "Une positivité des IgM ourliennes traduit une infection récente. Une positivité des IgG signe une immunité acquise. Lorsque les IgM et les IgG sont tous deux négatifs, le sujet est considéré comme non immunisé."
    ),
  },
  'rubeole avidite des igg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Indice avidité', 'Interprétation'],
      [
        ['< 30 %', 'Faible - Infection récente (< 3 mois)'],
        ['30 - 60 %', 'Intermédiaire - À recontrôler'],
        ['> 60 %', 'Forte - Infection ancienne'],
      ],
      "Un indice d'avidité inférieur à 30 % est considéré comme faible et évoque une infection récente datant de moins de 3 mois. Entre 30 et 60 %, l'avidité est intermédiaire et le résultat doit être recontrôlé. Au-delà de 60 %, l'avidité est forte et traduit une infection ancienne."
    ),
  },
  'mni test': {
    machineA: 'Test rapide', machineB: 'Test rapide',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un MNI-test négatif traduit l\'absence d\'anticorps hétérophiles évoquant une mononucléose infectieuse.'),
    interpretationB: texte('Un MNI-test négatif traduit l\'absence d\'anticorps hétérophiles évoquant une mononucléose infectieuse.'),
  },
  'rpr': {
    machineA: 'Test rapide', machineB: 'Test rapide',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un RPR négatif traduit l\'absence d\'anticorps réaginiques évoquant une syphilis active.'),
    interpretationB: texte('Un RPR négatif traduit l\'absence d\'anticorps réaginiques évoquant une syphilis active.'),
  },
  'serologie bilharziose': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Schistosoma détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Schistosoma détectés.'),
  },
  'serologie amibiase': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif : < 1/100', valeurMachineB: 'Négatif : < 1/100',
    interpretationA: texte('Un titre d\'anticorps anti-Entamoeba histolytica inférieur à 1/100 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps anti-Entamoeba histolytica inférieur à 1/100 est considéré comme négatif.'),
  },
  'serologie aspergillaire': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Aspergillus détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Aspergillus détectés.'),
  },
  'serologie hydatidose': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif : < 1/160', valeurMachineB: 'Négatif : < 1/160',
    interpretationA: texte('Un titre d\'anticorps anti-Echinococcus inférieur à 1/160 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps anti-Echinococcus inférieur à 1/160 est considéré comme négatif.'),
  },
  'serologie widal (widal et felix)': {
    machineA: 'Agglutination', machineB: 'Agglutination',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Antigène', 'Seuil significatif'],
      [
        ['TO (S. typhi O)', '≥ 1/100'],
        ['TH (S. typhi H)', '≥ 1/200'],
        ['AH, BH, CH', '≥ 1/200'],
      ],
      "Un titre d'agglutinines anti-TO (Salmonella typhi O) supérieur ou égal à 1/100 est considéré comme significatif. Pour l'antigène TH (Salmonella typhi H), le seuil significatif est supérieur ou égal à 1/200. Pour les antigènes AH, BH et CH (Salmonella paratyphi), le seuil significatif est également supérieur ou égal à 1/200."
    ),
  },
  'serologie chamydiae': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Chlamydia détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Chlamydia détectés.'),
  },
  'serologie mycoplasmes ( m.hominis +urealyticum)': {
    machineA: 'Culture sélective', machineB: 'Culture sélective',
    valeurMachineA: 'Négatif (< 10^4 UCC/mL)', valeurMachineB: 'Négatif (< 10^4 UCC/mL)',
    interpretationA: texte('Un résultat négatif correspond à une culture inférieure à 10^4 UCC/mL, sans portage significatif de M. hominis et U. urealyticum.'),
    interpretationB: texte('Un résultat négatif correspond à une culture inférieure à 10^4 UCC/mL, sans portage significatif de M. hominis et U. urealyticum.'),
  },
  'serologie cryptococcique': {
    machineA: 'Latex agglutination', machineB: 'Latex agglutination',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'antigène cryptococcique détecté.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'antigène cryptococcique détecté.'),
  },
  'quantiferon': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Résultat', 'Interprétation'],
      [
        ['< 0,35 UI/mL', 'Négatif - Pas d\'infection tuberculeuse'],
        ['≥ 0,35 UI/mL', 'Positif - Infection tuberculeuse présente'],
        ['Indéterminé', 'À recontrôler'],
      ],
      "Une valeur de QuantiFERON inférieure à 0,35 UI/mL est négative et traduit l'absence d'infection tuberculeuse. Une valeur supérieure ou égale à 0,35 UI/mL est positive et traduit la présence d'une infection tuberculeuse. Un résultat indéterminé impose un recontrôle."
    ),
  },
  'antigene helicobacter pylori (selles)': {
    machineA: 'Test rapide', machineB: 'Test rapide',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'antigène d\'Helicobacter pylori détecté dans les selles.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'antigène d\'Helicobacter pylori détecté dans les selles.'),
  },
  'anticorps anti helicobacter pylori': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Helicobacter pylori détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Helicobacter pylori détectés.'),
  },
  'recherche rotavirus (selles)': {
    machineA: 'Test rapide', machineB: 'Test rapide',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'antigène de rotavirus détecté dans les selles.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'antigène de rotavirus détecté dans les selles.'),
  },
  'recherche de sang occulte/hemoccult (selles)': {
    machineA: 'Test rapide', machineB: 'Test rapide',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de sang occulte détecté dans les selles.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de sang occulte détecté dans les selles.'),
  },

  // =====================================================================
  // AUTO-IMMUNITE (Immunoblot Euroimmun)
  // =====================================================================
  'anticorps anti nucleaires': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/80', valeurMachineB: 'Négatif : < 1/80',
    interpretationA: texte('Un titre d\'anticorps antinucléaires inférieur à 1/80 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps antinucléaires inférieur à 1/80 est considéré comme négatif.'),
  },
  'ana': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/80', valeurMachineB: 'Négatif : < 1/80',
    interpretationA: texte('Un titre d\'ANA inférieur à 1/80 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'ANA inférieur à 1/80 est considéré comme négatif.'),
  },
  'anti ccp': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 17 U/mL', valeurMachineB: '< 17 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-CCP inférieur à 17 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-CCP inférieur à 17 U/mL est considéré comme négatif.'),
  },
  'facteur rhumatoide': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 14 UI/mL', valeurMachineB: '< 14 UI/mL',
    interpretationA: texte('Un facteur rhumatoïde inférieur à 14 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un facteur rhumatoïde inférieur à 14 UI/mL est considéré comme négatif.'),
  },
  'anti dna': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 30 UI/mL', valeurMachineB: '< 30 UI/mL',
    interpretationA: texte('Un taux d\'anticorps anti-DNA inférieur à 30 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-DNA inférieur à 30 UI/mL est considéré comme négatif.'),
  },
  'anticorps anti membrane basale epidermidique': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-membrane basale épidermique détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-membrane basale épidermique détectés.'),
  },
  'anticorps anti mitochondrie': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/80', valeurMachineB: 'Négatif : < 1/80',
    interpretationA: texte('Un titre d\'anticorps anti-mitochondrie inférieur à 1/80 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps anti-mitochondrie inférieur à 1/80 est considéré comme négatif.'),
  },
  'anticorps anti cytoplasme polynucleaires neutrophiles': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Type ANCA', 'Cible', 'Valeur normale'],
      [
        ['c-ANCA', 'PR3', '< 5 U/mL'],
        ['p-ANCA', 'MPO', '< 5 U/mL'],
      ],
      "La valeur normale des c-ANCA, dirigés contre la PR3, est inférieure à 5 U/mL. La valeur normale des p-ANCA, dirigés contre la MPO, est également inférieure à 5 U/mL."
    ),
  },
  'pr3 mpo': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Cible', 'Valeur normale (U/mL)'],
      [
        ['PR3', '< 5'],
        ['MPO', '< 5'],
      ],
      "La valeur normale des anticorps anti-PR3 est inférieure à 5 U/mL. La valeur normale des anticorps anti-MPO est inférieure à 5 U/mL."
    ),
  },
  'anticorps anti muscle lisse': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/40', valeurMachineB: 'Négatif : < 1/40',
    interpretationA: texte('Un titre d\'anticorps anti-muscle lisse inférieur à 1/40 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps anti-muscle lisse inférieur à 1/40 est considéré comme négatif.'),
  },
  'anticorps anti myosites': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Cible', 'Valeur normale'],
      [
        ['Jo-1', 'Négatif'],
        ['Mi-2', 'Négatif'],
        ['Ku', 'Négatif'],
        ['PM-Scl', 'Négatif'],
        ['SRP', 'Négatif'],
        ['MDA5', 'Négatif'],
      ],
      "Les anticorps anti-Jo-1 sont normalement négatifs. Les anticorps anti-Mi-2 sont normalement négatifs. Les anticorps anti-Ku sont normalement négatifs. Les anticorps anti-PM-Scl sont normalement négatifs. Les anticorps anti-SRP sont normalement négatifs. Les anticorps anti-MDA5 sont normalement négatifs."
    ),
  },
  'anticorps anti centromeres': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-centromères détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-centromères détectés.'),
  },
  'anticorps anti facteurs gad': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 10 UI/mL', valeurMachineB: '< 10 UI/mL',
    interpretationA: texte('Un taux d\'anticorps anti-GAD inférieur à 10 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-GAD inférieur à 10 UI/mL est considéré comme négatif.'),
  },
  'anticorps anti facteurs ia2': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 7,5 UI/mL', valeurMachineB: '< 7,5 UI/mL',
    interpretationA: texte('Un taux d\'anticorps anti-IA2 inférieur à 7,5 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-IA2 inférieur à 7,5 UI/mL est considéré comme négatif.'),
  },
  'anticorps anti membrane basale glomerulaire': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 10 U/mL', valeurMachineB: '< 10 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-membrane basale glomérulaire inférieur à 10 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-membrane basale glomérulaire inférieur à 10 U/mL est considéré comme négatif.'),
  },
  'anticorps anticardiolipine (igg, igm)': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Isotype', 'Valeur normale'],
      [
        ['IgG', '< 20 GPL-U/mL'],
        ['IgM', '< 20 MPL-U/mL'],
      ],
      "La valeur normale des anticorps anti-cardiolipine de type IgG est inférieure à 20 GPL-U/mL. La valeur normale des anticorps anti-cardiolipine de type IgM est inférieure à 20 MPL-U/mL."
    ),
  },
  'anticorps anti facteur intrinseque': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-facteur intrinsèque détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-facteur intrinsèque détectés.'),
  },
  'anticorps anti lkm': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/40', valeurMachineB: 'Négatif : < 1/40',
    interpretationA: texte('Un titre d\'anticorps anti-LKM inférieur à 1/40 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps anti-LKM inférieur à 1/40 est considéré comme négatif.'),
  },
  'anticorps anti 21 hydroxylase': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 1 U/mL', valeurMachineB: '< 1 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-21-hydroxylase inférieur à 1 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-21-hydroxylase inférieur à 1 U/mL est considéré comme négatif.'),
  },
  'anticorps anti thyroglobuline': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 115 UI/mL', valeurMachineB: '< 115 UI/mL',
    interpretationA: texte('Un taux d\'anticorps anti-thyroglobuline inférieur à 115 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-thyroglobuline inférieur à 115 UI/mL est considéré comme négatif.'),
  },
  'anticorps anti cellules parietales': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/40', valeurMachineB: 'Négatif : < 1/40',
    interpretationA: texte('Un titre d\'anticorps anti-cellules pariétales inférieur à 1/40 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps anti-cellules pariétales inférieur à 1/40 est considéré comme négatif.'),
  },
  'anticorps anti ilots de langherans': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 1/4 (JDF)', valeurMachineB: '< 1/4 (JDF)',
    interpretationA: texte('Un titre d\'anticorps anti-îlots de Langerhans inférieur à 1/4 JDF est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps anti-îlots de Langerhans inférieur à 1/4 JDF est considéré comme négatif.'),
  },
  'anticorps antinucleaires solubles (ena ou ect)': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Cible', 'Valeur normale'],
      [
        ['SSA / Ro', 'Négatif'],
        ['SSB / La', 'Négatif'],
        ['Sm', 'Négatif'],
        ['RNP', 'Négatif'],
        ['Scl-70', 'Négatif'],
        ['Jo-1', 'Négatif'],
      ],
      "Les anticorps anti-SSA/Ro sont normalement négatifs. Les anticorps anti-SSB/La sont normalement négatifs. Les anticorps anti-Sm sont normalement négatifs. Les anticorps anti-RNP sont normalement négatifs. Les anticorps anti-Scl-70 sont normalement négatifs. Les anticorps anti-Jo-1 sont normalement négatifs."
    ),
  },
  'anticorps antinucleaires (aan ou acan)': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/80', valeurMachineB: 'Négatif : < 1/80',
    interpretationA: texte('Un titre d\'anticorps antinucléaires inférieur à 1/80 est considéré comme négatif.'),
    interpretationB: texte('Un titre d\'anticorps antinucléaires inférieur à 1/80 est considéré comme négatif.'),
  },
  'anticorps anti peptides cycliques citrullines (accp)': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 17 U/mL', valeurMachineB: '< 17 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-peptides cycliques citrullinés inférieur à 17 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-peptides cycliques citrullinés inférieur à 17 U/mL est considéré comme négatif.'),
  },
  'anticorps anti transglutaminases': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Isotype', 'Valeur normale (U/mL)'],
      [
        ['IgA', '< 7'],
        ['IgG', '< 7'],
      ],
      "La valeur normale des anticorps anti-transglutaminases de type IgA est inférieure à 7 U/mL. La valeur normale des anticorps anti-transglutaminases de type IgG est inférieure à 7 U/mL."
    ),
  },
  'anticorps anti recepteur de la tsh (ou trak)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 1,75 UI/L', valeurMachineB: '< 1,75 UI/L',
    interpretationA: texte('Un taux d\'anticorps anti-récepteur de la TSH (TRAK) inférieur à 1,75 UI/L est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-récepteur de la TSH (TRAK) inférieur à 1,75 UI/L est considéré comme négatif.'),
  },
  'anticorps anti thyroperoxydase (atpo)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '< 34 UI/mL', valeurMachineB: '< 34 UI/mL',
    interpretationA: texte('Un taux d\'anticorps anti-thyroperoxydase (ATPO) inférieur à 34 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-thyroperoxydase (ATPO) inférieur à 34 UI/mL est considéré comme négatif.'),
  },
  'anticorps anti thyroidiens  (ac antithyroglobine + ac anti tpo)': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Anticorps', 'Valeur normale'],
      [
        ['Anti-Tg', '< 115 UI/mL'],
        ['Anti-TPO', '< 34 UI/mL'],
      ],
      "La valeur normale des anticorps anti-thyroglobuline (anti-Tg) est inférieure à 115 UI/mL. La valeur normale des anticorps anti-thyroperoxydase (anti-TPO) est inférieure à 34 UI/mL."
    ),
  },
  'anticorps anti dna natif': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 30 UI/mL', valeurMachineB: '< 30 UI/mL',
    interpretationA: texte('Un taux d\'anticorps anti-DNA natif inférieur à 30 UI/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-DNA natif inférieur à 30 UI/mL est considéré comme négatif.'),
  },
  'hla b27': {
    machineA: 'Cytométrie de flux', machineB: 'Cytométrie de flux',
    valeurMachineA: 'Absent', valeurMachineB: 'Absent',
    interpretationA: texte('Un résultat absent traduit l\'absence de l\'antigène HLA-B27 à la surface des lymphocytes.'),
    interpretationB: texte('Un résultat absent traduit l\'absence de l\'antigène HLA-B27 à la surface des lymphocytes.'),
  },
  'beta2 glycoproteine': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Isotype', 'Valeur normale (U/mL)'],
      [
        ['IgG', '< 20'],
        ['IgM', '< 20'],
      ],
      "La valeur normale des anticorps anti-β2-glycoprotéine I de type IgG est inférieure à 20 U/mL. La valeur normale des anticorps anti-β2-glycoprotéine I de type IgM est inférieure à 20 U/mL."
    ),
  },
  'ac anti b2gp1 igg': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 20 U/mL', valeurMachineB: '< 20 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-β2-glycoprotéine I de type IgG inférieur à 20 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-β2-glycoprotéine I de type IgG inférieur à 20 U/mL est considéré comme négatif.'),
  },
  'ac anti b2gp1 igm': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 20 U/mL', valeurMachineB: '< 20 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-β2-glycoprotéine I de type IgM inférieur à 20 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-β2-glycoprotéine I de type IgM inférieur à 20 U/mL est considéré comme négatif.'),
  },
  'ac anti mda5': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-MDA5 détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-MDA5 détectés.'),
  },
  'ac anti 21 hydroxylase': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 1 U/mL', valeurMachineB: '< 1 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-21-hydroxylase inférieur à 1 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-21-hydroxylase inférieur à 1 U/mL est considéré comme négatif.'),
  },
  'ac anti pla2r': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 14 RU/mL', valeurMachineB: '< 14 RU/mL',
    interpretationA: texte('Un taux d\'anticorps anti-PLA2R inférieur à 14 RU/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-PLA2R inférieur à 14 RU/mL est considéré comme négatif.'),
  },
  'ac anti sla': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-SLA détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-SLA détectés.'),
  },
  'anti hmgcr': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 20 U/mL', valeurMachineB: '< 20 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-HMGCR inférieur à 20 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-HMGCR inférieur à 20 U/mL est considéré comme négatif.'),
  },
  'anti musk': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 0,4 nmol/L', valeurMachineB: '< 0,4 nmol/L',
    interpretationA: texte('Un taux d\'anticorps anti-MuSK inférieur à 0,4 nmol/L est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-MuSK inférieur à 0,4 nmol/L est considéré comme négatif.'),
  },
  'anti rach': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 0,4 nmol/L', valeurMachineB: '< 0,4 nmol/L',
    interpretationA: texte('Un taux d\'anticorps anti-récepteurs de l\'acétylcholine (RACh) inférieur à 0,4 nmol/L est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-récepteurs de l\'acétylcholine (RACh) inférieur à 0,4 nmol/L est considéré comme négatif.'),
  },
  'anti znt8': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 15 U/mL', valeurMachineB: '< 15 U/mL',
    interpretationA: texte('Un taux d\'anticorps anti-ZnT8 inférieur à 15 U/mL est considéré comme négatif.'),
    interpretationB: texte('Un taux d\'anticorps anti-ZnT8 inférieur à 15 U/mL est considéré comme négatif.'),
  },
  'ac anti fiev': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-foie/intestin/estomac/vésicule détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-foie/intestin/estomac/vésicule détectés.'),
  },
  'ac myosites': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Cible', 'Valeur normale'],
      [
        ['Jo-1', 'Négatif'],
        ['Mi-2', 'Négatif'],
        ['SRP', 'Négatif'],
        ['MDA5', 'Négatif'],
        ['TIF1-γ', 'Négatif'],
        ['NXP2', 'Négatif'],
      ],
      "Les anticorps anti-Jo-1 sont normalement négatifs. Les anticorps anti-Mi-2 sont normalement négatifs. Les anticorps anti-SRP sont normalement négatifs. Les anticorps anti-MDA5 sont normalement négatifs. Les anticorps anti-TIF1-γ sont normalement négatifs. Les anticorps anti-NXP2 sont normalement négatifs."
    ),
  },
  'anticorps anti espace intercellulaire': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-substance intercellulaire détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-substance intercellulaire détectés.'),
  },
  'anticorps anti substance intracellulaire': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-substance intracellulaire détectés.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-substance intracellulaire détectés.'),
  },
  'anapat 1': {
    machineA: 'Anatomopathologie', machineB: 'Anatomopathologie',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen anatomopathologique - Compte-rendu fourni par le pathologiste.'),
  },
  'anapat 2': {
    machineA: 'Anatomopathologie', machineB: 'Anatomopathologie',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen anatomopathologique - Compte-rendu fourni par le pathologiste.'),
  },
  'anapat 3': {
    machineA: 'Anatomopathologie', machineB: 'Anatomopathologie',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen anatomopathologique - Compte-rendu fourni par le pathologiste.'),
  },
  'anapat 4': {
    machineA: 'Anatomopathologie', machineB: 'Anatomopathologie',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen anatomopathologique - Compte-rendu fourni par le pathologiste.'),
  },

  // =====================================================================
  // GENETIQUE
  // =====================================================================
  'brca 1/2': {
    machineA: 'Séquençage NGS', machineB: 'Séquençage NGS',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Recherche de mutations des gènes BRCA1 et BRCA2 (cancer du sein et de l\'ovaire héréditaire).'),
  },
  'caryotype conventionnel': {
    machineA: 'Cytogénétique', machineB: 'Cytogénétique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Caryotype standard 46,XX ou 46,XY - Analyse de 20 mitoses minimum.'),
  },
  'caryotype moleculaire': {
    machineA: 'CGH-array', machineB: 'CGH-array',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Caryotype par hybridation génomique comparative (CGH-array) - Détection des CNV.'),
  },
  'caryotype constitutionnel': {
    machineA: 'Cytogénétique', machineB: 'Cytogénétique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Caryotype constitutionnel à partir des lymphocytes sanguins.'),
  },
  'caryotype oncologique hematologique': {
    machineA: 'Cytogénétique', machineB: 'Cytogénétique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Caryotype oncohématologique - Recherche d\'anomalies clonales acquises.'),
  },
  'fish oncohematologique': {
    machineA: 'FISH', machineB: 'FISH',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Hybridation in situ en fluorescence pour recherche de translocations spécifiques.'),
  },
  'bcr abl': {
    machineA: 'PCR temps réel', machineB: 'PCR temps réel',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Quantification du transcrit BCR-ABL1 par RT-qPCR (ratio BCR-ABL/ABL en %IS).'),
  },
  'gene cftr mucoviscidose': {
    machineA: 'Séquençage NGS', machineB: 'Séquençage NGS',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Recherche de mutations du gène CFTR (mucoviscidose).'),
  },
  'immunophenotypage lymphocytaire': {
    machineA: 'Cytométrie de flux', machineB: 'Cytométrie de flux',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Sous-population', 'Valeur normale (/mm³)'],
      [
        ['CD3+ (T totaux)', '700 - 2 100'],
        ['CD4+', '400 - 1 600'],
        ['CD8+', '200 - 900'],
        ['CD19+ (B)', '100 - 500'],
        ['CD16+/56+ (NK)', '90 - 600'],
        ['Ratio CD4/CD8', '> 1,0'],
      ],
      "Le nombre normal de lymphocytes T totaux CD3+ est compris entre 700 et 2 100/mm³. Les lymphocytes CD4+ sont normalement compris entre 400 et 1 600/mm³. Les lymphocytes CD8+ sont compris entre 200 et 900/mm³. Les lymphocytes B CD19+ sont compris entre 100 et 500/mm³. Les cellules NK CD16+/56+ sont comprises entre 90 et 600/mm³. Le rapport CD4/CD8 est normalement supérieur à 1,0."
    ),
  },

  // =====================================================================
  // EXAMENS CYTOBACTERIOLOGIQUES (ECB)
  // =====================================================================
  'examen cytobacteriologique urinaire (ecbu)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique urinaire avec étude microscopique, culture et antibiogramme si germes isolés. Seuil de bactériurie significatif : ≥ 10^5 UFC/mL.'),
  },
  'examen cytobacteriologique vaginal (pv)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique vaginal avec étude microscopique, culture et antibiogramme si germes isolés.'),
  },
  'examen cytobacteriologique uretral (pu)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique urétral avec étude microscopique, culture et antibiogramme si germes isolés.'),
  },
  'examen cytobacteriologique nasal': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique nasal avec étude microscopique, culture et antibiogramme si germes isolés.'),
  },
  'examen cytobacteriologique occulaire': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique oculaire avec étude microscopique, culture et antibiogramme si germes isolés.'),
  },
  'examen cytobacteriologique du pus (ecbpus)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique du pus avec étude microscopique, culture aéro-anaérobie et antibiogramme.'),
  },
  'examen cytobacteriologique de la gorge (ecbgorge)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique de gorge avec étude microscopique, culture et antibiogramme si germes isolés.'),
  },
  'examen cytobacteriologique du liquide auriculaire': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique du liquide auriculaire avec étude microscopique, culture et antibiogramme.'),
  },
  'examen cytobacteriologique du liquide pleural (ecbpleural)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique du liquide pleural avec étude microscopique, culture aéro-anaérobie et antibiogramme.'),
  },
  'examen cytobacteriologique du lcr (ecblcr)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique du LCR avec étude microscopique (cytologie + Gram), culture et antibiogramme.'),
  },
  'examen cytobacteriologique du liquide d\'ascite (ecbascite)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique du liquide d\'ascite avec étude microscopique, culture et antibiogramme.'),
  },
  'examen cytobacteriologique du liquide articulaire': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique du liquide articulaire avec étude microscopique, recherche de cristaux, culture et antibiogramme.'),
  },
  'examen cytobacteriologique vulvaire (ecbvulvaire)': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen cytobactériologique vulvaire avec étude microscopique, culture et antibiogramme si germes isolés.'),
  },
  'examen cytobacteriologique vaginal - chlamydia - mycoplasmes (pvmc)': {
    machineA: 'Microscope optique + culture + PCR', machineB: 'Microscope optique + culture + PCR',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('ECB vaginal + recherche de Chlamydia trachomatis (PCR) + Mycoplasmes (culture sélective).'),
  },
  'examen cytobacteriologique vaginal - chlamydia (pvc)': {
    machineA: 'Microscope optique + culture + PCR', machineB: 'Microscope optique + culture + PCR',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('ECB vaginal + recherche de Chlamydia trachomatis (PCR).'),
  },
  'examen cytobacteriologique vaginal - mycoplasmes (pvm)': {
    machineA: 'Microscope optique + culture sélective', machineB: 'Microscope optique + culture sélective',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('ECB vaginal + recherche de Mycoplasmes urogénitaux (M. hominis et U. urealyticum).'),
  },
  'spermogramme - spermocytogramme': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Spermogramme/spermocytogramme selon les critères OMS 2010 : volume, numération, mobilité, vitalité, morphologie.'),
  },
  'spermoculture': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen bactériologique du sperme avec culture aéro-anaérobie et antibiogramme si germes isolés.'),
  },
  'test de migration survie': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Test de migration survie des spermatozoïdes après préparation (gradient de densité).'),
  },
  'mar test (recherche d\'ac fixes sur spermatozoides)': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '< 50 % (négatif)', valeurMachineB: '< 50 % (négatif)',
    interpretationA: texte('Un MAR-test inférieur à 50 % de spermatozoïdes recouverts est considéré comme négatif.'),
    interpretationB: texte('Un MAR-test inférieur à 50 % de spermatozoïdes recouverts est considéré comme négatif.'),
  },
  'test de huhner': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Test post-coïtal : recherche et étude de la mobilité des spermatozoïdes dans la glaire cervicale.'),
  },
  'fcv (frottis cervico-vaginal)': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Frottis cervico-vaginal en milieu liquide - Compte-rendu selon le système de Bethesda 2014.'),
  },
  'hemoculture': {
    machineA: 'Automate hémoculture + culture', machineB: 'Automate hémoculture + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Hémoculture aéro-anaérobie sur 7 jours - Identification et antibiogramme si positive.'),
  },
  'coproculture': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Coproculture : recherche de Salmonella, Shigella, Yersinia, Campylobacter, E. coli pathogènes.'),
  },
  'coproculture pour enfant < 3 ans': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Coproculture étendue : recherche de Salmonella, Shigella, Campylobacter, E. coli (EPEC, ETEC) et Rotavirus.'),
  },
  'kop': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: 'Absence de parasites', valeurMachineB: 'Absence de parasites',
    interpretationA: texte('Un résultat normal correspond à l\'absence de parasites intestinaux observés à l\'examen parasitologique des selles.'),
    interpretationB: texte('Un résultat normal correspond à l\'absence de parasites intestinaux observés à l\'examen parasitologique des selles.'),
  },
  'kop complet (3 selles 3 jours d\'affile)': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: 'Absence de parasites', valeurMachineB: 'Absence de parasites',
    interpretationA: texte('Un résultat normal correspond à l\'absence de parasites intestinaux observés sur les trois prélèvements de selles successifs.'),
    interpretationB: texte('Un résultat normal correspond à l\'absence de parasites intestinaux observés sur les trois prélèvements de selles successifs.'),
  },
  'examen mycologique': {
    machineA: 'Microscope optique + culture', machineB: 'Microscope optique + culture',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen mycologique direct (KOH) et culture sur milieu Sabouraud avec identification si positif.'),
  },
  'recherche de leishmanies': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence de leishmanies observées à l\'examen microscopique.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence de leishmanies observées à l\'examen microscopique.'),
  },
  'recherches de mycoplasmes': {
    machineA: 'Culture sélective', machineB: 'Culture sélective',
    valeurMachineA: 'Négatif (< 10^4 UCC/mL)', valeurMachineB: 'Négatif (< 10^4 UCC/mL)',
    interpretationA: texte('Un résultat négatif correspond à une culture inférieure à 10^4 UCC/mL, sans portage significatif de mycoplasmes.'),
    interpretationB: texte('Un résultat négatif correspond à une culture inférieure à 10^4 UCC/mL, sans portage significatif de mycoplasmes.'),
  },
  'cytochimie du lcr': {
    machineA: 'Balio AX300 + Microscope', machineB: 'CBS 400 + Microscope',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Valeur normale'],
      [
        ['Leucocytes', '< 5/mm³'],
        ['Hématies', '0/mm³'],
        ['Protéines', '0,15 - 0,45 g/L'],
        ['Glucose', '> 50 % glycémie'],
        ['Chlore', '120 - 130 mmol/L'],
      ],
      "Le nombre normal de leucocytes dans le LCR est inférieur à 5/mm³. Les hématies sont normalement absentes (0/mm³). La protéinorachie normale est comprise entre 0,15 et 0,45 g/L. La glycorachie normale est supérieure à 50 % de la glycémie concomitante. La chlorurachie normale est comprise entre 120 et 130 mmol/L."
    ),
  },
  'cytochimie du liquide pleural': {
    machineA: 'Balio AX300 + Microscope', machineB: 'CBS 400 + Microscope',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Critère (Light)', 'Transsudat vs Exsudat'],
      [
        ['Protéines liquide/sérum', '> 0,5 : exsudat'],
        ['LDH liquide/sérum', '> 0,6 : exsudat'],
        ['LDH liquide', '> 2/3 normale sérique : exsudat'],
      ],
      "Un rapport protéines liquide/sérum supérieur à 0,5 qualifie le liquide d'exsudat. Un rapport LDH liquide/sérum supérieur à 0,6 qualifie également d'exsudat. Une LDH dans le liquide supérieure aux deux tiers de la normale sérique signe aussi un exsudat."
    ),
  },
  'cytochimie du liquide d\'ascite': {
    machineA: 'Balio AX300 + Microscope', machineB: 'CBS 400 + Microscope',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Paramètre', 'Interprétation'],
      [
        ['Gradient albumine sérum-ascite ≥ 11 g/L', 'HTP'],
        ['Protéines totales > 25 g/L', 'Exsudat'],
        ['PNN > 250/mm³', 'Infection du liquide d\'ascite'],
      ],
      "Un gradient d'albumine sérum-ascite supérieur ou égal à 11 g/L traduit une hypertension portale. Un taux de protéines totales supérieur à 25 g/L qualifie le liquide d'exsudat. Un nombre de polynucléaires neutrophiles supérieur à 250/mm³ signe une infection du liquide d'ascite."
    ),
  },
  'cytochimie du liquide articulaire': {
    machineA: 'Balio AX300 + Microscope', machineB: 'CBS 400 + Microscope',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Type', 'Leucocytes (/mm³)', '% PNN'],
      [
        ['Normal', '< 200', '< 25'],
        ['Inflammatoire', '2 000 - 50 000', '> 50'],
        ['Septique', '> 50 000', '> 75'],
      ],
      "Un liquide articulaire normal comporte moins de 200 leucocytes/mm³ avec moins de 25 % de polynucléaires neutrophiles. Un liquide inflammatoire présente entre 2 000 et 50 000 leucocytes/mm³ avec plus de 50 % de polynucléaires neutrophiles. Un liquide septique comporte plus de 50 000 leucocytes/mm³ avec plus de 75 % de polynucléaires neutrophiles."
    ),
  },
  'cytologie du lcr': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Étude cytologique du LCR : numération et formule leucocytaire, recherche de cellules anormales.'),
  },
  'cytologie du liquide de ponction': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Étude cytologique du liquide de ponction : numération, formule, recherche de cellules atypiques.'),
  },
  'cytoponction nodule ou ganglion': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Cytologie sur cytoponction à l\'aiguille fine de nodule ou ganglion.'),
  },
  'culot urinaire': {
    machineA: 'Microscope optique', machineB: 'Microscope optique',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Élément', 'Valeur normale'],
      [
        ['Leucocytes', '< 10/mm³'],
        ['Hématies', '< 5/mm³'],
        ['Cylindres', 'Absence'],
        ['Cristaux', 'Variable'],
      ],
      "Le nombre normal de leucocytes dans le culot urinaire est inférieur à 10/mm³. Le nombre normal d'hématies est inférieur à 5/mm³. Les cylindres sont normalement absents. La présence de cristaux est variable."
    ),
  },
  'biopsie 1': {
    machineA: 'Anatomopathologie', machineB: 'Anatomopathologie',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen anatomopathologique de biopsie - Compte-rendu fourni par le pathologiste.'),
  },
  'biopsie 2': {
    machineA: 'Anatomopathologie', machineB: 'Anatomopathologie',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen anatomopathologique de biopsie - Compte-rendu fourni par le pathologiste.'),
  },
  'biopsie 3': {
    machineA: 'Anatomopathologie', machineB: 'Anatomopathologie',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: texte('Examen anatomopathologique de biopsie - Compte-rendu fourni par le pathologiste.'),
  },
  'calprotectine fecale': {
    machineA: 'Maglumi', machineB: 'Minividas',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: mixte(
      ['Seuil (ug/g)', 'Interprétation'],
      [
        ['< 50', 'Normal'],
        ['50 - 250', 'Inflammation modérée'],
        ['> 250', 'Inflammation significative (MICI)'],
      ],
      "Une calprotectine fécale inférieure à 50 µg/g est considérée comme normale. Une valeur comprise entre 50 et 250 µg/g traduit une inflammation modérée. Au-delà de 250 µg/g, le résultat évoque une inflammation significative en faveur d'une MICI."
    ),
  },

  // ===========================================================================
  // Complements - noms exacts de la DB (24 entrees ajoutees)
  // ===========================================================================

  // --- Tests avec refs HARDCODEES dans le PDF (laisser valeurMachine vide) ---
  'DFG (Débit de filtration glomérulaire)': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '>= 90 mL/min/1,73m²',
    valeurMachineB: '>= 90 mL/min/1,73m²',
    interpretationA: mixte(
      ['DFG (mL/min/1,73m²)', 'Stade'],
      [
        ['>= 90', 'Normal'],
        ['60 - 89', 'IRC légère'],
        ['30 - 59', 'IRC modérée'],
        ['15 - 29', 'IRC sévère'],
        ['< 15', 'IRC terminale'],
      ],
      "Un DFG supérieur ou égal à 90 mL/min/1,73m² est considéré comme normal. Un DFG compris entre 60 et 89 mL/min/1,73m² traduit une insuffisance rénale chronique légère. Entre 30 et 59 mL/min/1,73m², l'insuffisance rénale est modérée. Entre 15 et 29 mL/min/1,73m², elle est sévère. En dessous de 15 mL/min/1,73m², il s'agit d'une insuffisance rénale chronique terminale."
    ),
  },
  'Clairance de la créatinine': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '> 90 mL/min',
    valeurMachineB: '> 90 mL/min',
    interpretationA: texte('Une clairance de la créatinine supérieure à 90 mL/min est considérée comme normale.'),
    interpretationB: texte('Une clairance de la créatinine supérieure à 90 mL/min est considérée comme normale.'),
  },
  'Rapport albuminurie/créatinurie (RAC)': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: 'N : < 30 mg/g',
    valeurMachineB: 'N : < 30 mg/g',
    interpretationA: texte('Un rapport albuminurie/créatinurie inférieur à 30 mg/g est considéré comme normal.'),
    interpretationB: texte('Un rapport albuminurie/créatinurie inférieur à 30 mg/g est considéré comme normal.'),
  },
  'Rapport protéinurie/créatinurie (RPC)': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: 'N : < 150 mg/g',
    valeurMachineB: 'N : < 150 mg/g',
    interpretationA: texte('Un rapport protéinurie/créatinurie inférieur à 150 mg/g est considéré comme normal.'),
    interpretationB: texte('Un rapport protéinurie/créatinurie inférieur à 150 mg/g est considéré comme normal.'),
  },
  'Microalbuminurie des 24h': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '< 30 mg/24h',
    valeurMachineB: '< 30 mg/24h',
    interpretationA: texte('Une microalbuminurie des 24 heures inférieure à 30 mg est considérée comme normale.'),
    interpretationB: texte('Une microalbuminurie des 24 heures inférieure à 30 mg est considérée comme normale.'),
  },
  'Protéinurie des 24H': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '< 150 mg/24h',
    valeurMachineB: '< 150 mg/24h',
    interpretationA: texte('Une protéinurie des 24 heures inférieure à 150 mg est considérée comme normale.'),
    interpretationB: texte('Une protéinurie des 24 heures inférieure à 150 mg est considérée comme normale.'),
  },
  'Taux de réticulocytes': {
    machineA: 'Hemax 530AL',
    machineB: 'Hemax 530AL',
    valeurMachineA: '25 - 100 G/L',
    valeurMachineB: '25 - 100 G/L',
    interpretationA: texte(
      'Régénération médullaire : > 120 G/L = régénératif ; < 50 G/L = arégénératif.'
    ),
  },
  'Numération Formule Sanguine  (NFS)': {
    machineA: 'Hemax 530AL',
    machineB: 'Hemax 530AL',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: texte(
      'Numération sanguine complète : valeurs de référence par paramètre détaillées dans le rapport (GR, GB, Hb, Ht, PLT, indices VGM/TCMH/CCMH, formule leucocytaire).'
    ),
  },

  // --- Coagulation ---
  'Temps de céphaline activé (TCA/TCK)': {
    machineA: 'Start Max',
    machineB: 'CA104',
    valeurMachineA: '25 - 35 sec  (ratio M/T < 1,2)',
    valeurMachineB: '25 - 35 sec  (ratio M/T < 1,2)',
    interpretationA: texte('Le temps de céphaline activé est normalement compris entre 25 et 35 secondes, avec un ratio malade/témoin inférieur à 1,2.'),
    interpretationB: texte('Le temps de céphaline activé est normalement compris entre 25 et 35 secondes, avec un ratio malade/témoin inférieur à 1,2.'),
  },
  'Taux de prothrombine (TP)': {
    machineA: 'Start Max',
    machineB: 'CA104',
    valeurMachineA: '70 - 100 %',
    valeurMachineB: '70 - 100 %',
    interpretationA: texte('Un taux de prothrombine compris entre 70 et 100 % est considéré comme normal.'),
    interpretationB: texte('Un taux de prothrombine compris entre 70 et 100 % est considéré comme normal.'),
  },

  // --- Biochimie / marqueurs ---
  'PAC (phospatase acide)': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '< 4 ng/mL',
    valeurMachineB: '< 4 ng/mL',
    interpretationA: texte('Un taux de phosphatase acide prostatique inférieur à 4 ng/mL est considéré comme normal.'),
    interpretationB: texte('Un taux de phosphatase acide prostatique inférieur à 4 ng/mL est considéré comme normal.'),
  },
  'PAL': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Sexe / Age', 'Norme (UI/L)'],
      [
        ['Homme adulte', '40 - 130'],
        ['Femme adulte', '35 - 105'],
        ['Enfant', '< 500 (croissance)'],
      ],
      "Chez l'homme adulte, les phosphatases alcalines sont normalement comprises entre 40 et 130 UI/L. Chez la femme adulte, elles sont comprises entre 35 et 105 UI/L. Chez l'enfant en période de croissance, elles sont normalement inférieures à 500 UI/L."
    ),
  },
  'Protéine C Réactive (CRP)': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '< 6 mg/L',
    valeurMachineB: '< 6 mg/L',
    interpretationA: texte('Une protéine C réactive inférieure à 6 mg/L est considérée comme normale, sans syndrome inflammatoire biologique.'),
    interpretationB: texte('Une protéine C réactive inférieure à 6 mg/L est considérée comme normale, sans syndrome inflammatoire biologique.'),
  },
  'Glycémie post prandiale': {
    machineA: 'Balio AX300',
    machineB: 'CBS 400',
    valeurMachineA: '< 1,40 g/L',
    valeurMachineB: '< 1,40 g/L',
    interpretationA: texte('Une glycémie post-prandiale inférieure à 1,40 g/L est considérée comme normale.'),
    interpretationB: texte('Une glycémie post-prandiale inférieure à 1,40 g/L est considérée comme normale.'),
  },
  'Hémoglobine glyquée (HBA1c)': {
    machineA: 'HumaMeter A1c',
    machineB: 'Balio AX300',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['HbA1c (%)', 'Interprétation'],
      [
        ['< 5,7', 'Normal'],
        ['5,7 - 6,4', 'Pré-diabète'],
        ['>= 6,5', 'Diabète'],
        ['< 7', 'Bon équilibre diabétique'],
        ['> 8', 'Mauvais équilibre - ajustement requis'],
      ],
      "Une valeur d'HbA1c inférieure à 5,7 % est considérée comme normale. Entre 5,7 et 6,4 %, le résultat évoque un pré-diabète. Une valeur supérieure ou égale à 6,5 % est en faveur d'un diabète. Chez le patient diabétique connu, une HbA1c inférieure à 7 % traduit un bon équilibre glycémique, tandis qu'une valeur supérieure à 8 % traduit un mauvais équilibre."
    ),
  },
  'TSHus': {
    machineA: 'Minividas',
    machineB: 'Maglumi',
    valeurMachineA: '0,27 - 4,2 µUI/mL',
    valeurMachineB: '0,27 - 4,2 µUI/mL',
    interpretationA: texte('Le taux de TSH ultrasensible est normalement compris entre 0,27 et 4,2 µUI/mL.'),
    interpretationB: texte('Le taux de TSH ultrasensible est normalement compris entre 0,27 et 4,2 µUI/mL.'),
  },

  // --- Serologies / qualitatifs ---
  'Anticorps anti HCV': {
    machineA: 'Minividas',
    machineB: 'Maglumi',
    valeurMachineA: 'Négatif',
    valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHC.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-VHC.'),
  },
  'TPHA': {
    machineA: 'Minividas',
    machineB: 'Maglumi',
    valeurMachineA: 'Négatif',
    valeurMachineB: 'Négatif',
    interpretationA: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Treponema pallidum.'),
    interpretationB: texte('Un résultat négatif traduit l\'absence d\'anticorps anti-Treponema pallidum.'),
  },
  'Test de Coombs direct': {
    machineA: 'Grifols carte DG gel Coombs',
    machineB: 'Grifols carte DG gel Coombs',
    valeurMachineA: 'Négatif',
    valeurMachineB: 'Négatif',
    interpretationA: texte('Un test de Coombs direct négatif traduit l\'absence d\'anticorps fixés sur les hématies du patient.'),
    interpretationB: texte('Un test de Coombs direct négatif traduit l\'absence d\'anticorps fixés sur les hématies du patient.'),
  },
  'Test de Coombs indirect': {
    machineA: 'Grifols carte DG gel Coombs',
    machineB: 'Grifols carte DG gel Coombs',
    valeurMachineA: 'Négatif',
    valeurMachineB: 'Négatif',
    interpretationA: texte('Un test de Coombs indirect négatif traduit l\'absence d\'anticorps anti-érythrocytaires circulants dans le sérum.'),
    interpretationB: texte('Un test de Coombs indirect négatif traduit l\'absence d\'anticorps anti-érythrocytaires circulants dans le sérum.'),
  },
  'QBC (QBC-Goutte épaisse)': {
    machineA: 'QBC Paralens Advance',
    machineB: 'QBC Paralens Advance',
    valeurMachineA: 'Négatif',
    valeurMachineB: 'Négatif',
    interpretationA: texte('Un QBC négatif traduit l\'absence de Plasmodium détecté en fluorescence.'),
    interpretationB: texte('Un QBC négatif traduit l\'absence de Plasmodium détecté en fluorescence.'),
  },
  'Goutte épaisse (GE)': {
    machineA: 'QBC Paralens Advance',
    machineB: 'Microscope optique',
    valeurMachineA: 'Négatif',
    valeurMachineB: 'Négatif',
    interpretationA: texte('Une goutte épaisse négative traduit l\'absence de Plasmodium détecté.'),
    interpretationB: texte('Une goutte épaisse négative traduit l\'absence de Plasmodium détecté.'),
  },

  // --- Auto-immunite ---
  'Anticorps anti cytoplasme polynucléaires neutrophiles, PR3 MPO': {
    machineA: 'Immunoblot Euroimmun',
    machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Cible', 'Norme'],
      [
        ['ANCA (IFI)', 'Négatif (titre < 1/20)'],
        ['Anti-PR3 (c-ANCA)', '< 5 U/mL'],
        ['Anti-MPO (p-ANCA)', '< 5 U/mL'],
      ],
      "Les ANCA en immunofluorescence indirecte sont normalement négatifs (titre inférieur à 1/20). La valeur normale des anticorps anti-PR3 (c-ANCA) est inférieure à 5 U/mL. La valeur normale des anticorps anti-MPO (p-ANCA) est inférieure à 5 U/mL."
    ),
  },

  // --- Electrophorese ---
  'Electrophorèse hémoglobine': {
    machineA: 'Minicap Sebia',
    machineB: 'Hydrasys 2 scan Sebia',
    valeurMachineA: '',
    valeurMachineB: '',
    interpretationA: mixte(
      ['Fraction', 'Norme adulte (%)'],
      [
        ['HbA', '> 96,5'],
        ['HbA2', '2,0 - 3,3'],
        ['HbF', '< 1,0'],
        ['HbS / HbC', 'Absente'],
      ],
      "Chez l'adulte, la fraction HbA représente normalement plus de 96,5 % de l'hémoglobine totale. La fraction HbA2 est comprise entre 2,0 et 3,3 %. La fraction HbF est inférieure à 1,0 %. Les fractions anormales HbS et HbC sont normalement absentes."
    ),
  },
}

// ---------------------------------------------------------------------------
// Build l'index normalise
// ---------------------------------------------------------------------------
const refsByNormName = new Map()
for (const [k, v] of Object.entries(REFS)) refsByNormName.set(norm(k), v)

// Matching STRICT : seulement la cle normalisee EXACTE.
// Pas d'inclusion partielle pour eviter les faux positifs.
const findMatch = (testName) => {
  const n = norm(testName)
  if (refsByNormName.has(n)) return { key: n, ref: refsByNormName.get(n) }
  return null
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
;(async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI manquant dans .env')
    process.exit(1)
  }

  console.log('--- Connexion MongoDB...')
  // IMPORTANT : la base est nommee "lims" cote app principal (cf config/db.js).
  // La MONGO_URI ne contient pas de dbName -> il faut le forcer ici.
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'lims' })
  console.log(`--- Connexion OK sur DB: ${mongoose.connection.name}`)

  const tests = await Test.find({}).lean()
  console.log(`--- ${tests.length} tests trouves`)

  const matched = []
  const skipped = []
  const unmatched = []
  const skippedEssais = []

  for (const t of tests) {
    const normName = norm(t.nom)

    // Skip explicite : essais internes
    if (SKIP.has(normName)) {
      skippedEssais.push(t.nom)
      continue
    }

    const match = findMatch(t.nom)
    if (!match) {
      unmatched.push(t.nom)
      continue
    }
    const ref = match.ref

    // Si valeurs deja remplies et pas --force, on ne touche pas.
    const alreadyHasA = t.valeurMachineA && String(t.valeurMachineA).trim() !== ''
    const alreadyHasB = t.valeurMachineB && String(t.valeurMachineB).trim() !== ''
    if (alreadyHasA && alreadyHasB && !FORCE) {
      skipped.push({ nom: t.nom, raison: 'deja rempli (use --force pour ecraser)' })
      continue
    }

    matched.push({
      _id: t._id,
      nom: t.nom,
      matchedKey: match.key,
      changes: {
        machineA: ref.machineA,
        machineB: ref.machineB,
        valeurMachineA: ref.valeurMachineA,
        valeurMachineB: ref.valeurMachineB,
        ...(ref.interpretationA ? { interpretationA: ref.interpretationA } : {}),
        ...(ref.interpretationB ? { interpretationB: ref.interpretationB } : {}),
      },
    })
  }

  console.log('\n=== TESTS MATCHES (à modifier) ===')
  matched.forEach((m) => {
    console.log(`\n• ${m.nom}  (match: "${m.matchedKey}")`)
    console.log(`  → machineA: ${m.changes.machineA}`)
    console.log(`  → machineB: ${m.changes.machineB}`)
    console.log(`  → valA: ${m.changes.valeurMachineA}`)
    console.log(`  → valB: ${m.changes.valeurMachineB}`)
    if (m.changes.interpretationA) {
      console.log(`  → interpretationA: ${m.changes.interpretationA.type}`)
    }
    if (m.changes.interpretationB) {
      console.log(`  → interpretationB: ${m.changes.interpretationB.type}`)
    }
  })

  console.log('\n=== TESTS SAUTES (deja remplis, sans --force) ===')
  skipped.forEach((s) => console.log(`• ${s.nom}  (${s.raison})`))

  console.log('\n=== TESTS SAUTES (essais internes - SKIP list) ===')
  skippedEssais.forEach((n) => console.log(`• ${n}`))

  console.log('\n=== TESTS NON-MATCHES (mapping a completer) ===')
  unmatched.forEach((n) => console.log(`• ${n}`))

  console.log(
    `\n--- Resume : ${matched.length} a modifier  |  ${skipped.length} deja remplis  |  ${skippedEssais.length} essais skippes  |  ${unmatched.length} non-matches`
  )

  if (!APPLY) {
    console.log(
      `\n[DRY-RUN] Aucun changement applique. Relancer avec --apply pour ecrire en DB.`
    )
    await mongoose.disconnect()
    return
  }

  console.log(`\n--- Application des ${matched.length} changements...`)
  for (const m of matched) {
    await Test.updateOne({ _id: m._id }, { $set: m.changes })
  }
  console.log('--- Termine.')

  await mongoose.disconnect()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
