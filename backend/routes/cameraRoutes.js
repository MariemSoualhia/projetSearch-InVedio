const express = require("express");
const router = express.Router();
const cameraController = require("../controllers/cameraController");

// Route pour récupérer toutes les caméras
router.get("/", cameraController.getAllCameras);

// Route pour créer une nouvelle caméra
router.post("/", cameraController.createCamera);

// Route pour récupérer une caméra spécifique par son ID
router.get("/:id", cameraController.getCameraById);

// Route pour mettre à jour une caméra spécifique par son ID
router.put("/:_id", cameraController.updateCameraById);

// Route pour supprimer une caméra spécifique par son ID
router.delete("/:_id", cameraController.deleteCameraById);

module.exports = router;
