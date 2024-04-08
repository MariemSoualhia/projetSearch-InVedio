const Camera = require("../models/Camera");

// Récupérer toutes les caméras
const getAllCameras = async (req, res) => {
  try {
    const cameras = await Camera.find();
    res.json(cameras);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Créer une nouvelle caméra
const createCamera = async (req, res) => {
  const camera = new Camera({
    name: req.body.name,
    address: req.body.address,
    username: req.body.username,
    password: req.body.password,
    rtspUrl: req.body.rtspUrl,
  });

  try {
    const newCamera = await camera.save();
    res.status(201).json(newCamera);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Récupérer une caméra par son ID
const getCameraById = async (req, res) => {
  res.json(res.camera);
};

// Mettre à jour une caméra par son ID
const updateCameraById = async (req, res) => {

  try {

    const { _id } = req.params;


    const updateCamera = await Camera.findOneAndUpdate(
      { _id },
      {
        $set: req.body,
      },
      { new: true } // return new Camera with update
    );
    if (!updateCamera) {
      return res.status(400).json({
        Message: "Failed to update Event",
        Success: false,
        data: updateCamera,
      });
    }
    return res
      .status(200)
      .json({ Message: "Camera updated successfully", data: updateCamera });
  } catch (error) {
    console.log("##########:", error);
    res.status(500).send({ Message: "Server Error", Error: error.message });
  }
};
const deleteCameraById = async (req, res) => {

  try {
    const { _id } = req.params;
    const removeCamera = await Camera.deleteOne({ _id });

    if (!removeCamera) {
      return res.status(400).json({ Message: "Failed to delete Event" });
    }
    return res.status(200).json({ Message: "Camera deleted successfully" });
  } catch (error) {
    console.log("##########:", error);
    res.status(500).send({ Message: "Server Error", Error: error.message });
  }
};

module.exports = {
  getAllCameras,
  createCamera,
  getCameraById,
  updateCameraById,
  deleteCameraById,
};
