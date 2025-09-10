const Produit = require("../models/produit.model");
const LigneCommande = require("../models/ligneCommande.model");
const mongoose = require("mongoose");
const Categorie = require("../models/categorie.model"); // ← AJOUTEZ CETTE LI
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
    const { limit = 4 } = req.query;

    console.log("Début getBestSellers avec limit:", limit);

    // D'abord, vérifions ce qu'il y a dans la collection LigneCommande
    const toutesLignes = await LigneCommande.find().populate("produitId");
    console.log("Toutes les lignes de commande:", toutesLignes);

    // Vérifions aussi les statuts existants
    const statutsExistants = await LigneCommande.distinct("statut");
    console.log("Statuts existants dans LigneCommande:", statutsExistants);

    // Agrégation corrigée
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
          from: "produits", // Nom de la collection en minuscules
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

    console.log("Résultat de l'agrégation bestSellers:", bestSellers);

    // Si aucun best-seller n'est trouvé, retourner des produits populaires
    if (bestSellers.length === 0) {
      console.log(
        "Aucun best-seller trouvé, retournement des produits récents"
      );
      const produitsRecents = await Produit.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      const bestSellersFallback = produitsRecents.map((prod) => ({
        _id: prod._id,
        nom: prod.nom,
        description: prod.description,
        image: prod.image,
        prix: prod.prix,
        reference: prod.reference,
        totalVentes: 0,
        nombreCommandes: 0,
      }));

      return res.status(200).json(bestSellersFallback);
    }

    res.status(200).json(bestSellers);
  } catch (error) {
    console.error("Erreur récupération best-sellers:", error);

    // Fallback en cas d'erreur
    try {
      const produits = await Produit.find().sort({ createdAt: -1 }).limit(10);

      const fallbackData = produits.map((prod) => ({
        _id: prod._id,
        nom: prod.nom,
        description: prod.description,
        image: prod.image,
        prix: prod.prix,
        reference: prod.reference,
        totalVentes: 0,
        nombreCommandes: 0,
      }));

      res.status(200).json(fallbackData);
    } catch (fallbackError) {
      res
        .status(500)
        .json({ message: "Erreur serveur", error: fallbackError.message });
    }
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Récupérer les best-sellers avec debug
exports.getBestSellersPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log("Recherche des best-sellers...");

    // D'abord, vérifions ce qu'il y a dans LigneCommande
    const toutesLignes = await LigneCommande.find();
    console.log("Toutes les lignes de commande:", toutesLignes);

    // Essayons sans filtrer par statut d'abord
    const bestSellers = await LigneCommande.aggregate([
      // Enlever le filtre temporairement pour debug
      // { $match: { statut: "Active" } },
      {
        $group: {
          _id: "$produitId",
          totalVentes: { $sum: "$quantite" },
          nombreCommandes: { $sum: 1 },
          statuts: { $push: "$statut" }, // Pour voir les statuts
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
          statuts: 1, // Pour debug
        },
      },
    ]);

    console.log("Résultat de l'agrégation:", bestSellers);

    // Compter le total
    const totalCount = await LigneCommande.aggregate([
      // { $match: { statut: "Active" } },
      { $group: { _id: "$produitId" } },
      { $count: "total" },
    ]);

    console.log("Total count:", totalCount);

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
//
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir les produits par ID de catégorie avec pagination
exports.getProduitsByCategorieIdPagination = async (req, res) => {
  try {
    const { categorieId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log("Recherche de catégorie par ID:", categorieId);

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(categorieId)) {
      return res.status(400).json({ message: "ID de catégorie invalide" });
    }

    // Trouver la catégorie par son ID
    const categorie = await Categorie.findById(categorieId);

    if (!categorie) {
      console.log("Catégorie non trouvée avec ID:", categorieId);
      return res.status(404).json({
        message: `Catégorie avec ID "${categorieId}" non trouvée`,
      });
    }

    console.log("Catégorie trouvée:", categorie.nom);

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Récupérer les produits de cette catégorie avec pagination
    const produits = await Produit.find({ categorieId: categorie._id })
      .populate("categorieId")
      .skip(skip)
      .limit(parseInt(limit));

    // Compter le total de produits dans cette catégorie
    const totalProduits = await Produit.countDocuments({
      categorieId: categorie._id,
    });

    res.status(200).json({
      categorie: {
        _id: categorie._id,
        nom: categorie.nom,
        description: categorie.description,
        image: categorie.image,
        famille: categorie.famille,
      },
      produits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalProduits,
        totalPages: Math.ceil(totalProduits / limit),
      },
    });
  } catch (err) {
    console.error("Erreur getProduitsByCategorieId:", err);
    res.status(500).json({
      message:
        "Erreur lors de la récupération des produits par ID de catégorie",
      error: err.message,
    });
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir les produits par ID de catégorie (sans pagination - version simple)
exports.getProduitsByCategorieId = async (req, res) => {
  try {
    const { categorieId } = req.params;

    console.log("Recherche de catégorie par ID:", categorieId);

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(categorieId)) {
      return res.status(400).json({ message: "ID de catégorie invalide" });
    }

    // Trouver la catégorie par son ID
    const categorie = await Categorie.findById(categorieId);

    if (!categorie) {
      return res.status(404).json({
        message: `Catégorie avec ID "${categorieId}" non trouvée`,
      });
    }

    // Récupérer tous les produits de cette catégorie
    const produits = await Produit.find({
      categorieId: categorie._id,
    }).populate("categorieId");

    res.status(200).json({
      categorie: {
        _id: categorie._id,
        nom: categorie.nom,
        description: categorie.description,
        image: categorie.image,
        famille: categorie.famille,
      },
      produits,
      count: produits.length,
    });
  } catch (err) {
    console.error("Erreur getProduitsByCategorieIdSimple:", err);
    res.status(500).json({
      message:
        "Erreur lors de la récupération des produits par ID de catégorie",
      error: err.message,
    });
  }
};

// Rechercher des produits par nom
exports.searchProducts = async (req, res) => {
  try {
    const { q: searchQuery, page = 1, limit = 12 } = req.query;

    if (!searchQuery || searchQuery.trim() === "") {
      return res
        .status(400)
        .json({ message: "Le terme de recherche est requis" });
    }

    const skip = (page - 1) * limit;
    const regex = new RegExp(searchQuery, "i");

    // Rechercher les produits dont le nom correspond exactement ou partiellement
    const exactMatch = await Produit.findOne({
      nom: { $regex: new RegExp(`^${searchQuery}$`, "i") },
    }).populate("categorieId");

    let produits;
    let totalProduits;

    if (exactMatch) {
      // Si on trouve une correspondance exacte, retourner seulement ce produit
      produits = [exactMatch];
      totalProduits = 1;
    } else {
      // Sinon, rechercher les correspondances partielles
      produits = await Produit.find({ nom: { $regex: regex } })
        .populate("categorieId")
        .skip(skip)
        .limit(parseInt(limit));

      // Compter le total de résultats pour les correspondances partielles
      totalProduits = await Produit.countDocuments({
        nom: { $regex: regex },
      });

      // Si aucune correspondance partielle n'est trouvée, retourner tous les produits
      if (totalProduits === 0) {
        produits = await Produit.find()
          .populate("categorieId")
          .skip(skip)
          .limit(parseInt(limit));

        totalProduits = await Produit.countDocuments();
      }
    }

    res.status(200).json({
      produits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalProduits,
        totalPages: Math.ceil(totalProduits / limit),
        searchQuery,
        exactMatch: !!exactMatch,
      },
    });
  } catch (err) {
    console.error("Erreur recherche produits:", err);
    res.status(500).json({
      message: "Erreur lors de la recherche",
      error: err.message,
    });
  }
}; // Mettre à jour uniquement la quantité en stock
exports.updateQuantiteStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ message: "Le champ 'stock' est requis" });
    }

    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    produit.stock = stock;
    await produit.save();

    res.status(200).json({
      message: "Stock mis à jour avec succès",
      produit,
    });
  } catch (err) {
    console.error("Erreur updateQuantiteStock:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message, errors: err.errors });
    }
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
