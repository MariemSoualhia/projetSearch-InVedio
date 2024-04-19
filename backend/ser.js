const express = require("express")
const Stream = require("node-rtsp-stream")
const  Recorder  = require('node-rtsp-recorder').Recorder;
const mongoose = require("mongoose");
const cors = require("cors")
const bodyParser = require('body-parser');
const connectDB = require("./db"); 
const cameraRoutes = require("./routes/cameraRoutes");
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutesjs');
const Video = require('./models/Video');
const moment = require('moment');
const path = require('path');
const setIpAddress = require('set-ip-address');
const multer = require('multer'); 
const app = express()
const port = 3002
let stream = null
let rec = null; 
let recordedFilePath; // Variable pour stocker le chemin du fichier enregistré
const dirname = path.join(__dirname, 'videos'); // Le dossier `videos` sera créé dans le répertoire du script
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
app.use('/api/user', userRoutes);
app.use('/api/videos', videoRoutes);
app.get("/api/test", (req, res) => { 
  res.send(200).json({ test: `ok` })
})

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
        stream.stop()
      }
      await createStream(newRtspStreamUrl);
      currentRtspStreamUrl = newRtspStreamUrl;
      stream.on('data', data => {
        console.log(`hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh`,data);
      });

    
      
    }

   
  } catch (error) {
    console.error("Erreur lors de la création du stream :", error);
    res.status(500).json({ error: "Erreur lors de la création du stream." });
  }
});

let rtspRecorder = null;

// Route pour démarrer l'enregistrement
app.post('/api/start-recording', (req, res) => {
  const { url, recordingDuration , name, cameraName} = req.body;

  // Création de l'enregistreur (Recorder) avec l'URL et le dossier de sauvegarde
  rec = new Recorder({
    url: url,
    timeLimit:recordingDuration,
    folder: dirname,
    name: 'video.mp4',
    //directoryPathFormat: '[vedio]',  
   // fileNameFormat: name  
  });


  // Démarrer l'enregistrement initial
  rec.startRecording();
  //const filePath = `${rec.folder}/${rec.name}/${rec.directoryPathFormat}/video/${rec.fileNameFormat}`;
  const videoData = {
    path: rec.getFilename(rec.getMediaTypePath()) ,
    name:name,
    cameraName:cameraName
  
  };
   // Créez un nouvel enregistrement Video et sauvegardez-le dans la base de données
   const video = new Video(videoData);
   video.save()
     .then(savedVideo => {
       console.log('Vidéo enregistrée dans la base de données :', savedVideo);
       res.json({ message: 'Recording Started', video: savedVideo });
     })
     .catch(error => {
       console.error('Erreur lors de l\'enregistrement de la vidéo dans la base de données :', error);
       res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la vidéo dans la base de données' });
     });



});



app.post('/api/stop-recording', (req,res) => {
  if (rec) {
    rec.stopRecording((output) => {
      recordedFilePath = output.file;
      console.log('Enregistrement terminé :', recordedFilePath);
      res.json({ filePath: recordedFilePath }); // Envoyer le chemin du fichier enregistré en réponse
    });
    rec = null;
    console.log('Recording stopped');
    res.json({ message: 'Recording stopped' });
  } else {
    res.status(400).json({ error: 'No recording in progress' });
  }
});


app.post('/config', async (req, res) => {
  const { interface, dhcp, ip, prefix, gateway } = req.body;
  console.log(`hiiiiiiiiiiii`)
  console.log(req.body)
  try {
    if (dhcp) {
      // Configuration DHCP
      const eth0 = {
        interface: interface,
        dhcp: true
      };

      await setIpAddress.configure([eth0]);
    } else {
      // Configuration Manuelle
 
      
      var vlan1 = {
        interface: interface,
        ip_address: ip,
        prefix: prefix,
        gateway: gateway,
        nameservers: ['8.8.8.8']
      };
      
      setIpAddress.configure([vlan1])
        .then((result) => {
          console.log('Résultat de la configuration réseau :', result);
          console.log('Configuration réseau appliquée avec succès !');
        })
        .catch((error) => {
          console.error('Erreur lors de la configuration réseau :', error);
        });
      
     
    }

    console.log('Configuration Réseau Appliquée avec Succès');
    res.send('Configuration Réseau Réussie !');
  } catch (error) {
    console.error('Erreur lors de la Configuration Réseau :', error);
    res.status(500).send('Erreur lors de la Configuration Réseau');
  }
});
// Configuration de multer pour gérer les fichiers envoyés
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Dossier où les fichiers seront enregistrés
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Nom de fichier unique
  }
});

const upload = multer({ storage: storage });

// Route pour recevoir l'image et la sauvegarder
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
      return res.status(400).send('Aucun fichier envoyé.');
  }
  // Vous pouvez traiter l'image sauvegardée ici, par exemple, renvoyer le nom du fichier sauvegardé.
  res.send(req.file.filename);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})