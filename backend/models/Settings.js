// settingsModel.js

const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  bassiraId: {
    type: String,
    required: true,
  },
  areaName: {
    type: String,
    required: true,
  },
  dashboardToken: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
