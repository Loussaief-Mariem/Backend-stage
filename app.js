const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

//categorie
const categorieRouter = require("./routes/categorie.route");
const utilisateurRouter = require("./routes/utilisateur.route");
const clientRoutes = require("./routes/client.route");
const produitRouter = require("./routes/produit.route");
const contactRoutes = require("./routes/contactRoutes");
const panierRoutes = require("./routes/panier.routes");
const lignePanierRoutes = require("./routes/lignePanier.route");
const commandeRoutes = require("./routes/commande.routes");
const ligneCommandeRoutes = require("./routes/ligneCommande.route");
const factureRoutes = require("./routes/facture.routes");
const ligneFactureRoutes = require("./routes/ligneFacture.routes");
const emailRoutes = require("./routes/email.routes");
const authRouter = require("./routes/auth.route");
const headerRouter = require("./routes/header.route");
app.use("/api/categories", categorieRouter);
app.use("/api/utilisateurs", utilisateurRouter);
app.use("/api/clients", clientRoutes);
app.use("/api/produits", produitRouter);
app.use("/api/contacts", contactRoutes);
app.use("/api/paniers", panierRoutes);
app.use("/api/ligne-panier", lignePanierRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/ligne_commandes", ligneCommandeRoutes);
app.use("/api/factures", factureRoutes);
app.use("/api/ligne_factures", ligneFactureRoutes);
app.use("/api/email", emailRoutes);

app.use("/api/auth", authRouter);
app.use("/api/headers", headerRouter);

//dist reactjs
app.use(express.static(path.join(__dirname, "./client/build")));
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

module.exports = app;
