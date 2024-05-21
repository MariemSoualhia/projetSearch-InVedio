const express = require("express");
const mongoose = require("mongoose");
const Video = require("../models/Video");
const fs = require("fs");
const path = require("path");

// Function to retrieve all videos
const getAllVideos = async (req, res) => {
  try {
    let query = {}; // Default empty search query

    // Check if a search term is provided in the request parameters
    if (req.query.search) {
      // Use a regular expression to search for the term in the video name
      query.name = { $regex: req.query.search, $options: "i" }; // 'i' for case insensitivity
    }

    const videos = await Video.find(query); // Retrieve videos matching the query
    res.json(videos); // Send the videos as JSON response
  } catch (error) {
    console.error("Error retrieving videos:", error);
    res.status(500).json({
      error: "Error retrieving videos from the database",
    });
  }
};
// Route pour obtenir l'URL de partage d'une vidéo par son ID

// Function to serve video streaming
const getVideo = async (req, res) => {
  const videoId = req.params.id;

  try {
    // Retrieve video information from the database
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).send("Video not found");
    }

    const filePath = video.path;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error("Error serving video:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Function to delete a video by its ID
const deleteVideoById = async (req, res) => {
  try {
    const { _id } = req.params;
    const video = await Video.findById(_id);

    if (!video) {
      return res.status(404).json({ Message: "Video not found" });
    }

    // Check if the file exists
    if (fs.existsSync(video.path)) {
      // Delete the file
      fs.unlinkSync(video.path);
    }

    // Delete the video record from the database
    await Video.deleteOne({ _id });

    return res.status(200).json({ Message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ Message: "Server Error", Error: error.message });
  }
};

// Function to download a video by its ID
const downloadVideo = async (req, res) => {
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).send("Video not found");
    }

    const filePath = video.path;
    const fileName = video.name + path.extname(filePath);

    // Set appropriate headers to trigger download dialog in the browser
    res.setHeader("Content-disposition", "attachment; filename=" + fileName);
    res.setHeader("Content-type", "video/mp4");

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getAllVideos,
  getVideo,
  deleteVideoById,
  downloadVideo,
};
