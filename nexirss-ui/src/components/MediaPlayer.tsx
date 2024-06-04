import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { useAudio } from './AudioContext';

const MediaPlayer: React.FC = () => {
    const { audioUrl, audioRef, itemTitle, feedTitle, imageUrl, postId, stopAudio, setAudioPosition } = useAudio();

    const handleTimeUpdate = () => {
        if (audioRef.current && postId) {
            localStorage.setItem(`audioPosition-${postId}`, audioRef.current.currentTime.toString());
        }
    };

    if (!audioUrl) return null;

    return (
        <Box sx={{ position: 'fixed', bottom: 0, width: '100%', bgcolor: '#202325', p: 2, boxShadow: 3, color: 'white', display: 'flex', alignItems: 'center' }}>
            {imageUrl && (
                <Box sx={{ mr: 2 }}>
                    <img src={imageUrl} alt="Feed or Item" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                </Box>
            )}
            <Box sx={{ flexGrow: 1 }}>
                {postId && (
                    <Typography variant="body1">
                        <Link to={`/items/${postId}`} style={{ color: 'white', textDecoration: 'none' }}>
                            {itemTitle}
                        </Link>
                    </Typography>
                )}
                <Typography variant="body2" color="textSecondary">{feedTitle}</Typography>
                <audio
                    controls
                    style={{ width: '100%', backgroundColor: 'transparent', color: 'black' }}
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                >
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            </Box>
            <IconButton color="inherit" onClick={stopAudio}>
                <CloseIcon />
            </IconButton>
        </Box>
    );
};

export default MediaPlayer;
