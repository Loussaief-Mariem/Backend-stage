const Utilisateur = require("../models/utilisateur.model");
const Client = require("../models/client.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Générer token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.SECRET || "secret",
    {
      expiresIn: "1h",
    }
  );
};

// Générer refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN || "refresh_secret",
    { expiresIn: "1y" }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, telephone, genre, adresse } =
      req.body;

    // Vérifier si l'utilisateur existe déjà
    let user = await Utilisateur.findOne({ email });
    if (user)
      return res.status(400).json({ message: "L'utilisateur existe déjà" });

    // Vérifier si le téléphone est déjà utilisé
    const clientExist = await Client.findOne({ telephone });
    if (clientExist)
      return res
        .status(400)
        .json({ message: "Le numéro de téléphone est déjà utilisé" });

    // Créer le nouvel utilisateur
    const newUser = new Utilisateur({ nom, prenom, email, password });
    await newUser.save();

    // Créer le client associé
    const newClient = new Client({
      utilisateurId: newUser._id,
      telephone: telephone || "",
      genre: genre || "",
      adresse: adresse || "",
    });
    await newClient.save();

    res.status(201).json({
      message: "Utilisateur inscrit avec succès",
      user: newUser,
      client: newClient,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const user = await Utilisateur.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Le compte n'existe pas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Identifiants invalides" });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Récupérer les informations du client
    const client = await Client.findOne({ utilisateurId: user._id });

    res.status(200).json({
      token,
      refreshToken,
      user: {
        ...user.toObject(),
        clientInfo: client,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Utilisateur.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const token = jwt.sign({ id: user._id }, process.env.SECRET || "secret", {
      expiresIn: "1h",
    });

    const frontendUrl = process.env.FRONTEND_URL;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Réinitialisation de mot de passe - Nawara",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5D4037;">Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe Nawara.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <p>
            <a href="${frontendUrl}/reset-password/${user._id}/${token}" 
               style="background-color: #5D4037; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email de réinitialisation envoyé" });
  } catch (err) {
    console.error("Erreur envoi email:", err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  try {
    jwt.verify(token, process.env.SECRET || "secret");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Utilisateur.findByIdAndUpdate(id, { password: hashedPassword });
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    res.status(400).json({ message: "Token invalide ou expiré" });
  }
};
