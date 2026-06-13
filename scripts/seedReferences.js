/*
 * Script de seed : remplit valeurMachineA, valeurMachineB, machineA,
 * machineB et interpretationA / B pour les tests de Test (collection
 * 'tests') selon les normes labo standards (OMS, SFBC, ...).
 *
 * Mode dry-run par defaut : preview les changements sans rien
 * sauvegarder. Mode reel : `node scripts/seedReferences.js --apply`.
 *
 * MAPPING : il est defini ci-dessous. Le matching test -> mapping
 * est insensible a la casse et aux accents. Si un test du DB n'a pas
 * d'entree, il est liste a la fin du report (modify mapping or skip).
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

// ---------------------------------------------------------------------------
// MAPPING : nom du test (normalise) -> infos machines et references
// ---------------------------------------------------------------------------
const tablette = (cols, rows) => ({
  type: 'table',
  content: { columns: cols, rows },
})
const texte = (s) => ({ type: 'text', content: s })

// Reference machine A (selon le pattern : pour les tests avec sens H/F,
// on stocke la chaine "H: ... F: ..." pour rester sur une seule ligne).
const REFS = {
  // ============ HEMATOLOGIE (Hemax 530AL) ============
  'hematies': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'H: 4,6 - 6,2  F: 4,2 - 5,4 x10^6/uL',
    valeurMachineB: 'H: 4,6 - 6,2  F: 4,2 - 5,4 x10^6/uL',
  },
  'hemoglobine': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'H: 13,5 - 17,5  F: 12,0 - 16,0 g/dL',
    valeurMachineB: 'H: 13,5 - 17,5  F: 12,0 - 16,0 g/dL',
  },
  'hematocrite': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'H: 40 - 52  F: 36 - 48 %',
    valeurMachineB: 'H: 40 - 52  F: 36 - 48 %',
  },
  'vgm': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '80 - 97 fL', valeurMachineB: '80 - 97 fL',
  },
  'tcmh': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '26 - 32 pg', valeurMachineB: '26 - 32 pg',
  },
  'ccmh': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '30 - 36 g/dL', valeurMachineB: '30 - 36 g/dL',
  },
  'idr cv': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '11 - 16 %', valeurMachineB: '11 - 16 %',
  },
  'leucocytes': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '4,0 - 10,0 x10^3/uL', valeurMachineB: '4,0 - 10,0 x10^3/uL',
  },
  'plaquettes': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '150 - 450 x10^3/uL', valeurMachineB: '150 - 450 x10^3/uL',
  },
  'numeration formule sanguine': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'Voir details NFS', valeurMachineB: 'Voir details NFS',
  },
  'nfs': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'Voir details NFS', valeurMachineB: 'Voir details NFS',
  },
  'vitesse de sedimentation': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'H: < 15  F: < 20 mm/1h',
    valeurMachineB: 'H: < 15  F: < 20 mm/1h',
  },
  'vs': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: 'H: < 15  F: < 20 mm/1h',
    valeurMachineB: 'H: < 15  F: < 20 mm/1h',
  },

  // ============ BIOCHIMIE SANGUINE (Balio AX300 / CBS 400) ============
  'glycemie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,70 - 1,10 g/L', valeurMachineB: '0,70 - 1,10 g/L',
  },
  'glycemie a jeun': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,70 - 1,10 g/L', valeurMachineB: '0,70 - 1,10 g/L',
  },
  'uree': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '0,15 - 0,45 g/L', valeurMachineB: '0,15 - 0,45 g/L',
  },
  'creatinine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'H: 7 - 13  F: 6 - 12 mg/L',
    valeurMachineB: 'H: 7 - 13  F: 6 - 12 mg/L',
  },
  'creatininemie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'H: 7 - 13  F: 6 - 12 mg/L',
    valeurMachineB: 'H: 7 - 13  F: 6 - 12 mg/L',
  },
  'acide urique': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'H: 35 - 72  F: 26 - 60 mg/L',
    valeurMachineB: 'H: 35 - 72  F: 26 - 60 mg/L',
  },
  'asat': { // TGO
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
  },
  'transaminases asat': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
  },
  'alat': { // TGP
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
  },
  'transaminases alat': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 40 UI/L', valeurMachineB: '< 40 UI/L',
  },
  'ggt': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'H: < 60  F: < 40 UI/L',
    valeurMachineB: 'H: < 60  F: < 40 UI/L',
  },
  'phosphatases alcalines': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '40 - 130 UI/L', valeurMachineB: '40 - 130 UI/L',
  },
  'bilirubine totale': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 10 mg/L', valeurMachineB: '< 10 mg/L',
  },
  'bilirubine directe': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 3 mg/L', valeurMachineB: '< 3 mg/L',
  },
  'bilirubine indirecte': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 10 mg/L', valeurMachineB: '< 10 mg/L',
  },
  'calcium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '85 - 105 mg/L  (2,15 - 2,55 mmol/L)',
    valeurMachineB: '85 - 105 mg/L  (2,15 - 2,55 mmol/L)',
  },
  'phosphore': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '25 - 45 mg/L', valeurMachineB: '25 - 45 mg/L',
  },
  'magnesium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '17 - 25 mg/L  (0,7 - 1,1 mmol/L)',
    valeurMachineB: '17 - 25 mg/L  (0,7 - 1,1 mmol/L)',
  },
  'sodium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '135 - 145 mmol/L', valeurMachineB: '135 - 145 mmol/L',
  },
  'potassium': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '3,5 - 5,0 mmol/L', valeurMachineB: '3,5 - 5,0 mmol/L',
  },
  'chlore': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '95 - 105 mmol/L', valeurMachineB: '95 - 105 mmol/L',
  },
  'crp': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 6 mg/L', valeurMachineB: '< 6 mg/L',
  },
  'proteine c reactive': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 6 mg/L', valeurMachineB: '< 6 mg/L',
  },
  'ldh': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '130 - 460 UI/L', valeurMachineB: '130 - 460 UI/L',
  },
  'cholesterol total': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 2,00 g/L', valeurMachineB: '< 2,00 g/L',
  },
  'hdl cholesterol': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '> 0,40 g/L', valeurMachineB: '> 0,40 g/L',
  },
  'ldl cholesterol': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 1,60 g/L', valeurMachineB: '< 1,60 g/L',
  },
  'triglycerides': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 1,50 g/L', valeurMachineB: '< 1,50 g/L',
  },
  'lipides totaux': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '4 - 10 g/L', valeurMachineB: '4 - 10 g/L',
  },
  'proteines totales': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '60 - 80 g/L', valeurMachineB: '60 - 80 g/L',
  },
  'albumine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '35 - 50 g/L', valeurMachineB: '35 - 50 g/L',
  },
  'fer serique': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'H: 65 - 175  F: 50 - 170 ug/dL',
    valeurMachineB: 'H: 65 - 175  F: 50 - 170 ug/dL',
  },
  'ferritine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'H: 30 - 400  F: 13 - 150 ng/mL',
    valeurMachineB: 'H: 30 - 400  F: 13 - 150 ng/mL',
  },

  // ============ COAGULATION (Start Max / CA104) ============
  'taux de prothrombine': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '> 70 %', valeurMachineB: '> 70 %',
  },
  'tp': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '> 70 %', valeurMachineB: '> 70 %',
  },
  'inr': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '0,9 - 1,2', valeurMachineB: '0,9 - 1,2',
  },
  'tck': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '20 - 40 secondes', valeurMachineB: '20 - 40 secondes',
  },
  'tca': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '20 - 40 secondes', valeurMachineB: '20 - 40 secondes',
  },
  'temps de cephaline active': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '20 - 40 secondes', valeurMachineB: '20 - 40 secondes',
  },
  'fibrinogene': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '2,0 - 4,0 g/L', valeurMachineB: '2,0 - 4,0 g/L',
  },
  'd dimeres': {
    machineA: 'Start Max', machineB: 'CA104',
    valeurMachineA: '< 500 ng/mL', valeurMachineB: '< 500 ng/mL',
  },

  // ============ HbA1c (HumaMeter A1c) ============
  'hba1c': {
    machineA: 'HumaMeter A1c', machineB: 'HumaMeter A1c',
    valeurMachineA: '4 - 5,6 %', valeurMachineB: '4 - 5,6 %',
    interpretationA: tablette(
      ['Valeur HbA1c', 'Interprétation'],
      [
        ['< 5,7 %', 'Normal'],
        ['5,7 - 6,4 %', 'Prédiabète'],
        ['≥ 6,5 %', 'Diabète'],
        ['< 7 %', 'Objectif chez diabétique contrôlé'],
      ]
    ),
    interpretationB: tablette(
      ['Valeur HbA1c', 'Interprétation'],
      [
        ['< 5,7 %', 'Normal'],
        ['5,7 - 6,4 %', 'Prédiabète'],
        ['≥ 6,5 %', 'Diabète'],
        ['< 7 %', 'Objectif chez diabétique contrôlé'],
      ]
    ),
  },
  'hemoglobine glyquee': {
    machineA: 'HumaMeter A1c', machineB: 'HumaMeter A1c',
    valeurMachineA: '4 - 5,6 %', valeurMachineB: '4 - 5,6 %',
  },

  // ============ GROUPE SANGUIN (Grifols carte DG gel Coombs) ============
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
  },

  // ============ PARASITOLOGIE (QBC Paralens Advance) ============
  'goutte epaisse': {
    machineA: 'QBC Paralens Advance', machineB: 'QBC Paralens Advance',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
  },
  'paludisme': {
    machineA: 'QBC Paralens Advance', machineB: 'QBC Paralens Advance',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
  },
  'qbc': {
    machineA: 'QBC Paralens Advance', machineB: 'QBC Paralens Advance',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
  },

  // ============ ELECTROPHORESE (Minicap / Hydrasys 2 sebia) ============
  'electrophorese des proteines': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Fraction', 'Valeur normale (g/L)'],
      [
        ['Albumine', '38 - 51'],
        ['Alpha-1 globulines', '1 - 4'],
        ['Alpha-2 globulines', '5 - 11'],
        ['Beta globulines', '6 - 13'],
        ['Gamma globulines', '8 - 16'],
      ]
    ),
  },
  'electrophorese de l hemoglobine': {
    machineA: 'Hydrasys 2 scan Sebia', machineB: 'Minicap Sebia',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Hémoglobine', 'Adulte (%)'],
      [
        ['HbA', '95 - 98'],
        ['HbA2', '2,0 - 3,3'],
        ['HbF', '< 1'],
      ]
    ),
  },

  // ============ HORMONOLOGIE (CLIA Minividas / Maglumi) ============
  't3 libre': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '3,0 - 8,3 pmol/L', valeurMachineB: '3,0 - 8,3 pmol/L',
  },
  't4 libre': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '8,6 - 25 pmol/L', valeurMachineB: '8,6 - 25 pmol/L',
  },
  'tsh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '0,4 - 4,0 mUI/L', valeurMachineB: '0,4 - 4,0 mUI/L',
  },
  'fsh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Phase / Sexe', 'FSH (UI/L)'],
      [
        ['Folliculaire (F)', '3,5 - 12,5'],
        ['Ovulatoire (F)', '4,7 - 21,5'],
        ['Lutéale (F)', '1,7 - 7,7'],
        ['Ménopause (F)', '25,8 - 134,8'],
        ['Adulte (H)', '1,5 - 12,4'],
      ]
    ),
  },
  'lh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Phase / Sexe', 'LH (UI/L)'],
      [
        ['Folliculaire (F)', '2,4 - 12,6'],
        ['Ovulatoire (F)', '14,0 - 95,6'],
        ['Lutéale (F)', '1,0 - 11,4'],
        ['Ménopause (F)', '7,7 - 58,5'],
        ['Adulte (H)', '1,7 - 8,6'],
      ]
    ),
  },
  'estradiol': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Phase / Sexe', 'Estradiol (pg/mL)'],
      [
        ['Folliculaire (F)', '12,5 - 166'],
        ['Ovulatoire (F)', '85,8 - 498'],
        ['Lutéale (F)', '43,8 - 211'],
        ['Ménopause (F)', '< 54,7'],
        ['Adulte (H)', '7,6 - 42,6'],
      ]
    ),
  },
  'progesterone': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Phase / Sexe', 'Progestérone (ng/mL)'],
      [
        ['Folliculaire (F)', '0,2 - 1,5'],
        ['Lutéale (F)', '1,7 - 27'],
        ['Ménopause (F)', '< 0,4'],
        ['Adulte (H)', '< 0,2 - 1,4'],
      ]
    ),
  },
  'prolactine': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'H: < 18  F: < 25 ng/mL',
    valeurMachineB: 'H: < 18  F: < 25 ng/mL',
  },
  'testosterone': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'H: 3,0 - 10,0  F: < 1,0 ng/mL',
    valeurMachineB: 'H: 3,0 - 10,0  F: < 1,0 ng/mL',
  },
  'amh': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Tranche d\'âge', '2,5 pctl', 'Médiane', '97,5 pctl (ng/mL)'],
      [
        ['20 - 24 ans', '1,13', '3,94', '11,46'],
        ['25 - 29 ans', '0,77', '3,01', '9,75'],
        ['30 - 34 ans', '0,33', '2,74', '7,83'],
        ['35 - 39 ans', '0,13', '1,93', '6,65'],
        ['40 - 44 ans', '0,027', '0,85', '5,26'],
        ['45 - 50 ans', '0,02', '0,17', '2,82'],
      ]
    ),
  },
  'hormone antimullerienne': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
  },

  // ============ MARQUEURS TUMORAUX ============
  'psa total': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 4,0 ng/mL', valeurMachineB: '< 4,0 ng/mL',
  },
  'psa libre': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
  },
  'rapport psa libre psa total': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '> 15 %', valeurMachineB: '> 15 %',
  },
  'afp': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 7,25 UI/mL', valeurMachineB: '< 7,25 UI/mL',
  },
  'alpha foeto protein': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 7,25 UI/mL', valeurMachineB: '< 7,25 UI/mL',
  },
  'ace': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 5 ng/mL (non-fumeur)', valeurMachineB: '< 5 ng/mL (non-fumeur)',
  },
  'ca 125': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 35 UI/mL', valeurMachineB: '< 35 UI/mL',
  },
  'ca 15 3': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 30 UI/mL', valeurMachineB: '< 30 UI/mL',
  },
  'ca 19 9': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '< 37 UI/mL', valeurMachineB: '< 37 UI/mL',
  },

  // ============ SEROLOGIE INFECTIEUSE (qualitative -> table) ============
  'bw': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
  },
  'hiv': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
  },
  'hbs ag': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif : < 1,0 index/mL', valeurMachineB: 'Négatif : < 1,0 index/mL',
  },
  'antigene hbs': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif : < 1,0 index/mL', valeurMachineB: 'Négatif : < 1,0 index/mL',
  },
  'hcv': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
  },
  'toxoplasmose igg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Seuil (UI/mL)', 'Interprétation'],
      [
        ['< 4', 'Négatif - Absence d\'immunité'],
        ['4 - 7', 'Douteux - Contrôler à 3 semaines'],
        ['≥ 7', 'Positif - Immunisé'],
      ]
    ),
    interpretationB: tablette(
      ['Seuil (UI/mL)', 'Interprétation'],
      [
        ['< 4', 'Négatif - Absence d\'immunité'],
        ['4 - 7', 'Douteux - Contrôler à 3 semaines'],
        ['≥ 7', 'Positif - Immunisé'],
      ]
    ),
  },
  'toxoplasmose igm': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '', valeurMachineB: '',
    interpretationA: tablette(
      ['Seuil (UI/mL)', 'Interprétation'],
      [
        ['< 0,55', 'Négatif - Pas d\'infection récente'],
        ['0,55 - 0,65', 'Douteux'],
        ['> 0,65', 'Positif - Infection récente probable'],
      ]
    ),
    interpretationB: tablette(
      ['Seuil (AU/mL)', 'Interprétation'],
      [
        ['< 2', 'Négatif'],
        ['2 - 2,6', 'Douteux'],
        ['≥ 2,6', 'Positif'],
      ]
    ),
  },
  'rubeole igg': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: '≥ 10 UI/mL : Immunisé', valeurMachineB: '≥ 10 UI/mL : Immunisé',
  },
  'rubeole igm': {
    machineA: 'Minividas', machineB: 'Maglumi',
    valeurMachineA: 'Négatif', valeurMachineB: 'Négatif',
  },

  // ============ AUTO-IMMUNITE (Immunoblot Euroimmun) ============
  'anticorps anti nucleaires': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/80', valeurMachineB: 'Négatif : < 1/80',
  },
  'ana': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: 'Négatif : < 1/80', valeurMachineB: 'Négatif : < 1/80',
  },
  'anti ccp': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 17 U/mL', valeurMachineB: '< 17 U/mL',
  },
  'facteur rhumatoide': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 14 UI/mL', valeurMachineB: '< 14 UI/mL',
  },
  'anti dna': {
    machineA: 'Immunoblot Euroimmun', machineB: 'Immunoblot Euroimmun',
    valeurMachineA: '< 30 UI/mL', valeurMachineB: '< 30 UI/mL',
  },

  // ============ BIOCHIMIE URINAIRE ============
  'microalbuminurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 30 mg/24h', valeurMachineB: '< 30 mg/24h',
  },
  'proteinurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '< 150 mg/24h', valeurMachineB: '< 150 mg/24h',
  },
  'rapport albuminurie creatinurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'N : < 30 mg/g', valeurMachineB: 'N : < 30 mg/g',
  },
  'rapport proteinurie creatinurie': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: 'N : < 150 mg/g', valeurMachineB: 'N : < 150 mg/g',
  },

  // ============ AUTRES ============
  'reticulocytes': {
    machineA: 'Hemax 530AL', machineB: 'Hemax 530AL',
    valeurMachineA: '0,5 - 1,5 % (20 000 - 120 000/mm³)',
    valeurMachineB: '0,5 - 1,5 % (20 000 - 120 000/mm³)',
  },
  'calcium corrige': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '2,20 - 2,60 mmol/L', valeurMachineB: '2,20 - 2,60 mmol/L',
  },
  'clairance creatinine': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '> 90 mL/min', valeurMachineB: '> 90 mL/min',
  },
  'dfg': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '≥ 90 mL/min/1,73 m²', valeurMachineB: '≥ 90 mL/min/1,73 m²',
  },
  'debit de filtration glomerulaire': {
    machineA: 'Balio AX300', machineB: 'CBS 400',
    valeurMachineA: '≥ 90 mL/min/1,73 m²', valeurMachineB: '≥ 90 mL/min/1,73 m²',
  },
}

// ---------------------------------------------------------------------------
// Build l'index normalise
// ---------------------------------------------------------------------------
const refsByNormName = new Map()
for (const [k, v] of Object.entries(REFS)) refsByNormName.set(norm(k), v)

// Matching tolerant : on accepte des inclusions partielles
const findMatch = (testName) => {
  const n = norm(testName)
  if (refsByNormName.has(n)) return { key: n, ref: refsByNormName.get(n) }
  // recherche par mot-cle inclus
  for (const [k, v] of refsByNormName) {
    if (n.includes(k) || k.includes(n)) {
      return { key: k, ref: v }
    }
  }
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
  await mongoose.connect(process.env.MONGO_URI)
  console.log('--- Connexion OK')

  const tests = await Test.find({}).lean()
  console.log(`--- ${tests.length} tests trouves`)

  const matched = []
  const skipped = []
  const unmatched = []

  for (const t of tests) {
    const match = findMatch(t.nom)
    if (!match) {
      unmatched.push(t.nom)
      continue
    }
    const ref = match.ref

    // Si valeurs deja remplies et pas --force, on ne touche pas.
    const alreadyHasA = t.valeurMachineA && t.valeurMachineA.trim() !== ''
    const alreadyHasB = t.valeurMachineB && t.valeurMachineB.trim() !== ''
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
  })

  console.log('\n=== TESTS SAUTES (deja remplis, sans --force) ===')
  skipped.forEach((s) => console.log(`• ${s.nom}  (${s.raison})`))

  console.log('\n=== TESTS NON-MATCHES (mapping a completer) ===')
  unmatched.forEach((n) => console.log(`• ${n}`))

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
