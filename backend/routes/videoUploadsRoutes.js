// routes/videos.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Video = require("../models/VideoUpload");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = "uploadsVideo/";
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

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = path.resolve(req.file.path);
    const video = new Video({
      name: req.file.originalname,
      path: filePath,
    });
    await video.save();
    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/:id", async (req, res) => {
    try {
     
  
        // Supprime l'entrée de la base de données
        await Video.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Video deleted successfully" });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
