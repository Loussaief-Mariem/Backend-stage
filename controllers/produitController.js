const Produit = require("../models/produit.model");

//  Ajouter un produit
exports.createProduit = async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir tous les produits
exports.getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.find().populate("categorieId");
    res.status(200).json(produits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Obtenir les produits avec pagination
exports.getProduitsPagines = async (req, res) => {
  try {
    // Récupération des paramètres
    const page = parseInt(req.query.page) || 1; // Page par défaut = 1
    const limit = parseInt(req.query.limit) || 10; // Limite par défaut = 10

    // Calcul de l'offset
    const skip = (page - 1) * limit;

    // Récupération des produits avec pagination
    const produits = await Produit.find()
      .populate("categorieId")
      .skip(skip)
      .limit(limit);

    // Compter le total
    const totalProduits = await Produit.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalProduits,
      totalPages: Math.ceil(totalProduits / limit),
      produits,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir les produits créés il y a moins d'1 an
exports.getProduitsDeCetteAnnee = async (req, res) => {
  try {
    const now = new Date();

    const debutAnnee = new Date(now.getFullYear(), 0, 1);

    const finAnnee = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const produits = await Produit.find({
      createdAt: { $gte: debutAnnee, $lte: finAnnee },
    }).sort({ createdAt: -1 });

    res.status(200).json(produits);
  } catch (error) {
    console.error("Erreur getProduitsDeCetteAnnee:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des produits de cette année",
    });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

//  Obtenir un seul produit par ID
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id).populate(
      "categorieId"
    );
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(produit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Modifier un produit
exports.updateProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(produit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  Supprimer un produit
exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir le nombre total de produits
exports.getProduitCount = async (req, res) => {
  try {
    const count = await Produit.countDocuments();
    res.status(200).json({ totalProduits: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
