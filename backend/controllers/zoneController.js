const Zone = require('../models/Zone'); // Assurez-vous que le chemin est correct

// Créer une nouvelle zone
exports.createZone = async (req, res) => {
  try {
    const { zone_name, type, areaName } = req.body;
    const newZone = new Zone({ zone_name, type, areaName });
    await newZone.save();
    res.status(201).json(newZone);
  } catch (error) {
    if (error.code === 11000) { // Code d'erreur pour les doublons
      return res.status(400).json({ message: 'Zone name must be unique' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Obtenir toutes les zones
exports.getZones = async (req, res) => {
  try {
    console.log("fffffffffffff")
    const zones = await Zone.find();
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une zone par ID
exports.getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }
    res.status(200).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une zone par ID
exports.updateZoneById = async (req, res) => {
  try {
    const { zone_name, type, areaName } = req.body;
    const updatedZone = await Zone.findByIdAndUpdate(
      req.params.id,
      { zone_name, type, areaName },
      { new: true, runValidators: true }
    );
    if (!updatedZone) {
      return res.status(404).json({ message: 'Zone not found' });
    }
    res.status(200).json(updatedZone);
  } catch (error) {
    if (error.code === 11000) { // Code d'erreur pour les doublons
      return res.status(400).json({ message: 'Zone name must be unique' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une zone par ID
exports.deleteZoneById = async (req, res) => {
  try {
    const deletedZone = await Zone.findByIdAndDelete(req.params.id);
    if (!deletedZone) {
      return res.status(404).json({ message: 'Zone not found' });
    }
    res.status(200).json({ message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to get all internal zones using aggregate
exports.getInternalZones = async (req, res) => {
    try {
        console.log("fffffffffffff")
        const zones = await Zone.find({ type: 'internal zone' } );
        res.status(200).json(zones);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

  
  // Function to get all gate zones using aggregate
  exports.getGateZones = async (req, res) => {
    try {
      console.log("Fetching gate zones...");
      const gateZones = await Zone.find({ type: 'gate zone' } );
      console.log("Gate Zones:", gateZones);
      res.status(200).json(gateZones);
    } catch (err) {
      console.error("Error fetching gate zones:", err);
      res.status(500).json({ message: err.message });
    }
  };


