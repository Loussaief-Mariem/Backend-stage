const Categorie = require("../models/categorie.model");

//  Ajouter une catégorie
exports.createCategorie = async (req, res) => {
  try {
    const cat = new Categorie(req.body);
    await cat.save();
    res.status(200).json(cat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// get les categorie par pagination
exports.getCategoriesPaginees = async (req, res) => {
  try {
    // Récupération des paramètres de pagination
    const page = parseInt(req.query.page) || 1; // Page par défaut = 1
    const limit = parseInt(req.query.limit) || 10; // Limite par défaut = 10

    // Calcul du nombre d'éléments à ignorer
    const skip = (page - 1) * limit;

    // Récupération des catégories avec pagination
    const categories = await Categorie.find().skip(skip).limit(limit);

    // Compter le total de catégories
    const totalCategories = await Categorie.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      categories,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//  Obtenir toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Obtenir une catégorie par ID
exports.getCategorieById = async (req, res) => {
  try {
    const cat = await Categorie.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Obtenir une catégorie par nom
exports.getCategorieByName = async (req, res) => {
  try {
    const cat = await Categorie.findOne({ nom: req.params.nom });
    if (!cat) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Supprimer une catégorie
exports.deleteCategorie = async (req, res) => {
  try {
    const deleted = await Categorie.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Modifier une catégorie
exports.updateCategorie = async (req, res) => {
  try {
    const cat = await Categorie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!cat) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json(cat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// obtenir categorie par sa famille
exports.getCategoriesByFamille = async (req, res) => {
  try {
    const cat = await Categorie.find({ famille: req.params.famille });
    if (cat.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune catégorie trouvée pour cette famille" });
    }
    res.status(200).json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir le nombre total de categories
exports.getCategorieCount = async (req, res) => {
  try {
    const count = await Categorie.countDocuments();
    res.status(200).json({ totalCategories: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
