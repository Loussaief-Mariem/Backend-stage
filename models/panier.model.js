const mongoose = require("mongoose");

const panierSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Le client est requis"],
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
panierSchema.index(
  { clientId: 1, est_actif: 1 },
  {
    unique: true,
    partialFilterExpression: { est_actif: true },
  }
);

panierSchema.pre("save", async function (next) {
  if (this.est_actif && this.isNew) {
    // Désactiver les autres paniers actifs de ce client
    await this.constructor.updateMany(
      { clientId: this.clientId, est_actif: true },
      { est_actif: false }
    );
  }
  next();
});

module.exports = mongoose.model("Panier", panierSchema);
