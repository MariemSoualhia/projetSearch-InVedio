// settingsRoutes.js

const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.get("/", settingsController.getSettings);
router.get("/all", settingsController.getAllSettings);
router.post("/", settingsController.createSettings); 
router.put("/:_id", settingsController.updateSettings);
router.delete("/delete/:_id", settingsController.deleteSettings);

module.exports = router;
