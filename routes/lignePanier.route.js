const express = require("express");
const router = express.Router();
const ligneCtrl = require("../controllers/lignePanierController");

// ------------------ CRUD Lignes de Panier ------------------

// POST - Ajouter une nouvelle ligne dans un panier
router.post("/", ligneCtrl.createLignePanier);
// PUT - Modifier une ligne de panier par son ID
router.put("/modifier/:id", ligneCtrl.modifierLigne);

// GET - Obtenir toutes les lignes d’un panier par ID de panier
router.get("/:panierId", ligneCtrl.getLignesByPanier);

// GET - Obtenir une ligne précise par panierId + produitId
router.get("/:panierId/:produitId", ligneCtrl.getLigneByPanierAndProduit);

// PUT - Mettre à jour la quantité d’un produit dans un panier
router.put("/:panierId/:produitId", ligneCtrl.updateQuantiteArticle);

// DELETE - Supprimer une ligne de panier (par panierId + produitId)
// Supprimer une ligne par ID
router.delete("/:panierId/:ligneId", ligneCtrl.supprimerLignePanier);

module.exports = router;
