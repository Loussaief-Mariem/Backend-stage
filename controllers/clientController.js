const Client = require("../models/client.model");
const bcrypt = require("bcrypt");
// GET : Tous les clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("utilisateurId");
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

exports.getClientsPagines = async (req, res) => {
  try {
    // Récupération des paramètres de pagination
    const page = parseInt(req.query.page) || 1; // Page par défaut = 1
    const limit = parseInt(req.query.limit) || 10; // Limite par défaut = 10

    // Calcul de l'offset
    const skip = (page - 1) * limit;

    // Récupération des clients avec pagination
    const clients = await Client.find()
      .populate("utilisateurId", "nom prenom email isActive") // Peupler l'utilisateur lié
      .skip(skip)
      .limit(limit);

    // Filtrer les clients qui ont un utilisateurId valide
    const validClients = clients.filter(client => client.utilisateurId !== null);

    // Compter le total des clients avec utilisateurId valide
    const totalClients = await Client.countDocuments({ utilisateurId: { $ne: null } });

    // Réponse avec pagination
    res.status(200).json({
      page,
      limit,
      totalClients,
      totalPages: Math.ceil(totalClients / limit),
      clients: validClients,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// GET : Client par ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate(
      "utilisateurId"
    );
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST : Créer un client
exports.createClient = async (req, res) => {
  try {
    const nouveauClient = new Client(req.body);

    await nouveauClient.save();
    res.status(201).json(nouveauClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT : Modifier un client
exports.updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE : Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    res.status(200).json({ message: "Client supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Compter tous les clients
exports.getClientCount = async (req, res) => {
  try {
    const totalclients = await Client.countDocuments();
    res.status(200).json({ totalclients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
