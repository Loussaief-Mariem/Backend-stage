const PDFDocument = require("pdfkit");
const https = require("https");

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Échec du téléchargement, code: ${response.statusCode}`)
          );
          return;
        }
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
};

exports.generateFacturePDF = async (
  facture,
  commande,
  client,
  lignesFacture
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      /** ---------------- HEADER ---------------- **/
      doc.rect(0, 0, doc.page.width, 100).fill("#FDF2F8").fillColor("black");

      try {
        const logoBuffer = await downloadImage(
          "https://res.cloudinary.com/dx90dxjb0/image/upload/v1754422758/Capture_d_%C3%A9cran_2025-08-05_203339_tx4rmd.png"
        );
        doc.image(logoBuffer, 50, 20, { width: 60 });
      } catch {
        doc.fontSize(12).text("Nawara", 50, 40);
      }

      doc
        .fontSize(20)
        .fillColor("black")
        .text(`Facture ${facture.numFact}`, 130, 35);
      doc
        .fontSize(12)
        .text(
          `Date: ${new Date(facture.createdAt).toLocaleDateString("fr-FR")}`,
          130,
          65
        );

      /** ---------------- ENTREPRISE ---------------- **/
      doc.moveDown(3);
      doc
        .fontSize(12)
        .fillColor("black")
        .text("Nawara - Vente de produits cosmétiques", 50, 130);
      doc.fontSize(10).text("Adresse : Sfax, Route Gremda Km 10", 50, 145);
      doc.text("Téléphone: +216 44 123 432", 50, 160);
      doc.text("Email: contact@nawara.tn", 50, 175);

      /** ---------------- CLIENT ---------------- **/
      const utilisateur = client.utilisateurId || client.utilisateur || {};
      doc.fontSize(12).fillColor("black").text("Informations Client", 300, 130);
      doc.fontSize(10);
      doc.text(
        `Nom: ${utilisateur.nom || ""} ${utilisateur.prenom || ""}`,
        300,
        150
      );
      doc.text(`Adresse: ${client.adresse || "Non spécifiée"}`, 300, 165);
      doc.text(`Téléphone: ${client.telephone || "Non spécifié"}`, 300, 180);
      doc.text(`Email: ${utilisateur.email || "Non spécifié"}`, 300, 195);

      /** ---------------- COMMANDE ---------------- **/
      doc.moveDown(5);
      doc
        .fontSize(14)
        .text(`Commande: ${commande.numcmd}`, 50, doc.y + 10, {
          underline: true,
        });

      // Tableau
      doc.moveDown(1);
      let yPosition = doc.y;
      doc.fontSize(11).font("Helvetica-Bold");

      // Colonnes
      const colProduitX = 50;
      const colQuantiteX = 250;
      const colPrixX = 330;
      const colTotalX = 430;

      // En-tête
      doc.text("Produit", colProduitX, yPosition, { width: 180 });
      doc.text("Quantité", colQuantiteX, yPosition);
      doc.text("Prix unitaire", colPrixX, yPosition);
      doc.text("Total", colTotalX, yPosition);

      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

      // Produits
      doc.font("Helvetica").fontSize(9);
      lignesFacture.forEach((ligne) => {
        const produitNom = ligne.produitId.nom;
        const textHeight = doc.heightOfString(produitNom, { width: 180 });

        yPosition += textHeight + 5;

        doc.text(produitNom, colProduitX, yPosition - textHeight, {
          width: 180,
        });
        doc.text(
          ligne.quantite.toString(),
          colQuantiteX,
          yPosition - textHeight
        );
        doc.text(
          `${ligne.prixUnitaire.toFixed(3)} TND`,
          colPrixX,
          yPosition - textHeight
        );
        doc.text(
          `${(ligne.quantite * ligne.prixUnitaire).toFixed(3)} TND`,
          colTotalX,
          yPosition - textHeight
        );
      });

      /** ---------------- TOTAL ---------------- **/
      yPosition += 40;
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text(`Total: ${commande.total.toFixed(3)} TND`, colTotalX, yPosition);

      /** ---------------- FOOTER ---------------- **/
      doc.fontSize(10).font("Helvetica").fillColor("gray");
      const footerY = doc.page.height - 80;
      doc.text("Merci pour votre confiance !", 50, footerY, {
        align: "center",
        width: 500,
      });
      doc.text(`Nawara - ${new Date().getFullYear()}`, 50, footerY + 15, {
        align: "center",
        width: 500,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
