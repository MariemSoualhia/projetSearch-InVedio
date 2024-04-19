import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import {
    Button,
    Typography,
    Modal,
    Box,
    Grid,
    Paper,
    IconButton,
    Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
      
        margin: '0 auto',
        padding: theme.spacing(4),
        border: '1px solid #ccc',
        borderRadius: theme.spacing(2),
    },
    title: {
        marginBottom: theme.spacing(2),
        fontWeight: 'bold',
        fontSize: '1.5rem',
        color: theme.palette.primary.main,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        paddingBottom: theme.spacing(1),
    },
    videoCard: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(3),
        backgroundColor: '#f9f9f9',
        borderRadius: theme.spacing(1),
    },
    videoTitle: {
        marginBottom: theme.spacing(1.5),
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        fontSize: '1.2rem',
        textAlign: 'center',
    },
    cameraInfo: {
        marginBottom: theme.spacing(1),
        textAlign: 'center',
    },
    deleteButton: {
        color: theme.palette.error.main,
    },
}));

const VideoList = () => {
    const classes = useStyles();
    const [videos, setVideos] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [page, setPage] = useState(1);
    const videosPerPage = 6; // Nombre de vidéos par page

    useEffect(() => {
        fetchVideos();
    }, [page]); // Recharger les vidéos lorsque la page change

    const fetchVideos = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:3002/api/videos/');
            setVideos(response.data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const handleDelete = async (videoId) => {
        try {
            await axios.delete(`http://127.0.0.1:3002/api/videos/${videoId}`);
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setVideoToDelete(null);
    };

    const handleShowDeleteModal = (videoId) => {
        setVideoToDelete(videoId);
        setShowDeleteModal(true);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Calcul du début et de la fin des vidéos à afficher pour la pagination
    const startIndex = (page - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;

    return (
        <div className={classes.root}>
            <Typography variant="h4" gutterBottom className={classes.title}>
                Video List
            </Typography>
            <Grid container spacing={3}>
                {videos.slice(startIndex, endIndex).map((video) => (
                    <Grid item key={video._id} xs={12} sm={6} md={4}>
                        <Paper elevation={3} className={classes.videoCard}>
                            <Typography variant="h6" className={classes.videoTitle}>
                                {video.name}
                            </Typography>
                            <Typography variant="body2" className={classes.cameraInfo}>
                                <strong>Camera:</strong> {video.cameraName}
                            </Typography>
                            <VideoPlayer videoId={video._id} width="100%" height="300px" />
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                                <IconButton
                                    aria-label="delete"
                                    className={classes.deleteButton}
                                    onClick={() => handleShowDeleteModal(video._id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
                <Pagination
                    count={Math.ceil(videos.length / videosPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

            {/* Delete Confirmation Modal */}
            <Modal open={showDeleteModal} onClose={handleCloseDeleteModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        minWidth: 300,
                        maxWidth: 400,
                    }}
                >
                    <Typography variant="h6" gutterBottom>Confirm Deletion</Typography>
                    <Typography gutterBottom>Are you sure you want to delete this video?</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={handleCloseDeleteModal}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={() => { handleDelete(videoToDelete); handleCloseDeleteModal(); }} sx={{ marginLeft: 1 }}>Delete</Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default VideoList;
