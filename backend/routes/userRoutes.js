const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendEmail = require("./emailService"); // Adjust the path accordingly

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    // Vérifie si le dossier d'upload existe, sinon il le crée
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/create", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error during user creation:", err);
    res.status(500).json({ message: "Error during user creation" });
  }
});

// Route for signing in (POST)
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For debugging purpose, check the stored hashed password
    console.log("Stored hashed password:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    });
    const dataRes = {
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        photoProfil: user.photoProfil,
      },
    };

    res.status(200).json(dataRes);
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Error during login" });
  }
});

// Route pour récupérer tous les utilisateurs (GET)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Route pour récupérer un utilisateur par son ID (GET)
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Route pour mettre à jour un utilisateur par son ID (PATCH)
router.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Route pour supprimer un utilisateur par son ID (DELETE)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Route pour mettre à jour un utilisateur par son ID (PUT)
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Vérifiez si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Mettez à jour les informations de l'utilisateur
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Enregistrez les modifications
    await user.save();

    // Réponse avec l'utilisateur mis à jour
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Route pour changer le mot de passe d'un utilisateur (PUT)
router.put("/change-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Vérifiez si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Vérifiez le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Incorrect current password" });
    }

    // Hachez le nouveau mot de passe et mettez à jour l'utilisateur
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    // Enregistrez les modifications
    await user.save();

    // Réponse avec l'utilisateur mis à jour
    res.send({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Route pour mettre à jour la photo de profil d'un utilisateur (PUT)
router.put(
  "/update-profile-picture/:id",
  upload.single("photoProfil"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Vérifiez si l'utilisateur existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Enregistrez le chemin absolu de la photo de profil
      user.photoProfil = path.join("/uploads", req.file.filename);

      // Enregistrez les modifications
      await user.save();

      // Réponse avec l'utilisateur mis à jour
      res.send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  }
);

// Configure the email transport using the default SMTP transport and a Gmail account.
// For other email services, see https://nodemailer.com/about/
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "siwargarrouri57@gmail.com",
    pass: "qecfduhhdhkqpxgd",
  },
});

// Route pour demander une réinitialisation de mot de passe
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested to reset the password of your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Route pour réinitialiser le mot de passe
router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password has been reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
