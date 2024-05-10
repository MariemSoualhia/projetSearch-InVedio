import React, { Component } from 'react';
import io from 'socket.io-client';

class WebRTCStreamer extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidMount() {
        const socket = io('http://localhost:5050');
        const videoElement = this.videoRef.current;

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('frame', (frame) => {
            const blob = new Blob([frame], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            videoElement.src = imageUrl;
        });
    }

    render() {
        return (
            <div>
                <h1>WebRTC Streaming</h1>
                <video ref={this.videoRef} autoPlay />
            </div>
        );
    }
}

export default WebRTCStreamer;
