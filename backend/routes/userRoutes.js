const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// Route pour créer un nouvel utilisateur (POST)
router.post("/create", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur avec le mot de passe haché
    const newUser = new User({ username, email, password: hashedPassword });

    // Enregistrer l'utilisateur dans la base de données
    await newUser.save();

    // Réponse avec l'utilisateur créé
    res.status(201).send(newUser);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, "votre_secret_key_secrete", {
      expiresIn: "1h", // Durée de validité du token (par exemple, 1 heure)
    });
    const dataRes = {
      token: token,
      user: user,
    };
    // Réponse avec le token
    res.status(200).json(dataRes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la connexion" });
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
      return res.status(404).send({ message: "Utilisateur non trouvé" });
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
      return res.status(404).send({ message: "Utilisateur non trouvé" });
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
      return res.status(404).send({ message: "Utilisateur non trouvé" });
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});
// Ajoutez la route pour mettre à jour un utilisateur par son ID (PATCH)
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Vérifiez si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé" });
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

module.exports = router;
