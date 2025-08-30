const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
    required: true,
  },
  adresse: String,
  genre: {
    type: String,
    enum: ["M", "F"],
  },
  telephone: {
    type: String,
    required: true,
    unique: true,
  },
  dateInscription: {
    type: Date,
    default: Date.now,
  },
});

clientSchema.virtual("utilisateur", {
  ref: "Utilisateur",
  localField: "utilisateurId",
  foreignField: "_id",
  justOne: true,
});

clientSchema.set("toObject", { virtuals: true });
clientSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Client", clientSchema);
