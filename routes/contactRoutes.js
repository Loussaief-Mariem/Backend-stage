const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// POST - Ajouter un nouveau contact
router.post("/", contactController.createContact);
// pagination
router.get("/pagines", contactController.getContactsPagines);

// GET - Obtenir tous les contacts
router.get("/", contactController.getAllContacts);
// Route pour récupérer les contacts d'aujourd'hui
router.get("/today", contactController.getContactsToday);

// GET - Obtenir un contact par ID
router.get("/:id", contactController.getContactById);

// PUT - Mettre à jour un contact
router.put("/:id", contactController.updateContact);

// DELETE - Supprimer un contact
router.delete("/:id", contactController.deleteContact);

module.exports = router;
