const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produitController");

// ------------------ Routes spécifiques ------------------

// GET - Obtenir les produits paginés
router.get("/pagines", produitController.getProduitsPagines);

// GET - Obtenir les best-sellers (sans pagination)
router.get("/best-sellers", produitController.getBestSellers);

// GET - Obtenir les best-sellers (avec pagination)
router.get(
  "/best-sellers/paginated",
  produitController.getBestSellersPaginated
);

// GET - Obtenir les nouveaux produits de l'année
router.get("/nouveaux", produitController.getProduitsDeCetteAnnee);

// GET - Obtenir le nombre total de produits
router.get("/count", produitController.getProduitCount);

// GET - Rechercher des produits (par nom, description, etc.)
router.get("/recherche", produitController.searchProducts);

// GET - Obtenir les produits d'une catégorie (sans pagination)
router.get(
  "/categorie/:categorieId",
  produitController.getProduitsByCategorieId
);

// GET - Obtenir les produits d'une catégorie (avec pagination)
router.get(
  "/categorie/:categorieId/pagines",
  produitController.getProduitsByCategorieIdPagination
);

// ------------------ CRUD principal ------------------

// POST - Créer un produit
router.post("/", produitController.createProduit);

// GET - Obtenir tous les produits
router.get("/", produitController.getAllProduits);

// GET - Obtenir un produit par ID
router.get("/:id", produitController.getProduitById);

// PUT - Mettre à jour un produit par ID
router.put("/:id", produitController.updateProduit);

// DELETE - Supprimer un produit par ID
router.delete("/:id", produitController.deleteProduit);
// PUT - Mettre à jour uniquement le stock d’un produit
router.put("/:id/stock", produitController.updateQuantiteStock);

module.exports = router;
