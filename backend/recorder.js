const express = require('express');
const  Recorder  = require('node-rtsp-recorder').Recorder;
var cors = require('cors')

const app = express();
app.use(cors())
const PORT = process.env.PORT || 5000;

app.use(express.json());

let rtspRecorder = null;

app.post('/api/start-recording', (req, res) => {
  const { url, folder, fileName, timeLimit } = req.body;

  var rec = new Recorder({
    url: 'rtsp://admin:Admin-123@192.168.0.12/profile1',
    folder: '/home/datadoit/Desktop/rtsp-stream-react/server/videos',
    //name: 'cam1',
})
// Starts Recording
rec.startRecording();

setTimeout(() => {
  console.log('Stopping Recording')
  rec.stopRecording()
  rec = null
}, 900000)
});

app.post('/api/stop-recording', (req, res) => {
  if (rtspRecorder) {
    rtspRecorder.stopRecording();
    rtspRecorder = null;
    console.log('Recording stopped');
    res.json({ message: 'Recording stopped' });
  } else {
    res.status(400).json({ error: 'No recording in progress' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
