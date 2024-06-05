const Settings = require("../models/Settings");
const User = require("../models/User");
const request = require("request");

exports.getSettings = async (req, res) => {
  const { token } = req.query; // Assuming the token is passed as a query parameter

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const user = await User.findOne({ dashboardToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const settings = await Settings.findOne({ dashboardToken: token });
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSettings = async (req, res) => {
  try {
    const newSettings = await Settings.create(req.body);

    // Update the user's dashboardToken
    const user = await User.findOneAndUpdate(
      { _id: req.body.userId }, // Assuming userId is provided in the request body
      { dashboardToken: newSettings.dashboardToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json(newSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { _id } = req.params;
    const updatedSettings = await Settings.findOneAndUpdate({ _id }, req.body, {
      new: true,
    });

    // Update the user's dashboardToken
    const user = await User.findOneAndUpdate(
      { _id: req.body.userId }, // Assuming userId is provided in the request body
      { dashboardToken: updatedSettings.dashboardToken },
      { new: true }
    );

    // Effectuer la requête GET avec request.get
    request.get(
      {
        url: "https://dashboard.datadoit.io/api/tokenapi/test",
        json: true,
        body: {
          TokenAPI: updatedSettings.dashboardToken,
        },
      },
      (error, response, body) => {
        if (error) {
          res.status(200).json(error);
        } else {
          console.log("Réponse de la requête GET:", body);
          res.status(200).json(body);
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nouvelle fonction pour obtenir tous les paramètres
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nouvelle fonction pour supprimer des paramètres
exports.deleteSettings = async (req, res) => {
  const { _id } = req.params;
  
  try {
    const settings = await Settings.findByIdAndDelete(_id);

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json({ message: "Settings deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
