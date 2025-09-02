const express = require("express");
const router = express.Router();
const headerController = require("../controllers/headerController");

// Routes pour les headers
router.post("/", headerController.createHeader);
router.get("/", headerController.getAllHeaders);
router.get("/active", headerController.getActiveHeaders);
router.get("/:id", headerController.getHeaderById);
router.put("/:id", headerController.updateHeader);
router.delete("/:id", headerController.deleteHeader);
router.put("/order/update", headerController.updateHeaderOrder);

module.exports = router;
