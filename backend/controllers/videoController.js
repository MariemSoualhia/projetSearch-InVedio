const Video = require('../models/Video');
const fs = require('fs');


// Récupérer toutes les caméras
const getAllVideos = async (req, res) => {
  try {
      let query = {}; // Requête de recherche vide par défaut

      // Vérifier si un terme de recherche est fourni dans les paramètres de requête
      if (req.query.search) {
          // Utiliser une expression régulière pour rechercher le terme dans le nom du vidéo
          query.name = { $regex: req.query.search, $options: 'i' }; // 'i' pour l'insensibilité à la casse
      }

      const videos = await Video.find(query); // Récupérer les vidéos correspondant à la requête
      res.json(videos); // Renvoyer les vidéos en tant que réponse JSON
  } catch (error) {
      console.error('Erreur lors de la récupération des vidéos :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des vidéos depuis la base de données' });
  }
};


const getVideo = async(req, res) => {
    const videoId = req.params.id;

    try {
        // Récupérer les informations sur la vidéo depuis la base de données
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).send('Video not found');
        }

        const filePath = video.path;
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunksize = end - start + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4'
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4'
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res)
        }
    } catch (error) {
        console.error('Error serving video:', error);
        res.status(500).send('Internal Server Error');
    }

}
const deleteVideoById = async (req, res) => {
    try {
      const { _id } = req.params;
      const video = await Video.findById(_id);
  
      if (!video) {
        return res.status(404).json({ Message: "Video not found" });
      }
  
      // Vérifie si le fichier existe
      if (fs.existsSync(video.path)) {
        // Suppression du fichier
        fs.unlinkSync(video.path);
      }
  
      // Suppression de l'enregistrement vidéo dans la base de données
      await Video.deleteOne({ _id });
  
      return res.status(200).json({ Message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ Message: "Server Error", Error: error.message });
    }
  };
  module.exports = {
    getAllVideos,
    getVideo,
    deleteVideoById
  }