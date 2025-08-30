const mongoose = require("mongoose");

const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom est requis"],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, "La description est requise"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "L'URL de l'image est requise"],
    trim: true,
  },
  famille: {
    type: String,
    required: [true, "La famille est requise"],
    enum: {
      values: ["visage", "cheveux", "huile végétale", "homme"],
      message: "Valeur de famille invalide",
    },
  },
});

module.exports = mongoose.model("Categorie", categorieSchema);
