// const asyncHandler = require('express-async-handler');
// const puppeteer = require('puppeteer');
// const handlebars = require('handlebars');
// const path = require('path');
// const fs = require('fs').promises;

// // Modèles
// const Analyse = require('../models/analyseModel');
// const ReportTemplate = require('../models/reportTemplateModel');

// /**
//  * Moteur de génération de PDF pilotée par métadonnées - Version Complète
//  */
// class ReportEngine {
//   constructor() {
//     this.registerHelpers();
//     this.registerPartials();
//   }

//   /**
//    * Enregistre les helpers Handlebars
//    */
//   registerHelpers() {
//     // Helper pour vérifier l'égalité
//     handlebars.registerHelper('eq', (a, b) => a === b);
    
//     // Helper pour vérifier si une valeur existe
//     handlebars.registerHelper('exists', (value) => value != null && value !== '');
    
//     // Helper pour formater les nombres
//     handlebars.registerHelper('formatNumber', (value) => {
//       if (!value) return '';
//       return parseFloat(value).toFixed(2);
//     });
    
//     // Helper pour lookup dynamique
//     handlebars.registerHelper('lookup', (obj, key) => {
//       return obj && obj[key];
//     });

//     // Helper pour répéter une chaîne (pour les croix QBC)
//     handlebars.registerHelper('repeat', (str, count) => {
//       return str.repeat(count || 0);
//     });

//     // Helper pour joindre un tableau
//     handlebars.registerHelper('join', (array, separator = ', ') => {
//       if (!Array.isArray(array)) return '';
//       return array.join(separator);
//     });

//     // Helper conditionnel
//     handlebars.registerHelper('if_any', (...args) => {
//       const options = args.pop();
//       return args.some(arg => arg) ? options.fn(this) : options.inverse(this);
//     });
//   }

//   /**
//    * Enregistre les partials (composants réutilisables)
//    */
//   registerPartials() {
//     // =================================================================
//     // PARTIAL POUR TEST SIMPLE
//     // =================================================================
//     handlebars.registerPartial('SIMPLE_PARAMETER', `
//       <div class="test-result simple-parameter">
//         <div class="test-header">
//           <span class="test-bullet">•</span>
//           <span class="test-name">{{data.label}}</span>
//         </div>
//         <div class="test-content">
//           <div class="test-value-line">
//             <span class="test-value">{{data.value}}</span>
//             {{#if data.unit}}<span class="test-unit"> {{data.unit}}</span>{{/if}}
//             {{#if data.qualitative}}<span class="test-qualitative"> ({{data.qualitative}})</span>{{/if}}
//           </div>
//           {{#if data.reference}}
//             <div class="test-reference">Valeurs de référence : {{data.reference}}</div>
//           {{/if}}
//           {{#if data.method}}
//             <div class="test-method">Méthode : {{data.method}}</div>
//           {{/if}}
//           {{#if data.interpretation}}
//             <div class="test-interpretation">
//               <strong>Interprétation :</strong> {{data.interpretation}}
//             </div>
//           {{/if}}
//           {{#if data.remark}}
//             <div class="test-remark">
//               <strong>Remarque :</strong> {{data.remark}}
//             </div>
//           {{/if}}
//         </div>
//       </div>
//     `);

//     // =================================================================
//     // PARTIAL POUR GROUPE DE PARAMÈTRES
//     // =================================================================
//     handlebars.registerPartial('PARAMETER_GROUP', `
//       <div class="test-result parameter-group">
//         {{#if data.title}}<h3 class="group-title">{{data.title}}</h3>{{/if}}
        
//         <table class="parameters-table">
//           <thead>
//             <tr>
//               <th>Paramètre</th>
//               <th>Valeur</th>
//               <th>Unité</th>
//               <th>Valeurs de référence</th>
//             </tr>
//           </thead>
//           <tbody>
//             {{#each data.parameters}}
//               {{#if this.value}}
//               <tr>
//                 <td class="param-label">{{this.label}}</td>
//                 <td class="param-value">{{this.value}}</td>
//                 <td class="param-unit">{{this.unit}}</td>
//                 <td class="param-reference">{{this.reference}}</td>
//               </tr>
//               {{/if}}
//             {{/each}}
//           </tbody>
//         </table>
//       </div>
//     `);

//     // =================================================================
//     // PARTIAL POUR NFS COMPLEXE
//     // =================================================================
//     handlebars.registerPartial('NFS_COMPLEX_TABLE', `
//       <div class="test-result nfs-complex">
//         <h2 class="nfs-title">NUMÉRATION FORMULE SANGUINE (NFS)</h2>
//         <div class="nfs-reference-note">Valeurs de référence</div>
        
//         {{#if data.hematiesSection}}
//         <div class="nfs-section">
//           <h3 class="section-title">HÉMATIES ET CONSTANTES</h3>
//           <table class="nfs-table">
//             <thead>
//               <tr>
//                 <th>Paramètre</th>
//                 <th>Valeur</th>
//                 <th>Unité</th>
//                 <th>Référence</th>
//               </tr>
//             </thead>
//             <tbody>
//               {{#each data.hematiesSection}}
//               <tr>
//                 <td>{{this.label}}</td>
//                 <td class="nfs-value">{{this.value}}</td>
//                 <td>{{this.unit}}</td>
//                 <td>{{this.reference}}</td>
//               </tr>
//               {{/each}}
//             </tbody>
//           </table>
//         </div>
//         {{/if}}
        
//         {{#if data.leucocytesSection}}
//         <div class="nfs-section">
//           <h3 class="section-title">LEUCOCYTES ET FORMULE</h3>
//           <table class="nfs-table">
//             <thead>
//               <tr>
//                 <th>Paramètre</th>
//                 <th>%</th>
//                 <th>Valeur absolue</th>
//                 <th>Unité</th>
//                 <th>Référence</th>
//               </tr>
//             </thead>
//             <tbody>
//               {{#each data.leucocytesSection}}
//               <tr>
//                 <td>{{this.label}}</td>
//                 <td class="nfs-percentage">{{#if this.percentage}}{{this.percentage}}%{{/if}}</td>
//                 <td class="nfs-value">{{this.value}}</td>
//                 <td>{{this.unit}}</td>
//                 <td>{{this.reference}}</td>
//               </tr>
//               {{/each}}
//             </tbody>
//           </table>
//         </div>
//         {{/if}}

//         {{#if data.plaquettesSection}}
//         <div class="nfs-section">
//           <h3 class="section-title">PLAQUETTES</h3>
//           <table class="nfs-table">
//             <thead>
//               <tr>
//                 <th>Paramètre</th>
//                 <th>Valeur</th>
//                 <th>Unité</th>
//                 <th>Référence</th>
//               </tr>
//             </thead>
//             <tbody>
//               {{#each data.plaquettesSection}}
//               <tr>
//                 <td>{{this.label}}</td>
//                 <td class="nfs-value">{{this.value}}</td>
//                 <td>{{this.unit}}</td>
//                 <td>{{this.reference}}</td>
//               </tr>
//               {{/each}}
//             </tbody>
//           </table>
//         </div>
//         {{/if}}

//         {{#if data.autresSection}}
//         <div class="nfs-section">
//           <h3 class="section-title">AUTRES CELLULES</h3>
//           <table class="nfs-table">
//             <thead>
//               <tr>
//                 <th>Paramètre</th>
//                 <th>%</th>
//                 <th>Valeur absolue</th>
//                 <th>Unité</th>
//                 <th>Référence</th>
//               </tr>
//             </thead>
//             <tbody>
//               {{#each data.autresSection}}
//               <tr>
//                 <td>{{this.label}}</td>
//                 <td class="nfs-percentage">{{#if this.percentage}}{{this.percentage}}%{{/if}}</td>
//                 <td class="nfs-value">{{this.value}}</td>
//                 <td>{{this.unit}}</td>
//                 <td>{{this.reference}}</td>
//               </tr>
//               {{/each}}
//             </tbody>
//           </table>
//         </div>
//         {{/if}}
//       </div>
//     `);

//     // =================================================================
//     // PARTIAL POUR QBC/PARASITES
//     // =================================================================
//     handlebars.registerPartial('QBC_PARASITES', `
//       <div class="test-result qbc-results">
//         <h3 class="qbc-title">RECHERCHE DE PARASITES (QBC)</h3>
        
//         {{#if data.positivite}}
//         <div class="qbc-line">
//           <span class="qbc-label">Statut parasitaire :</span>
//           <span class="qbc-value">{{data.positivite}}</span>
//         </div>
//         {{/if}}
        
//         {{#if data.nombreCroix}}
//         <div class="qbc-line">
//           <span class="qbc-label">Niveau d'infestation :</span>
//           <span class="qbc-crosses">{{repeat "+" data.nombreCroix}}</span>
//         </div>
//         {{/if}}
        
//         {{#if data.densiteParasitaire}}
//         <div class="qbc-line">
//           <span class="qbc-label">Densité parasitaire :</span>
//           <span class="qbc-value">{{data.densiteParasitaire}} p/µL</span>
//         </div>
//         {{/if}}
        
//         {{#if data.especes}}
//         <div class="qbc-line">
//           <span class="qbc-label">Espèces :</span>
//           <span class="qbc-value">{{join data.especes}}</span>
//         </div>
//         {{/if}}
//       </div>
//     `);

//     // =================================================================
//     // PARTIAL POUR GROUPE SANGUIN
//     // =================================================================
//     handlebars.registerPartial('BLOOD_GROUP', `
//       <div class="test-result blood-group">
//         <h3 class="blood-title">GROUPE SANGUIN</h3>
        
//         {{#if data.abo}}
//         <div class="blood-line">
//           <span class="blood-label">Groupe ABO :</span>
//           <span class="blood-value">{{data.abo}}</span>
//         </div>
//         {{/if}}
        
//         {{#if data.rhesus}}
//         <div class="blood-line">
//           <span class="blood-label">Rhésus (Antigène D) :</span>
//           <span class="blood-value">{{data.rhesus}}</span>
//         </div>
//         {{/if}}
//       </div>
//     `);

//     // =================================================================
//     // PARTIAL POUR CULTURE ET ANTIBIOGRAMME
//     // =================================================================
//     handlebars.registerPartial('CULTURE_RESULTS', `
//       <div class="test-result culture-results">
//         <h3 class="culture-title">CULTURES SUR MILIEUX SPÉCIFIQUES</h3>
        
//         {{#if data.culture}}
//         <div class="culture-line">
//           <span class="culture-label">Culture :</span>
//           <span class="culture-value">{{data.culture}}</span>
//         </div>
//         {{/if}}
        
//         {{#if data.germes}}
//         <div class="culture-line">
//           <span class="culture-label">Germe(s) identifié(s) :</span>
//           <div class="germes-list">{{data.germes}}</div>
//         </div>
//         {{/if}}
        
//         {{#if data.description}}
//         <div class="culture-line">
//           <span class="culture-label">Numération :</span>
//           <span class="culture-value">{{data.description}}</span>
//         </div>
//         {{/if}}

//         {{#if data.antibiogrammes}}
//         <div class="antibiogrammes-section">
//           {{#each data.antibiogrammes}}
//           <div class="antibiogramme">
//             <h4 class="antibiogramme-title">ANTIBIOGRAMME : {{this.germe}}</h4>
//             <table class="antibiogramme-table">
//               <thead>
//                 <tr>
//                   <th>Antibiotique</th>
//                   <th>Sensibilité</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {{#each this.antibiotiques}}
//                 <tr>
//                   <td>{{this.nom}}</td>
//                   <td class="sensibilite-{{this.sensibilite}}">{{this.sensibilite}}</td>
//                 </tr>
//                 {{/each}}
//               </tbody>
//             </table>
//             <div class="antibiogramme-legend">
//               S : Sensible | I : Intermédiaire | R : Résistant
//             </div>
//           </div>
//           {{/each}}
//         </div>
//         {{/if}}
//       </div>
//     `);

//     // =================================================================
//     // PARTIAL POUR OBSERVATIONS DÉTAILLÉES
//     // =================================================================
//     handlebars.registerPartial('OBSERVATIONS_DETAILED', `
//       <div class="test-result observations-detailed">
//         <h3 class="observations-title">{{data.title}}</h3>
        
//         {{#if data.macroscopique}}
//         <div class="exam-section">
//           <h4 class="exam-subtitle">EXAMEN MACROSCOPIQUE</h4>
//           <div class="macroscopique-content">
//             {{#if data.typePrelevement}}
//             <span class="prelevement-type">{{data.typePrelevement}} :</span>
//             {{/if}}
//             <span class="macroscopique-value">{{join data.macroscopique}}</span>
//           </div>
//         </div>
//         {{/if}}
        
//         {{#if data.microscopique}}
//         <div class="exam-section">
//           <h4 class="exam-subtitle">EXAMEN CYTOLOGIQUE</h4>
//           <table class="microscopique-table">
//             {{#each data.microscopique}}
//             {{#if this.value}}
//             <tr>
//               <td class="microscopique-label">{{this.label}} :</td>
//               <td class="microscopique-value">{{this.value}}{{#if this.unit}}/{{this.unit}}{{/if}}</td>
//             </tr>
//             {{/if}}
//             {{/each}}
//           </table>
//         </div>
//         {{/if}}
        
//         {{#if data.chimie}}
//         <div class="exam-section">
//           <h4 class="exam-subtitle">CHIMIE</h4>
//           <table class="chimie-table">
//             {{#each data.chimie}}
//             {{#if this.value}}
//             <tr>
//               <td class="chimie-label">{{this.label}} :</td>
//               <td class="chimie-value">{{this.value}} {{this.unit}}</td>
//               {{#if this.reference}}
//               <td class="chimie-reference">({{this.reference}})</td>
//               {{/if}}
//             </tr>
//             {{/if}}
//             {{/each}}
//           </table>
//         </div>
//         {{/if}}
        
//         {{#if data.gram}}
//         <div class="exam-section">
//           <h4 class="exam-subtitle">EXAMEN BACTÉRIOLOGIQUE DIRECT (Coloration de Gram)</h4>
//           <div class="gram-result">
//             <span class="gram-label">Gram :</span>
//             <span class="gram-value">{{data.gram}}</span>
//           </div>
//         </div>
//         {{/if}}
        
//         {{#if data.conclusion}}
//         <div class="exam-section">
//           <h4 class="exam-subtitle">CONCLUSION</h4>
//           <div class="conclusion-content">{{data.conclusion}}</div>
//         </div>
//         {{/if}}
//       </div>
//     `);

//     // =================================================================
//     // PARTIAL POUR HGPO
//     // =================================================================
//     handlebars.registerPartial('HGPO_RESULTS', `
//       <div class="test-result hgpo-results">
//         <h3 class="hgpo-title">HYPERGLYCÉMIE PROVOQUÉE PAR VOIE ORALE (HGPO)</h3>
        
//         <table class="hgpo-table">
//           <thead>
//             <tr>
//               <th>Temps</th>
//               <th>Glycémie</th>
//               <th>Unité</th>
//             </tr>
//           </thead>
//           <tbody>
//             {{#if data.t0}}
//             <tr>
//               <td>T0 (à jeun)</td>
//               <td class="hgpo-value">{{data.t0}}</td>
//               <td>g/L</td>
//             </tr>
//             {{/if}}
//             {{#if data.t60}}
//             <tr>
//               <td>T60 (1h après charge)</td>
//               <td class="hgpo-value">{{data.t60}}</td>
//               <td>g/L</td>
//             </tr>
//             {{/if}}
//             {{#if data.t120}}
//             <tr>
//               <td>T120 (2h après charge)</td>
//               <td class="hgpo-value">{{data.t120}}</td>
//               <td>g/L</td>
//             </tr>
//             {{/if}}
//           </tbody>
//         </table>
//       </div>
//     `);
//   }

//   /**
//    * Extrait une valeur depuis un objet en utilisant un chemin (ex: "exceptions.nfs.gr.valeur")
//    */
//   extractValue(obj, path) {
//     if (!path || !obj) return null;
//     return path.split('.').reduce((current, key) => current?.[key], obj);
//   }

//   /**
//    * Prépare les données de vue selon les templates
//    */
//   async prepareViewData(analyse) {
//     const transformedResults = [];

//     for (const resultat of analyse.resultat) {
//       // Chercher le template pour ce test
//       const template = await ReportTemplate.findOne({
//         name: resultat.testId.nom
//       }).lean();

//       // Déterminer automatiquement le type de renderer basé sur les données
//       let rendererType;
//       let transformedData = {};

//       if (template) {
//         rendererType = template.renderer.type;
//       } else {
//         // Auto-détection du type basé sur les données présentes
//         rendererType = this.autoDetectRendererType(resultat);
//       }

//       // Traitement selon le type de renderer
//       switch (rendererType) {
//         case 'SIMPLE_PARAMETER':
//           transformedData = this.prepareSimpleParameterData(resultat, template);
//           break;

//         case 'PARAMETER_GROUP':
//           transformedData = this.prepareParameterGroupData(resultat, template);
//           break;

//         case 'NFS_COMPLEX_TABLE':
//           transformedData = this.prepareNFSData(resultat);
//           break;

//         case 'CULTURE_RESULTS':
//           transformedData = this.prepareCultureData(resultat);
//           break;

//         case 'QBC_PARASITES':
//           transformedData = this.prepareQBCData(resultat);
//           break;

//         case 'BLOOD_GROUP':
//           transformedData = this.prepareBloodGroupData(resultat);
//           break;

//         case 'OBSERVATIONS_DETAILED':
//           transformedData = this.prepareObservationsData(resultat);
//           break;

//         case 'HGPO_RESULTS':
//           transformedData = this.prepareHGPOData(resultat);
//           break;

//         default:
//           // Fallback vers test simple
//           rendererType = 'SIMPLE_PARAMETER';
//           transformedData = this.prepareSimpleParameterData(resultat, null);
//       }

//       transformedResults.push({
//         rendererType,
//         data: transformedData
//       });
//     }

//     return {
//       patient: {
//         nom: analyse.userId.nom,
//         prenom: analyse.userId.prenom,
//         dossier: analyse.identifiant,
//         age: this.calculateAge(analyse.userId.dateNaissance) || analyse.userId.age,
//         telephone: analyse.userId.telephone,
//         nip: analyse.userId.nip
//       },
//       resultats: transformedResults,
//       dateCreation: new Date(analyse.createdAt).toLocaleDateString('fr-FR'),
//       laboratoire: {
//         nom: "LABORATOIRE D'ANALYSES MÉDICALES",
//         adresse: "Rufisque Ouest, rond-point SOCABEG vers cité SIPRES",
//         telephone: "Tel. +221 78 601 09 09 / 33 836 99 98",
//         email: "contact@bioram.org"
//       }
//     };
//   }

//   /**
//    * Auto-détection du type de renderer basé sur les données
//    */
//   autoDetectRendererType(resultat) {
//     if (resultat.exceptions?.nfs) return 'NFS_COMPLEX_TABLE';
//     if (resultat.exceptions?.qbc) return 'QBC_PARASITES';
//     if (resultat.exceptions?.groupeSanguin) return 'BLOOD_GROUP';
//     if (resultat.exceptions?.hgpo) return 'HGPO_RESULTS';
//     if (resultat.exceptions?.ionogramme) return 'PARAMETER_GROUP';
//     if (resultat.culture?.germeIdentifie?.length > 0) return 'CULTURE_RESULTS';
//     if (resultat.observations?.macroscopique?.length > 0 || 
//         Object.values(resultat.observations?.microscopique || {}).some(v => v)) {
//       return 'OBSERVATIONS_DETAILED';
//     }
//     return 'SIMPLE_PARAMETER';
//   }

//   /**
//    * Prépare les données pour un test simple
//    */
//   prepareSimpleParameterData(resultat, template) {
//     return {
//       label: resultat.testId.nom,
//       value: resultat.valeur,
//       unit: template?.renderer?.config?.unit || resultat.testId.unite || '',
//       reference: template?.renderer?.config?.reference || resultat.testId.valeurMachineA || '',
//       qualitative: resultat.qualitatif || '',
//       method: resultat.methode || '',
//       interpretation: resultat.interpretation || '',
//       remark: resultat.remarque || ''
//     };
//   }

//   /**
//    * Prépare les données pour un groupe de paramètres
//    */
//   prepareParameterGroupData(resultat, template) {
//     if (!template) return {};

//     return {
//       title: template.renderer.config.title,
//       parameters: template.renderer.config.parameters.map(param => ({
//         ...param,
//         value: this.extractValue(resultat, param.key)
//       })).filter(param => param.value != null)
//     };
//   }

//   /**
//    * Prépare les données NFS complètes
//    */
//   prepareNFSData(resultat) {
//     const nfsData = resultat.exceptions?.nfs;
//     if (!nfsData) return {};

//     const data = {};

//     // Section hématies
//     if (nfsData.hematiesEtConstantes) {
//       const hematies = nfsData.hematiesEtConstantes;
//       data.hematiesSection = [
//         { label: 'Hématies', value: hematies.gr?.valeur, unit: hematies.gr?.unite, reference: hematies.gr?.reference },
//         { label: 'Hémoglobine', value: hematies.hgb?.valeur, unit: hematies.hgb?.unite, reference: hematies.hgb?.reference },
//         { label: 'Hématocrite', value: hematies.hct?.valeur, unit: hematies.hct?.unite, reference: hematies.hct?.reference },
//         { label: 'VGM', value: hematies.vgm?.valeur, unit: hematies.vgm?.unite, reference: hematies.vgm?.reference },
//         { label: 'TCMH', value: hematies.tcmh?.valeur, unit: hematies.tcmh?.unite, reference: hematies.tcmh?.reference },
//         { label: 'CCMH', value: hematies.ccmh?.valeur, unit: hematies.ccmh?.unite, reference: hematies.ccmh?.reference },
//         { label: 'IDR-CV', value: hematies.idr_cv?.valeur, unit: hematies.idr_cv?.unite, reference: hematies.idr_cv?.reference }
//       ].filter(item => item.value != null);
//     }

//     // Section leucocytes
//     if (nfsData.leucocytesEtFormules) {
//       const leucocytes = nfsData.leucocytesEtFormules;
      
//       // Leucocytes principaux
//       const mainLeukocytes = [
//         { label: 'Leucocytes', value: leucocytes.gb?.valeur, unit: leucocytes.gb?.unite, reference: leucocytes.gb?.reference },
//         { label: 'Neutrophiles', value: leucocytes.neut?.valeur, percentage: leucocytes.neut?.pourcentage, unit: leucocytes.neut?.unite, reference: leucocytes.neut?.referencePourcentage },
//         { label: 'Lymphocytes', value: leucocytes.lymph?.valeur, percentage: leucocytes.lymph?.pourcentage, unit: leucocytes.lymph?.unite, reference: leucocytes.lymph?.referencePourcentage },
//         { label: 'Monocytes', value: leucocytes.mono?.valeur, percentage: leucocytes.mono?.pourcentage, unit: leucocytes.mono?.unite, reference: leucocytes.mono?.referencePourcentage },
//         { label: 'Eosinophiles', value: leucocytes.eo?.valeur, percentage: leucocytes.eo?.pourcentage, unit: leucocytes.eo?.unite, reference: leucocytes.eo?.referencePourcentage },
//         { label: 'Basophiles', value: leucocytes.baso?.valeur, percentage: leucocytes.baso?.pourcentage, unit: leucocytes.baso?.unite, reference: leucocytes.baso?.referencePourcentage }
//       ].filter(item => item.value != null);

//       data.leucocytesSection = mainLeukocytes;

//       // Section plaquettes
//       if (leucocytes.plt?.valeur) {
//         data.plaquettesSection = [
//           { label: 'Plaquettes', value: leucocytes.plt.valeur, unit: leucocytes.plt.unite, reference: leucocytes.plt.reference }
//         ];
//       }

//       // Section autres cellules (blastes, etc.)
//       const autresCellules = [
//         { label: 'Proérythroblastes', value: leucocytes.proerythroblastes?.valeur, percentage: leucocytes.proerythroblastes?.pourcentage, unit: leucocytes.proerythroblastes?.unite, reference: leucocytes.proerythroblastes?.referencePourcentage },
//         { label: 'Erythroblastes', value: leucocytes.erythroblastes?.valeur, percentage: leucocytes.erythroblastes?.pourcentage, unit: leucocytes.erythroblastes?.unite, reference: leucocytes.erythroblastes?.referencePourcentage },
//         { label: 'Myéloblastes', value: leucocytes.myeloblastes?.valeur, percentage: leucocytes.myeloblastes?.pourcentage, unit: leucocytes.myeloblastes?.unite, reference: leucocytes.myeloblastes?.referencePourcentage },
//         { label: 'Promyélocytes', value: leucocytes.promyelocytes?.valeur, percentage: leucocytes.promyelocytes?.pourcentage, unit: leucocytes.promyelocytes?.unite, reference: leucocytes.promyelocytes?.referencePourcentage },
//         { label: 'Myélocytes', value: leucocytes.myelocytes?.valeur, percentage: leucocytes.myelocytes?.pourcentage, unit: leucocytes.myelocytes?.unite, reference: leucocytes.myelocytes?.referencePourcentage },
//         { label: 'Métamyélocytes', value: leucocytes.metamyelocytes?.valeur, percentage: leucocytes.metamyelocytes?.pourcentage, unit: leucocytes.metamyelocytes?.unite, reference: leucocytes.metamyelocytes?.referencePourcentage },
//         { label: 'Monoblastes', value: leucocytes.monoblastes?.valeur, percentage: leucocytes.monoblastes?.pourcentage, unit: leucocytes.monoblastes?.unite, reference: leucocytes.monoblastes?.referencePourcentage },
//         { label: 'Lymphoblastes', value: leucocytes.lymphoblastes?.valeur, percentage: leucocytes.lymphoblastes?.pourcentage, unit: leucocytes.lymphoblastes?.unite, reference: leucocytes.lymphoblastes?.referencePourcentage }
//       ].filter(item => item.value != null);

//       if (autresCellules.length > 0) {
//         data.autresSection = autresCellules;
//       }
//     }

//     return data;
//   }

//   /**
//    * Prépare les données de culture avec antibiogrammes
//    */
//   prepareCultureData(resultat) {
//     const culture = resultat.culture;
//     if (!culture) return {};

//     const data = {
//       culture: culture.culture,
//       description: culture.description,
//       germes: culture.germeIdentifie?.map(g => g.nom).join(', ') || ''
//     };

//     // Préparation des antibiogrammes
//     if (culture.germeIdentifie?.length > 0) {
//       data.antibiogrammes = culture.germeIdentifie
//         .filter(germe => germe.antibiogramme && Object.keys(germe.antibiogramme).length > 0)
//         .map(germe => ({
//           germe: germe.nom,
//           antibiotiques: Object.entries(germe.antibiogramme).map(([nom, sensibilite]) => ({
//             nom,
//             sensibilite
//           }))
//         }));
//     }

//     return data;
//   }

//   /**
//    * Prépare les données QBC
//    */
//   prepareQBCData(resultat) {
//     const qbc = resultat.exceptions?.qbc;
//     if (!qbc) return {};

//     return {
//       positivite: qbc.positivite,
//       nombreCroix: qbc.nombreCroix,
//       densiteParasitaire: qbc.densiteParasitaire,
//       especes: qbc.especes || []
//     };
//   }

//   /**
//    * Prépare les données de groupe sanguin
//    */
//   prepareBloodGroupData(resultat) {
//     const groupeSanguin = resultat.exceptions?.groupeSanguin;
//     if (!groupeSanguin) return {};

//     return {
//       abo: groupeSanguin.abo,
//       rhesus: groupeSanguin.rhesus
//     };
//   }

//   /**
//    * Prépare les données d'observations détaillées
//    */
//   prepareObservationsData(resultat) {
//     const obs = resultat.observations;
//     if (!obs) return {};

//     const data = {
//       title: `EXAMENS COMPLÉMENTAIRES - ${resultat.testId.nom}`,
//       typePrelevement: resultat.typePrelevement
//     };

//     // Macroscopique
//     if (obs.macroscopique?.length > 0) {
//       data.macroscopique = obs.macroscopique;
//     }

//     // Microscopique
//     if (obs.microscopique) {
//       const micro = obs.microscopique;
//       data.microscopique = [
//         { label: 'Leucocytes', value: micro.leucocytes, unit: micro.unite },
//         { label: 'Hématies', value: micro.hematies, unit: micro.unite },
//         { label: 'pH', value: micro.ph },
//         { label: 'Cellules épithéliales', value: micro.cellulesEpitheliales },
//         { label: 'Éléments levuriformes', value: micro.elementsLevuriforme },
//         { label: 'Filaments mycéliens', value: micro.filamentsMyceliens },
//         { label: 'Trichomonas vaginalis', value: micro.trichomonasVaginalis },
//         { label: 'Cristaux', value: micro.cristaux },
//         { label: 'Cylindres', value: micro.cylindres },
//         { label: 'Parasites', value: micro.parasites },
//         { label: 'Trichomonas intestinales', value: micro.trichomonasIntestinales },
//         { label: 'Œufs de Bilharzies', value: micro.oeufsDeBilharzies },
//         { label: 'Clue Cells', value: micro.clueCells },
//         { label: 'Gardnerella vaginalis', value: micro.gardnerellaVaginalis },
//         { label: 'Bacilles de Doderlein', value: micro.bacillesDeDoderlein },
//         { label: 'Type de Flore', value: micro.typeDeFlore },
//         { label: 'Recherche de Streptocoque B', value: micro.rechercheDeStreptocoqueB },
//         { label: 'Monocytes', value: micro.monocytes ? `${micro.monocytes}%` : null },
//         { label: 'Polynucléaires neutrophiles altérées', value: micro.polynucleairesNeutrophilesAlterees ? `${micro.polynucleairesNeutrophilesAlterees}%` : null },
//         { label: 'Polynucléaires neutrophiles non altérées', value: micro.polynucleairesNeutrophilesNonAlterees ? `${micro.polynucleairesNeutrophilesNonAlterees}%` : null },
//         { label: 'Éosinophiles', value: micro.eosinophiles ? `${micro.eosinophiles}%` : null },
//         { label: 'Basophiles', value: micro.basophiles ? `${micro.basophiles}%` : null }
//       ].filter(item => item.value && item.value.trim() !== '');
//     }

//     // Chimie
//     if (obs.chimie) {
//       const chimie = obs.chimie;
//       data.chimie = [
//         { label: 'Protéines Totales', value: chimie.proteinesTotales, unit: 'g/L' },
//         { label: 'Protéines Rachidiennes', value: chimie.proteinesArochies, unit: 'g/L', reference: '0,2-0,4' },
//         { label: 'Glycorachie', value: chimie.glycorachie, unit: 'g/L', reference: '0,2-0,4' },
//         { label: 'Acide Urique', value: chimie.acideUrique, unit: 'mg/L' },
//         { label: 'LDH', value: chimie.LDH, unit: 'U/I' }
//       ].filter(item => item.value && item.value.trim() !== '');
//     }

//     // Gram
//     if (resultat.gram) {
//       data.gram = resultat.gram;
//     }

//     // Conclusion
//     if (resultat.conclusion) {
//       data.conclusion = resultat.conclusion;
//     }

//     return data;
//   }

//   /**
//    * Prépare les données HGPO
//    */
//   prepareHGPOData(resultat) {
//     const hgpo = resultat.exceptions?.hgpo;
//     if (!hgpo) return {};

//     return {
//       t0: hgpo.t0,
//       t60: hgpo.t60,
//       t120: hgpo.t120
//     };
//   }

//   /**
//    * Calcule l'âge à partir de la date de naissance
//    */
//   calculateAge(dateNaissance) {
//     if (!dateNaissance) return null;
//     const today = new Date();
//     const birth = new Date(dateNaissance);
//     let age = today.getFullYear() - birth.getFullYear();
//     const m = today.getMonth() - birth.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
//       age--;
//     }
//     return age;
//   }

//   /**
//    * Compile le template principal avec un design amélioré
//    */
//   compileMainTemplate(viewData) {
//     const mainTemplate = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Résultats d'Analyse - {{patient.dossier}}</title>
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body { 
//             font-family: 'Times New Roman', serif; 
//             font-size: 11px;
//             line-height: 1.4;
//             color: #333;
//             background: #fff;
//           }
          
//           .page {
//             padding: 15mm;
//             min-height: 100vh;
//           }
          
//           /* ========== EN-TÊTE ========== */
//           .header {
//             text-align: center;
//             border-bottom: 2px solid #2c3e50;
//             padding-bottom: 15px;
//             margin-bottom: 25px;
//             background: linear-gradient(to right, #f8f9fa, #e9ecef);
//             padding: 20px;
//             border-radius: 8px;
//           }
          
//           .header h1 {
//             font-size: 18px;
//             font-weight: bold;
//             color: #2c3e50;
//             margin-bottom: 5px;
//           }
          
//           .header .subtitle {
//             font-size: 12px;
//             color: #7f8c8d;
//             margin-bottom: 8px;
//           }
          
//           .header .contact {
//             font-size: 9px;
//             color: #95a5a6;
//             line-height: 1.3;
//           }
          
//           /* ========== INFORMATIONS PATIENT ========== */
//           .patient-info {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 25px;
//             background: #f8f9fa;
//             padding: 15px;
//             border-radius: 6px;
//             border-left: 4px solid #3498db;
//           }
          
//           .patient-left, .patient-right {
//             width: 48%;
//           }
          
//           .patient-info p {
//             margin-bottom: 6px;
//             font-size: 11px;
//           }
          
//           .patient-info strong {
//             color: #2c3e50;
//             font-weight: bold;
//           }
          
//           /* ========== RÉSULTATS ========== */
//           .results {
//             margin-bottom: 30px;
//           }
          
//           .test-result {
//             margin-bottom: 20px;
//             page-break-inside: avoid;
//             background: #fff;
//             border: 1px solid #ecf0f1;
//             border-radius: 6px;
//             overflow: hidden;
//           }
          
//           /* ========== TEST SIMPLE ========== */
//           .simple-parameter {
//             padding: 15px;
//           }
          
//           .test-header {
//             display: flex;
//             align-items: center;
//             margin-bottom: 8px;
//           }
          
//           .test-bullet {
//             color: #3498db;
//             font-size: 14px;
//             font-weight: bold;
//             margin-right: 8px;
//           }
          
//           .test-name {
//             font-size: 12px;
//             font-weight: bold;
//             color: #2c3e50;
//           }
          
//           .test-content {
//             margin-left: 20px;
//           }
          
//           .test-value-line {
//             margin-bottom: 5px;
//           }
          
//           .test-value {
//             font-size: 13px;
//             font-weight: bold;
//             color: #27ae60;
//           }
          
//           .test-unit {
//             font-size: 10px;
//             color: #7f8c8d;
//           }
          
//           .test-qualitative {
//             font-size: 10px;
//             color: #8e44ad;
//             font-style: italic;
//           }
          
//           .test-reference,
//           .test-method {
//             font-size: 9px;
//             color: #95a5a6;
//             margin-bottom: 3px;
//           }
          
//           .test-interpretation,
//           .test-remark {
//             font-size: 10px;
//             margin-top: 8px;
//             padding: 8px;
//             background: #f8f9fa;
//             border-radius: 4px;
//           }
          
//           .test-interpretation {
//             border-left: 3px solid #f39c12;
//           }
          
//           .test-remark {
//             border-left: 3px solid #e67e22;
//           }
          
//           /* ========== TABLEAUX ========== */
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             margin: 10px 0;
//           }
          
//           th, td {
//             padding: 8px;
//             text-align: left;
//             border: 1px solid #bdc3c7;
//             font-size: 10px;
//           }
          
//           th {
//             background: #34495e;
//             color: white;
//             font-weight: bold;
//             text-align: center;
//           }
          
//           .parameters-table .param-value,
//           .nfs-value,
//           .hgpo-value {
//             font-weight: bold;
//             text-align: center;
//             color: #27ae60;
//           }
          
//           .nfs-percentage {
//             text-align: center;
//             color: #3498db;
//           }
          
//           /* ========== NFS ========== */
//           .nfs-complex {
//             padding: 15px;
//           }
          
//           .nfs-title {
//             font-size: 14px;
//             font-weight: bold;
//             color: #2c3e50;
//             text-align: center;
//             margin-bottom: 5px;
//           }
          
//           .nfs-reference-note {
//             text-align: center;
//             font-size: 9px;
//             color: #7f8c8d;
//             margin-bottom: 15px;
//           }
          
//           .nfs-section {
//             margin-bottom: 20px;
//           }
          
//           .section-title {
//             font-size: 12px;
//             font-weight: bold;
//             color: #34495e;
//             margin-bottom: 10px;
//             padding: 5px 0;
//             border-bottom: 1px solid #ecf0f1;
//           }
          
//           /* ========== GROUPE DE PARAMÈTRES ========== */
//           .parameter-group {
//             padding: 15px;
//           }
          
//           .group-title {
//             font-size: 13px;
//             font-weight: bold;
//             color: #2c3e50;
//             text-align: center;
//             margin-bottom: 15px;
//             padding: 8px;
//             background: #ecf0f1;
//             border-radius: 4px;
//           }
          
//           /* ========== QBC ========== */
//           .qbc-results {
//             padding: 15px;
//             background: #fef5e7;
//           }
          
//           .qbc-title {
//             font-size: 13px;
//             font-weight: bold;
//             color: #d68910;
//             margin-bottom: 15px;
//             text-align: center;
//           }
          
//           .qbc-line {
//             display: flex;
//             margin-bottom: 8px;
//             align-items: center;
//           }
          
//           .qbc-label {
//             min-width: 150px;
//             font-weight: bold;
//             color: #7d6608;
//           }
          
//           .qbc-value {
//             font-weight: bold;
//             color: #d68910;
//           }
          
//           .qbc-crosses {
//             font-size: 14px;
//             color: #e74c3c;
//             font-weight: bold;
//           }
          
//           /* ========== GROUPE SANGUIN ========== */
//           .blood-group {
//             padding: 15px;
//             background: #edf7fd;
//           }
          
//           .blood-title {
//             font-size: 13px;
//             font-weight: bold;
//             color: #2980b9;
//             margin-bottom: 15px;
//             text-align: center;
//           }
          
//           .blood-line {
//             display: flex;
//             margin-bottom: 8px;
//           }
          
//           .blood-label {
//             min-width: 180px;
//             font-weight: bold;
//             color: #1f4e79;
//           }
          
//           .blood-value {
//             font-size: 14px;
//             font-weight: bold;
//             color: #2980b9;
//           }
          
//           /* ========== CULTURE ========== */
//           .culture-results {
//             padding: 15px;
//             background: #f4f6f6;
//           }
          
//           .culture-title {
//             font-size: 13px;
//             font-weight: bold;
//             color: #5d6d7e;
//             margin-bottom: 15px;
//             text-align: center;
//           }
          
//           .culture-line {
//             display: flex;
//             margin-bottom: 8px;
//             align-items: flex-start;
//           }
          
//           .culture-label {
//             min-width: 150px;
//             font-weight: bold;
//             color: #34495e;
//           }
          
//           .culture-value {
//             font-weight: bold;
//             color: #5d6d7e;
//           }
          
//           .germes-list {
//             font-style: italic;
//             color: #8e44ad;
//           }
          
//           /* ========== ANTIBIOGRAMMES ========== */
//           .antibiogrammes-section {
//             margin-top: 15px;
//           }
          
//           .antibiogramme {
//             margin-bottom: 20px;
//             border: 1px solid #bdc3c7;
//             border-radius: 4px;
//             overflow: hidden;
//           }
          
//           .antibiogramme-title {
//             background: #34495e;
//             color: white;
//             padding: 8px;
//             margin: 0;
//             font-size: 11px;
//             text-align: center;
//           }
          
//           .antibiogramme-table {
//             margin: 0;
//           }
          
//           .antibiogramme-table th {
//             background: #7f8c8d;
//           }
          
//           .sensibilite-S {
//             background: #d5f4e6;
//             color: #27ae60;
//             font-weight: bold;
//             text-align: center;
//           }
          
//           .sensibilite-I {
//             background: #fdeaa7;
//             color: #f39c12;
//             font-weight: bold;
//             text-align: center;
//           }
          
//           .sensibilite-R {
//             background: #fadbd8;
//             color: #e74c3c;
//             font-weight: bold;
//             text-align: center;
//           }
          
//           .antibiogramme-legend {
//             background: #ecf0f1;
//             padding: 8px;
//             font-size: 9px;
//             text-align: center;
//             color: #5d6d7e;
//           }
          
//           /* ========== OBSERVATIONS ========== */
//           .observations-detailed {
//             padding: 15px;
//           }
          
//           .observations-title {
//             font-size: 13px;
//             font-weight: bold;
//             color: #2c3e50;
//             margin-bottom: 15px;
//             text-align: center;
//           }
          
//           .exam-section {
//             margin-bottom: 15px;
//           }
          
//           .exam-subtitle {
//             font-size: 11px;
//             font-weight: bold;
//             color: #34495e;
//             margin-bottom: 8px;
//             padding: 5px 0;
//             border-bottom: 1px solid #ecf0f1;
//           }
          
//           .macroscopique-content {
//             padding: 8px;
//             background: #f8f9fa;
//             border-radius: 4px;
//           }
          
//           .prelevement-type {
//             font-weight: bold;
//             color: #2c3e50;
//           }
          
//           .macroscopique-value {
//             color: #5d6d7e;
//           }
          
//           .microscopique-table,
//           .chimie-table {
//             margin: 8px 0;
//           }
          
//           .microscopique-table th,
//           .chimie-table th {
//             background: #95a5a6;
//             display: none;
//           }
          
//           .microscopique-label,
//           .chimie-label {
//             font-weight: bold;
//             color: #34495e;
//             min-width: 200px;
//           }
          
//           .microscopique-value,
//           .chimie-value {
//             color: #27ae60;
//             font-weight: bold;
//           }
          
//           .chimie-reference {
//             color: #7f8c8d;
//             font-size: 9px;
//           }
          
//           .gram-result {
//             display: flex;
//             padding: 8px;
//             background: #f8f9fa;
//             border-radius: 4px;
//           }
          
//           .gram-label {
//             font-weight: bold;
//             color: #34495e;
//             min-width: 80px;
//           }
          
//           .gram-value {
//             color: #8e44ad;
//             font-weight: bold;
//           }
          
//           .conclusion-content {
//             padding: 10px;
//             background: #e8f5e8;
//             border-radius: 4px;
//             border-left: 4px solid #27ae60;
//             font-weight: bold;
//             color: #1e7e34;
//           }
          
//           /* ========== HGPO ========== */
//           .hgpo-results {
//             padding: 15px;
//             background: #fdf2e9;
//           }
          
//           .hgpo-title {
//             font-size: 13px;
//             font-weight: bold;
//             color: #d35400;
//             margin-bottom: 15px;
//             text-align: center;
//           }
          
//           .hgpo-table th {
//             background: #e67e22;
//           }
          
//           /* ========== PIED DE PAGE ========== */
//           .footer {
//             margin-top: 40px;
//             text-align: center;
//             border-top: 2px solid #2c3e50;
//             padding-top: 15px;
//             font-size: 9px;
//             color: #7f8c8d;
//             background: #f8f9fa;
//             padding: 15px;
//             border-radius: 6px;
//           }
          
//           .footer-contact {
//             margin-bottom: 5px;
//           }
          
//           /* ========== RESPONSIVE ========== */
//           @media print {
//             .page {
//               padding: 10mm;
//             }
            
//             .test-result {
//               page-break-inside: avoid;
//             }
            
//             .antibiogramme {
//               page-break-inside: avoid;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="page">
//           <!-- EN-TÊTE -->
//           <div class="header">
//             <h1>{{laboratoire.nom}}</h1>
//             <div class="subtitle">Résultats d'Analyse Médicale</div>
//             <div class="contact">
//               <div>Hématologie – Immunohématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie</div>
//               <div>{{laboratoire.adresse}} | {{laboratoire.telephone}} | {{laboratoire.email}}</div>
//             </div>
//           </div>
          
//           <!-- INFORMATIONS PATIENT -->
//           <div class="patient-info">
//             <div class="patient-left">
//               <p><strong>Patient :</strong> {{patient.prenom}} {{patient.nom}}</p>
//               <p><strong>Dossier N° :</strong> {{patient.dossier}}</p>
//               {{#if patient.nip}}<p><strong>NIP :</strong> {{patient.nip}}</p>{{/if}}
//               {{#if patient.age}}<p><strong>Âge :</strong> {{patient.age}} ans</p>{{/if}}
//             </div>
//             <div class="patient-right">
//               <p><strong>Date d'analyse :</strong> {{dateCreation}}</p>
//               {{#if patient.telephone}}<p><strong>Téléphone :</strong> {{patient.telephone}}</p>{{/if}}
//               <p><strong>Statut :</strong> <span style="color: #27ae60; font-weight: bold;">Validé</span></p>
//             </div>
//           </div>
          
//           <!-- RÉSULTATS -->
//           <div class="results">
//             {{#each resultats}}
//               {{> (lookup . 'rendererType') data=this.data}}
//             {{/each}}
//           </div>
          
//           <!-- PIED DE PAGE -->
//           <div class="footer">
//             <div class="footer-contact">{{laboratoire.nom}} - {{laboratoire.telephone}}</div>
//             <div>Rapport généré automatiquement le {{dateCreation}}</div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const template = handlebars.compile(mainTemplate);
//     return template(viewData);
//   }

//   /**
//    * ✅ GÉNÈRE LE PDF AVEC PUPPETEER - VERSION CORRIGÉE
//    */
//   async generatePDF(html) {
//     let browser;
    
//     try {
//       console.log('🚀 Démarrage de Puppeteer...');
      
//       browser = await puppeteer.launch({
//         headless: 'new', // ✅ Nouvelle version headless
//         args: [
//           '--no-sandbox',
//           '--disable-setuid-sandbox',
//           '--disable-dev-shm-usage',
//           '--disable-accelerated-2d-canvas',
//           '--no-first-run',
//           '--no-zygote',
//           '--disable-gpu',
//           '--disable-web-security', // ✅ Ajouté pour éviter les problèmes CORS
//           '--disable-features=VizDisplayCompositor'
//         ]
//       });
      
//       console.log('✅ Browser Puppeteer lancé');
      
//       const page = await browser.newPage();
      
//       // ✅ Configuration de la page améliorée
//       await page.setViewport({ width: 1200, height: 1600 });
//       await page.setContent(html, { 
//         waitUntil: ['networkidle0', 'domcontentloaded'],
//         timeout: 30000
//       });
      
//       console.log('✅ Contenu HTML chargé');
      
//       // ✅ Génération du PDF avec options optimisées
//       const pdfBuffer = await page.pdf({
//         format: 'A4',
//         printBackground: true,
//         preferCSSPageSize: true,
//         margin: {
//           top: '15mm',
//           bottom: '15mm',
//           left: '12mm',
//           right: '12mm'
//         },
//         displayHeaderFooter: false,
//         // ✅ Options supplémentaires pour garantir la qualité
//         quality: 100,
//         omitBackground: false
//       });
      
//       console.log(`✅ PDF généré - Taille: ${pdfBuffer.length} bytes`);
      
//       return pdfBuffer;
      
//     } catch (error) {
//       console.error('❌ Erreur Puppeteer:', error);
//       throw error;
//     } finally {
//       if (browser) {
//         await browser.close();
//         console.log('✅ Browser Puppeteer fermé');
//       }
//     }
//   }
// }

// /**
//  * ✅ GÉNÈRE ET RENVOIE UN PDF POUR UNE ANALYSE - VERSION CORRIGÉE
//  */
// exports.generateAnalysePDF = asyncHandler(async (req, res) => {
//   try {
//     const { analyseId } = req.params;

//     // Validation de l'ID
//     if (!analyseId || !analyseId.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({
//         success: false,
//         message: 'ID d\'analyse invalide'
//       });
//     }

//     // Récupérer l'analyse avec tous les résultats et données utilisateur
//     const analyse = await Analyse.findById(analyseId)
//       .populate({
//         path: 'resultat',
//         populate: {
//           path: 'testId',
//           select: 'nom unite categories valeurMachineA valeurMachineB machineA machineB interpretationA interpretationB'
//         }
//       })
//       .populate('userId', 'nom prenom telephone dateNaissance age nip')
//       .lean();

//     if (!analyse) {
//       return res.status(404).json({
//         success: false,
//         message: 'Analyse non trouvée'
//       });
//     }

//     // Vérifier que l'analyse a des résultats
//     if (!analyse.resultat || analyse.resultat.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Aucun résultat trouvé pour cette analyse'
//       });
//     }

//     // Initialiser le moteur de rapport
//     const reportEngine = new ReportEngine();
    
//     // Préparer les données
//     const viewData = await reportEngine.prepareViewData(analyse);
    
//     // Compiler le HTML
//     const html = reportEngine.compileMainTemplate(viewData);
    
//     // Générer le PDF
//     const pdfBuffer = await reportEngine.generatePDF(html);

//     // ✅ CORRECTION: Vérifier que le PDF est valide
//     if (!pdfBuffer || pdfBuffer.length === 0) {
//       throw new Error('PDF généré est vide');
//     }

//     // Logs pour debugging
//     console.log(`✅ PDF généré avec succès pour l'analyse ${analyse.identifiant}`);
//     console.log(`📊 Nombre de résultats traités: ${analyse.resultat.length}`);
//     console.log(`📄 Taille du PDF: ${pdfBuffer.length} bytes`);

//     // ✅ CORRECTION: Headers HTTP corrects pour PDF
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Length', pdfBuffer.length);
//     res.setHeader('Content-Disposition', `inline; filename="analyse_${analyse.identifiant}_${new Date().toISOString().split('T')[0]}.pdf"`);
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
    
//     // ✅ CORRECTION: Envoyer le buffer directement
//     res.end(pdfBuffer);

//   } catch (error) {
//     console.error('❌ Erreur génération PDF:', error);
    
//     // Gestion spécifique des erreurs Puppeteer
//     if (error.message.includes('Protocol error') || error.message.includes('Target closed')) {
//       return res.status(500).json({
//         success: false,
//         message: 'Erreur de génération PDF - Ressources insuffisantes',
//         error: 'Puppeteer timeout'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la génération du PDF',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
//     });
//   }
// });

// /**
//  * Upload du PDF vers Cloudinary (optionnel)
//  */
// exports.generateAndUploadPDF = asyncHandler(async (req, res) => {
//   try {
//     const { analyseId } = req.params;
    
//     res.status(501).json({
//       success: false,
//       message: 'Fonctionnalité d\'upload Cloudinary en cours de développement'
//     });
    
//   } catch (error) {
//     console.error('❌ Erreur upload PDF:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de l\'upload du PDF',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
//     });
//   }
// });

// /**
//  * ✅ PRÉVISUALISER LE HTML AVANT GÉNÉRATION PDF
//  */
// exports.previewAnalyseHTML = asyncHandler(async (req, res) => {
//   try {
//     const { analyseId } = req.params;

//     const analyse = await Analyse.findById(analyseId)
//       .populate({
//         path: 'resultat',
//         populate: {
//           path: 'testId',
//           select: 'nom unite categories valeurMachineA valeurMachineB'
//         }
//       })
//       .populate('userId', 'nom prenom telephone dateNaissance age nip')
//       .lean();

//     if (!analyse) {
//       return res.status(404).json({
//         success: false,
//         message: 'Analyse non trouvée'
//       });
//     }

//     const reportEngine = new ReportEngine();
//     const viewData = await reportEngine.prepareViewData(analyse);
//     const html = reportEngine.compileMainTemplate(viewData);
    
//     // Renvoyer le HTML directement pour prévisualisation
//     res.set('Content-Type', 'text/html');
//     res.send(html);

//   } catch (error) {
//     console.error('❌ Erreur prévisualisation HTML:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la prévisualisation',
//       error: error.message
//     });
//   }
// });



const asyncHandler = require('express-async-handler');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs').promises;

// Modèles
const Analyse = require('../models/analyseModel');
const ReportTemplate = require('../models/reportTemplateModel'); // ← NOUVEAU

/**
 * Moteur de génération PDF amélioré avec templates configurables
 */
class ImprovedReportEngine {
  constructor() {
    this.registerHelpers();
    this.registerPartials();
  }

  /**
   * Enregistre les helpers Handlebars
   */
  registerHelpers() {
    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('exists', (value) => value != null && value !== '');
    handlebars.registerHelper('formatNumber', (value, decimals = 2) => {
      if (!value) return '';
      return parseFloat(value).toFixed(decimals);
    });
    handlebars.registerHelper('lookup', (obj, key) => {
      return this.extractValue(obj, key);
    });
    handlebars.registerHelper('repeat', (str, count) => {
      return str.repeat(count || 0);
    });
    handlebars.registerHelper('join', (array, separator = ', ') => {
      if (!Array.isArray(array)) return '';
      return array.join(separator);
    });
    handlebars.registerHelper('if_any', (...args) => {
      const options = args.pop();
      return args.some(arg => arg) ? options.fn(this) : options.inverse(this);
    });
    handlebars.registerHelper('and', (a, b) => a && b);
  }

  /**
   * Enregistre les partials dynamiques
   */
  registerPartials() {
    // Partial configurable pour test simple
    handlebars.registerPartial('SIMPLE_PARAMETER', `
      <div class="test-result simple-parameter">
        <div class="test-header">
          <span class="test-bullet">•</span>
          <span class="test-name">{{data.label}}</span>
        </div>
        <div class="test-content">
          {{#if (and config.simpleConfig.showValue data.value)}}
          <div class="test-value-line">
            <span class="test-value">{{data.value}}</span>
            {{#if (and config.simpleConfig.showUnit data.unit)}}
              <span class="test-unit"> {{data.unit}}</span>
            {{/if}}
            {{#if (and config.simpleConfig.showQualitative data.qualitative)}}
              <span class="test-qualitative"> ({{data.qualitative}})</span>
            {{/if}}
          </div>
          {{/if}}
          
          {{#if (and config.simpleConfig.showReference data.reference)}}
            <div class="test-reference">Valeurs de référence : {{data.reference}}</div>
          {{/if}}
          
          {{#if (and config.simpleConfig.showMethod data.method)}}
            <div class="test-method">Méthode : {{data.method}}</div>
          {{/if}}
          
          {{#if (and config.simpleConfig.showInterpretation data.interpretation)}}
            <div class="test-interpretation">
              <strong>Interprétation :</strong> {{data.interpretation}}
            </div>
          {{/if}}
        </div>
      </div>
    `);

    // Partial configurable pour groupe de paramètres
    handlebars.registerPartial('PARAMETER_GROUP', `
      <div class="test-result parameter-group">
        {{#if config.groupConfig.title}}
          <h3 class="group-title">{{config.groupConfig.title}}</h3>
        {{/if}}
        
        {{#if config.groupConfig.showTable}}
        <table class="parameters-table">
          <thead>
            <tr>
              <th>Paramètre</th>
              <th>Valeur</th>
              <th>Unité</th>
              <th>Valeurs de référence</th>
            </tr>
          </thead>
          <tbody>
            {{#each data.parameters}}
              {{#if this.value}}
              <tr>
                <td class="param-label">{{this.label}}</td>
                <td class="param-value">{{this.value}}</td>
                <td class="param-unit">{{this.unit}}</td>
                <td class="param-reference">{{this.reference}}</td>
              </tr>
              {{/if}}
            {{/each}}
          </tbody>
        </table>
        {{else}}
        <div class="parameters-list">
          {{#each data.parameters}}
            {{#if this.value}}
            <div class="param-line">
              <span class="param-label">{{this.label}} :</span>
              <span class="param-value">{{this.value}}</span>
              {{#if this.unit}}<span class="param-unit"> {{this.unit}}</span>{{/if}}
              {{#if this.reference}}<span class="param-reference"> ({{this.reference}})</span>{{/if}}
            </div>
            {{/if}}
          {{/each}}
        </div>
        {{/if}}
      </div>
    `);

    // GARDEZ TOUS VOS AUTRES PARTIALS EXISTANTS (NFS_COMPLEX_TABLE, QBC_PARASITES, etc.)
    // Copiez-les depuis votre fichier actuel (paste.txt)
    
    // ======= Copiez tout le contenu entre les lignes 65-400 de votre paste.txt =======
    handlebars.registerPartial('NFS_COMPLEX_TABLE', `
      <div class="test-result nfs-complex">
        <h2 class="nfs-title">NUMÉRATION FORMULE SANGUINE (NFS)</h2>
        <div class="nfs-reference-note">Valeurs de référence</div>
        
        {{#if data.hematiesSection}}
        <div class="nfs-section">
          <h3 class="section-title">HÉMATIES ET CONSTANTES</h3>
          <table class="nfs-table">
            <thead>
              <tr>
                <th>Paramètre</th>
                <th>Valeur</th>
                <th>Unité</th>
                <th>Référence</th>
              </tr>
            </thead>
            <tbody>
              {{#each data.hematiesSection}}
              <tr>
                <td>{{this.label}}</td>
                <td class="nfs-value">{{this.value}}</td>
                <td>{{this.unit}}</td>
                <td>{{this.reference}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
        {{/if}}
        
        {{#if data.leucocytesSection}}
        <div class="nfs-section">
          <h3 class="section-title">LEUCOCYTES ET FORMULE</h3>
          <table class="nfs-table">
            <thead>
              <tr>
                <th>Paramètre</th>
                <th>%</th>
                <th>Valeur absolue</th>
                <th>Unité</th>
                <th>Référence</th>
              </tr>
            </thead>
            <tbody>
              {{#each data.leucocytesSection}}
              <tr>
                <td>{{this.label}}</td>
                <td class="nfs-percentage">{{#if this.percentage}}{{this.percentage}}%{{/if}}</td>
                <td class="nfs-value">{{this.value}}</td>
                <td>{{this.unit}}</td>
                <td>{{this.reference}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
        {{/if}}

        {{#if data.plaquettesSection}}
        <div class="nfs-section">
          <h3 class="section-title">PLAQUETTES</h3>
          <table class="nfs-table">
            <thead>
              <tr>
                <th>Paramètre</th>
                <th>Valeur</th>
                <th>Unité</th>
                <th>Référence</th>
              </tr>
            </thead>
            <tbody>
              {{#each data.plaquettesSection}}
              <tr>
                <td>{{this.label}}</td>
                <td class="nfs-value">{{this.value}}</td>
                <td>{{this.unit}}</td>
                <td>{{this.reference}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
        {{/if}}

        {{#if data.autresSection}}
        <div class="nfs-section">
          <h3 class="section-title">AUTRES CELLULES</h3>
          <table class="nfs-table">
            <thead>
              <tr>
                <th>Paramètre</th>
                <th>%</th>
                <th>Valeur absolue</th>
                <th>Unité</th>
                <th>Référence</th>
              </tr>
            </thead>
            <tbody>
              {{#each data.autresSection}}
              <tr>
                <td>{{this.label}}</td>
                <td class="nfs-percentage">{{#if this.percentage}}{{this.percentage}}%{{/if}}</td>
                <td class="nfs-value">{{this.value}}</td>
                <td>{{this.unit}}</td>
                <td>{{this.reference}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
        {{/if}}
      </div>
    `);

    handlebars.registerPartial('QBC_PARASITES', `
      <div class="test-result qbc-results">
        <h3 class="qbc-title">RECHERCHE DE PARASITES (QBC)</h3>
        
        {{#if data.positivite}}
        <div class="qbc-line">
          <span class="qbc-label">Statut parasitaire :</span>
          <span class="qbc-value">{{data.positivite}}</span>
        </div>
        {{/if}}
        
        {{#if data.nombreCroix}}
        <div class="qbc-line">
          <span class="qbc-label">Niveau d'infestation :</span>
          <span class="qbc-crosses">{{repeat "+" data.nombreCroix}}</span>
        </div>
        {{/if}}
        
        {{#if data.densiteParasitaire}}
        <div class="qbc-line">
          <span class="qbc-label">Densité parasitaire :</span>
          <span class="qbc-value">{{data.densiteParasitaire}} p/µL</span>
        </div>
        {{/if}}
        
        {{#if data.especes}}
        <div class="qbc-line">
          <span class="qbc-label">Espèces :</span>
          <span class="qbc-value">{{join data.especes}}</span>
        </div>
        {{/if}}
      </div>
    `);

    handlebars.registerPartial('BLOOD_GROUP', `
      <div class="test-result blood-group">
        <h3 class="blood-title">GROUPE SANGUIN</h3>
        
        {{#if data.abo}}
        <div class="blood-line">
          <span class="blood-label">Groupe ABO :</span>
          <span class="blood-value">{{data.abo}}</span>
        </div>
        {{/if}}
        
        {{#if data.rhesus}}
        <div class="blood-line">
          <span class="blood-label">Rhésus (Antigène D) :</span>
          <span class="blood-value">{{data.rhesus}}</span>
        </div>
        {{/if}}
      </div>
    `);

    handlebars.registerPartial('HGPO_RESULTS', `
      <div class="test-result hgpo-results">
        <h3 class="hgpo-title">HYPERGLYCÉMIE PROVOQUÉE PAR VOIE ORALE (HGPO)</h3>
        
        <table class="hgpo-table">
          <thead>
            <tr>
              <th>Temps</th>
              <th>Glycémie</th>
              <th>Unité</th>
            </tr>
          </thead>
          <tbody>
            {{#if data.t0}}
            <tr>
              <td>T0 (à jeun)</td>
              <td class="hgpo-value">{{data.t0}}</td>
              <td>g/L</td>
            </tr>
            {{/if}}
            {{#if data.t60}}
            <tr>
              <td>T60 (1h après charge)</td>
              <td class="hgpo-value">{{data.t60}}</td>
              <td>g/L</td>
            </tr>
            {{/if}}
            {{#if data.t120}}
            <tr>
              <td>T120 (2h après charge)</td>
              <td class="hgpo-value">{{data.t120}}</td>
              <td>g/L</td>
            </tr>
            {{/if}}
          </tbody>
        </table>
      </div>
    `);

    // Ajoutez les autres partials : CULTURE_RESULTS, OBSERVATIONS_DETAILED
    // Copiez-les depuis votre paste.txt lignes 400-600
  }

  /**
   * Extrait une valeur depuis un objet en utilisant un chemin
   */
  extractValue(obj, path) {
    if (!path || !obj) return null;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Trouve le template approprié pour un test
   */
  async findTemplateForTest(resultat) {
    const testName = resultat.testId.nom;
    const category = resultat.testId.categories;
    
    // Déterminer les exceptions présentes
    const hasExceptions = [];
    if (resultat.exceptions) {
      Object.keys(resultat.exceptions).forEach(key => {
        if (resultat.exceptions[key] && Object.keys(resultat.exceptions[key]).length > 0) {
          hasExceptions.push(key);
        }
      });
    }
    
    const hasObservations = resultat.observations && 
      (resultat.observations.macroscopique?.length > 0 || 
       Object.values(resultat.observations.microscopique || {}).some(v => v));
    
    const hasCulture = resultat.culture && 
      (resultat.culture.culture || resultat.culture.germeIdentifie?.length > 0);

    // Chercher le template le plus approprié
    const template = await ReportTemplate.findTemplateForTest(
      testName, category, hasExceptions, hasObservations, hasCulture
    );

    return template;
  }

  /**
   * Auto-détection du type de renderer (FALLBACK si pas de template)
   */
  autoDetectRendererType(resultat) {
    if (resultat.exceptions?.nfs) return 'NFS_COMPLEX_TABLE';
    if (resultat.exceptions?.qbc) return 'QBC_PARASITES';
    if (resultat.exceptions?.groupeSanguin) return 'BLOOD_GROUP';
    if (resultat.exceptions?.hgpo) return 'HGPO_RESULTS';
    if (resultat.exceptions?.ionogramme) return 'PARAMETER_GROUP';
    if (resultat.culture?.germeIdentifie?.length > 0) return 'CULTURE_RESULTS';
    if (resultat.observations?.macroscopique?.length > 0 || 
        Object.values(resultat.observations?.microscopique || {}).some(v => v)) {
      return 'OBSERVATIONS_DETAILED';
    }
    return 'SIMPLE_PARAMETER';
  }

  /**
   * Prépare les données selon le template trouvé
   */
  async prepareViewData(analyse) {
    const transformedResults = [];

    for (const resultat of analyse.resultat) {
      // Trouver le template approprié
      const template = await this.findTemplateForTest(resultat);
      
      let rendererType = 'SIMPLE_PARAMETER'; // Fallback
      let config = {};
      
      if (template) {
        rendererType = template.renderer.type;
        config = template.renderer.config || {};
        console.log(`✅ Template trouvé: ${template.name} pour ${resultat.testId.nom}`);
      } else {
        // Auto-détection si pas de template
        rendererType = this.autoDetectRendererType(resultat);
        console.log(`⚠️ Pas de template, auto-détection: ${rendererType} pour ${resultat.testId.nom}`);
      }

      // Préparer les données selon le type de renderer
      let transformedData = {};
      
      switch (rendererType) {
        case 'SIMPLE_PARAMETER':
          transformedData = this.prepareSimpleParameterData(resultat, config);
          break;
        case 'PARAMETER_GROUP':
          transformedData = this.prepareParameterGroupData(resultat, config);
          break;
        case 'NFS_COMPLEX_TABLE':
          transformedData = this.prepareNFSData(resultat, config);
          break;
        case 'QBC_PARASITES':
          transformedData = this.prepareQBCData(resultat, config);
          break;
        case 'BLOOD_GROUP':
          transformedData = this.prepareBloodGroupData(resultat, config);
          break;
        case 'OBSERVATIONS_DETAILED':
          transformedData = this.prepareObservationsData(resultat, config);
          break;
        case 'CULTURE_RESULTS':
          transformedData = this.prepareCultureData(resultat, config);
          break;
        case 'HGPO_RESULTS':
          transformedData = this.prepareHGPOData(resultat, config);
          break;
        default:
          transformedData = this.prepareSimpleParameterData(resultat, {});
      }

      transformedResults.push({
        rendererType,
        data: transformedData,
        config: config
      });
    }

    return {
      patient: {
        nom: analyse.userId.nom,
        prenom: analyse.userId.prenom,
        dossier: analyse.identifiant,
        age: this.calculateAge(analyse.userId.dateNaissance) || analyse.userId.age,
        telephone: analyse.userId.telephone,
        nip: analyse.userId.nip
      },
      resultats: transformedResults,
      dateCreation: new Date(analyse.createdAt).toLocaleDateString('fr-FR'),
      laboratoire: {
        nom: "LABORATOIRE D'ANALYSES MÉDICALES",
        adresse: "Rufisque Ouest, rond-point SOCABEG vers cité SIPRES",
        telephone: "Tel. +221 78 601 09 09 / 33 836 99 98",
        email: "contact@bioram.org"
      }
    };
  }

  /**
   * Prépare les données pour un paramètre simple avec configuration
   */
  prepareSimpleParameterData(resultat, config) {
    const simpleConfig = config?.simpleConfig || {
      showValue: true,
      showUnit: true,
      showReference: true,
      showQualitative: true,
      valueFormat: 'decimal',
      valuePath: 'valeur',
      unitPath: 'testId.unite',
      referencePath: 'testId.valeurMachineA'
    };
    
    // Extraction dynamique selon la configuration
    const valuePath = simpleConfig.valuePath || 'valeur';
    const unitPath = simpleConfig.unitPath || 'testId.unite';
    const referencePath = simpleConfig.referencePath || 'testId.valeurMachineA';
    
    const value = this.extractValue(resultat, valuePath);
    const unit = this.extractValue(resultat, unitPath);
    const reference = this.extractValue(resultat, referencePath);
    
    return {
      label: resultat.testId.nom,
      value: this.formatValue(value, simpleConfig.valueFormat),
      unit: unit || '',
      reference: reference || '',
      qualitative: resultat.qualitatif || '',
      method: resultat.methode || '',
      interpretation: resultat.interpretation || '',
      remark: resultat.remarque || ''
    };
  }

  /**
   * Prépare les données pour un groupe de paramètres avec configuration
   */
  prepareParameterGroupData(resultat, config) {
    const groupConfig = config?.groupConfig;
    
    if (!groupConfig) {
      // Fallback pour ionogramme si pas de config
      return {
        title: 'IONOGRAMME',
        parameters: [
          { label: 'Sodium (Na+)', value: this.extractValue(resultat, 'exceptions.ionogramme.na'), unit: 'mEq/L', reference: '137-145' },
          { label: 'Potassium (K+)', value: this.extractValue(resultat, 'exceptions.ionogramme.k'), unit: 'mEq/L', reference: '3.5-5.0' },
          { label: 'Chlore (Cl-)', value: this.extractValue(resultat, 'exceptions.ionogramme.cl'), unit: 'mEq/L', reference: '98-107' },
          { label: 'Calcium (Ca2+)', value: this.extractValue(resultat, 'exceptions.ionogramme.ca'), unit: 'mg/L', reference: '8.5-10.5' },
          { label: 'Magnésium (Mg2+)', value: this.extractValue(resultat, 'exceptions.ionogramme.mg'), unit: 'mg/L', reference: '1.8-2.4' }
        ].filter(param => param.value != null && param.value !== '')
      };
    }
    
    return {
      title: groupConfig.title,
      parameters: groupConfig.parameters
        .map(param => ({
          label: param.label,
          value: this.formatValue(this.extractValue(resultat, param.key), param.format),
          unit: param.unit || '',
          reference: param.reference || ''
        }))
        .filter(param => param.value != null && param.value !== '')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    };
  }

  /**
   * GARDEZ TOUTES VOS AUTRES MÉTHODES EXISTANTES
   * Copiez depuis votre paste.txt : prepareNFSData, prepareQBCData, etc.
   */
  prepareNFSData(resultat, config) {
    const nfsData = resultat.exceptions?.nfs;
    if (!nfsData) return {};

    const data = {};

    // Section hématies
    if (nfsData.hematiesEtConstantes) {
      const hematies = nfsData.hematiesEtConstantes;
      data.hematiesSection = [
        { label: 'Hématies', value: hematies.gr?.valeur, unit: hematies.gr?.unite, reference: hematies.gr?.reference },
        { label: 'Hémoglobine', value: hematies.hgb?.valeur, unit: hematies.hgb?.unite, reference: hematies.hgb?.reference },
        { label: 'Hématocrite', value: hematies.hct?.valeur, unit: hematies.hct?.unite, reference: hematies.hct?.reference },
        { label: 'VGM', value: hematies.vgm?.valeur, unit: hematies.vgm?.unite, reference: hematies.vgm?.reference },
        { label: 'TCMH', value: hematies.tcmh?.valeur, unit: hematies.tcmh?.unite, reference: hematies.tcmh?.reference },
        { label: 'CCMH', value: hematies.ccmh?.valeur, unit: hematies.ccmh?.unite, reference: hematies.ccmh?.reference },
        { label: 'IDR-CV', value: hematies.idr_cv?.valeur, unit: hematies.idr_cv?.unite, reference: hematies.idr_cv?.reference }
      ].filter(item => item.value != null);
    }

    // Section leucocytes
    if (nfsData.leucocytesEtFormules) {
      const leucocytes = nfsData.leucocytesEtFormules;
      
      const mainLeukocytes = [
        { label: 'Leucocytes', value: leucocytes.gb?.valeur, unit: leucocytes.gb?.unite, reference: leucocytes.gb?.reference },
        { label: 'Neutrophiles', value: leucocytes.neut?.valeur, percentage: leucocytes.neut?.pourcentage, unit: leucocytes.neut?.unite, reference: leucocytes.neut?.referencePourcentage },
        { label: 'Lymphocytes', value: leucocytes.lymph?.valeur, percentage: leucocytes.lymph?.pourcentage, unit: leucocytes.lymph?.unite, reference: leucocytes.lymph?.referencePourcentage },
        { label: 'Monocytes', value: leucocytes.mono?.valeur, percentage: leucocytes.mono?.pourcentage, unit: leucocytes.mono?.unite, reference: leucocytes.mono?.referencePourcentage },
        { label: 'Eosinophiles', value: leucocytes.eo?.valeur, percentage: leucocytes.eo?.pourcentage, unit: leucocytes.eo?.unite, reference: leucocytes.eo?.referencePourcentage },
        { label: 'Basophiles', value: leucocytes.baso?.valeur, percentage: leucocytes.baso?.pourcentage, unit: leucocytes.baso?.unite, reference: leucocytes.baso?.referencePourcentage }
      ].filter(item => item.value != null);

      data.leucocytesSection = mainLeukocytes;

      if (leucocytes.plt?.valeur) {
        data.plaquettesSection = [
          { label: 'Plaquettes', value: leucocytes.plt.valeur, unit: leucocytes.plt.unite, reference: leucocytes.plt.reference }
        ];
      }

      // Section autres cellules
      const autresCellules = [
        { label: 'Proérythroblastes', value: leucocytes.proerythroblastes?.valeur, percentage: leucocytes.proerythroblastes?.pourcentage, unit: leucocytes.proerythroblastes?.unite, reference: leucocytes.proerythroblastes?.referencePourcentage },
        { label: 'Erythroblastes', value: leucocytes.erythroblastes?.valeur, percentage: leucocytes.erythroblastes?.pourcentage, unit: leucocytes.erythroblastes?.unite, reference: leucocytes.erythroblastes?.referencePourcentage },
        { label: 'Myéloblastes', value: leucocytes.myeloblastes?.valeur, percentage: leucocytes.myeloblastes?.pourcentage, unit: leucocytes.myeloblastes?.unite, reference: leucocytes.myeloblastes?.referencePourcentage },
        { label: 'Promyélocytes', value: leucocytes.promyelocytes?.valeur, percentage: leucocytes.promyelocytes?.pourcentage, unit: leucocytes.promyelocytes?.unite, reference: leucocytes.promyelocytes?.referencePourcentage },
        { label: 'Myélocytes', value: leucocytes.myelocytes?.valeur, percentage: leucocytes.myelocytes?.pourcentage, unit: leucocytes.myelocytes?.unite, reference: leucocytes.myelocytes?.referencePourcentage },
        { label: 'Métamyélocytes', value: leucocytes.metamyelocytes?.valeur, percentage: leucocytes.metamyelocytes?.pourcentage, unit: leucocytes.metamyelocytes?.unite, reference: leucocytes.metamyelocytes?.referencePourcentage },
        { label: 'Monoblastes', value: leucocytes.monoblastes?.valeur, percentage: leucocytes.monoblastes?.pourcentage, unit: leucocytes.monoblastes?.unite, reference: leucocytes.monoblastes?.referencePourcentage },
        { label: 'Lymphoblastes', value: leucocytes.lymphoblastes?.valeur, percentage: leucocytes.lymphoblastes?.pourcentage, unit: leucocytes.lymphoblastes?.unite, reference: leucocytes.lymphoblastes?.referencePourcentage }
      ].filter(item => item.value != null);

      if (autresCellules.length > 0) {
        data.autresSection = autresCellules;
      }
    }

    return data;
  }

  prepareQBCData(resultat, config) {
    const qbc = resultat.exceptions?.qbc;
    if (!qbc) return {};

    return {
      positivite: qbc.positivite,
      nombreCroix: qbc.nombreCroix,
      densiteParasitaire: qbc.densiteParasitaire,
      especes: qbc.especes || []
    };
  }

  prepareBloodGroupData(resultat, config) {
    const groupeSanguin = resultat.exceptions?.groupeSanguin;
    if (!groupeSanguin) return {};

    return {
      abo: groupeSanguin.abo,
      rhesus: groupeSanguin.rhesus
    };
  }

  prepareHGPOData(resultat, config) {
    const hgpo = resultat.exceptions?.hgpo;
    if (!hgpo) return {};

    return {
      t0: hgpo.t0,
      t60: hgpo.t60,
      t120: hgpo.t120
    };
  }

  prepareCultureData(resultat, config) {
    const culture = resultat.culture;
    if (!culture) return {};

    const data = {
      culture: culture.culture,
      description: culture.description,
      germes: culture.germeIdentifie?.map(g => g.nom).join(', ') || ''
    };

    if (culture.germeIdentifie?.length > 0) {
      data.antibiogrammes = culture.germeIdentifie
        .filter(germe => germe.antibiogramme && Object.keys(germe.antibiogramme).length > 0)
        .map(germe => ({
          germe: germe.nom,
          antibiotiques: Object.entries(germe.antibiogramme).map(([nom, sensibilite]) => ({
            nom,
            sensibilite
          }))
        }));
    }

    return data;
  }

  prepareObservationsData(resultat, config) {
    const obs = resultat.observations;
    if (!obs) return {};

    const data = {
      title: `EXAMENS COMPLÉMENTAIRES - ${resultat.testId.nom}`,
      typePrelevement: resultat.typePrelevement
    };

    if (obs.macroscopique?.length > 0) {
      data.macroscopique = obs.macroscopique;
    }

    if (obs.microscopique) {
      const micro = obs.microscopique;
      data.microscopique = [
        { label: 'Leucocytes', value: micro.leucocytes, unit: micro.unite },
        { label: 'Hématies', value: micro.hematies, unit: micro.unite },
        { label: 'pH', value: micro.ph },
        { label: 'Cellules épithéliales', value: micro.cellulesEpitheliales },
        { label: 'Éléments levuriformes', value: micro.elementsLevuriforme },
        { label: 'Filaments mycéliens', value: micro.filamentsMyceliens },
        { label: 'Trichomonas vaginalis', value: micro.trichomonasVaginalis },
        { label: 'Cristaux', value: micro.cristaux },
        { label: 'Cylindres', value: micro.cylindres },
        { label: 'Parasites', value: micro.parasites },
        { label: 'Trichomonas intestinales', value: micro.trichomonasIntestinales },
        { label: 'Œufs de Bilharzies', value: micro.oeufsDeBilharzies },
        { label: 'Clue Cells', value: micro.clueCells },
        { label: 'Gardnerella vaginalis', value: micro.gardnerellaVaginalis },
        { label: 'Bacilles de Doderlein', value: micro.bacillesDeDoderlein },
        { label: 'Type de Flore', value: micro.typeDeFlore },
        { label: 'Recherche de Streptocoque B', value: micro.rechercheDeStreptocoqueB }
      ].filter(item => item.value && item.value.trim() !== '');
    }

    if (obs.chimie) {
      const chimie = obs.chimie;
      data.chimie = [
        { label: 'Protéines Totales', value: chimie.proteinesTotales, unit: 'g/L' },
        { label: 'Protéines Rachidiennes', value: chimie.proteinesArochies, unit: 'g/L', reference: '0,2-0,4' },
        { label: 'Glycorachie', value: chimie.glycorachie, unit: 'g/L', reference: '0,2-0,4' },
        { label: 'Acide Urique', value: chimie.acideUrique, unit: 'mg/L' },
        { label: 'LDH', value: chimie.LDH, unit: 'U/I' }
      ].filter(item => item.value && item.value.trim() !== '');
    }

    if (resultat.gram) {
      data.gram = resultat.gram;
    }

    if (resultat.conclusion) {
      data.conclusion = resultat.conclusion;
    }

    return data;
  }

  /**
   * Formate une valeur selon le type spécifié
   */
  formatValue(value, format) {
    if (value == null || value === '') return value;
    
    switch (format) {
      case 'integer':
        return Math.round(parseFloat(value));
      case 'decimal':
        return parseFloat(value).toFixed(2);
      case 'text':
      default:
        return value;
    }
  }

  /**
   * Calcule l'âge à partir de la date de naissance
   */
  calculateAge(dateNaissance) {
    if (!dateNaissance) return null;
    const today = new Date();
    const birth = new Date(dateNaissance);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Compile le template principal (GARDEZ VOTRE CSS EXISTANT)
   */
  compileMainTemplate(viewData) {
    const mainTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Résultats d'Analyse - {{patient.dossier}}</title>
        <style>
          /* GARDEZ TOUT VOTRE CSS EXISTANT depuis paste.txt lignes 600-1000 */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Times New Roman', serif; 
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            background: #fff;
          }
          
          .page {
            padding: 15mm;
            min-height: 100vh;
          }
          
          /* ========== EN-TÊTE ========== */
          .header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 25px;
            background: linear-gradient(to right, #f8f9fa, #e9ecef);
            padding: 20px;
            border-radius: 8px;
          }
          
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          /* GARDEZ TOUT LE RESTE DE VOTRE CSS */
          /* ... */
        </style>
      </head>
      <body>
        <div class="page">
          <!-- EN-TÊTE -->
          <div class="header">
            <h1>{{laboratoire.nom}}</h1>
            <div class="subtitle">Résultats d'Analyse Médicale</div>
            <div class="contact">
              <div>Hématologie – Immunohématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie</div>
              <div>{{laboratoire.adresse}} | {{laboratoire.telephone}} | {{laboratoire.email}}</div>
            </div>
          </div>
          
          <!-- INFORMATIONS PATIENT -->
          <div class="patient-info">
            <div class="patient-left">
              <p><strong>Patient :</strong> {{patient.prenom}} {{patient.nom}}</p>
              <p><strong>Dossier N° :</strong> {{patient.dossier}}</p>
              {{#if patient.nip}}<p><strong>NIP :</strong> {{patient.nip}}</p>{{/if}}
              {{#if patient.age}}<p><strong>Âge :</strong> {{patient.age}} ans</p>{{/if}}
            </div>
            <div class="patient-right">
              <p><strong>Date d'analyse :</strong> {{dateCreation}}</p>
              {{#if patient.telephone}}<p><strong>Téléphone :</strong> {{patient.telephone}}</p>{{/if}}
              <p><strong>Statut :</strong> <span style="color: #27ae60; font-weight: bold;">Validé</span></p>
            </div>
          </div>
          
          <!-- RÉSULTATS -->
          <div class="results">
            {{#each resultats}}
              {{> (lookup . 'rendererType') data=this.data config=this.config}}
            {{/each}}
          </div>
          
          <!-- PIED DE PAGE -->
          <div class="footer">
            <div class="footer-contact">{{laboratoire.nom}} - {{laboratoire.telephone}}</div>
            <div>Rapport généré automatiquement le {{dateCreation}}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const template = handlebars.compile(mainTemplate);
    return template(viewData);
  }

  /**
   * Génère le PDF avec Puppeteer (GARDEZ VOTRE CODE EXISTANT)
   */
  async generatePDF(html) {
    let browser;
    
    try {
      console.log('🚀 Démarrage de Puppeteer...');
      
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      console.log('✅ Browser Puppeteer lancé');
      
      const page = await browser.newPage();
      
      await page.setViewport({ width: 1200, height: 1600 });
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });
      
      console.log('✅ Contenu HTML chargé');
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '15mm',
          bottom: '15mm',
          left: '12mm',
          right: '12mm'
        },
        displayHeaderFooter: false,
        quality: 100,
        omitBackground: false
      });
      
      console.log(`✅ PDF généré - Taille: ${pdfBuffer.length} bytes`);
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('❌ Erreur Puppeteer:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        console.log('✅ Browser Puppeteer fermé');
      }
    }
  }
}

/**
 * REMPLACE votre exports.generateAnalysePDF existant
 */
exports.generateAnalysePDF = asyncHandler(async (req, res) => {
  try {
    const { analyseId } = req.params;

    if (!analyseId || !analyseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'analyse invalide'
      });
    }

    // Récupérer l'analyse avec toutes les données
    const analyse = await Analyse.findById(analyseId)
      .populate({
        path: 'resultat',
        populate: {
          path: 'testId',
          select: 'nom unite categories valeurMachineA valeurMachineB machineA machineB interpretationA interpretationB'
        }
      })
      .populate('userId', 'nom prenom telephone dateNaissance age nip')
      .lean();

    if (!analyse) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    if (!analyse.resultat || analyse.resultat.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun résultat trouvé pour cette analyse'
      });
    }

    // Initialiser le moteur amélioré
    const reportEngine = new ImprovedReportEngine();
    
    // Préparer les données avec les templates
    const viewData = await reportEngine.prepareViewData(analyse);
    
    console.log(`📊 Templates utilisés pour ${analyse.resultat.length} résultats`);
    
    // Compiler le HTML
    const html = reportEngine.compileMainTemplate(viewData);
    
    // Générer le PDF
    const pdfBuffer = await reportEngine.generatePDF(html);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF généré est vide');
    }

    console.log(`✅ PDF généré avec succès pour l'analyse ${analyse.identifiant}`);

    // Renvoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="analyse_${analyse.identifiant}_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.end(pdfBuffer);

  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    
    if (error.message.includes('Protocol error') || error.message.includes('Target closed')) {
      return res.status(500).json({
        success: false,
        message: 'Erreur de génération PDF - Ressources insuffisantes',
        error: 'Puppeteer timeout'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// GARDEZ vos autres exports existants
exports.generateAndUploadPDF = asyncHandler(async (req, res) => {
  try {
    const { analyseId } = req.params;
    
    res.status(501).json({
      success: false,
      message: 'Fonctionnalité d\'upload Cloudinary en cours de développement'
    });
    
  } catch (error) {
    console.error('❌ Erreur upload PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

exports.previewAnalyseHTML = asyncHandler(async (req, res) => {
  try {
    const { analyseId } = req.params;

    const analyse = await Analyse.findById(analyseId)
      .populate({
        path: 'resultat',
        populate: {
          path: 'testId',
          select: 'nom unite categories valeurMachineA valeurMachineB'
        }
      })
      .populate('userId', 'nom prenom telephone dateNaissance age nip')
      .lean();

    if (!analyse) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    const reportEngine = new ImprovedReportEngine();
    const viewData = await reportEngine.prepareViewData(analyse);
    const html = reportEngine.compileMainTemplate(viewData);
    
    res.set('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('❌ Erreur prévisualisation HTML:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la prévisualisation',
      error: error.message
    });
  }
});