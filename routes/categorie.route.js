const express = require("express");
const router = express.Router();
const categorieController = require("../controllers/categorieController");

// Routes
router.get("/pagines", categorieController.getCategoriesPaginees);
router.post("/", categorieController.createCategorie);
router.get("/", categorieController.getAllCategories);
router.get("/count", categorieController.getCategorieCount);

router.get("/:id", categorieController.getCategorieById);
router.get("/byname/:nom", categorieController.getCategorieByName);
router.get("/byfamille/:famille", categorieController.getCategoriesByFamille);
// getCategoriesPaginees
router.delete("/:id", categorieController.deleteCategorie);
router.put("/:id", categorieController.updateCategorie);

module.exports = router;
