const Stream = require("../models/Stream");
// Récupérer toutes les caméras
const getAllStreams = async (req, res) => {
  try {
    const streams = await Stream.find();
    res.json(streams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createStream = async (req, res) => {
  try {
    // Créer et enregistrer la nouvelle caméra
    const stream = new Stream(req.body);
    await stream.save();

    res.status(201).json(stream);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateStreamById = async (req, res) => {
  try {
    const { _id } = req.params;

    const updateCamera = await Stream.findOneAndUpdate(
      { _id },
      {
        $set: req.body,
      },
      { new: true } // retourner la nouvelle caméra mise à jour
    );

    if (!updateCamera) {
      return res.status(400).json({
        Message: "Failed to update Camera",
        Success: false,
        data: updateCamera,
      });
    }

    return res.status(200).json({
      Message: "Camera updated successfully",
      data: updateCamera,
    });
  } catch (error) {
    console.log("##########:", error);
    res.status(500).send({ Message: "Server Error", Error: error.message });
  }
};

const getAllStreamsPlay = async (req, res) => {
  try {
    const streams = await Stream.find({ streamplay: true });
    res.json(streams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const stopStream = async (req, res) => {
  try {
    const { _id } = req.params;
    const updatedStream = await Stream.findByIdAndUpdate(
      _id,
      { $set: { streamplay: false } },
      { new: true }
    );
    res.json(updatedStream);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const updatePortStream = async (req, res) => {
  try {
    const { _id } = req.params;
    const updatedStream = await Stream.findByIdAndUpdate(
      _id,
      { $set: { output_port: req.body.port } },
      { new: true }
    );
    res.json(updatedStream);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const updateConnectStream = async (req, res) => {
  try {
    const { _id } = req.params;
    const updatedStream = await Stream.findByIdAndUpdate(
      _id,
      { $set: { stream: req.body.stream } },
      { new: true }
    );
    res.json(updatedStream);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteStreamById = async (req, res) => {
  try {
    const deletedZone = await Stream.findByIdAndDelete(req.params.id);
    if (!deletedZone) {
      return res.status(404).json({ message: 'Stream not found' });
    }
    res.status(200).json({ message: 'Stream deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAllStreams,
  createStream,
  updateStreamById,
  getAllStreamsPlay,
  stopStream,
  updatePortStream,
  updateConnectStream,
  deleteStreamById
};
