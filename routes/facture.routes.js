const express = require("express");
const router = express.Router();
const factureController = require("../controllers/factureController");

// ------------------ Routes Factures ------------------

// POST - Créer une nouvelle facture
router.post("/", factureController.creerFacture);

// GET - Obtenir toutes les factures
router.get("/", factureController.getFactures);

// GET - Obtenir une facture par son ID
router.get("/:id", factureController.getFactureById);

// PUT - Mettre à jour une facture par son ID
router.put("/:id", factureController.updateFacture);

// DELETE - Annuler / supprimer une facture par son ID
router.delete("/:id", factureController.annulerFacture);

module.exports = router;
