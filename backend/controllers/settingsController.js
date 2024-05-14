// settingsController.js

const Settings = require("../models/Settings");

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
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
