const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    prix: {
      type: Number,
      required: true,
      min: [0.01, "Le prix doit être strictement supérieur à 0"],
      set: (v) => Math.round(v * 1000) / 1000,
    },
    reference: {
      type: String,
      unique: true,
      trim: true,
      required: false,
    },
    stock: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.seuilAlertStock;
        },
        message: "Le stock doit être supérieur ou égal au seuil d'alerte",
      },
    },
    volume: {
      type: String,
      required: false,
      trim: true,
    },
    seuilAlertStock: {
      type: Number,
      required: true,
      min: [0, "Le seuil d'alerte doit être supérieur ou égal à 0"],
    },
    TVA: {
      type: Number,
      default: 19,
      min: [0, "La TVA doit être positive"],
      required: true,
    },
    categorieId: { type: mongoose.Schema.Types.ObjectId, ref: "Categorie" },
  },
  {
    timestamps: true,
  }
);
produitSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Produit").countDocuments();
    this.reference = `PROD-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});
module.exports = mongoose.model("Produit", produitSchema);
