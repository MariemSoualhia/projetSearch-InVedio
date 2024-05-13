import React, { useState, useRef, useEffect } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import moment from "moment";
import axios from "axios";
import {
  Grid,
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  MenuItem,
  Menu,
  ListItemIcon,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import { ContactSupportOutlined, Videocam } from "@material-ui/icons";
import { API_API_URL } from "../../config/serverApiConfig";

const useStyles = makeStyles((theme) => ({
  streamContainer: {
    position: "relative",
    width: "960px", // Ajouter une largeur fixe pour le conteneur
    height: "544px", // Ajouter une hauteur fixe pour le conteneur
  },
  stream: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: theme.spacing(1),
    backgroundColor: "transparent", // Modification pour rendre le canvas transparent
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2), // Espacement entre les éléments
    padding: theme.spacing(2), // Ajoutez du padding selon vos besoins
    backgroundColor: '#f0f0f0', // Couleur de fond
    borderRadius: theme.shape.borderRadius, // Ajoutez des bordures arrondies
    boxShadow: theme.shadows[2], // Ajoutez une ombre si nécessaire
  },
}));

const DetectionPage = ({ stream: initialStream, allCameras }) => {
  const classes = useStyles();
  const [selectedCamera, setSelectedCamera] = useState({
    name: "",
  });
  const [stream, setStream] = useState(initialStream);
  const [selectedCameraList, setSelectedCameraList] = useState([{}]);
  const [selectedPort, setSelectedPort] = useState(() => {
    // Récupérer le port initial depuis le stockage local, ou null s'il n'existe pas
    const selectedCameraName = localStorage.getItem("selectedCameraName");
    const storedPort = localStorage.getItem(
      `selectedPort${selectedCameraName}`
    );
    return storedPort ? JSON.parse(storedPort) : { name: "" };
  });

  const [cameras, setCameras] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingStart, setIsDrawingStart] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [endCoords, setEndCoords] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState([]);
  const [drawMode, setDrawMode] = useState("roi");
  const [drawDirection, setDrawDirection] = useState("left");
  const [drawFlowDirection, setDrawFlowDirection] = useState("in_out");
  const [lineCoordinates, setLineCoordinates] = useState({});
  const [connectedToStream, setConnectedToStream] = useState(false);
  const [connections, setConnections] = useState({});
  const [connectionNow, setConnectionsNow] = useState(); 
  const socketRef = useRef();
  const peersRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStream, setCurrentStream] = useState();

  const [isTimer, setTimer] = useState("off");

  useEffect(() => {
    const selectedCameraName = localStorage.getItem(
      "selectedCamera" + selectedCamera.name
    );

    // Définir une valeur par défaut pour storedPort
    let storedPort = 99999;

    // Vérifier si le nom de la caméra sélectionnée existe
    if (selectedCameraName) {
      // Récupérer le port sélectionné depuis le localStorage, ou null s'il n'existe pas
      const storedPort = localStorage.getItem(
        "selectedPort" +
          "selectedPort" +
          localStorage.getItem("selectedCamera" + selectedCamera.name).name
      );
    }
    if (storedPort) {
      setSelectedPort(storedPort);
    }
  }, []); // Ce useEffect s'exécutera une seule fois après le premier rendu

  useEffect(() => {
    // Récupérer la caméra sélectionnée depuis le localStorage, ou null si elle n'existe pas
    const storedCamera = JSON.parse(
      localStorage.getItem("selectedCamera" + selectedCamera.name)
    );
    if (storedCamera) {
      setSelectedCamera(storedCamera);
    }
  }, []); // Ce useEffect s'exécutera une seule fois après le premier rendu

  useEffect(() => {
    // Jouer la vidéo lorsque videoReady est true

    const videoElement = videoRef.current;
    //const playPromise = videoElement.play();
if(stream){

    FristStream();
 
  
}
  
  }, []);

  useEffect(() => {
    fetchCameras();
    //initializeVideo();
  }, []);

  const initializeVideo = () => {
    const videoPlayer = videoRef.current;
    if (videoPlayer) {
      videoPlayer.load();
      setVideoReady(true);
    }
  };
  const handleTimerChange = (event) => {
    console.log(event.target.checked);
    setTimer(event.target.checked ? "on" : "off");
    console.log(isTimer);
  };

  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/cameras");
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };
  const FristStream = async () => {
    //stopStreamedVideo(videoRef.current)

    var connections = {};
    var reportError;

    function getLocalStream() {
      var constraints = { audio: false, video: true };
      if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
      }
    }
    function onIncomingSDP(url, sdp) {
      console.log("Incoming SDP: (%s)" + JSON.stringify(sdp), url);

      function onLocalDescription(desc) {
        console.log("Local description (%s)\n" + JSON.stringify(desc), url);
        connections[url].webrtcPeer
          .setLocalDescription(desc)
          .then(function () {
            connections[url].websocket.send(
              JSON.stringify({
                type: "sdp",
                data: connections[url].webrtcPeer.localDescription,
              })
            );
          })
          .catch(reportError);
      }

      connections[url].webrtcPeer.setRemoteDescription(sdp).catch(reportError);

      if (connections[url].type == "inbound") {
        connections[url].webrtcPeer
          .createAnswer()
          .then(onLocalDescription)
          .catch(reportError);
      } else if (connections[url].type == "outbound") {
        getLocalStream().then((stream) => {
          console.log("Adding local stream");
          connections[url].webrtcPeer.addStream(stream);
          connections[url].webrtcPeer
            .createAnswer()
            .then((sdp) => {
              var arr = sdp.sdp.split("\r\n");
              arr.forEach((str, i) => {
                if (/^a=fmtp:\d*/.test(str)) {
                  arr[i] =
                    str +
                    ";x-google-max-bitrate=10000;x-google-min-bitrate=0;x-google-start-bitrate=6000";
                } else if (/^a=mid:(1|video)/.test(str)) {
                  arr[i] += "\r\nb=AS:10000";
                }
              });
              sdp = new RTCSessionDescription({
                type: "answer",
                sdp: arr.join("\r\n"),
              });
              onLocalDescription(sdp);
            })
            .catch(reportError);
        });
      }
    }

    function onIncomingICE(url, ice) {
      var candidate = new RTCIceCandidate(ice);
      console.log("Incoming ICE (%s)\n" + JSON.stringify(ice), url);
      connections[url].webrtcPeer.addIceCandidate(candidate).catch(reportError);
    }

    function getConnectionStats(url, reportType) {
      if (reportType == undefined) reportType = "all";

      connections[url].webrtcPeer.getStats(null).then((stats) => {
        let statsOutput = "";

        stats.forEach((report) => {
          // Le reste de votre logique JavaScript...
        });

        var statsElement =
          connections[url].type == "inbound" ? "stats-player" : "stats-sender";
        //document.getElementById(statsElement).innerHTML = statsOutput;
      });
    }

    function onAddRemoteStream(event) {
      var url = event.srcElement.url;
      console.log("Adding remote stream to HTML video player (%s)", url);
      if (event.streams[0] && url) {
        connections[url].videoElement.srcObject = event.streams[0];
        //connections[url].videoElement.play();
      }
    }

    function onIceCandidate(event) {
      var url = event.srcElement.url;

      if (event.candidate == null) return;

      console.log(
        "Sending ICE candidate out (%s)\n" + JSON.stringify(event.candidate),
        url
      );
      connections[url].websocket.send(
        JSON.stringify({ type: "ice", data: event.candidate })
      );
    }

    function onServerMessage(event) {
      var msg;
      var url = event.srcElement.url;

      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }

      if (!connections[url].webrtcPeer) {
        connections[url].webrtcPeer = new RTCPeerConnection(
          connections[url].webrtcConfig
        );
        connections[url].webrtcPeer.url = url;

        connections[url].webrtcPeer.onconnectionstatechange = (ev) => {
          console.log(
            "WebRTC connection state (%s) " +
              connections[url].webrtcPeer.connectionState,
            url
          );
          if (connections[url].webrtcPeer.connectionState == "connected")
            setInterval(
              getConnectionStats,
              1000,
              url,
              connections[url].type == "inbound"
                ? "inbound-rtp"
                : "outbound-rtp"
            );
        };

        if (connections[url].type == "inbound")
          connections[url].webrtcPeer.ontrack = onAddRemoteStream;
        connections[url].webrtcPeer.onicecandidate = onIceCandidate;
      }

      switch (msg.type) {
        case "sdp":
          onIncomingSDP(url, msg.data);
          break;
        case "ice":
          onIncomingICE(url, msg.data);
          break;
        default:
          break;
      }
    }

    function playStream(
      videoPlayer,
      hostname,
      port,
      path,
      configuration,
      reportErrorCB
    ) {
      var l = window.location;

      if (path == "null") return;
      var wsProt = l.protocol == "https:" ? "wss://" : "ws://";
      var wsHost = hostname != undefined ? hostname : l.hostname;
      var wsPort =
        port != undefined
          ? port
          : stream.output_port
      var wsPath = path != undefined ? path : "/ws";
      if (wsPort) wsPort = ":" + wsPort;
      var wsUrl = wsProt + wsHost + wsPort + wsPath;
      console.log("Video server URL: " + wsUrl);
      var url = wsUrl;

      connections[url] = {};

      connections[url].type = "inbound";
      connections[url].videoElement = videoRef.current; // Utilisation de la référence vidéo
      connections[url].webrtcConfig = configuration;
      reportError =
        reportErrorCB != undefined ? reportErrorCB : function (text) {};

      connections[url].websocket = new WebSocket(wsUrl);
      connections[url].websocket.addEventListener("message", onServerMessage);
    }

    function sendStream(hostname, port, path, configuration, reportErrorCB) {
      var l = window.location;
      if (path == "null") return;
      if (l.protocol != "https:") {
        alert("Please use HTTPS to enable the use of your browser webcam");
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("getUserMedia() not available (confirm HTTPS is being used)");
        return;
      }
      var wsProt = l.protocol == "https:" ? "wss://" : "ws://";
      var wsHost = hostname != undefined ? hostname : l.hostname;
      var wsPort =
        port != undefined
          ? port
          : localStorage.getItem("selectedPort" + selectedCamera.name);
      var wsPath = path != undefined ? path : "/ws";
      if (wsPort) wsPort = ":" + wsPort;
      var wsUrl = wsProt + wsHost + wsPort + wsPath;
      console.log("Video server URL: " + wsUrl);
      var url = wsUrl;

      connections[url] = {};

      connections[url].type = "outbound";
      connections[url].webrtcConfig = configuration;
      reportError =
        reportErrorCB != undefined ? reportErrorCB : function (text) {};

      connections[url].websocket = new WebSocket(wsUrl);
      connections[url].websocket.addEventListener("message", onServerMessage);
    }

    playStream(
      "video-player",
      null,
      null,
      "/output",
      { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
      function (errmsg) {
        console.error(errmsg);
      }
    );
    sendStream(
      null,
      null,
      "null",
      { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
      function (errmsg) {
        console.error(errmsg);
      }
    );
  };
  const handleCameraButtonClick = async (cam) => {
    setSelectedCamera(cam);
    localStorage.setItem("selectedCamera" + cam.name, JSON.stringify(cam));
    setSelectedCameraList((prevList) => [...prevList, cam]);

    // Enregistrer la liste mise à jour dans le localStorage
    const updatedList = [...selectedCameraList, cam];
    localStorage.setItem("selectedCameraList", JSON.stringify(updatedList));

    const data = {
      input_stream: cam.rtspUrl,
      startDet: "false",
      camera_name: cam.name,
    };
    const response = await axios.post("http://127.0.0.1:5050/get_output", data);
    console.log("la resultat est", response.data);
    console.log(response.data.port);
    setCurrentStream(response.data.stream);
 
    //const selectedCamera = JSON.parse(localStorage.getItem('selectedCamera'+selectedCamera.name));
    localStorage.setItem(
      "selectedPort" + selectedCamera.name,
      response.data.port
    );

    if (response) {
      const dataStream ={
        input_stream: cam.rtspUrl,
        output_port:response.data.port,
  
        stream_name:cam.name,
        streamplay:true,
  
      }
      const response2 = await axios.post("http://127.0.0.1:3002/api/stream/", dataStream);
      console.log(response2)
      const updatedStream = { ...initialStream, ...response2.data };
        setStream(updatedStream);
      setSelectedPort(response.data.port);
      var connections = {};
      var reportError;
      var port = localStorage.getItem("selectedPort");

      function getLocalStream() {
        var constraints = { audio: false, video: true };
        if (navigator.mediaDevices.getUserMedia) {
          return navigator.mediaDevices.getUserMedia(constraints);
        }
      }

      function onIncomingSDP(url, sdp) {
        console.log("Incoming SDP: (%s)" + JSON.stringify(sdp), url);

        function onLocalDescription(desc) {
          console.log("Local description (%s)\n" + JSON.stringify(desc), url);
          connections[url].webrtcPeer
            .setLocalDescription(desc)
            .then(function () {
              connections[url].websocket.send(
                JSON.stringify({
                  type: "sdp",
                  data: connections[url].webrtcPeer.localDescription,
                })
              );
            })
            .catch(reportError);
        }

        connections[url].webrtcPeer
          .setRemoteDescription(sdp)
          .catch(reportError);

        if (connections[url].type == "inbound") {
          connections[url].webrtcPeer
            .createAnswer()
            .then(onLocalDescription)
            .catch(reportError);
        } else if (connections[url].type == "outbound") {
          getLocalStream().then((stream) => {
            console.log("Adding local stream");
            connections[url].webrtcPeer.addStream(stream);
            connections[url].webrtcPeer
              .createAnswer()
              .then((sdp) => {
                var arr = sdp.sdp.split("\r\n");
                arr.forEach((str, i) => {
                  if (/^a=fmtp:\d*/.test(str)) {
                    arr[i] =
                      str +
                      ";x-google-max-bitrate=10000;x-google-min-bitrate=0;x-google-start-bitrate=6000";
                  } else if (/^a=mid:(1|video)/.test(str)) {
                    arr[i] += "\r\nb=AS:10000";
                  }
                });
                sdp = new RTCSessionDescription({
                  type: "answer",
                  sdp: arr.join("\r\n"),
                });
                onLocalDescription(sdp);
              })
              .catch(reportError);
          });
        }
      }

      function onIncomingICE(url, ice) {
        var candidate = new RTCIceCandidate(ice);
        console.log("Incoming ICE (%s)\n" + JSON.stringify(ice), url);
        connections[url].webrtcPeer
          .addIceCandidate(candidate)
          .catch(reportError);
      }

      function getConnectionStats(url, reportType) {
        if (reportType == undefined) reportType = "all";

        connections[url].webrtcPeer.getStats(null).then((stats) => {
          let statsOutput = "";

          stats.forEach((report) => {
            // Le reste de votre logique JavaScript...
          });

          var statsElement =
            connections[url].type == "inbound"
              ? "stats-player"
              : "stats-sender";
          //document.getElementById(statsElement).innerHTML = statsOutput;
        });
      }

      function onAddRemoteStream(event) {
        var url = event.srcElement.url;
        console.log("Adding remote stream to HTML video player (%s)", url);
        connections[url].videoElement.srcObject = event.streams[0];
        //connections[url].videoElement.play();
      }

      function onIceCandidate(event) {
        var url = event.srcElement.url;

        if (event.candidate == null) return;

        console.log(
          "Sending ICE candidate out (%s)\n" + JSON.stringify(event.candidate),
          url
        );
        connections[url].websocket.send(
          JSON.stringify({ type: "ice", data: event.candidate })
        );
      }

      function onServerMessage(event) {
        var msg;
        var url = event.srcElement.url;

        try {
          msg = JSON.parse(event.data);
        } catch (e) {
          return;
        }

        if (!connections[url].webrtcPeer) {
          connections[url].webrtcPeer = new RTCPeerConnection(
            connections[url].webrtcConfig
          );
          connections[url].webrtcPeer.url = url;

          connections[url].webrtcPeer.onconnectionstatechange = (ev) => {
            console.log(
              "WebRTC connection state (%s) " +
                connections[url].webrtcPeer.connectionState,
              url
            );
            if (connections[url].webrtcPeer.connectionState == "connected")
              setInterval(
                getConnectionStats,
                1000,
                url,
                connections[url].type == "inbound"
                  ? "inbound-rtp"
                  : "outbound-rtp"
              );
          };

          if (connections[url].type == "inbound")
            connections[url].webrtcPeer.ontrack = onAddRemoteStream;
          connections[url].webrtcPeer.onicecandidate = onIceCandidate;
        }

        switch (msg.type) {
          case "sdp":
            onIncomingSDP(url, msg.data);
            break;
          case "ice":
            onIncomingICE(url, msg.data);
            break;
          default:
            break;
        }
      }

      function playStream(
        videoPlayer,
        hostname,
        port,
        path,
        configuration,
        reportErrorCB
      ) {
        var l = window.location;
        //const selectedCamera = JSON.parse(localStorage.getItem('selectedCamera'+selectedCamera.name));

        if (path == "null") return;
        var wsProt = l.protocol == "https:" ? "wss://" : "ws://";
        var wsHost = hostname != undefined ? hostname : l.hostname;
        var wsPort =
          port != undefined
            ? port
            : localStorage.getItem("selectedPort" + selectedCamera.name);
        var wsPath = path != undefined ? path : "/ws";
        if (wsPort) wsPort = ":" + wsPort;
        var wsUrl = wsProt + wsHost + wsPort + wsPath;
        console.log("Video server URL: " + wsUrl);
        var url = wsUrl;

        connections[url] = {};

        connections[url].type = "inbound";
        connections[url].videoElement = videoRef.current; // Utilisation de la référence vidéo
        connections[url].webrtcConfig = configuration;
        reportError =
          reportErrorCB != undefined ? reportErrorCB : function (text) {};
         
          
          
          
          // Mettez à jour les données de connexion dans le state ou où vous en avez besoin
          setConnectionsNow(connections[url]);
          const videoData = {
            src: videoRef.current.src,
            // Ajoutez d'autres propriétés pertinentes si nécessaire
          };
          
          // Créez l'objet connections[url] avec les données extraites
          const connectionData = {
          type : "inbound",
           videoElement : videoRef.current.src,
            webrtcConfig : configuration,
            reportError :
              reportErrorCB != undefined ? reportErrorCB : function (text) {},
          };
          
          
          // Mettez à jour les données de connexion dans le state ou où vous en avez besoin
          setConnectionsNow(connections[url]);
          
          // Enregistrez les données de connexion dans le localStorage
          localStorage.setItem(
            "connections[" + response.data.port + "]",
            JSON.stringify(connectionData)
          );
        
    
        connections[url].websocket = new WebSocket(wsUrl);
        connections[url].websocket.addEventListener("message", onServerMessage);
        //connections[url].websocket.close()

        //localStorage.setItem('connections', JSON.stringify(connections[url]));
      }

      function sendStream(hostname, port, path, configuration, reportErrorCB) {
        var l = window.location;
        if (path == "null") return;
        if (l.protocol != "https:") {
          alert("Please use HTTPS to enable the use of your browser webcam");
          return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("getUserMedia() not available (confirm HTTPS is being used)");
          return;
        }
        var wsProt = l.protocol == "https:" ? "wss://" : "ws://";
        var wsHost = hostname != undefined ? hostname : l.hostname;
        var wsPort =
          port != undefined
            ? port
            : localStorage.getItem(
                "selectedPort" +
                  localStorage.getItem("selectedCamera" + selectedCamera.name)
                    .name
              );
        var wsPath = path != undefined ? path : "/ws";
        if (wsPort) wsPort = ":" + wsPort;
        var wsUrl = wsProt + wsHost + wsPort + wsPath;
        console.log("Video server URL: " + wsUrl);
        var url = wsUrl;

        connections[url] = {};

        connections[url].type = "outbound";
        connections[url].webrtcConfig = configuration;

        reportError =
          reportErrorCB != undefined ? reportErrorCB : function (text) {};

        connections[url].websocket = new WebSocket(wsUrl);
        connections[url].websocket.addEventListener("message", onServerMessage);
      }

      playStream(
        "video-player",
        null,
        null,
        "/output",
        { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
        function (errmsg) {
          console.error(errmsg);
        }
      );
      sendStream(
        null,
        null,
        "null",
        { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
        function (errmsg) {
          console.error(errmsg);
        }
      );
    }
  };
  const startDrawing = (event) => {
    setIsDrawingStart(true);
    if (drawMode == "line") {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;

      const y = event.clientY - rect.top;
      console.log("la pt est ", event.clientY);
      setStartCoords({ x, y: canvas.height });
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
    
      if (points.length === 0) {
        // Premier clic : enregistrer le point de départ (coin supérieur gauche)
        setPoints([{ x, y }]);
      } else if (points.length === 1) {
        // Deuxième clic : enregistrer le point de fin (coin inférieur droit)
        const startPoint = points[0];
        const endPoint = { x, y };
        const width = Math.abs(endPoint.x - startPoint.x);
        const height = Math.abs(endPoint.y - startPoint.y);
        const bottomRight = { x: startPoint.x + width, y: startPoint.y + height };
        const topRight = { x: bottomRight.x, y: startPoint.y };
        const bottomLeft = { x: startPoint.x, y: bottomRight.y };
        setPoints([...points, topRight, bottomRight, bottomLeft]);
      } else {
        // Reset si déjà quatre points enregistrés
        setPoints([{ x, y }]);
      }
    }
  };
  const draw = (event) => {
    if (drawMode === "line") {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const x = startCoords.x; // Coordonnée x fixe
      const y = event.clientY - rect.top; // Coordonnée y du curseur
      setEndCoords({ x, y: 0 });

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();

      // Dessine une ligne verticale
      ctx.moveTo(x, 0); // Commence en haut du canvas
      ctx.lineTo(x, canvas.height); // Se termine en bas du canvas

      ctx.lineWidth = 5; // Épaisseur de la ligne
      ctx.strokeStyle = "red"; // Couleur de la ligne
      ctx.stroke();
    }
  };

  // Fonction pour fermer la connexion
  const closeConnection = () => {
    // Code pour fermer la connexion WebSocket
    // Par exemple :
    Object.values(connections).forEach((connection) => {
      connection.websocket.close();
    });
  };

  // Effet pour fermer la connexion lorsque le composant est démonté
  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, []); 



  const handleDirectionChange = (event) => {
    setDrawDirection(event.target.value);
  };
  const handleFlowDirectionChange = (event) => {
    setDrawFlowDirection(event.target.value);
  };
  function stopStreamedVideo(videoPlayer) {
    const stream = videoPlayer.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });
    localStorage.removeItem("selectedPort");
    videoPlayer.srcObject = null;
  }
  const stopStream = async () => {
    const data = {
      input_stream: selectedCamera.rtspUrl,
    };
    console.log(data);
  
    const response = await axios.post("http://127.0.0.1:5050/stop_stream", data);
    const response2 = await axios.put(`http://127.0.0.1:3002/api/stream/stop/${stream._id}`);
  
    if (response && response2) {
      console.log(response);
      console.log(response2);
      window.location.reload()
  
      // Récupérer les données de connexion du localStorage
      const connectionData = JSON.parse(localStorage.getItem("connections[" + stream.output_port + ']'));
  
     
    }
  };
  

  const drawRectangle = (side) => {
    // Récupération des coordonnées de la ligne
    const { start, end } = lineCoordinates;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Calcul des coordonnées du rectangle

    let x1, x2, y1, y2;
    let rectangleData = {};
    if (side === "left") {
      x1 = 0;
      y1 = 0;
      x2 = 0;
      y2 = canvas.height;
    } else if (side === "right") {
      x1 = canvas.width;
      y1 = 0;
      x2 = canvas.width;
      y2 = canvas.height;
    } else {
      // Gérer les cas invalides ou par défaut
      return;
    }
    const x3 = startCoords.x;
    const y3 = startCoords.y;
    const x4 = endCoords.x;
    const y4 = endCoords.y;

    // Dessin du rectangle
    //ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer le canvas
    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.strokeStyle = "blue";
    ctx.stroke();
    if (drawMode == "line") {
      rectangleData = {
        input_stream: stream.input_stream,
        port: stream.output_port,
        type_app: drawMode,
        pos_line: drawDirection,
        flow_dir: drawFlowDirection,
        x1: { x: x1, y: y1 },
        y1: { x: x2, y: y2 },
        x2: { x: x3, y: y3 },
        y2: { x: x4, y: y4 },
      };
    } else {
      rectangleData = {
        input_stream: stream.input_stream,
        port:stream.output_port,
        type_app: drawMode,
        enable_timer: isTimer,

        x1: points[0],
        y1: points[1],
        x2: points[2],
        y2: points[3],
      };
    }
    stopStreamedVideo(videoRef.current);
    //stopStream()

    console.log(rectangleData);
    const data = {
      input_stream: stream.rtspUrl,
    };
    // Envoyer les coordonnées du rectangle au backend (exemple avec Axios)
   axios.post("http://127.0.0.1:5050/stop_stream", data);
   //connectionNow.websocket.close()
    axios
      .post("http://127.0.0.1:5050/start_counting", rectangleData)
      

      .then((response) => {
        console.log("Coordonnées du rectangle envoyées avec succès !");
        console.log(response.data.port);
        const dataToSend={
          port:response.data.port
        }
        axios.put(`http://127.0.0.1:3002/api/stream/updatePort/${stream._id}`, dataToSend) .then((resp) => {
          console.log("Coordonnées du rectangle envoyées avec succès !");
          
         const updatedStream = { ...initialStream, ...resp.data };
         setStream(updatedStream);
        })
       

          
        setSelectedPort(response.data.port);

        clearCanvas();
        console.log( connectionNow.websocket);

        var connections = {};
        var reportError;
        var port = response.data.port;

        function getLocalStream() {
          var constraints = { audio: false, video: true };
          if (navigator.mediaDevices.getUserMedia) {
            return navigator.mediaDevices.getUserMedia(constraints);
          }
        }

        function onIncomingSDP(url, sdp) {
          console.log("Incoming SDP: (%s)" + JSON.stringify(sdp), url);
          function onLocalDescription(desc) {
            console.log("Local description (%s)\n" + JSON.stringify(desc), url);
            connections[url].webrtcPeer
              .setLocalDescription(desc)
              .then(function () {
                connections[url].websocket.send(
                  JSON.stringify({
                    type: "sdp",
                    data: connections[url].webrtcPeer.localDescription,
                  })
                );
              })
              .catch(reportError);
          }

          connections[url].webrtcPeer
            .setRemoteDescription(sdp)
            .catch(reportError);

          if (connections[url].type == "inbound") {
            connections[url].webrtcPeer
              .createAnswer()
              .then(onLocalDescription)
              .catch(reportError);
          } else if (connections[url].type == "outbound") {
            getLocalStream().then((stream) => {
              console.log("Adding local stream");
              connections[url].webrtcPeer.addStream(stream);
              connections[url].webrtcPeer
                .createAnswer()
                .then((sdp) => {
                  var arr = sdp.sdp.split("\r\n");
                  arr.forEach((str, i) => {
                    if (/^a=fmtp:\d*/.test(str)) {
                      arr[i] =
                        str +
                        ";x-google-max-bitrate=10000;x-google-min-bitrate=0;x-google-start-bitrate=6000";
                    } else if (/^a=mid:(1|video)/.test(str)) {
                      arr[i] += "\r\nb=AS:10000";
                    }
                  });
                  sdp = new RTCSessionDescription({
                    type: "answer",
                    sdp: arr.join("\r\n"),
                  });
                  onLocalDescription(sdp);
                })
                .catch(reportError);
            });
          }
        }

        function onIncomingICE(url, ice) {
          var candidate = new RTCIceCandidate(ice);
          console.log("Incoming ICE (%s)\n" + JSON.stringify(ice), url);
          connections[url].webrtcPeer
            .addIceCandidate(candidate)
            .catch(reportError);
        }

        function getConnectionStats(url, reportType) {
          if (reportType === undefined) reportType = "all";

          connections[url].webrtcPeer.getStats(null).then((stats) => {
            let statsOutput = "";

            stats.forEach((report) => {
              // Vérifier le type de rapport
              if (reportType === "all" || report.type === reportType) {
                // Ajouter les informations du rapport à la sortie
                statsOutput += `<p>${report.type} - ${report.stat}</p>`;
                // Vous pouvez accéder à d'autres propriétés du rapport ici selon vos besoins
              }
            });
          });
        }

        function onAddRemoteStream(event) {
          var url = event.srcElement.url;
          console.log("Adding remote stream to HTML video player (%s)", url);
          connections[url].videoElement.srcObject = event.streams[0];
          connections[url].videoElement.play();
        }

        function onIceCandidate(event) {
          var url = event.srcElement.url;

          if (event.candidate == null) return;

          console.log(
            "Sending ICE candidate out (%s)\n" +
              JSON.stringify(event.candidate),
            url
          );
          connections[url].websocket.send(
            JSON.stringify({ type: "ice", data: event.candidate })
          );
        }

        function onServerMessage(event) {
          var msg;
          var url = event.srcElement.url;

          try {
            msg = JSON.parse(event.data);
          } catch (e) {
            return;
          }

          if (!connections[url].webrtcPeer) {
            connections[url].webrtcPeer = new RTCPeerConnection(
              connections[url].webrtcConfig
            );
            connections[url].webrtcPeer.url = url;

            connections[url].webrtcPeer.onconnectionstatechange = (ev) => {
              console.log(
                "WebRTC connection state (%s) " +
                  connections[url].webrtcPeer.connectionState,
                url
              );
              if (connections[url].webrtcPeer.connectionState == "connected")
                setInterval(
                  getConnectionStats,
                  1000,
                  url,
                  connections[url].type == "inbound"
                    ? "inbound-rtp"
                    : "outbound-rtp"
                );
            };

            if (connections[url].type == "inbound")
              connections[url].webrtcPeer.ontrack = onAddRemoteStream;
            connections[url].webrtcPeer.onicecandidate = onIceCandidate;
          }

          switch (msg.type) {
            case "sdp":
              onIncomingSDP(url, msg.data);
              break;
            case "ice":
              onIncomingICE(url, msg.data);
              break;
            default:
              break;
          }
        }

        function playStream(
          videoPlayer,
          hostname,
          port,
          path,
          configuration,
          reportErrorCB
        ) {
          var l = window.location;
          if (path == "null") return;
          var wsProt = l.protocol == "https:" ? "wss://" : "ws://";
          var wsHost = hostname != undefined ? hostname : l.hostname;
          var wsPort =
            port != undefined
              ? port
              : response.data.port
          var wsPath = path != undefined ? path : "/ws";
          if (wsPort) wsPort = ":" + wsPort;
          var wsUrl = wsProt + wsHost + wsPort + wsPath;
          console.log("Video server URL: " + wsUrl);
          var url = wsUrl;

          connections[url] = {};

          connections[url].type = "inbound";
          connections[url].videoElement = videoRef.current; // Utilisation de la référence vidéo
          connections[url].webrtcConfig = configuration;
          reportError =
            reportErrorCB != undefined ? reportErrorCB : function (text) {};
       
          setConnectionsNow(connections[url]);
      
          connections[url].websocket = new WebSocket(wsUrl);
          connections[url].websocket.addEventListener(
            "message",
            onServerMessage
          );
        }

        function sendStream(
          hostname,
          port,
          path,
          configuration,
          reportErrorCB
        ) {
          var l = window.location;
          if (path == "null") return;
          if (l.protocol != "https:") {
            alert("Please use HTTPS to enable the use of your browser webcam");
            return;
          }
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("getUserMedia() not available (confirm HTTPS is being used)");
            return;
          }
          var wsProt = l.protocol == "https:" ? "wss://" : "ws://";
          var wsHost = hostname != undefined ? hostname : l.hostname;
          var wsPort = port != undefined ? port : stream.output_port;
          var wsPath = path != undefined ? path : "/ws";
          if (wsPort) wsPort = ":" + wsPort;
          var wsUrl = wsProt + wsHost + wsPort + wsPath;
          console.log("Video server URL: " + wsUrl);
          var url = wsUrl;

          connections[url] = {};

          connections[url].type = "outbound";
          connections[url].webrtcConfig = configuration;
          reportError =
            reportErrorCB != undefined ? reportErrorCB : function (text) {};

          connections[url].websocket = new WebSocket(wsUrl);
          connections[url].websocket.addEventListener(
            "message",
            onServerMessage
          );
        }

        playStream(
          "video-player",
          null,
          null,
          "/output",
          { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
          function (errmsg) {
            console.error(errmsg);
          }
        );
        sendStream(
          null,
          null,
          "null",
          { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
          function (errmsg) {
            console.error(errmsg);
          }
        );
      })
      .catch((error) => {
        console.error(
          "Erreur lors de l'envoi des coordonnées du rectangle :",
          error
        );
      });
  };

  const stopDrawing = () => {
    if (drawMode == "line") {
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    console.log(ctx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStartCoords({ x: 0, y: 0 });
    setEndCoords({ x: 0, y: 0 });
    setIsDrawingStart(false);
  };

  const handleDrawMode = (value) => {
    setDrawMode(value);
  };

  const handleMouseDown = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Effacer les points existants si le nombre de points est égal à quatre
    if (points.length === 4) {
      setPoints([{ x, y }]);
    } else {
      // Ajouter un nouveau point
      setPoints([...points, { x, y }]);
    }
  };

  const clearZone = () => {
    setPoints([]);
    setIsDrawingStart(false);
  };

  const drawZone = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    // Effacer le contenu précédent du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Dessiner les points
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Dessiner un cercle de rayon 5
      ctx.fillStyle = "blue";
      ctx.fill();
      ctx.closePath();
    });
  
    // Vérifier si nous avons exactement quatre points
    if (points.length === 4) {
      const topLeft = points[0];
      const topRight = points[1];
      const bottomRight = points[2];
      const bottomLeft = points[3];
  
      // Dessiner le rectangle
      ctx.beginPath();
      ctx.moveTo(topLeft.x, topLeft.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.lineTo(bottomRight.x, bottomRight.y);
      ctx.lineTo(bottomLeft.x, bottomLeft.y);
      ctx.closePath();
  
      ctx.lineWidth = 2;
      ctx.strokeStyle = "blue";
      ctx.stroke();
    }
  
    console.log(points);
  };
  

  React.useEffect(() => {
    drawZone();
  }, [points]);
  const handleDrawModeChange = (event) => {
    setDrawMode(event.target.value);
  };
  return (
    <>
        <p> {stream&&stream.input_stream}</p>
      <div className={classes.streamContainer}>
        <video
          id="video-player"
          ref={videoRef}
          className={classes.stream}
          width={960}
          height={544}
          autoPlay
          controls
          playsInline
          muted
        >
          Your browser does not support video
          <source src="https://vimeo.com/475068701.mp4" type="video/mp4" />
        </video>

        <canvas
          ref={canvasRef}
          className={classes.stream}
          width={960}
          height={544}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
        ></canvas>
      </div>

      {stream.output_port&& (
       <div className={classes.controlsContainer}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              value={drawMode}
              onChange={handleDrawModeChange}
              row
            >
              <FormControlLabel value="roi" control={<Radio />} label="ROI" />
              <FormControlLabel
                value="line"
                control={<Radio />}
                label="Trippwaire"
              />
            </RadioGroup>
          </FormControl>
          {drawMode === "roi" && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isTimer === "on"}
                    onChange={handleTimerChange}
                  />
                }
                label="Timer"
              />
            </FormGroup>
          )}
          {drawMode === "line" && (
            <>
              <FormControl>
                <InputLabel id="demo-simple-select-label">Position</InputLabel>

                <Select
                  labelId="direction-label"
                  id="direction-select"
                  value={drawDirection}
                  onChange={handleDirectionChange}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Flow direction</InputLabel>
                <Select
                  labelId="direction-label"
                  id="direction-select"
                  value={drawFlowDirection}
                  onChange={handleFlowDirectionChange}
                >
                  <MenuItem value="in_out">In/Out</MenuItem>
                  <MenuItem value="in">In</MenuItem>
                  <MenuItem value="out">Out</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => drawRectangle(drawDirection)}
            className={classes.button}
          >
            Start Counting
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={stopStream}
            className={classes.button}
          >
            Stop Stream
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={drawMode === "line" ? clearCanvas : clearZone}
            disabled={!isDrawingStart}
            className={classes.button}
          >
            Clear
          </Button>
        </div>
      )}
      <List className={classes.cameraList}>
        {cameras.map((camera, index) => (
          <ListItem
            key={camera.id}
            button
            onClick={() => handleCameraButtonClick(camera)}
            className={classes.cameraItem}
          >
            <ListItemIcon>
              <Videocam color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body1">{camera.name}</Typography>}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default DetectionPage;
