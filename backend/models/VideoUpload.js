// models/VideoUpload.js
const mongoose = require('mongoose');

const videoUploadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VideoUpload', videoUploadSchema);
