const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');

// Créer une nouvelle zone
router.post('/zones', zoneController.createZone);

// Obtenir toutes les zones
router.get('/zones', zoneController.getZones);

// Obtenir une zone par ID
router.get('/zones/:id', zoneController.getZoneById);

// Mettre à jour une zone par ID
router.put('/zones/:id', zoneController.updateZoneById);

// Supprimer une zone par ID
router.delete('/zones/:id', zoneController.deleteZoneById);
// Route to get all internal zones
// Route to get all internal zones
router.get('/internal', zoneController.getInternalZones);

// Route to get all gate zones
router.get('/gate', zoneController.getGateZones);
module.exports = router;
