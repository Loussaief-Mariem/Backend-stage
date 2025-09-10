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

// Un seul panier actif par client
panierSchema.index(
  { clientId: 1, est_actif: 1 },
  {
    unique: true,
    partialFilterExpression: { est_actif: true },
  }
);

// Hook : désactiver les anciens paniers actifs de ce client
panierSchema.pre("save", async function (next) {
  if (this.est_actif && this.isNew) {
    await this.constructor.updateMany(
      { clientId: this.clientId, est_actif: true },
      { est_actif: false }
    );
  }
  next();
});

module.exports = mongoose.model("Panier", panierSchema);
