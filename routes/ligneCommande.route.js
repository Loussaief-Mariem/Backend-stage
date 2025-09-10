const express = require("express");
const router = express.Router();
const ligneCommandeController = require("../controllers/ligneCommandeController");

// ------------------ Routes Lignes de Commande ------------------

// GET - Obtenir toutes les lignes de commande
router.get("/", ligneCommandeController.getAllLignesCommande);

// GET - Obtenir toutes les lignes de commande actives
router.get("/actives", ligneCommandeController.getLignesCommandeActives);

// GET - Obtenir une ligne de commande par son ID
router.get("/:id", ligneCommandeController.getLigneCommandeById);

// PUT - Mettre à jour une ligne de commande par son ID
router.put("/:id", ligneCommandeController.updateLigneCommande);

// DELETE - Annuler une ligne de commande par son ID
router.delete("/:id", ligneCommandeController.annulerLigneCommande);

module.exports = router;
