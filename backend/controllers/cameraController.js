const Camera = require("../models/Camera");
const axios = require("axios")
// Récupérer toutes les caméras
const getAllCameras = async (req, res) => {
  try {
    const cameras = await Camera.find();
    res.json(cameras);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAvailablePort = async (usedPorts) => {
  // Définir la plage de ports disponibles
  const minPort = 8000;
  const maxPort = 9000;

  // Vérifier chaque port dans la plage
  for (let port = minPort; port <= maxPort; port++) {
    // Vérifier si le port est déjà utilisé par une autre caméra
    if (usedPorts.includes(port)) {
      continue; // Passer au port suivant s'il est déjà utilisé
    }

    try {
      // Utiliser une promesse pour vérifier si le port est disponible
      await new Promise((resolve, reject) => {
        const server = require("net").createServer();
        server.unref();
        server.on("error", reject);
        server.listen(port, () => {
          server.close(() => {
            resolve(port);
          });
        });
      });
      // Si la promesse est résolue, le port est disponible
      return port;
    } catch (error) {
      // Si une erreur se produit, le port est déjà utilisé, passez au suivant
      continue;
    }
  }
  // Si aucun port disponible n'est trouvé, retournez null ou lancez une exception
  return null;
};

// Utilisation de la fonction getAvailablePort lors de la création d'une nouvelle caméra
const createCamera = async (req, res) => {
  try {
    // Envoyer une requête POST vers l'autre serveur
    const networkData = {
      ip_address: req.body.address,
      login: req.body.username,
      pwd: req.body.password,
    };
    const response = await axios.post('http://localhost:5002/add_network', networkData);

    // Vérifier la réponse et enregistrer l'URL RTSP dans la base de données
    const rtspUrl = response.data.valid_links.find(link => link.includes(req.body.address));
    
    // Récupérer les ports utilisés par d'autres caméras
    const usedPorts = await Camera.distinct("port");

    // Obtenir un port disponible pour la nouvelle caméra
    const port = await getAvailablePort(usedPorts);
    if (!port) {
      return res.status(400).json({
        Message: "Failed to update Camera: No available ports within the specified range.",
        Success: false,
      });
    }

    // Créer et enregistrer la nouvelle caméra
    const camera = new Camera({
      name: req.body.name,
      address: req.body.address,
      username: req.body.username,
      password: req.body.password,
      rtspUrl: rtspUrl,
      port: port
    });
    await camera.save();

    res.status(201).json(camera);
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

    // Envoyer une requête POST vers l'autre serveur pour obtenir l'URL RTSP mise à jour
    const networkData = {
      ip_address: req.body.address,
      login: req.body.username,
      pwd: req.body.password,
    };

    const response = await axios.post('http://localhost:5000/add_network', networkData);

    // Vérifier la réponse et récupérer l'URL RTSP mise à jour
    const rtspUrl = response.data.valid_links.find(link => link.includes(req.body.address));

    const updateCamera = await Camera.findOneAndUpdate(
      { _id },
      {
        $set: {
          name: req.body.name,
          address: req.body.address,
          username: req.body.username,
          password: req.body.password,
          rtspUrl: rtspUrl,
        },
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
