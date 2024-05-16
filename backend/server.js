const express = require("express");
const Stream = require("node-rtsp-stream");
const Recorder = require("node-rtsp-recorder").Recorder;
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./db");
const cameraRoutes = require("./routes/cameraRoutes");
const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutesjs");
const streamRoutes = require("./routes/streamRouttes");
const zoneRoutes = require("./routes/zoneRoutes"); // Assurez-vous que le chemin est correct
const settingsRoutes = require("./routes/settingsRoutes");
const Video = require("./models/Video");
const moment = require("moment");
const path = require("path");
const setIpAddress = require("set-ip-address");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const axios = require("axios")

const Settings = require("./models/Settings");
const app = express();
const port = 3002;
let stream = null;
let rec = null;
let recordedFilePath; // Variable pour stocker le chemin du fichier enregistré
const dirname = path.join(__dirname, "videos"); // Le dossier `videos` sera créé dans le répertoire du script
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
dotenv.config();
// Parse application/json
app.use(bodyParser.json());
connectDB();

// Utilisation des routes pour les caméras
app.use("/api/cameras", cameraRoutes);
app.use("/api/user", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/zone", zoneRoutes); // Préfixe pour les routes de l'API

app.get("/api/test", (req, res) => {
  res.send(200).json({ test: `ok` });
});
// Configurer multer pour les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    // Vérifie si le dossier d'upload existe, sinon il le crée
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// Endpoint pour l'upload de fichiers
app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    const filePath = path.resolve(req.file.path);
    res.json({
      success: true,
      message: "File uploaded successfully",
      filePath: filePath,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "File upload failed",
    });
  }
});

// Servir les fichiers statiques du dossier uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
async function createStream(rtspUrl) {
  return new Promise((resolve, reject) => {
    stream = new Stream({
      name: "Camera Stream",
      streamUrl: rtspUrl,
      wsPort: 9999,
      ffmpegOptions: {
        "-rtsp_transport": "tcp",
        "-f": "mpegts",
        "-codec:v": "mpeg1video",
        "-codec:a": "mp2",
        "-stats": "",
        "-b:v": "3000k",
        "-s": "1280x720",
        "-ar": "44100",
        "-r": 30,
      },
    });
  });
}

app.get("/stream", async (req, res) => {
  const newRtspStreamUrl = req.query.rtsp;
  let currentRtspStreamUrl = "";

  try {
    // Create the WebSocket stream only if it doesn't exist or the RTSP URL has changed
    if (!stream || currentRtspStreamUrl !== newRtspStreamUrl) {
      if (stream || newRtspStreamUrl === "stop") {
        stream.stop();
      }
      await createStream(newRtspStreamUrl);
      currentRtspStreamUrl = newRtspStreamUrl;
      stream.on("data", (data) => {
        console.log(data);
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création du stream :", error);
    res.status(500).json({ error: "Erreur lors de la création du stream." });
  }
});
let allStreams = [];

async function createStreamByPort(rtspUrl, port) {
  return new Promise((resolve, reject) => {
    stream = new Stream({
      name: "Camera Stream",
      streamUrl: rtspUrl,
      wsPort: port,
      ffmpegOptions: {
        "-rtsp_transport": "tcp",
        "-f": "mpegts",
        "-codec:v": "mpeg1video",
        "-codec:a": "mp2",
        "-stats": "",
        "-b:v": "3000k",
        "-s": "532x324",
        "-ar": "44100",
        "-r": 30,
      },
    });
    let newStreamData = {
      url: rtspUrl,
      port: port,
      stream: stream,
    };
    allStreams.push(newStreamData);
  });
}
// Fonction pour arrêter un flux sur un port spécifié
const stopStreamByPort = (port) => {
  // Chercher le flux existant correspondant au port spécifié
  const index = allStreams.findIndex((stream) => stream.port === port);
  if (index !== -1) {
    // Si un flux correspondant est trouvé, l'arrêter
    const stream = allStreams[index];
    stream.stream.stop();
    // Retirer le flux du tableau
    allStreams.splice(index, 1);
  }
  console.log("allStreams après suppression :", allStreams);
};

app.get("/stopStream", async (req, res) => {
  const port = req.query.port;

  try {
    // Arrêter le flux sur le port spécifié en utilisant async/await
    await stopStreamByPort(port);
    res.status(200).json({ message: "Stream stopped successfully." });
  } catch (error) {
    console.error("Erreur lors de l'arrêt du flux :", error);
    res.status(500).json({ error: "Erreur lors de l'arrêt du flux." });
  }
});

app.get("/streamAll", async (req, res) => {
  const newRtspStreamUrl = req.query.rtsp;
  const port = req.query.port;
  let currentRtspStream = null;

  try {
    // Chercher le flux existant correspondant à la nouvelle URL RTSP
    const index = allStreams.findIndex((stream) => stream.port === port);
    if (index !== -1) {
      // Si un flux correspondant est trouvé, l'arrêter
      const stream = allStreams[index];
      stream.stream.stop();
      // Retirer le flux du tableau
      allStreams.splice(index, 1);
    }

    // Créer et démarrer le nouveau flux
    const newStream = await createStreamByPort(newRtspStreamUrl, port);

    // Écouter les données du flux
    newStream.on("data", (data) => {
      console.log(data);
    });
  } catch (error) {
    console.error("Erreur lors de la création du stream :", error);
    res.status(500).json({ error: "Erreur lors de la création du stream." });
  }
});

// Route pour démarrer l'enregistrement
app.post("/api/start-recording", (req, res) => {
  const { url, recordingDuration, name, cameraName } = req.body;

  // Création de l'enregistreur (Recorder) avec l'URL et le dossier de sauvegarde
  rec = new Recorder({
    url: url,
    timeLimit: recordingDuration,
    folder: dirname,
    name: "video.mp4",
    //directoryPathFormat: '[vedio]',
    // fileNameFormat: name
  });

  // Démarrer l'enregistrement initial
  rec.startRecording();
  //const filePath = `${rec.folder}/${rec.name}/${rec.directoryPathFormat}/video/${rec.fileNameFormat}`;
  const videoData = {
    path: rec.getFilename(rec.getMediaTypePath()),
    name: name,
    cameraName: cameraName,
  };
  // Créez un nouvel enregistrement Video et sauvegardez-le dans la base de données
  const video = new Video(videoData);
  video
    .save()
    .then((savedVideo) => {
      console.log("Vidéo enregistrée dans la base de données :", savedVideo);
      res.json({ message: "Recording Started", video: savedVideo });
    })
    .catch((error) => {
      console.error(
        "Erreur lors de l'enregistrement de la vidéo dans la base de données :",
        error
      );
      res.status(500).json({
        error:
          "Erreur lors de l'enregistrement de la vidéo dans la base de données",
      });
    });
});

app.post("/api/stop-recording", (req, res) => {
  if (rec) {
    rec.stopRecording((output) => {
      recordedFilePath = output.file;
      console.log("Enregistrement terminé :", recordedFilePath);
      res.json({ filePath: recordedFilePath });
    });
    rec = null;
    console.log("Recording stopped");
    res.json({ message: "Recording stopped" });
  } else {
    res.status(400).json({ error: "No recording in progress" });
  }
});

let allRecords = [];

async function createRecord(url, port, recordingDuration, name, cameraName) {
  return new Promise((resolve, reject) => {
    // Créez l'enregistreur avec les paramètres fournis
    const rec = new Recorder({
      url: url,
      timeLimit: recordingDuration,
      folder: dirname,
      name: "video.mp4",
    });

    // Démarrer l'enregistrement
    rec.startRecording();

    // Créez un objet pour représenter l'enregistrement
    const newRecord = {
      rec: rec,
      port: port,
      url: url,
      videoData: {
        path: rec.getFilename(rec.getMediaTypePath()),
        name: name,
        cameraName: cameraName,
      },
    };

    // Ajouter l'enregistrement au tableau
    allRecords.push(newRecord);
    console.log("all records", allRecords);
    // Enregistrez la vidéo dans la base de données
    const video = new Video(newRecord.videoData);
    video
      .save()
      .then((savedVideo) => {
        console.log("Vidéo enregistrée dans la base de données :", savedVideo);
        resolve(savedVideo);
      })
      .catch((error) => {
        console.error(
          "Erreur lors de l'enregistrement de la vidéo dans la base de données :",
          error
        );
        reject(error);
      });
  });
}

const stopRecordByPort = (port) => {
  console.log("lee port est ", port);
  // Trouver l'enregistrement correspondant au port spécifié
  const index = allRecords.findIndex((record) => record.port == port);
  console.log("la resultat est", index);
  if (index !== -1) {
    // Si un enregistrement correspondant est trouvé, l'arrêter
    const record = allRecords[index];
    record.rec.stopRecording();
    // Retirer l'enregistrement du tableau
    allRecords.splice(index, 1);
  }
};

app.post("/api/startAllRecording", async (req, res) => {
  const { url, port, recordingDuration, name, cameraName } = req.body;

  try {
    // Créer un nouvel enregistrement
    const savedVideo = await createRecord(
      url,
      port,
      recordingDuration,
      name,
      cameraName
    );
    res.json({ message: "Recording Started", video: savedVideo });
  } catch (error) {
    console.error("Error starting recording:", error);
    res.status(500).json({ error: "Error starting recording" });
  }
});

app.post("/api/stopAllRecording", async (req, res) => {
  const port = req.query.port;
  console.log("le port arriver est ", port);
  try {
    // Arrêter l'enregistrement sur le port spécifié
    await stopRecordByPort(port);
    res.json({ message: "Recording stopped" });
  } catch (error) {
    console.error("Error stopping recording:", error);
    res.status(500).json({ error: "Error stopping recording" });
  }
});

app.post("/config", async (req, res) => {
  const { interface, dhcp, ip, prefix, gateway } = req.body;
  console.log(`hiiiiiiiiiiii`);
  console.log(req.body);
  try {
    if (dhcp) {
      // Configuration DHCP
      const eth0 = {
        interface: interface,
        dhcp: true,
      };

      await setIpAddress.configure([eth0]);
    } else {
      // Configuration Manuelle

      var vlan1 = {
        interface: interface,
        ip_address: ip,
        prefix: prefix,
        gateway: gateway,
        nameservers: ["8.8.8.8"],
      };

      setIpAddress
        .configure([vlan1])
        .then((result) => {
          console.log("Résultat de la configuration réseau :", result);
          console.log("Configuration réseau appliquée avec succès !");
        })
        .catch((error) => {
          console.error("Erreur lors de la configuration réseau :", error);
        });
    }

    console.log("Configuration Réseau Appliquée avec Succès");
    res.send("Configuration Réseau Réussie !");
  } catch (error) {
    console.error("Erreur lors de la Configuration Réseau :", error);
    res.status(500).send("Erreur lors de la Configuration Réseau");
  }
});

// Route pour recevoir l'image et la sauvegarder
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier envoyé.");
  }
  // Vous pouvez traiter l'image sauvegardée ici, par exemple, renvoyer le nom du fichier sauvegardé.
  res.send(req.file.filename);
});

// Endpoint POST pour recevoir les coordonnées du rectangle
app.post("/rectangle", (req, res) => {
  const rectangleData = req.body;
  console.log("Coordonnées du rectangle reçues :", rectangleData);
  // Vous pouvez traiter les coordonnées du rectangle ici, par exemple les enregistrer dans une base de données

  res.status(200).send("Coordonnées du rectangle reçues avec succès !");
});

async function createDevice() {
  // Lecture du fichier JSON
 
      try {
          const file = await Settings.find();
         
          console.log(file[0])
          const requestData = {
            TokenAPI: file[0].dashboardToken,
            BassiraName: 'Bassira',
            BassiraID: file[0].bassiraId,
            BassiraStatus: 'on'
        };

        // Envoi de la requête PATCH
        axios.post('https://dashboard.datadoit.io/api/bassira/create', requestData)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Erreur lors de la requête POST :', error);
            });
      } catch (error) {
          console.error('Erreur lors de la conversion du JSON :', error);
      }
  
}
async function statusDevice() {
  // Lecture du fichier JSON
 
      try {
          const file = await Settings.find();
         
          console.log(file[0])
          const requestData = {
            TokenAPI: file[0].dashboardToken,
            BassiraName: 'Bassira',
            BassiraID: file[0].bassiraId,
            BassiraStatus: 'on'
        };

        // Envoi de la requête PATCH
        axios.patch('https://dashboard.datadoit.io/api/bassira/update', requestData)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Erreur lors de la requête PATCH :', error);
            });
      } catch (error) {
          console.error('Erreur lors de la conversion du JSON :', error);
      }
  
}

// Définition de la fonction pour exécuter statusDevice toutes les 5 minutes
function statusDeviceScheduler() {
  setInterval(() => {
    statusDevice();
}, 60000); // 60000 millisecondes = 1 minute

}
createDevice()
// Appel de la fonction de planification
statusDeviceScheduler();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
