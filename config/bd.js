const mongoose = require("mongoose");
const seedAdmin = require("../scripts/seedAdmin");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Database successfully connected");

    await seedAdmin();
  } catch (err) {
    console.error("Unable to connect to database", err);
    throw err;
  }
};

module.exports = connectDB;
