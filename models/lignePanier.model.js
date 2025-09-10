const mongoose = require("mongoose");

const lignePanierSchema = new mongoose.Schema(
  {
    panierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panier",
      required: true,
    },
    produitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produit",
      required: true,
    },
    quantite: {
      type: Number,
      required: true,
      min: 1,
    },

    prixUnitaire: {
      type: Number,
      required: true,
    },
    est_actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons
lignePanierSchema.index({ panierId: 1, produitId: 1 }, { unique: true });

module.exports = mongoose.model("LignePanier", lignePanierSchema);
