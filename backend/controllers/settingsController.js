// settingsController.js

const Settings = require("../models/Settings");
const request = require('request')
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSettings = async (req, res) => {
  try {
    const newSettings = await Settings.create(req.body);
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

    // Effectuer la requête GET avec request.get
    request.get({
      url: 'https://dashboard.datadoit.io/api/tokenapi/test',
      json: true,
      body: {
        "TokenAPI": updatedSettings.dashboardToken,
      }
    }, (error, response, body) => {
      if (error) {
        res.status(200).json(error);
      } else {
        console.log('Réponse de la requête GET:', body);
        res.status(200).json(body);
      }
    });
    
    // Répondre avec les paramètres mis à jour
  
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: error.message });
  }
};
