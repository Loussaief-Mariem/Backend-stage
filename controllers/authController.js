const Utilisateur = require("../models/utilisateur.model");
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
    const { nom, prenom, email, password } = req.body;
    let user = await Utilisateur.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const newUser = new Utilisateur({ nom, prenom, email, password });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await Utilisateur.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Account doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({ token, refreshToken, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Utilisateur.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.SECRET || "secret", {
      expiresIn: "1h",
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset Password Link",
      text: `Cliquez sur ce lien pour réinitialiser votre mot de passe: http://localhost:5173/reset-password/${user._id}/${token}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reset password email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid token or expired" });
  }
};
