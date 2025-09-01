const Header = require("../models/header.model");

// Créer un header
exports.createHeader = async (req, res) => {
  try {
    const { title, imageUrl, description, order, active } = req.body;

    const header = new Header({
      title,
      imageUrl,
      description: description || "",
      order: order || 1,
      active: active !== undefined ? active : true,
    });

    await header.save();
    res.status(201).json({
      message: "Header créé avec succès",
      header,
    });
  } catch (error) {
    console.error("Erreur création header:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création" });
  }
};

// Récupérer tous les headers
exports.getAllHeaders = async (req, res) => {
  try {
    const headers = await Header.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json(headers);
  } catch (error) {
    console.error("Erreur récupération headers:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les headers actifs pour le carousel
exports.getActiveHeaders = async (req, res) => {
  try {
    const headers = await Header.find({ active: true }).sort({ order: 1 });
    res.status(200).json(headers);
  } catch (error) {
    console.error("Erreur récupération headers actifs:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un header par ID
exports.getHeaderById = async (req, res) => {
  try {
    const header = await Header.findById(req.params.id);
    if (!header) {
      return res.status(404).json({ message: "Header non trouvé" });
    }
    res.status(200).json(header);
  } catch (error) {
    console.error("Erreur récupération header:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Modifier un header
exports.updateHeader = async (req, res) => {
  try {
    const { title, imageUrl, description, order, active } = req.body;

    const header = await Header.findByIdAndUpdate(
      req.params.id,
      {
        title,
        imageUrl,
        description,
        order,
        active,
      },
      { new: true, runValidators: true }
    );

    if (!header) {
      return res.status(404).json({ message: "Header non trouvé" });
    }

    res.status(200).json({
      message: "Header modifié avec succès",
      header,
    });
  } catch (error) {
    console.error("Erreur modification header:", error);
    res.status(500).json({ message: "Erreur serveur lors de la modification" });
  }
};

// Supprimer un header
exports.deleteHeader = async (req, res) => {
  try {
    const header = await Header.findByIdAndDelete(req.params.id);
    if (!header) {
      return res.status(404).json({ message: "Header non trouvé" });
    }

    res.status(200).json({ message: "Header supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression header:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};

// Changer l'ordre des headers
exports.updateHeaderOrder = async (req, res) => {
  try {
    const { headers } = req.body; // Tableau d'objets { id, order }

    const updatePromises = headers.map((header) =>
      Header.findByIdAndUpdate(
        header.id,
        { order: header.order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Ordre mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur modification ordre:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
