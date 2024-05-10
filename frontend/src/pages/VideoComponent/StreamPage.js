import React from 'react';
import VideoComponent from './VideoComponent'; // Assurez-vous de remplacer le chemin avec l'emplacement réel de votre composant VideoComponent

function StreamPage() {
  return (
    <div>
      <h1>Ma page principale</h1>
      <p>Autres contenus...</p>
      <VideoComponent  controls autoPlay src="http://localhost:8555/output" />

    </div>
  );
}

export default StreamPage;
