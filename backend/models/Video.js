const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  cameraName:{ type: String, },
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
