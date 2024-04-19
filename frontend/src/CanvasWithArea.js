import React, { useRef, useState } from 'react';

function CanvasWithZone() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);

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
  };

  const drawZone = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    if (points.length === 4) {
      ctx.closePath(); // Fermer la forme si les 4 points sont présents
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
  };

  // Redessiner la zone à chaque changement dans les points
  React.useEffect(() => {
    drawZone();
  }, [points]);

  return (
    <div>
      <h3>Draw Zone on Canvas</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onMouseDown={handleMouseDown}
      ></canvas>
      <button onClick={clearZone}>Clear Zone</button>
    </div>
  );
}

export default CanvasWithZone;
