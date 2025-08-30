const mongoose = require("mongoose");

const ligneCommandeSchema = new mongoose.Schema({
  commandeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commande",
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

  statut: {
    type: String,
    enum: ["Active", "Annulé"],
    default: "Active",
  },
});

ligneCommandeSchema.index({ commandeId: 1, produitId: 1 }, { unique: true });
ligneCommandeSchema.index(
  { commandeId: 1, numLigne: 1 },
  { unique: true, partialFilterExpression: { statut: "Active" } }
);

module.exports = mongoose.model("LigneCommande", ligneCommandeSchema);
