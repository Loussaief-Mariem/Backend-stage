const express = require("express");
const router = express.Router();
const ligneCtrl = require("../controllers/lignePanierController");

// Ajouter une ligne
router.post("/", ligneCtrl.ajouterLignePanier);

// Obtenir toutes les lignes d’un panier
router.get("/:panierId", ligneCtrl.getLignesByPanier);

// Modifier une ligne
router.put("/:id", ligneCtrl.modifierLigne);

// Supprimer une ligne
router.delete("/:panierId/:numLigne", ligneCtrl.supprimerLignePanier);

module.exports = router;
