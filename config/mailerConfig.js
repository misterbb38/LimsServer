// Configuration SMTP nodemailer (IONOS).
// Les credentials sont lus via process.env :
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME
// Ne JAMAIS committer les valeurs reelles dans le code : elles vivent
// dans le .env (local + Render env vars en prod).
//
// IMPORTANT : sur Render, le port 465 (SMTPS implicite) est SOUVENT bloque
// dans certaines regions / plans. Privilegier 587 (STARTTLS) qui est plus
// largement autorise. Pour IONOS, les 2 ports sont supportes.

const nodemailer = require('nodemailer');

const port = parseInt(process.env.SMTP_PORT, 10) || 587;
// Port 465 => SSL implicite (secure: true), 587 => STARTTLS (secure: false)
const secure = port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ionos.fr',
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Timeouts explicites : sans ca, nodemailer attend ~2 minutes avant
  // d'echouer, ce qui fait timeout la requete cote utilisateur.
  connectionTimeout: 15_000,   // 15s pour ouvrir la connexion TCP
  greetingTimeout:   10_000,   // 10s pour le banner SMTP
  socketTimeout:     30_000,   // 30s sur le socket apres connexion
  // STARTTLS opportuniste si le port n'est pas en SSL implicite.
  requireTLS: !secure,
  tls: {
    // IONOS accepte les TLS modernes ; on ne force pas de min version
    // mais on garde la verification du certificat (defaut).
    minVersion: 'TLSv1.2',
  },
});

// Verification au demarrage : log le resultat sans bloquer le serveur.
// Utile pour reperer une mauvaise config plus tot que la 1ere tentative
// d'envoi reelle.
transporter
  .verify()
  .then(() => console.log('[SMTP] Connexion OK avec', process.env.SMTP_HOST, 'port', port))
  .catch((err) => console.warn('[SMTP] Echec verify :', err.message));

const fromAddress = () => {
  const name = process.env.SMTP_FROM_NAME || 'Laboratoire Bioram';
  const email = process.env.SMTP_USER || 'contact@bioram.org';
  return `"${name}" <${email}>`;
};

module.exports = { transporter, fromAddress };
