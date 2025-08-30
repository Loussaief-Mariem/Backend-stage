const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  sujet: {
    type: String,
    enum: ["service client", "webmaster"],
    default: "service client",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    enum: ["non lu", "lu"],
    default: "non lu",
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
