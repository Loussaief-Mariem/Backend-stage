const express = require("express");
const router = express.Router();
const ligneFactureController = require("../controllers/ligneFactureController");

// GET toutes les lignes
router.get("/", ligneFactureController.getAllLignesFacture);

// GET ligne par ID
router.get("/:id", ligneFactureController.getLigneFactureById);

// PUT mise à jour d'une ligne
router.put("/:id", ligneFactureController.updateLigneFacture);

// DELETE (annuler toutes les lignes d'une facture)
router.delete(
  "/annuler/:factureId",
  ligneFactureController.annulerLignesFacture
);

module.exports = router;
