const express = require("express");
const router = express.Router();
const ligneFactureController = require("../controllers/ligneFactureController");

// ------------------ Routes Lignes de Facture ------------------

// GET - Obtenir toutes les lignes de facture
router.get("/", ligneFactureController.getAllLignesFacture);

// GET - Obtenir une ligne de facture par son ID
router.get("/:id", ligneFactureController.getLigneFactureById);

// PUT - Mettre à jour une ligne de facture par son ID
router.put("/:id", ligneFactureController.updateLigneFacture);

// DELETE - Annuler toutes les lignes d'une facture (par factureId)
router.delete(
  "/annuler/:factureId",
  ligneFactureController.annulerLignesFacture
);

module.exports = router;
