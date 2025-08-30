const mongoose = require("mongoose");
const Counter = require("./counter.model");
const factureSchema = new mongoose.Schema(
  {
    commandeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: true,
      unique: true,
    },
    numFact: {
      type: String,
      required: false,
      unique: true,
    },

    timbreFiscal: {
      type: Number,
      default: 1.0,
      min: 0,
      set: (v) => Math.round(v * 1000) / 1000,
    },

    statut: {
      type: String,
      enum: ["EnAttente", "Annulé", "Reglee"],

      default: "EnAttente",
    },
    estEnvoyee: {
      type: Boolean,
      default: false,
    },
    dateEnvoi: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);
// Auto-incrément numFact
factureSchema.pre("save", async function (next) {
  if (this.isNew) {
    const now = new Date();
    const annee = now.getFullYear().toString().slice(-2);
    const mois = String(now.getMonth() + 1).padStart(2, "0");

    const counter = await Counter.findOneAndUpdate(
      { name: `facture-${annee}-${mois}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const numeroFormatte = `FAC-${annee}-${mois}-${String(counter.seq).padStart(
      3,
      "0"
    )}`;
    this.numFact = numeroFormatte;
  }
  next();
});
factureSchema.virtual("lignesFacture", {
  ref: "LigneFacture",
  localField: "_id",
  foreignField: "factureId",
});

factureSchema.set("toObject", { virtuals: true });
factureSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("Facture", factureSchema);
