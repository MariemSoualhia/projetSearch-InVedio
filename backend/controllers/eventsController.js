const Event = require("../models/Event"); // Assurez-vous d'ajuster le chemin si nécessaire

// Créer un nouvel événement
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création de l'événement", error });
  }
};

// Obtenir tous les événements
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la récupération des événements",
      error,
    });
  }
};

// Obtenir un événement par son ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la récupération de l'événement",
      error,
    });
  }
};

// Mettre à jour un événement
const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour de l'événement", error });
  }
};

// Supprimer un événement
const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }
    res.status(200).json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la suppression de l'événement", error });
  }
};

const getEventsByCameraId = async (req, res) => {
  try {
    const events = await Event.find({ CameraID: req.params.cameraId });
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la récupération des événements pour la caméra",
      error,
    });
  }
};
// Obtenir des événements par chemin de vidéo
const getEventsByVideoPath = async (req, res) => {
  try {
    const events = await Event.find({ VideoPath: req.query.videoPath });
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la récupération des événements pour la vidéo",
      error,
    });
  }
};
module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByCameraId,
  getEventsByVideoPath,
};
