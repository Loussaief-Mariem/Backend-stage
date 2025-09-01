const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produitController");

// Routes existantes
router.get("/pagines", produitController.getProduitsPagines);
router.post("/", produitController.createProduit);
router.get("/best-sellers", produitController.getBestSellers); // Nouvelle route
router.get(
  "/best-sellers/paginated",
  produitController.getBestSellersPaginated
);
router.get("/nouveaux", produitController.getProduitsDeCetteAnnee); // Nouvelle route
router.get("/count", produitController.getProduitCount);
router.get("/", produitController.getAllProduits); // Correction: utiliser get au lieu de post
router.get("/:id", produitController.getProduitById);
router.put("/:id", produitController.updateProduit);
router.delete("/:id", produitController.deleteProduit);

module.exports = router;
