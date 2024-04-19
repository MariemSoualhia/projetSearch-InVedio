const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  // Vous pouvez ajouter d'autres champs ici selon les besoins
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Création du modèle User à partir du schéma
const User = mongoose.model('User', userSchema);

module.exports = User;
