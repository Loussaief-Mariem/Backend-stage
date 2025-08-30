const express = require("express");
const router = express.Router();
const factureController = require("../controllers/factureController");

router.post("/", factureController.creerFacture);
// GET toutes les factures
router.get("/", factureController.getFactures);

// GET facture par ID
router.get("/:id", factureController.getFactureById);
// update
router.put("/:id", factureController.updateFacture);
// DELETE
router.delete("/:id", factureController.annulerFacture);

module.exports = router;
