const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
    
   
         zone_name: {
            type: String,
            unique: true, 
            required: true,
            
          },
          type: {
            type: String,
          },
          areaName:
          {
            type: String,
          },
          CameraID: {
            type: String,
          },
          SessionID: {
            type: String,
          },
          TokenAPI: {
            type: String,
          },
          ForceCreate: {
            type: Boolean,
          },
          MaxOccupancy: {
            type: Number,
          },
          


          
        
 
});

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;