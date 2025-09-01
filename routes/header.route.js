const express = require("express");
const router = express.Router();
const headerController = require("../controllers/headerController");

// Routes pour les headers
router.post("/headers", headerController.createHeader);
router.get("/headers", headerController.getAllHeaders);
router.get("/headers/active", headerController.getActiveHeaders);
router.get("/headers/:id", headerController.getHeaderById);
router.put("/headers/:id", headerController.updateHeader);
router.delete("/headers/:id", headerController.deleteHeader);
router.put("/headers/order/update", headerController.updateHeaderOrder);

module.exports = router;
