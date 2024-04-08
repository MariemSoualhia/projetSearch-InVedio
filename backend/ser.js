const express = require("express")
const Stream = require("node-rtsp-stream")
const  Recorder  = require('node-rtsp-recorder').Recorder;
const mongoose = require("mongoose");
const cors = require("cors")
const bodyParser = require('body-parser');
const connectDB = require("./db"); 
const cameraRoutes = require("./routes/cameraRoutes");
const Video = require('./models/Video');
const app = express()
const port = 3002
let stream = null
let rec = null; 
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)
// Parse application/json
app.use(bodyParser.json());
connectDB();
// Utilisation des routes pour les caméras
app.use("/api/cameras", cameraRoutes);
app.get("/stream", (req, res) => {
  const newRtspStreamUrl = req.query.rtsp
  let currentRtspStreamUrl = ""

  // Create the WebSocket stream only if it doesn't exist or the RTSP URL has changed
  if (!stream || currentRtspStreamUrl !== newRtspStreamUrl) {
    if (stream || newRtspStreamUrl === "stop") {
      stream.stop()
    }
    stream = new Stream({
      name: "Camera Stream",
      streamUrl: newRtspStreamUrl,
      wsPort: 9999,
      ffmpegOptions: { // options ffmpeg flags
        "-rtsp_transport": "tcp",
        "-f": "mpegts",
        "-codec:v": "mpeg1video",
        "-codec:a": "mp2",
        "-stats": "",
        "-b:v": "3000k",
        "-s": "1280x720",  
        "-ar": "44100",
        "-r": 30,
      }
    })
    currentRtspStreamUrl = newRtspStreamUrl
  }

  res.send(200).json({ url: `ws://127.0.0.1:9999` })
})
let rtspRecorder = null;

app.post('/api/start-recording', (req, res) => {
  const { url, recordingDuration, cameraName } = req.body;

  // Création de l'enregistreur (Recorder) sans limite de temps
  rec = new Recorder({
    url: url,
    path: '/home/datadoit/Desktop/rtsp-stream-react/server/videos',
    title: 'Test Camera',
    directoryPattern: '%Y.%m.%d',
    filenamePattern: '%H.%M.%S',
    name: cameraName,
    timeLimit: recordingDuration 
  });

  // Démarre l'enregistrement
  rec.startRecording();

  res.json({ message: 'Recording Started' });
});



app.post('/api/stop-recording', (req,res) => {
  if (rec) {
    rec.stopRecording();
    rec = null;
    console.log('Recording stopped');
    res.json({ message: 'Recording stopped' });
  } else {
    res.status(400).json({ error: 'No recording in progress' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})