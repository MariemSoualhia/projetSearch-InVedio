const mongoose = require("mongoose");

const stramSchema = new mongoose.Schema({
    
        stream: {
        type: Object,

      },
      
        args: {
        type: Object,

      },
        input_stream: {
            type: String,
          },
        output_stream: {
            type: String,
          },
        output_port: {
            type: Number,
          },
         stream_name: {
            type: String,
          },
         streamplay: {
            type: Boolean,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        
 
});

const Camera = mongoose.model("Stream", stramSchema);

module.exports = Camera;