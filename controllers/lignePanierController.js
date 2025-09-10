const LignePanier = require("../models/lignePanier.model");
const mongoose = require("mongoose");
const Produit = require("../models/produit.model");

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//  Obtenir toutes les lignes d’un panier
exports.getLignesByPanier = async (req, res) => {
  try {
    const { panierId } = req.params;
    const lignes = await LignePanier.find({ panierId, est_actif: true })
      .sort({ createdAt: 1 })
      .populate("produitId");
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération",
      error: error.message,
    });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//  Modifier une ligne
exports.modifierLigne = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLigne = await LignePanier.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedLigne)
      return res.status(404).json({ message: "Ligne non trouvée" });
    res.status(200).json(updatedLigne);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur de modification", error: error.message });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Supprimer une ligne de panier par panierId + ligneId
exports.supprimerLignePanier = async (req, res) => {
  try {
    const { panierId, ligneId } = req.params;

    // Vérifier si l'ObjectId est valide
    if (
      !mongoose.Types.ObjectId.isValid(panierId) ||
      !mongoose.Types.ObjectId.isValid(ligneId)
    ) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // Désactiver la ligne au lieu de la supprimer
    const ligneModifiee = await LignePanier.findOneAndUpdate(
      { _id: ligneId, panierId: panierId, est_actif: true },
      { est_actif: false },
      { new: true }
    );

    if (!ligneModifiee) {
      return res
        .status(404)
        .json({ message: "Ligne non trouvée ou déjà inactive." });
    }

    res.status(200).json({
      message: "Ligne désactivée avec succès.",
      ligne: ligneModifiee,
    });
  } catch (error) {
    console.error("Erreur DELETE:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.createLignePanier = async (req, res) => {
  try {
    const { panierId, produitId, quantite } = req.body;
    const quantiteInt = parseInt(quantite);

    if (isNaN(quantiteInt) || quantiteInt < 1) {
      return res.status(400).json({ message: "Quantité invalide" });
    }

    const produit = await Produit.findById(produitId);
    if (!produit)
      return res.status(404).json({ message: "Produit non trouvé" });

    // Vérifier si la ligne existe déjà
    let ligneExistante = await LignePanier.findOne({
      panierId,
      produitId,
      est_actif: true,
    });

    if (ligneExistante) {
      ligneExistante.quantite += quantiteInt;
      await ligneExistante.save();
      return res.status(200).json(ligneExistante);
    }

    // Créer une nouvelle ligne
    const nouvelleLigne = new LignePanier({
      panierId,
      produitId,
      quantite: quantiteInt,
      prixUnitaire: produit.prix,
    });

    await nouvelleLigne.save();
    res.status(201).json(nouvelleLigne);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir une ligne spécifique par panierId et produitId
exports.getLignesByPanier = async (req, res) => {
  try {
    const { panierId } = req.params;
    const lignes = await LignePanier.find({ panierId, est_actif: true })
      .sort({ createdAt: 1 })
      .populate("produitId");
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Mettre à jour la quantité d'un article
exports.updateQuantiteArticle = async (req, res) => {
  try {
    const { panierId, produitId } = req.params;
    const { quantite } = req.body;

    const ligne = await LignePanier.findOneAndUpdate(
      {
        panierId: new mongoose.Types.ObjectId(panierId),
        produitId: new mongoose.Types.ObjectId(produitId),
        est_actif: true,
      },
      { quantite: parseInt(quantite) },
      { new: true, runValidators: true }
    );

    if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/////////

exports.getLigneByPanierAndProduit = async (req, res) => {
  try {
    const { panierId, produitId } = req.params;
    const ligne = await LignePanier.findOne({
      panierId,
      produitId,
      est_actif: true,
    });
    if (!ligne) return res.status(404).json({ message: "Ligne non trouvée" });
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
