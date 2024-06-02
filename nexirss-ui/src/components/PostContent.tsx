import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Paper, Button } from '@mui/material';
import axios from 'axios';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface AudioInfo {
    length: string;
    type: string;
    url: string;
}

interface Post {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
    audioInfo?: AudioInfo;
    ttsAudioId?: string;
}

const PostContent: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioPosition, setAudioPosition] = useState<number>(0);
    const [generatingTTS, setGeneratingTTS] = useState<boolean>(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/rss-feed/items/${postId}`);
                setPost(response.data);
                const savedPosition = localStorage.getItem(`audioPosition-${postId}`);
                if (savedPosition) {
                    setAudioPosition(Number(savedPosition));
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPost();
    }, [postId]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = audioPosition;
        }
    }, [audioPosition]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            localStorage.setItem(`audioPosition-${postId}`, audioRef.current.currentTime.toString());
        }
    };

    const handleGenerateTTS = async () => {
        setGeneratingTTS(true);
        try {
            const response = await axios.post(`http://localhost:3000/tts/generate`, { postId });
            console.log("got file id ", response.data.ttsAudioId, response.data)
            setPost(prevPost => prevPost ? { ...prevPost, ttsAudioId: response.data.ttsAudioId } : null);
        } catch (error) {
            console.error('Error generating TTS:', error);
        }
        setGeneratingTTS(false);
    };

    if (!post) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {post.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {new Date(post.pubDate).toLocaleString()}
                </Typography>
                {post.audioInfo && (
                    <Box sx={{ mt: 2 }}>
                        <audio
                            controls
                            style={{ width: '100%' }}
                            ref={audioRef}
                            onTimeUpdate={handleTimeUpdate}
                        >
                            <source src={post.audioInfo.url} type={post.audioInfo.type} />
                            Your browser does not support the audio element.
                        </audio>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Audio length: {Math.floor(Number(post.audioInfo.length) / 60)} minutes
                        </Typography>
                    </Box>
                )}
                {!post.ttsAudioId && (
                    <Button variant="contained" color="primary" onClick={handleGenerateTTS} disabled={generatingTTS}>
                        {generatingTTS ? 'Generating TTS...' : 'Generate TTS'}
                    </Button>
                )}
                {post.ttsAudioId && (
                    <Box sx={{ mt: 2 }}>
                        <audio controls style={{ width: '100%' }}>
                            <source src={`http://localhost:3000/tts/${post.ttsAudioId}`} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </Box>
                )}
                <Typography variant="body1" gutterBottom>
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </Typography>
                <IconButton
                    color="primary"
                    onClick={() => window.open(post.link, '_blank')}
                    sx={{ float: 'right' }}
                >
                    <OpenInNewIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default PostContent;
