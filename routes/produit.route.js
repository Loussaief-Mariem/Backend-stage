const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produitController");

router.get("/pagines", produitController.getProduitsPagines);
router.post("/", produitController.createProduit);
router.get("/best-sellers", produitController.getBestSellers);
router.get(
  "/best-sellers/paginated",
  produitController.getBestSellersPaginated
);
router.get("/nouveaux", produitController.getProduitsDeCetteAnnee);
router.get("/count", produitController.getProduitCount);
router.get("/", produitController.getAllProduits);
router.get("/:id", produitController.getProduitById);
router.put("/:id", produitController.updateProduit);
router.delete("/:id", produitController.deleteProduit);

module.exports = router;
