import React, { useEffect, useRef, useState } from 'react';

const WebRTCComponent = () => {
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null); // Référence à l'élément vidéo

  useEffect(() => {
    const videoElement = videoRef.current;

    const handleCanPlay = () => {
      // Définir videoReady sur true lorsque la vidéo est prête à être lue
      setVideoReady(true);
    };

    // Ajouter un écouteur d'événement pour l'événement 'canplay'
    videoElement.addEventListener('canplay', handleCanPlay);

    return () => {
      // Supprimer l'écouteur d'événement lors du démontage du composant
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, []);


  useEffect(() => {
    // Jouer la vidéo lorsque videoReady est true
    if (videoReady) {
      const videoElement = videoRef.current;
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Gérer l'erreur de lecture
          console.error('Error playing video:', error);
        });
      }
    }
  }, [videoReady]);

  const handlePause = () => {
    // Trigger pause when needed
    const videoElement = videoRef.current;
    videoElement.pause();
  };

  useEffect(() => {
    var connections = {};
    var reportError;

    function getLocalStream() {
      var constraints = { 'audio': false, 'video': true };
      if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
      }
    }

    function onIncomingSDP(url, sdp) {
      console.log('Incoming SDP: (%s)' + JSON.stringify(sdp), url);

      function onLocalDescription(desc) {
        console.log('Local description (%s)\n' + JSON.stringify(desc), url);
        connections[url].webrtcPeer.setLocalDescription(desc).then(function () {
          connections[url].websocket.send(JSON.stringify({ type: 'sdp', 'data': connections[url].webrtcPeer.localDescription }));
        }).catch(reportError);
      }

      connections[url].webrtcPeer.setRemoteDescription(sdp).catch(reportError);

      if (connections[url].type == 'inbound') {
        connections[url].webrtcPeer.createAnswer().then(onLocalDescription).catch(reportError);
      } else if (connections[url].type == 'outbound') {
        getLocalStream().then((stream) => {
          console.log('Adding local stream');
          connections[url].webrtcPeer.addStream(stream);
          connections[url].webrtcPeer.createAnswer().then(sdp => {
            var arr = sdp.sdp.split('\r\n');
            arr.forEach((str, i) => {
              if (/^a=fmtp:\d*/.test(str)) {
                arr[i] = str + ';x-google-max-bitrate=10000;x-google-min-bitrate=0;x-google-start-bitrate=6000';
              } else if (/^a=mid:(1|video)/.test(str)) {
                arr[i] += '\r\nb=AS:10000';
              }
            });
            sdp = new RTCSessionDescription({
              type: 'answer',
              sdp: arr.join('\r\n'),
            });
            onLocalDescription(sdp);
          }).catch(reportError);
        });
      }
    }

    function onIncomingICE(url, ice) {
      var candidate = new RTCIceCandidate(ice);
      console.log('Incoming ICE (%s)\n' + JSON.stringify(ice), url);
      connections[url].webrtcPeer.addIceCandidate(candidate).catch(reportError);
    }

    function getConnectionStats(url, reportType) {
      if (reportType == undefined)
        reportType = 'all';

      connections[url].webrtcPeer.getStats(null).then((stats) => {
        let statsOutput = '';

        stats.forEach((report) => {
          // Le reste de votre logique JavaScript...
        });

        var statsElement = (connections[url].type == 'inbound') ? 'stats-player' : 'stats-sender';
        //document.getElementById(statsElement).innerHTML = statsOutput;
      });
    }

    function onAddRemoteStream(event) {
      var url = event.srcElement.url;
      console.log('Adding remote stream to HTML video player (%s)', url);
      connections[url].videoElement.srcObject = event.streams[0];
      connections[url].videoElement.play();
    }

    function onIceCandidate(event) {
      var url = event.srcElement.url;

      if (event.candidate == null)
        return;

      console.log('Sending ICE candidate out (%s)\n' + JSON.stringify(event.candidate), url);
      connections[url].websocket.send(JSON.stringify({ 'type': 'ice', 'data': event.candidate }));
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
        connections[url].webrtcPeer = new RTCPeerConnection(connections[url].webrtcConfig);
        connections[url].webrtcPeer.url = url;

        connections[url].webrtcPeer.onconnectionstatechange = (ev) => {
          console.log('WebRTC connection state (%s) ' + connections[url].webrtcPeer.connectionState, url);
          if (connections[url].webrtcPeer.connectionState == 'connected')
            setInterval(getConnectionStats, 1000, url, connections[url].type == 'inbound' ? 'inbound-rtp' : 'outbound-rtp');
        };

        if (connections[url].type == 'inbound')
          connections[url].webrtcPeer.ontrack = onAddRemoteStream;
        connections[url].webrtcPeer.onicecandidate = onIceCandidate;
      }

      switch (msg.type) {
        case 'sdp': onIncomingSDP(url, msg.data); break;
        case 'ice': onIncomingICE(url, msg.data); break;
        default: break;
      }
    }

    function playStream(videoPlayer, hostname, port, path, configuration, reportErrorCB) {
      var l = window.location;
      if (path == 'null')
        return;
      var wsProt = (l.protocol == 'https:') ? 'wss://' : 'ws://';
      var wsHost = (hostname != undefined) ? hostname : l.hostname;
      var wsPort = (port != undefined) ? port : 8554;
      var wsPath = (path != undefined) ? path : '/ws';
      if (wsPort)
        wsPort = ':' + wsPort;
      var wsUrl = wsProt + wsHost + wsPort + wsPath;
      console.log('Video server URL: ' + wsUrl);
      var url = wsUrl;

      connections[url] = {};

      connections[url].type = 'inbound';
      connections[url].videoElement = videoRef.current; // Utilisation de la référence vidéo
      connections[url].webrtcConfig = configuration;
      reportError = (reportErrorCB != undefined) ? reportErrorCB : function (text) { };

      connections[url].websocket = new WebSocket(wsUrl);
      connections[url].websocket.addEventListener('message', onServerMessage);
    }

    function sendStream(hostname, port, path, configuration, reportErrorCB) {
      var l = window.location;
      if (path == 'null')
        return;
      if (l.protocol != 'https:') {
        alert('Please use HTTPS to enable the use of your browser webcam');
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('getUserMedia() not available (confirm HTTPS is being used)');
        return;
      }
      var wsProt = (l.protocol == 'https:') ? 'wss://' : 'ws://';
      var wsHost = (hostname != undefined) ? hostname : l.hostname;
      var wsPort = (port != undefined) ? port : l.port;
      var wsPath = (path != undefined) ? path : '/ws';
      if (wsPort)
        wsPort = ':' + wsPort;
      var wsUrl = wsProt + wsHost + wsPort + wsPath;
      console.log('Video server URL: ' + wsUrl);
      var url = wsUrl;

      connections[url] = {};

      connections[url].type = 'outbound';
      connections[url].webrtcConfig = configuration;
      reportError = (reportErrorCB != undefined) ? reportErrorCB : function (text) { };

      connections[url].websocket = new WebSocket(wsUrl);
      connections[url].websocket.addEventListener('message', onServerMessage);
    }

    playStream('video-player', null, null, '/output', { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }, function (errmsg) { console.error(errmsg); });
    sendStream(null, null, 'null', { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }, function (errmsg) { console.error(errmsg); });
  }, []);
  return (
    <div>
      <video id='video-player' ref={videoRef} autoPlay controls playsInline muted>
        Your browser does not support video
      </video>
      
      <pre>
        {/* Additional content */}
      </pre>
      <pre id='stats-player'></pre>
      <pre id='stats-sender'></pre>
    </div>
  );
};

export default WebRTCComponent;
