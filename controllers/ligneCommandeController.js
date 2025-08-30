const LigneCommande = require("../models/ligneCommande.model");

// GET : Récupérer toutes les lignes de commande
exports.getAllLignesCommande = async (req, res) => {
  try {
    const lignes = await LigneCommande.find()
      .populate("commandeId")
      .populate("produitId");
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// GET : Récupérer une ligne de commande par ID
exports.getLigneCommandeById = async (req, res) => {
  try {
    const ligne = await LigneCommande.findById(req.params.id)
      .populate("commandeId")
      .populate("produitId");
    if (!ligne)
      return res.status(404).json({ message: "Ligne commande non trouvée" });
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// PUT : Mettre à jour une ligne de commande
exports.updateLigneCommande = async (req, res) => {
  try {
    const ligne = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!ligne)
      return res.status(404).json({ message: "Ligne commande non trouvée" });
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// DELETE : Supprimer une ligne de commande
// Annuler une ligne de commande

exports.annulerLigneCommande = async (req, res) => {
  try {
    const { commandeId, numLigne } = req.params;

    // Trouver et annuler la ligne
    const ligneModifiee = await LigneCommande.findOneAndUpdate(
      { commandeId, numLigne, statut: "Active" },
      { statut: "Annulé", numLigne: null },
      { new: true }
    );

    if (!ligneModifiee) {
      return res
        .status(404)
        .json({ message: "Ligne non trouvée ou déjà annulée" });
    }

    //  Récupérer lignes actives et réorganiser numéros
    const lignesActives = await LigneCommande.find({
      commandeId,
      statut: "Active",
    }).sort({ numLigne: 1 });

    for (let i = 0; i < lignesActives.length; i++) {
      lignesActives[i].numLigne = i + 1;
      await lignesActives[i].save();
    }

    res.status(200).json({
      message: "Ligne annulée et numéros réorganisés.",
      ligne: ligneModifiee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'annulation",
      error: error.message,
    });
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
exports.getLignesCommandeActives = async (req, res) => {
  try {
    const lignesActives = await LigneCommande.find({ statut: "Active" })
      .populate("commandeId")
      .populate("produitId");

    if (lignesActives.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune ligne commande active trouvée" });
    }

    res.status(200).json(lignesActives);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};
