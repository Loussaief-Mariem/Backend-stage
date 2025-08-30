const LigneFacture = require("../models/ligneFacture.model");

//  GET - Récupérer toutes les lignes de facture
exports.getAllLignesFacture = async (req, res) => {
  try {
    const lignes = await LigneFacture.find().populate("factureId produitId");
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

//  GET by ID - Récupérer une ligne par ID
exports.getLigneFactureById = async (req, res) => {
  try {
    const ligne = await LigneFacture.findById(req.params.id).populate(
      "factureId produitId"
    );
    if (!ligne) {
      return res.status(404).json({ message: "Ligne non trouvée" });
    }
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

//  PUT - Mettre à jour une ligne (quantité, prix, etc.)
exports.updateLigneFacture = async (req, res) => {
  try {
    const updatedLigne = await LigneFacture.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedLigne) {
      return res.status(404).json({ message: "Ligne non trouvée" });
    }
    res.status(200).json(updatedLigne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};

// DELETE (ANNULER) - Annuler toutes les lignes d'une facture
exports.annulerLignesFacture = async (req, res) => {
  try {
    const { factureId } = req.params;
    const result = await LigneFacture.updateMany(
      { factureId },
      { $set: { statut: "Annulé" } }
    );
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Aucune ligne trouvée pour cette facture" });
    }
    res
      .status(200)
      .json({ message: "Toutes les lignes ont été annulées", result });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'annulation", error });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// annulée ligne facture
exports.annulerLigneFacture = async (req, res) => {
  try {
    const { factureId, numLigne } = req.params;

    //  Trouver et annuler la ligne active
    const ligneModifiee = await LigneFacture.findOneAndUpdate(
      { factureId, numLigne, statut: "Active" },
      { statut: "Annulé", numLigne: null },
      { new: true }
    );

    if (!ligneModifiee) {
      return res.status(404).json({
        message: "Ligne facture non trouvée ou déjà annulée",
      });
    }

    // Réorganiser numéros des lignes actives
    const lignesActives = await LigneFacture.find({
      factureId,
      statut: "Active",
    }).sort({ numLigne: 1 });

    for (let i = 0; i < lignesActives.length; i++) {
      lignesActives[i].numLigne = i + 1;
      await lignesActives[i].save();
    }

    res.status(200).json({
      message: "Ligne facture annulée et numéros réorganisés",
      ligne: ligneModifiee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'annulation de la ligne facture",
      error: error.message,
    });
  }
};
