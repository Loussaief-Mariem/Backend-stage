const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");
router.get("/pagines", commandeController.getCommandesPagines);
router.post("/:panierId", commandeController.createCommande);
router.put("/:id/annuler", commandeController.annulerCommandeGlobale);
router.get("/", commandeController.getAllCommandes);
router.get("/daily-sales", commandeController.getDailySales);
router.get("/count", commandeController.getCommandeCount);
router.get("/:id", commandeController.getCommandeById);
router.put("/:id", commandeController.updateCommande);
router.delete("/:id", commandeController.deleteCommande);
// updtaele total de la commande
router.put(
  "/commande/update-total/:commandeId",
  commandeController.updateTotalCommande
);

module.exports = router;
