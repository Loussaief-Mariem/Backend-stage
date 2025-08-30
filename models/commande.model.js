const mongoose = require("mongoose");
const Counter = require("./counter.model");

const commandeSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    panierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panier",
      required: true,
      unique: true,
    },
    numcmd: {
      type: String,
      required: false,
      unique: true,
    },
    dateLivraison: {
      type: Date,
    },
    total: {
      type: Number,
      min: 0,
      set: (v) => Math.round(v * 1000) / 1000,
    },
    factureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facture",
    },
    statut: {
      type: String,
      enum: ["EnAttente", "Annulé", "Livree"],
      default: "EnAttente",
    },
  },
  {
    timestamps: true,
  }
);

//  Génération numéro commande + date livraison
commandeSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "commande" },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        session: this.$session(),
      }
    );

    if (!counter) throw new Error("Counter non trouvé/créé");

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const seqFormatted = String(counter.seq).padStart(3, "0");
    this.numcmd = `C-${year}-${month}-${seqFormatted}`;

    //  Date livraison apres 3 jours
    const dateCreation = new Date();
    dateCreation.setDate(dateCreation.getDate() + 3);
    dateCreation.setHours(0, 0, 0, 0);
    this.dateLivraison = dateCreation;

    next();
  } catch (err) {
    console.error("Erreur dans le pre-save hook:", err);
    next(err);
  }
});

module.exports = mongoose.model("Commande", commandeSchema);
