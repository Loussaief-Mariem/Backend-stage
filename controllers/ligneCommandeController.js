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

// GET : Récupérer une ligne de commande par ID
exports.getLigneCommandeById = async (req, res) => {
  try {
    const ligne = await LigneCommande.findById(req.params.id)
      .populate("commandeId")
      .populate("produitId");
    if (!ligne) {
      return res.status(404).json({ message: "Ligne commande non trouvée" });
    }
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

// PUT : Mettre à jour une ligne de commande
exports.updateLigneCommande = async (req, res) => {
  try {
    const ligne = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ligne) {
      return res.status(404).json({ message: "Ligne commande non trouvée" });
    }
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};

// DELETE : Annuler une ligne de commande (par ID)
exports.annulerLigneCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const ligneModifiee = await LigneCommande.findOneAndUpdate(
      { _id: id, statut: "Active" },
      { statut: "Annulé" },
      { new: true }
    );

    if (!ligneModifiee) {
      return res
        .status(404)
        .json({ message: "Ligne non trouvée ou déjà annulée" });
    }

    res.status(200).json({
      message: "Ligne annulée avec succès.",
      ligne: ligneModifiee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'annulation",
      error: error.message,
    });
  }
};

// GET : Récupérer toutes les lignes actives
exports.getLignesCommandeActives = async (req, res) => {
  try {
    const lignesActives = await LigneCommande.find({ statut: "Active" })
      .populate("commandeId")
      .populate("produitId");

    res.status(200).json(lignesActives);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des lignes actives",
      error: error.message,
    });
  }
};
