const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  rtspUrl: {
    type: String,
    
  },
port:{
  type:Number,
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Camera = mongoose.model("Camera", cameraSchema);

module.exports = Camera;
