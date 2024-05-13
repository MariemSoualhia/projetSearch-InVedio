const express = require("express");
const router = express.Router();
const streamController = require("../controllers/StreamController");
router.get("/", streamController.getAllStreams);
// Route pour récupérer les flux en cours de lecture
router.get("/play", streamController.getAllStreamsPlay);
// Route pour créer une nouvelle caméra
router.post("/", streamController.createStream);

// Route pour mettre à jour une caméra spécifique par son ID
router.put("/:_id", streamController.updateStreamById);
router.put("/stop/:_id", streamController.stopStream);

// Route pour supprimer une caméra spécifique par son ID

module.exports = router;
