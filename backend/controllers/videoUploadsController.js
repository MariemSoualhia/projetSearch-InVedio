// controllers/videoController.js
const VideoUpload = require('../models/VideoUpload');
const path = require('path');
const fs = require('fs');

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const newVideo = new VideoUpload({
      name: req.file.originalname,
      path: req.file.path,
    });

    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading video', error });
  }
};

const getUploadedVideos = async (req, res) => {
  try {
    const videos = await VideoUpload.find({});
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error });
  }
};

module.exports = { uploadVideo, getUploadedVideos };
