const express = require("express");
const router = express.Router();
const headerController = require("../controllers/headerController");

// ------------------ Routes Headers ------------------

// POST - Créer un nouveau header
router.post("/", headerController.createHeader);

// GET - Obtenir tous les headers
router.get("/", headerController.getAllHeaders);

// GET - Obtenir tous les headers actifs
router.get("/active", headerController.getActiveHeaders);

// GET - Obtenir un header par son ID
router.get("/:id", headerController.getHeaderById);

// PUT - Mettre à jour un header par son ID
router.put("/:id", headerController.updateHeader);

// PUT - Mettre à jour l'ordre des headers
router.put("/order/update", headerController.updateHeaderOrder);

// DELETE - Supprimer un header par son ID
router.delete("/:id", headerController.deleteHeader);

module.exports = router;
