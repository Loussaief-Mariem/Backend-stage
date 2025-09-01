const Produit = require("../models/produit.model");
const LigneCommande = require("../models/ligneCommande.model");

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
// Obtenir les produits nouveaux
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
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Récupérer les best-sellers
exports.getBestSellers = async (req, res) => {
  try {
    const { limit = 10 } = req.query; // Nombre de produits à retourner

    const bestSellers = await LigneCommande.aggregate([
      // Filtrer seulement les lignes actives
      { $match: { statut: "Active" } },

      // Grouper par produit et calculer la quantité totale vendue
      {
        $group: {
          _id: "$produitId",
          totalVentes: { $sum: "$quantite" },
          nombreCommandes: { $sum: 1 },
        },
      },

      // Trier par quantité vendue (descendant)
      { $sort: { totalVentes: -1 } },

      // Limiter le nombre de résultats
      { $limit: parseInt(limit) },

      // Joindre avec les informations du produit
      {
        $lookup: {
          from: "produits",
          localField: "_id",
          foreignField: "_id",
          as: "produit",
        },
      },

      // Déstructurer le tableau produit
      { $unwind: "$produit" },

      // Projection pour formater la réponse
      {
        $project: {
          _id: "$produit._id",
          nom: "$produit.nom",
          description: "$produit.description",
          image: "$produit.image",
          prix: "$produit.prix",
          reference: "$produit.reference",
          totalVentes: 1,
          nombreCommandes: 1,
        },
      },
    ]);

    res.status(200).json(bestSellers);
  } catch (error) {
    console.error("Erreur récupération best-sellers:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Alternative: Best-sellers avec pagination
exports.getBestSellersPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bestSellers = await LigneCommande.aggregate([
      { $match: { statut: "Active" } },
      {
        $group: {
          _id: "$produitId",
          totalVentes: { $sum: "$quantite" },
          nombreCommandes: { $sum: 1 },
        },
      },
      { $sort: { totalVentes: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "produits",
          localField: "_id",
          foreignField: "_id",
          as: "produit",
        },
      },
      { $unwind: "$produit" },
      {
        $project: {
          _id: "$produit._id",
          nom: "$produit.nom",
          image: "$produit.image",
          prix: "$produit.prix",
          totalVentes: 1,
          nombreCommandes: 1,
        },
      },
    ]);

    // Compter le total
    const totalCount = await LigneCommande.aggregate([
      { $match: { statut: "Active" } },
      { $group: { _id: "$produitId" } },
      { $count: "total" },
    ]);

    res.status(200).json({
      bestSellers,
      currentPage: parseInt(page),
      totalPages: Math.ceil((totalCount[0]?.total || 0) / limit),
      totalBestSellers: totalCount[0]?.total || 0,
    });
  } catch (error) {
    console.error("Erreur récupération best-sellers paginés:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
