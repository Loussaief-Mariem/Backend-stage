const mongoose = require("mongoose");

const ligneFactureSchema = new mongoose.Schema({
  factureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facture",
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
  tvaProduit: {
    type: Number,
    required: true,
    min: 0,
  },
  prixUnitaire: {
    type: Number,
    required: true,
    min: 0,
    set: (v) => Math.round(v * 1000) / 1000,
  },
  numLigne: {
    type: Number,
    min: 1,
    unique: true,
  },
  statut: {
    type: String,
    enum: ["Active", "Annulé"],
    default: "Active",
  },
});

ligneFactureSchema.index({ factureId: 1, produitId: 1 }, { unique: true });
ligneFactureSchema.index(
  { factureId: 1, numLigne: 1 },
  { unique: true, partialFilterExpression: { statut: "Active" } }
);

module.exports = mongoose.model("LigneFacture", ligneFactureSchema);
