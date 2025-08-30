const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/utilisateur.model");

async function seedAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      // Validation des variables d'environnement
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error(
          "Les variables ADMIN_EMAIL et ADMIN_PASSWORD sont requises dans .env"
        );
      }

      // Hachage mot de passe
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      // Créer admin avec valeurs par défaut
      await User.create({
        nom: process.env.ADMIN_LASTNAME,
        prenom: process.env.ADMIN_FIRSTNAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });

      console.log("Admin créé avec succès");
    }
    //  else {
    //   console.log("Admin existe déjà :", adminExists.email);
    // }
  } catch (err) {
    console.error(" Erreur lors du seed admin :", err.message);
    throw err;
  }
}

module.exports = seedAdmin;
