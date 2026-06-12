// Configuration SMTP nodemailer (IONOS).
// Les credentials sont lus via process.env :
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME
// Ne JAMAIS committer les valeurs reelles dans le code : elles vivent
// dans le .env (local + Render env vars en prod).

const nodemailer = require('nodemailer');

const port = parseInt(process.env.SMTP_PORT, 10) || 465;
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
});

const fromAddress = () => {
  const name = process.env.SMTP_FROM_NAME || 'Laboratoire Bioram';
  const email = process.env.SMTP_USER || 'contact@bioram.org';
  return `"${name}" <${email}>`;
};

module.exports = { transporter, fromAddress };
