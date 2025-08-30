const LignePanier = require("../models/lignePanier.model");
const mongoose = require("mongoose");
const Produit = require("../models/produit.model");

exports.ajouterLignePanier = async (req, res) => {
  try {
    const { panierId, produitId, quantite } = req.body;
    // convertir la quantité en nombre
    const quantiteInt = parseInt(quantite);
    if (isNaN(quantiteInt) || quantiteInt < 1) {
      return res.status(400).json({ message: "Quantité invalide." });
    }
    // Vérifier si le produit existe
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    // Vérifier si la ligne pour ce produit existe déjà dans le panier
    let ligneExistante = await LignePanier.findOne({ panierId, produitId });

    if (ligneExistante) {
      // Incrémenter la quantité existante
      ligneExistante.quantite += quantiteInt;
      await ligneExistante.save();
      return res.status(200).json({ ligne: ligneExistante });
    }

    // Sinon, créer une nouvelle ligne avec numLigne auto
    const totalLignes = await LignePanier.countDocuments({ panierId });

    const nouvelleLigne = new LignePanier({
      panierId,
      produitId,
      quantite,
      prixUnitaire: produit.prix,
      numLigne: totalLignes + 1,
    });

    await nouvelleLigne.save();

    res
      .status(201)
      .json({ message: "Ligne ajoutée au panier.", ligne: nouvelleLigne });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//  Obtenir toutes les lignes d’un panier
exports.getLignesByPanier = async (req, res) => {
  try {
    const { panierId } = req.params;
    const lignes = await LignePanier.find({ panierId, est_actif: true })
      .sort({ numLigne: 1 })
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
//  supprimerLignePanier
exports.supprimerLignePanier = async (req, res) => {
  try {
    const { panierId, numLigne } = req.params;
    const num = parseInt(numLigne);

    if (isNaN(num)) {
      return res.status(400).json({ message: "numLigne invalide" });
    }

    // Désactiver la ligne
    const ligneModifiee = await LignePanier.findOneAndUpdate(
      {
        panierId: new mongoose.Types.ObjectId(panierId),
        numLigne: num,
        est_actif: true,
      },
      { est_actif: false },
      { new: true }
    );

    if (!ligneModifiee) {
      return res
        .status(404)
        .json({ message: "Ligne non trouvée ou déjà inactive." });
    }

    // Réorganiser numéros des lignes actives
    const lignesActives = await LignePanier.find({
      panierId: new mongoose.Types.ObjectId(panierId),
      est_actif: true,
    }).sort({ numLigne: 1 });

    for (let i = 0; i < lignesActives.length; i++) {
      lignesActives[i].numLigne = i + 1;
      await lignesActives[i].save();
    }

    res.status(200).json({
      message: "Ligne désactivée et numéros réorganisés.",
      ligne: ligneModifiee,
    });
  } catch (error) {
    console.error("Erreur DELETE:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
