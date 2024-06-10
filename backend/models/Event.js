const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const eventSchema = new mongoose.Schema({
    EventID: {
      type: String,
    },
    TokenAPI: {
      type: String,
    },
    CameraID: {
      type: String,
    },
    SessionID: {
      type: String,
    },
    UniversalID: {
      type: String,
    },
    AreaName: {
      type: String,
    },
    AreaID: {
      type: String,
    },
    CameraName: {
      type: String,
    },
    PictureURL: {
      type: String,
    },
    CentroidID: {
        type: String,
      },
    Timestamp: {
      type: String,
    },
    Hour: {
      type: String,
    },
    Day: {
      type: String,
    },
    DayName: {
      type: String,
    },
    Week: {
      type: String,
    },
    Month: {
      type: String,
    },
    Year: {
      type: String,
    },
    Visitor: {
      type: String,
    },
    Out: {
      type: String,
    },
    StayDuration: {
      type: String,
    },
    Gender: {
      type: String,
    },
    Age: {
      type: String,
    },
    Trigger: {
      type: String,
    },
    HourName: {
      type: String,
    },
  
    MonthName: {
      type: String,
    },
    EventType: {
      type: String,
    },
  
    VisitorID: {
      type: String,
      default: "",
    },
    Created: {
      type: Date,
      default: Date.now,
    },
    VIP: {
      type: Boolean,
      default: false,
    },
    IsSuspect: {
      type: Boolean,
      default: false,
    },
  
    CurrentOccupancy: {
      type: Number,
      default: 0,
    },
  });
  

  module.exports = mongoose.model("Events", eventSchema);
  
  