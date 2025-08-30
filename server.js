const app = require("./app");
const connectDB = require("./config/bd");

// Démarrer le serveur
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

startServer();
