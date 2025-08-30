const mongoose = require("mongoose");
const Panier = require("../models/panier.model");
const LignePanier = require("../models/lignePanier.model");

// Créer un panier
exports.createPanier = async (req, res) => {
  try {
    const panier = await Panier.create(req.body);
    res.status(201).json(panier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Récupérer tous les paniers
exports.getAllPaniers = async (req, res) => {
  try {
    const paniers = await Panier.find().populate("clientId");
    res.status(200).json(paniers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir les paniers avec pagination
exports.getPaniersPagines = async (req, res) => {
  try {
    // Récupération des paramètres
    const page = parseInt(req.query.page) || 1; // Page par défaut = 1
    const limit = parseInt(req.query.limit) || 10; // Limite par défaut = 10

    // Calcul offset
    const skip = (page - 1) * limit;

    // Récupérer les paniers
    const paniers = await Panier.find()
      .populate("clientId")
      .skip(skip)
      .limit(limit);

    // Total
    const totalPaniers = await Panier.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalPaniers,
      totalPages: Math.ceil(totalPaniers / limit),
      paniers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Récupérer un panier par ID
exports.getPanierById = async (req, res) => {
  try {
    const panier = await Panier.findById(req.params.id).populate("clientId");
    if (!panier) return res.status(404).json({ message: "Panier non trouvé" });
    res.status(200).json(panier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Mettre à jour un panier
exports.updatePanier = async (req, res) => {
  try {
    const panier = await Panier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!panier) return res.status(404).json({ message: "Panier non trouvé" });
    res.status(200).json(panier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Supprimer un panier

exports.deletePanier = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Trouver le panier
    const panier = await Panier.findById(req.params.id).session(session);
    if (!panier) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    // Désactiver le panier
    panier.est_actif = false;
    await panier.save({ session });

    //Désactiver toutes les lignes du panier
    await LignePanier.updateMany(
      { panierId: panier._id },
      { est_actif: false },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      message: "Panier désactivé avec succès",
      panierId: panier._id,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Calcul total d'un panier
exports.getTotalPanier = async (req, res) => {
  try {
    const panierId = req.params.id;
    // Vérifier si panierId est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(panierId)) {
      return res.status(400).json({ message: "ID panier invalide" });
    }
    // Calcul total par aggregation
    const total = await LignePanier.aggregate([
      {
        $match: {
          panierId: new mongoose.Types.ObjectId(panierId),
          est_actif: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$quantite", "$prixUnitaire"] } },
        },
      },
    ]);

    res.status(200).json({
      panierId,
      total: total.length > 0 ? total[0].total : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul du total", error });
  }
};
