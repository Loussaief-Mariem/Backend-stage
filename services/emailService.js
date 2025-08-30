const nodemailer = require("nodemailer");
const Email = require("../models/email.model");

// Création du transporteur Nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

exports.sendEmail = async (
  to,
  subject,
  html,
  attachments = [],
  template = "facture",
  relatedId = null
) => {
  try {
    if (!to)
      throw new Error(
        "Le destinataire 'to' est requis pour l'envoi de l'email"
      );

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);

    // Sauvegarde dans MongoDB - SEULEMENT si relatedId est fourni
    if (relatedId) {
      await Email.create({
        to,
        subject,
        template,
        relatedId,
        status: "sent",
        error: null,
      });
    }

    console.log("Email envoyé avec succès:", result.messageId);
    return result;
  } catch (error) {
    console.error("Erreur envoi email:", error);

    // Sauvegarde en échec - SEULEMENT si relatedId est fourni
    if (relatedId) {
      await Email.create({
        to,
        subject,
        template,
        relatedId,
        status: "failed",
        error: error.message,
      });
    }

    throw new Error(`Échec envoi email: ${error.message}`);
  }
};
