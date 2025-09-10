const Commande = require("../models/commande.model");
const LigneCommande = require("../models/ligneCommande.model");
const LignePanier = require("../models/lignePanier.model");
const Panier = require("../models/panier.model");
const mongoose = require("mongoose");
const Facture = require("../models/facture.model");
const LigneFacture = require("../models/ligneFacture.model");

// Créer une commande
exports.createCommande = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { panierId } = req.params;

    // Vérifier existance panier
    const panier = await Panier.findById(panierId).session(session);
    if (!panier) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Panier introuvable" });
    }

    if (panier.est_actif === false) {
      return res.status(400).json({
        message: "Impossible de créer une commande pour un panier inactif",
      });
    }

    // Vérifier si commande existe déjà
    const commandeExistante = await Commande.findOne({
      panierId,
      est_actif: true,
    }).session(session);
    if (commandeExistante) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Commande déjà créée pour ce panier" });
    }

    // Vérifier lignes panier
    const lignesPanier = await LignePanier.find({ panierId }).session(session);
    if (!lignesPanier.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Panier vide" });
    }

    // Créer commande
    const commande = new Commande({
      clientId: panier.clientId,
      panierId: panier._id,
      total: 0,
    });

    await commande.save({ session });

    // Créer lignes commande
    let total = 0;
    const ligneCommandeOps = lignesPanier.map((ligne) => {
      total += ligne.quantite * ligne.prixUnitaire;
      return {
        insertOne: {
          document: {
            commandeId: commande._id,
            produitId: ligne.produitId,
            quantite: ligne.quantite,
            prixUnitaire: ligne.prixUnitaire,
          },
        },
      };
    });

    await LigneCommande.bulkWrite(ligneCommandeOps, { session });

    // Mettre à jour total
    commande.total = total;
    await commande.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Commande créée avec succès",
      commande: {
        _id: commande._id,
        numcmd: commande.numcmd,
        panierId: commande.panierId,
        clientId: panier.clientId,
        total: commande.total,
        dateLivraison: commande.dateLivraison.toISOString().split("T")[0],
        statut: commande.statut,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur:", error);
    res.status(500).json({
      message: "Erreur lors de la création",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
exports.getCommandesPagines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Récupérer commandes avec client et panier
    const commandes = await Commande.find()
      .populate({
        path: "clientId",
        populate: { path: "utilisateurId", model: "Utilisateur" },
      })
      .populate("panierId")
      .populate("factureId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCommandes = await Commande.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalCommandes,
      totalPages: Math.ceil(totalCommandes / limit),
      commandes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().populate("clientId");

    // Si aucune commande trouvée
    if (commandes.length === 0) {
      return res.status(404).json({ message: "Aucune commande trouvée" });
    }

    // Retourner toutes les commandes
    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes",
      error,
    });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Récupérer une commande par ID
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate(
      "clientId"
    );
    if (!commande)
      return res.status(404).json({ message: "Commande non trouvée" });
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//  Mettre à jour une commande
exports.updateCommande = async (req, res) => {
  try {
    req.body.dateModification = new Date(); // Met à jour la dateModification
    const commande = await Commande.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!commande)
      return res.status(404).json({ message: "Commande non trouvée" });
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Supprimer une commande
// Annuler  une commande
exports.deleteCommande = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const commande = await Commande.findById(req.params.id).session(session);
    if (!commande) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Annuler commande
    commande.statut = "Annulé";
    await commande.save({ session });

    // Désactiver panier associé
    await Panier.findByIdAndUpdate(
      commande.panierId,
      { est_actif: false },
      { session }
    );

    // Désactiver toutes les lignes panier
    await LignePanier.updateMany(
      { panierId: commande.panierId },
      { est_actif: false },
      { session }
    );

    // Annuler toutes les lignes commande
    await LigneCommande.updateMany(
      { commandeId: commande._id },
      { statut: "Annulé" },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      message: "Commande annulée et panier/lignes désactivés avec succès",
      commande,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur lors de l'annulation:", error);
    res.status(500).json({ message: "Erreur lors de l'annulation", error });
  } finally {
    session.endSession();
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// update total commande
exports.updateTotalCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;

    //  Vérifier l'ID
    if (!mongoose.Types.ObjectId.isValid(commandeId)) {
      return res.status(400).json({ message: "ID commande invalide" });
    }

    //  Vérifier que la commande existe
    const commande = await Commande.findById(commandeId);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    //  Calculer le total avec uniquement les lignes actives
    const totalAgg = await LigneCommande.aggregate([
      {
        $match: {
          commandeId: new mongoose.Types.ObjectId(commandeId),
          statut: "Active",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$quantite", "$prixUnitaire"] } },
        },
      },
    ]);

    const total = totalAgg.length > 0 ? totalAgg[0].total : 0;

    //  Mettre à jour le champ `total` dans la commande
    commande.total = total;
    await commande.save();

    res.status(200).json({
      message: "Total commande mis à jour avec succès",
      commandeId,
      total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du total", error });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// Obtenir le nombre total de Commandes
exports.getCommandeCount = async (req, res) => {
  try {
    const count = await Commande.countDocuments();
    res.status(200).json({ totalCommandes: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Commandes journalières
exports.getDailySales = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const commandesToday = await Commande.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      statut: { $ne: "Annulé" },
    });

    const total = commandesToday.reduce(
      (sum, cmd) => sum + (cmd.total || 0),
      0
    );

    res.status(200).json({
      count: commandesToday.length,
      total: total.toFixed(3), // format TND
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

exports.annulerCommandeGlobale = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const commande = await Commande.findById(req.params.id).session(session);
    if (!commande) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // 1. Annuler la commande
    commande.statut = "Annulé";
    await commande.save({ session });

    // 2. Désactiver le panier + lignes
    if (commande.panierId) {
      await Panier.findByIdAndUpdate(
        commande.panierId,
        { est_actif: false },
        { session }
      );

      await LignePanier.updateMany(
        { panierId: commande.panierId },
        { est_actif: false },
        { session }
      );
    }

    // 3. Annuler les lignes de commande
    await LigneCommande.updateMany(
      { commandeId: commande._id },
      { statut: "Annulé" },
      { session }
    );

    // 4. Annuler la facture (si existe)
    const facture = await Facture.findOne({ commandeId: commande._id }).session(
      session
    );
    if (facture) {
      facture.statut = "Annulé";
      await facture.save({ session });

      // Annuler aussi ses lignes
      await LigneFacture.updateMany(
        { factureId: facture._id },
        { statut: "Annulé" },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(200).json({
      message: "Commande, panier, facture et lignes annulés avec succès",
      commandeId: commande._id,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur annulation globale:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'annulation globale", error });
  } finally {
    session.endSession();
  }
};
/////////////////////////////////:
exports.getCommandesByIdClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const commandes = await Commande.find({ clientId })
      .populate({
        path: "clientId",
        populate: { path: "utilisateurId" },
      })
      .populate("factureId")
      .sort({ createdAt: -1 });

    if (!commandes || commandes.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune commande trouvée pour ce client" });
    }

    res.status(200).json(commandes);
  } catch (err) {
    console.error("Erreur getCommandesByIdClient:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
