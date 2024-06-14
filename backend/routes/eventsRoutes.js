const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController"); 

// Routes pour les événements
router.post("/", eventsController.createEvent);
router.get("/", eventsController.getAllEvents);
router.get("/:id", eventsController.getEventById);
router.put("/:id", eventsController.updateEvent);
router.delete("/:id", eventsController.deleteEvent);
router.get("/camera/:cameraId", eventsController.getEventsByCameraId);
router.get("/video", eventsController.getEventsByVideoPath);
router.get("/byCameraNameAndToday/:cameraName", eventsController.getEventsByCameraNameAndToday);

module.exports = router;
