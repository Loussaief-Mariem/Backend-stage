const express = require("express");
const router = express.Router();
const ligneCommandeController = require("../controllers/ligneCommandeController");

// GET toutes les lignes de commande
router.get("/", ligneCommandeController.getAllLignesCommande);

// GET une ligne par ID
router.get("/:id", ligneCommandeController.getLigneCommandeById);

// PUT mise à jour d'une ligne
router.put("/:id", ligneCommandeController.updateLigneCommande);

// DELETE suppression d'une ligne
router.delete("/:id", ligneCommandeController.annulerLigneCommande);
// Get tous les lignes actives
router.get("/actives", ligneCommandeController.getLignesCommandeActives);

module.exports = router;
