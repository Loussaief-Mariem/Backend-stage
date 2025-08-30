const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panierController");
const checkPanierActif = require("../middlewares/checkPanierActif");

router.get("/pagines", panierController.getPaniersPagines);

// POST - Créer un panier
router.post("/", checkPanierActif, panierController.createPanier);

// GET - Obtenir tous les paniers
router.get("/", panierController.getAllPaniers);

// GET - Obtenir un panier par ID
router.get("/:id", panierController.getPanierById);

// PUT - Mettre à jour un panier
router.put("/:id", panierController.updatePanier);

// DELETE - Supprimer un panier
router.delete("/:id", panierController.deletePanier);
// obtenir le total d’un panier
router.get("/:id/total", panierController.getTotalPanier);

module.exports = router;
