import React, { useRef, useEffect } from 'react';
import Peer from 'simple-peer';

const VideoComponent = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startWebRTC = async () => {
      // Création d'une nouvelle instance de Peer
      const peer = new Peer({
        initiator: true, // Cet utilisateur initie la connexion
        trickle: false, // Désactive le transfert graduel (trickle ICE)
      });
      
      // Attente de la connexion établie
      peer.on('signal', data => {
        console.log('SIGNAL', JSON.stringify(data));
      });

      // Une fois le flux vidéo reçu, le connecter à l'élément vidéo
      peer.on('stream', stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });

      // Lancer la connexion WebRTC
      peer.signal('webrt://:@8845/output');

      // Si tu es l'utilisateur qui reçoit la vidéo, tu dois changer l'initiateur en false
      /*
      const peer = new Peer({
        initiator: false,
        trickle: false,
      });
      
      peer.signal('webrt://:@8845/output');
      */
    };

    startWebRTC();

    return () => {
      // Nettoyer les ressources lors du démontage du composant
      // Exemple avec simple-peer :
      // peer.destroy();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} controls autoPlay />
    </div>
  );
};

export default VideoComponent;
