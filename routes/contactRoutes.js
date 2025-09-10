const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// ------------------ Routes Contacts ------------------

// POST - Ajouter un nouveau contact
router.post("/", contactController.createContact);

// GET - Obtenir tous les contacts
router.get("/", contactController.getAllContacts);

// GET - Obtenir les contacts avec pagination
router.get("/pagines", contactController.getContactsPagines);

// GET - Obtenir les contacts ajoutés aujourd'hui
router.get("/today", contactController.getContactsToday);

// GET - Obtenir un contact par son ID
router.get("/:id", contactController.getContactById);

// PUT - Mettre à jour un contact par son ID
router.put("/:id", contactController.updateContact);

// DELETE - Supprimer un contact par son ID
router.delete("/:id", contactController.deleteContact);

module.exports = router;
