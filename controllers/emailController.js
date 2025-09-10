const Facture = require("../models/facture.model");
const Commande = require("../models/commande.model");

const LigneFacture = require("../models/ligneFacture.model");
const { sendEmail } = require("../services/emailService");
const LigneCommande = require("../models/ligneCommande.model");
const { generateFacturePDF } = require("../utils/pdfGenerator");
const mongoose = require("mongoose");

exports.sendFactureEmail = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { commandeId } = req.params;

    // Charger commande + client + utilisateur
    const commande = await Commande.findById(commandeId)
      .populate({
        path: "clientId",
        populate: { path: "utilisateurId" },
      })
      .session(session);

    if (!commande) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const client = commande.clientId;
    const utilisateur = client.utilisateurId;

    if (!utilisateur || !utilisateur.email) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Client ou email introuvable" });
    }

    // Vérifier si facture existe déjà
    let facture = await Facture.findOne({ commandeId }).session(session);

    // Si aucune facture, la créer + lignesFacture
    if (!facture) {
      const lignesCommande = await LigneCommande.find({
        commandeId,
        statut: "Active",
      })
        .populate("produitId")
        .session(session);

      if (lignesCommande.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Aucune ligne active trouvée" });
      }

      facture = new Facture({ commandeId });
      await facture.save({ session });

      const lignesFacture = lignesCommande.map((ligne) => ({
        factureId: facture._id,
        produitId: ligne.produitId._id,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        tvaProduit: ligne.produitId.TVA,
      }));

      await LigneFacture.insertMany(lignesFacture, { session });
    }

    // Charger la facture complète
    const factureComplete = await Facture.findById(facture._id)
      .populate("commandeId")
      .populate({
        path: "lignesFacture",
        populate: { path: "produitId" },
      })
      .session(session);

    // Générer PDF
    const pdfBuffer = await generateFacturePDF(
      factureComplete,
      commande,
      client,
      factureComplete.lignesFacture
    );

    // Générer HTML email avec ton style exact
    const emailHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background-color: #FDF2F8;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 700px;
      margin: 40px auto;
      background-color: #ffffff;
      border: 1px solid #F47AB7;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: #FDF2F8;
      padding: 20px;
      border-bottom: 2px solid #F47AB7;
      display: flex;
      align-items: center;
    }
    .header img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 20px;
    }
    .header-text {
      flex-grow: 1;
      text-align: left;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      color: #F47AB7;
    }
    .subheader {
      font-size: 14px;
      color: #666666;
      margin-top: 5px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #F47AB7;
      margin-bottom: 10px;
      border-bottom: 2px solid #F47AB7;
      padding-bottom: 5px;
    }
    .section p {
      margin: 5px 0;
      font-size: 14px;
      color: #333333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #F47AB7;
      padding: 12px;
      font-size: 14px;
      text-align: left;
    }
    th {
      background-color: #FDF2F8;
      font-weight: 600;
      color: #333333;
    }
    .total {
      font-size: 16px;
      font-weight: 600;
      text-align: right;
      margin-top: 20px;
      color: #F47AB7;
    }
    .footer {
      background-color: #FDF2F8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      border-top: 1px solid #F47AB7;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://res.cloudinary.com/dx90dxjb0/image/upload/v1754422758/Capture_d_%C3%A9cran_2025-08-05_203339_tx4rmd.png" alt="Nawara Logo" />
      <div class="header-text">
        <h1>Facture ${factureComplete.numFact}</h1>
        <p class="subheader">Émise le ${new Date(
          factureComplete.createdAt
        ).toLocaleDateString("fr-FR")}</p>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Infos entreprise -->
      <div class="section">
        <h2>Nawara</h2>
        <p>Vente de produits cosmétiques</p>
        <p>Adresse : Sfax, Route Gremda Km 10</p>
        <p>Téléphone : +216 44 123 432</p>
        <p>Email : contact@nawara.tn</p>
      </div>

      <!-- Infos client -->
      <div class="section">
        <h2>Client</h2>
        <p>${utilisateur.nom} ${utilisateur.prenom}</p>
        <p>Adresse : ${client.adresse || "Non spécifiée"}</p>
        <p>Téléphone : ${client.telephone || "Non spécifié"}</p>
        <p>Email : ${utilisateur.email}</p>
      </div>

      <!-- Détails commande -->
      <div class="section">
        <h2>Détails de la commande : ${commande.numcmd}</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>TVA</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${factureComplete.lignesFacture
              .map(
                (ligne) => `
              <tr>
                <td>${ligne.produitId.nom}</td>
                <td>${ligne.quantite}</td>
                <td>${ligne.prixUnitaire.toFixed(3)} TND</td>
                <td>${ligne.tvaProduit}%</td>
                <td>${(ligne.quantite * ligne.prixUnitaire).toFixed(3)} TND</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p class="total">Total à payer : ${commande.total.toFixed(3)} TND</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Merci pour votre confiance.</p>
      <p>&copy; Nawara - ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
`;

    // Envoyer email avec PDF en pièce jointe
    await sendEmail(
      utilisateur.email,
      `Votre facture ${factureComplete.numFact} - Commande ${commande.numcmd}`,
      emailHTML,
      [
        {
          filename: `facture-${factureComplete.numFact}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
      "facture",
      factureComplete._id
    );

    // Mettre facture à jour
    factureComplete.estEnvoyee = true;
    factureComplete.dateEnvoi = new Date();
    await factureComplete.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: "Facture générée et envoyée par email avec succès",
      factureId: factureComplete._id,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur lors de l'envoi de la facture:", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi de la facture",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
