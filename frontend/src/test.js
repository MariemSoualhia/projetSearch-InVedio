import React, { useRef, useState, useEffect } from 'react';
import JSMpeg from "@cycjimmy/jsmpeg-player"

function CanvasLine() {
  const videoCanvasRef = useRef(null); // Référence à la toile de vidéo
  const drawingCanvasRef = useRef(null); // Référence à la toile de dessin
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [endCoords, setEndCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const url = 'ws://127.0.0.1:9999';
    const videoCanvas = videoCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;

    if (videoCanvas && drawingCanvas) {
      new JSMpeg.Player(url, { canvas: videoCanvas });
    }
  }, []); // Seulement au montage

  const startDrawing = (event) => {
    console.log("hhhhhhhhhhhhhhh")
    setIsDrawing(true);
    
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log(x,y)
    setStartCoords({ x, y });
    setEndCoords({ x, y });
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setEndCoords({ x, y });
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0,  drawingCanvasRef.current.width,  drawingCanvasRef.current.height);
    ctx.beginPath();
    ctx.moveTo(startCoords.x, startCoords.y);
    ctx.lineTo(endCoords.x, endCoords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    setStartCoords({ x: 0, y: 0 });
    setEndCoords({ x: 0, y: 0 });
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={videoCanvasRef}
        width={1280}
        height={720}
        style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0 }}
      ></canvas>
      <canvas
        ref={drawingCanvasRef}
        width={1280}
        height={720}
        style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0 }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
      ></canvas>
      <p>Start: ({startCoords.x}, {startCoords.y})</p>
      <p>End: ({endCoords.x}, {endCoords.y})</p>
      <button onClick={clearCanvas}>Clear Line</button>
    </div>
  );
}

export default CanvasLine;
