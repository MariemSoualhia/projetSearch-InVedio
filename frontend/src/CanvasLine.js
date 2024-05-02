import React, { useRef, useState, useEffect } from 'react';
import JSMpeg from "@cycjimmy/jsmpeg-player";

function CanvasLine() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [endCoords, setEndCoords] = useState({ x: 0, y: 0 });
  const [upperRightCoords, setUpperRightCoords] = useState({ x: 0, y: 0 });
  const [lowerRightCoords, setLowerRightCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const url = 'ws://127.0.0.1:9999';
    const videoCanvas = document.getElementById("video-canvas");
    new JSMpeg.Player(url, { canvas: videoCanvas });
  }, []);

  const startDrawing = (event) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setStartCoords({ x, y });
    setEndCoords({ x, y });
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    setEndCoords({ x, y });

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(startCoords.x, startCoords.y);
    ctx.lineTo(x, y);
    ctx.lineWidth = 5; // Épaisseur de la ligne
    ctx.strokeStyle = 'red'; // Couleur de la ligne
    ctx.stroke();


  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStartCoords({ x: 0, y: 0 });
    setEndCoords({ x: 0, y: 0 });
  };

  return (
    <div>
      <h3>Draw a Line on Canvas</h3>
      <div style={{ position: 'relative', width: '1280px', height: '720px' }}>
        <canvas
          id='video-canvas'
          width={1280}
          height={720}
          style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0 }}
        ></canvas>
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
        ></canvas>
        <p style={{ position: 'absolute', top: '10px', left: '10px' }}>Start: ({startCoords.x}, {startCoords.y})</p>
        <p style={{ position: 'absolute', top: '30px', left: '10px' }}>End: ({endCoords.x}, {endCoords.y})</p>
        <button style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={clearCanvas}>Clear Line</button>
      </div>
    </div>
  );
}

export default CanvasLine;
