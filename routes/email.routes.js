const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.post("/send-facture/:commandeId", emailController.sendFactureEmail);

module.exports = router;
