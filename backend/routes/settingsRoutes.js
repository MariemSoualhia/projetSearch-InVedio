// settingsRoutes.js

const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.get("/", settingsController.getSettings);
router.post("/", settingsController.createSettings); // Ajout de la route pour la création
router.put("/:_id", settingsController.updateSettings);

module.exports = router;
