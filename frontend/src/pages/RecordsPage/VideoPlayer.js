import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ videoId }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
        }
    }, [videoId]);

    return (
        <video ref={videoRef} width='320' height='240' controls autoPlay>
            <source src={`http://localhost:3002/api/videos/${videoId}`} type='video/mp4' />
            Your browser does not support the video tag.
        </video>
    );
};

export default VideoPlayer;
