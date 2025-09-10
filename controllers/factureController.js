const Facture = require("../models/facture.model");
const LigneFacture = require("../models/ligneFacture.model");
const Commande = require("../models/commande.model");
const LigneCommande = require("../models/ligneCommande.model");
exports.creerFacture = async (req, res) => {
  try {
    const { commandeId } = req.body;

    // Vérifier la commande
    const commande = await Commande.findById(commandeId);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (commande.statut === "Annulé") {
      return res.status(400).json({
        message: "Impossible de créer une facture pour une commande annulée",
      });
    }

    const factureExistante = await Facture.findOne({ commandeId });
    if (factureExistante) {
      return res.status(400).json({
        message: "Une facture existe déjà pour cette commande",
        factureId: factureExistante._id,
      });
    }

    // Récupérer les lignes de commande actives
    const lignesCommande = await LigneCommande.find({
      commandeId,
      statut: "Active",
    }).populate("produitId");

    if (lignesCommande.length === 0) {
      return res.status(400).json({ message: "Aucune ligne active trouvée" });
    }

    // Créer la facture
    const nouvelleFacture = await Facture.create({ commandeId });

    // Associer la facture à la commande
    commande.factureId = nouvelleFacture._id;
    await commande.save();

    // Créer les lignes facture
    const lignesFacture = lignesCommande.map((ligne) => ({
      factureId: nouvelleFacture._id,
      produitId: ligne.produitId,
      quantite: ligne.quantite,
      prixUnitaire: ligne.prixUnitaire,
      tvaProduit: ligne.produitId.TVA,
    }));

    await LigneFacture.insertMany(lignesFacture);

    // Charger facture complète
    const factureComplete = await Facture.findById(nouvelleFacture._id)
      .populate("commandeId")
      .populate("lignesFacture");

    res.status(201).json({
      message: "Facture créée avec succès",
      facture: factureComplete,
      lignesFacture,
    });
  } catch (error) {
    console.error("Erreur création facture:", error);
    res.status(500).json({ message: error.message });
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// GET toutes les factures
exports.getFactures = async (req, res) => {
  try {
    const factures = await Facture.find().sort({ createdAt: -1 });
    res.status(200).json(factures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// GET facture par ID
exports.getFactureById = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
exports.updateFacture = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Mettre à jour uniquement les champs envoyés dans le body
    Object.keys(req.body).forEach((key) => {
      facture[key] = req.body[key];
    });

    const factureMiseAJour = await facture.save();

    res.status(200).json({
      message: "Facture mise à jour avec succès",
      facture: factureMiseAJour,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// DELETE
exports.annulerFacture = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Mettre le statut à Annulé
    facture.statut = "Annulé";
    await facture.save();

    res.status(200).json({ message: "Facture annulée avec succès", facture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
