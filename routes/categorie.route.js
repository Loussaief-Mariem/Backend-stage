const express = require("express");
const router = express.Router();
const categorieController = require("../controllers/categorieController");

// ------------------ Routes Catégories ------------------

// GET - Obtenir toutes les catégories
router.get("/", categorieController.getAllCategories);

// GET - Obtenir les catégories avec pagination
router.get("/pagines", categorieController.getCategoriesPaginees);

// GET - Obtenir le nombre total de catégories
router.get("/count", categorieController.getCategorieCount);

// GET - Obtenir une catégorie par son ID
router.get("/:id", categorieController.getCategorieById);

// GET - Obtenir une catégorie par son nom
router.get("/byname/:nom", categorieController.getCategorieByName);

// GET - Obtenir les catégories par famille
router.get("/byfamille/:famille", categorieController.getCategoriesByFamille);

// POST - Créer une nouvelle catégorie
router.post("/", categorieController.createCategorie);

// PUT - Mettre à jour une catégorie par son ID
router.put("/:id", categorieController.updateCategorie);

// DELETE - Supprimer une catégorie par son ID
router.delete("/:id", categorieController.deleteCategorie);

module.exports = router;
