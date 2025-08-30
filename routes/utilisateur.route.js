const express = require("express");
const router = express.Router();
const utilisateurController = require("../controllers/utilisateurController");

router.get("/", utilisateurController.getAllUtilisateurs);
router.get("/:id", utilisateurController.getUtilisateurById);
router.post("/", utilisateurController.createUtilisateur);
router.put("/:id", utilisateurController.updateUtilisateur);
router.delete("/:id", utilisateurController.deleteUtilisateur);

module.exports = router;
