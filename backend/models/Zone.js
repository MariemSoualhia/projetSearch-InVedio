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
          }
 
        
 
});

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;