const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");

// ------------------ Routes Commandes ------------------

// GET - Obtenir toutes les commandes
router.get("/", commandeController.getAllCommandes);

// GET - Obtenir les commandes avec pagination
router.get("/pagines", commandeController.getCommandesPagines);

// GET - Obtenir le nombre total de commandes
router.get("/count", commandeController.getCommandeCount);

// GET - Obtenir les ventes du jour
router.get("/daily-sales", commandeController.getDailySales);

// GET - Obtenir une commande par son ID
router.get("/:id", commandeController.getCommandeById);

// POST - Créer une commande à partir d'un panier
router.post("/:panierId", commandeController.createCommande);

// PUT - Mettre à jour une commande par son ID
router.put("/:id", commandeController.updateCommande);

// PUT - Annuler une commande globale par son ID
router.put("/:id/annuler", commandeController.annulerCommandeGlobale);

// PUT - Mettre à jour le total d'une commande
router.put(
  "/commande/update-total/:commandeId",
  commandeController.updateTotalCommande
);

// DELETE - Supprimer une commande par son ID
router.delete("/:id", commandeController.deleteCommande);
// Récupérer toutes les commandes d’un client triées par date
router.get("/client/:clientId", commandeController.getCommandesByIdClient);

module.exports = router;
