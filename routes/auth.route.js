const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST - Inscription d'un nouvel utilisateur
router.post("/register", authController.register);

// POST - Connexion d'un utilisateur existant
router.post("/login", authController.login);

// POST - Demande de réinitialisation du mot de passe
router.post("/forgot-password", authController.forgotPassword);

// POST - Réinitialisation du mot de passe avec token
router.post("/reset-password/:id/:token", authController.resetPassword);

module.exports = router;
