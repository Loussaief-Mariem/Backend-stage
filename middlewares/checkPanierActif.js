const Panier = require("../models/panier.model");

const checkPanierActif = async (req, res, next) => {
  try {
    const { clientId, est_actif } = req.body;
    if (est_actif === true) {
      const panierActif = await Panier.findOne({ clientId, est_actif: true });

      if (panierActif) {
        return res.status(409).json({
          message: "Ce client a déjà un panier actif.",
        });
      }
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = checkPanierActif;
