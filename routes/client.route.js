const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

// ------------------ Routes Clients ------------------

// GET - Obtenir tous les clients
router.get("/", clientController.getAllClients);

// GET - Obtenir les clients avec pagination
router.get("/pagines", clientController.getClientsPagines);

// GET - Obtenir le nombre total de clients
router.get("/count", clientController.getClientCount);

// GET - Obtenir un client par son ID
router.get("/:id", clientController.getClientById);

// POST - Créer un nouveau client
router.post("/", clientController.createClient);

// PUT - Mettre à jour un client par son ID
router.put("/:id", clientController.updateClient);

// DELETE - Supprimer un client par son ID
router.delete("/:id", clientController.deleteClient);

module.exports = router;
