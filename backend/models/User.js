const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const defimg =
  "https://cdn.pixabay.com/photo/2017/03/21/13/27/evil-2162179_640.png";

// Définition du schéma du modèle User
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  photoProfil: { type: String, default: defimg },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Création du modèle User à partir du schéma
const User = mongoose.model("User", userSchema);

module.exports = User;
