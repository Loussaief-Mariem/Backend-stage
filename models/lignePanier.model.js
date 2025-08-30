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
    numLigne: {
      type: Number,
      min: 1,
    },
    quantite: {
      type: Number,
      required: true,
      min: 1,
    },
    prixUnitaire: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => Math.round(v * 1000) / 1000,
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
lignePanierSchema.index({ panierId: 1, produitId: 1 }, { unique: true });
lignePanierSchema.index(
  { panierId: 1, numLigne: 1 },
  { unique: true, partialFilterExpression: { est_actif: true } }
);
module.exports = mongoose.model("LignePanier", lignePanierSchema);
