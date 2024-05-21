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
const zoneRoutes = require("./routes/zoneRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const Video = require("./models/Video");
const moment = require("moment");
const path = require("path");
const setIpAddress = require("set-ip-address");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const axios = require("axios");

const Settings = require("./models/Settings");
const app = express();
const port = 3002;
let stream = null;
let rec = null;
let recordedFilePath;
const dirname = path.join(__dirname, "videos");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
dotenv.config();
app.use(bodyParser.json());
connectDB();

app.use("/api/cameras", cameraRoutes);
app.use("/api/user", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/videos", videoRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/zone", zoneRoutes);

app.get("/api/test", (req, res) => {
  res.send(200).json({ test: `ok` });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
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
    resolve(stream);
  });
}

app.get("/stream", async (req, res) => {
  const newRtspStreamUrl = req.query.rtsp;
  let currentRtspStreamUrl = "";

  try {
    if (!stream || currentRtspStreamUrl !== newRtspStreamUrl) {
      if (stream) {
        stream.stop();
      }
      await createStream(newRtspStreamUrl);
      currentRtspStreamUrl = newRtspStreamUrl;
      stream.on("data", (data) => {
        console.log(data);
      });
    }
    res.status(200).json({ message: "Stream started successfully" });
  } catch (error) {
    console.error("Erreur lors de la création du stream :", error);
    res.status(500).json({ error: "Erreur lors de la création du stream." });
  }
});

let allStreams = [];

async function createStreamByPort(rtspUrl, port) {
  return new Promise((resolve, reject) => {
    const stream = new Stream({
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
    resolve(stream);
  });
}

const stopStreamByPort = (port) => {
  const index = allStreams.findIndex((stream) => stream.port === port);
  if (index !== -1) {
    const stream = allStreams[index];
    stream.stream.stop();
    allStreams.splice(index, 1);
  }
  console.log("allStreams après suppression :", allStreams);
};

app.get("/stopStream", async (req, res) => {
  const port = req.query.port;

  try {
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

  try {
    const index = allStreams.findIndex((stream) => stream.port === port);
    if (index !== -1) {
      const stream = allStreams[index];
      stream.stream.stop();
      allStreams.splice(index, 1);
    }

    const newStream = await createStreamByPort(newRtspStreamUrl, port);
    newStream.on("data", (data) => {
      console.log(data);
    });
    res.status(200).json({ message: "Stream started successfully" });
  } catch (error) {
    console.error("Erreur lors de la création du stream :", error);
    res.status(500).json({ error: "Erreur lors de la création du stream." });
  }
});

app.post("/api/start-recording", (req, res) => {
  const { url, name, cameraName } = req.body;

  function startContinuousRecording() {
    rec = new Recorder({
      url: url,
      folder: dirname,
      name: "video.mp4",
    });

    rec.startRecording();
    rec.on("done", () => {
      // Restart recording once the current recording is done
      console.log("Recording completed, starting a new recording...");
      startContinuousRecording();
    });
  }

  startContinuousRecording();

  const videoData = {
    path: rec.getFilename(rec.getMediaTypePath()),
    name: name,
    cameraName: cameraName,
  };

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

async function createRecord(url, port, name, cameraName) {
  return new Promise((resolve, reject) => {
    function startContinuousRecording() {
      const rec = new Recorder({
        url: url,
        folder: dirname,
        name: "video.mp4",
      });

      rec.startRecording();
      rec.on("done", () => {
        // Restart recording once the current recording is done
        console.log("Recording completed, starting a new recording...");
        startContinuousRecording();
      });

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

      allRecords.push(newRecord);
      console.log("all records", allRecords);
      const video = new Video(newRecord.videoData);
      video
        .save()
        .then((savedVideo) => {
          console.log(
            "Vidéo enregistrée dans la base de données :",
            savedVideo
          );
          resolve(savedVideo);
        })
        .catch((error) => {
          console.error(
            "Erreur lors de l'enregistrement de la vidéo dans la base de données :",
            error
          );
          reject(error);
        });
    }

    startContinuousRecording();
  });
}

const stopRecordByPort = (port) => {
  console.log("lee port est ", port);
  const index = allRecords.findIndex((record) => record.port == port);
  console.log("la resultat est", index);
  if (index !== -1) {
    const record = allRecords[index];
    record.rec.stopRecording();
    allRecords.splice(index, 1);
  }
};

app.post("/api/startAllRecording", async (req, res) => {
  const { url, port, name, cameraName } = req.body;

  try {
    const savedVideo = await createRecord(url, port, name, cameraName);
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
      const eth0 = {
        interface: interface,
        dhcp: true,
      };

      await setIpAddress.configure([eth0]);
    } else {
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

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier envoyé.");
  }
  res.send(req.file.filename);
});

app.post("/rectangle", (req, res) => {
  const rectangleData = req.body;
  console.log("Coordonnées du rectangle reçues :", rectangleData);
  res.status(200).send("Coordonnées du rectangle reçues avec succès !");
});

async function createDevice() {
  try {
    const file = await Settings.find();

    console.log(file[0]);
    const requestData = {
      TokenAPI: file[0].dashboardToken,
      BassiraName: "Bassira",
      BassiraID: file[0].bassiraId,
      BassiraStatus: "on",
    };

    axios
      .post("https://dashboard.datadoit.io/api/bassira/create", requestData)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la requête POST :", error);
      });
  } catch (error) {
    console.error("Erreur lors de la conversion du JSON :", error);
  }
}

async function statusDevice() {
  try {
    const file = await Settings.find();

    console.log(file[0]);
    const requestData = {
      TokenAPI: file[0].dashboardToken,
      BassiraName: "Bassira",
      BassiraID: file[0].bassiraId,
      BassiraStatus: "on",
    };

    axios
      .patch("https://dashboard.datadoit.io/api/bassira/update", requestData)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la requête PATCH :", error);
      });
  } catch (error) {
    console.error("Erreur lors de la conversion du JSON :", error);
  }
}

function statusDeviceScheduler() {
  setInterval(() => {
    statusDevice();
  }, 60000);
}

statusDeviceScheduler();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
