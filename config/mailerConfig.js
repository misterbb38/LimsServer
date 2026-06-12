// Configuration mailer via Resend (API HTTPS).
//
// Pourquoi Resend et plus de SMTP nodemailer ?
//   Render bloque les ports SMTP sortants (465, 587) sur les plans
//   gratuits/standards. L'envoi via API HTTPS contourne ce blocage et
//   est plus fiable.
//
// Vars d'env requises :
//   RESEND_API_KEY    : cle API generee sur resend.com (re_xxxxx)
//   SMTP_FROM_NAME    : nom affiche en expediteur (ex: "Laboratoire Bioram")
//   SMTP_USER         : adresse email expediteur (ex: contact@bioram.org)
//                       /!\ le domaine bioram.org DOIT etre verifie dans
//                       Resend (DNS SPF/DKIM) sinon les envois echouent.
//
// Le module exporte la meme interface qu'avant (fromAddress + sendMail
// helper) pour minimiser les changements dans le controller.

const { Resend } = require('resend');

const resendClient = new Resend(process.env.RESEND_API_KEY);

const fromAddress = () => {
  const name = process.env.SMTP_FROM_NAME || 'Laboratoire Bioram';
  const email = process.env.SMTP_USER || 'contact@bioram.org';
  return `${name} <${email}>`;
};

/**
 * Envoie un email transactionnel via Resend.
 *
 * @param {Object} opts
 * @param {string} opts.to       Adresse destinataire
 * @param {string} opts.replyTo  Reply-To (optionnel)
 * @param {string} opts.subject  Sujet du mail
 * @param {string} opts.text     Corps texte
 * @param {Array}  opts.attachments  [{ filename, content (Buffer), contentType }]
 * @returns {Promise<{id: string}>}
 */
const sendMail = async ({ to, replyTo, subject, text, attachments }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY manquant (env var)');
  }

  const result = await resendClient.emails.send({
    from: fromAddress(),
    to,
    reply_to: replyTo,
    subject,
    text,
    attachments: (attachments || []).map((a) => ({
      filename: a.filename,
      content: a.content, // Buffer attendu par Resend
    })),
  });

  if (result.error) {
    throw new Error(`Resend: ${result.error.message || JSON.stringify(result.error)}`);
  }
  return result.data || result;
};

// Verification au demarrage : check juste la presence de la cle.
// La validation reelle se fait au 1er envoi.
if (process.env.RESEND_API_KEY) {
  console.log('[Mail] Resend configure (cle presente)');
} else {
  console.warn('[Mail] RESEND_API_KEY non defini : les envois echoueront');
}

module.exports = { sendMail, fromAddress };
