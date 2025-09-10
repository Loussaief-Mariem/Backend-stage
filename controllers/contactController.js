const Contact = require("../models/contact.model");

//  Créer un nouveau contact
exports.createContact = async (req, res) => {
  try {
    const { clientId, email, sujet, message } = req.body;

    const nouveauContact = new Contact({ clientId, email, sujet, message });
    await nouveauContact.save();

    res.status(201).json(nouveauContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Obtenir tous les contacts avec infos client
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().populate("clientId");
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

exports.getContactsPagines = async (req, res) => {
  try {
    // Récupération des paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calcul de l'offset
    const skip = (page - 1) * limit;

    // Récupération des contacts avec pagination + population de clientId
    const contacts = await Contact.find()
      .populate("clientId")
      .skip(skip)
      .limit(limit);

    // Nombre total de documents
    const totalContacts = await Contact.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalContacts,
      totalPages: Math.ceil(totalContacts / limit),
      contacts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Obtenir un contact par son ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate("clientId");
    if (!contact)
      return res.status(404).json({ message: "Contact non trouvé" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un contact
exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contact)
      return res.status(404).json({ message: "Contact non trouvé" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un contact
exports.deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Contact non trouvé" });
    res.status(200).json({ message: "Contact supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Obtenir les contacts créés aujourd'hui
exports.getContactsToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const contacts = await Contact.find({
      dateCreation: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).populate({
      path: "clientId",
      populate: {
        path: "utilisateurId",
        select: "nom prenom email"
      }
    });

    res.status(200).json({
      count: contacts.length,
      list: contacts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
