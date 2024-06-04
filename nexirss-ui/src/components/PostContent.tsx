import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Paper, Button } from '@mui/material';
import axios from 'axios';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
import dateFormat from 'dateformat';
import { useAudio } from './AudioContext';

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
    feed?: {
        title: string;
        image?: string;
    };
}

const PostContent: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const { playAudio, setAudioPosition } = useAudio();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioPosition, setAudioPositionState] = useState<number>(0);
    const [generatingTTS, setGeneratingTTS] = useState<boolean>(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/rss-feed/items/${postId}`);
                setPost(response.data);
                const savedPosition = localStorage.getItem(`audioPosition-${postId}`);
                if (savedPosition) {
                    setAudioPositionState(Number(savedPosition));
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

    useEffect(() => {
        if (post && post.content) {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block as HTMLElement);
            });
            document.querySelectorAll('img').forEach((img) => {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            });
        }
    }, [post]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            localStorage.setItem(`audioPosition-${postId}`, audioRef.current.currentTime.toString());
        }
    };

    const handleGenerateTTS = async () => {
        setGeneratingTTS(true);
        try {
            const response = await axios.post(`http://localhost:3000/tts/generate`, { postId });
            setPost(prevPost => prevPost ? { ...prevPost, ttsAudioId: response.data.ttsAudioId } : null);
        } catch (error) {
            console.error('Error generating TTS:', error);
        }
        setGeneratingTTS(false);
    };

    const isYouTubeLink = (url: string) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/\w+\/\w+\/|\/v\/|^https?:\/\/youtu\.be\/|^https?:\/\/www.youtube.com\/watch\?v=))([\w-]{11})(?:\S+)?$/);
        return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
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
                    {dateFormat(new Date(post.pubDate), 'dddd, mmmm dS, yyyy, h:MM:ss TT')}
                </Typography>
                {post.audioInfo && (
                    <Box sx={{ mt: 2 }}>
                        <Button onClick={() => playAudio(post.audioInfo.url, post.title, post.feed?.title || 'Unknown Feed', post.feed?.image || '', post._id, audioPosition)}>
                            Play Audio
                        </Button>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Audio length: {Math.floor(Number(post.audioInfo.length) / 60)} minutes
                        </Typography>
                        <audio
                            ref={audioRef}
                            onTimeUpdate={handleTimeUpdate}
                            style={{ display: 'none' }}
                        />
                    </Box>
                )}
                {!post.ttsAudioId && post.content && (
                    <Button variant="contained" color="primary" onClick={handleGenerateTTS} disabled={generatingTTS}>
                        {generatingTTS ? 'Generating TTS...' : 'Generate TTS'}
                    </Button>
                )}
                {post.ttsAudioId && (
                    <Box sx={{ mt: 2 }}>
                        <Button onClick={() => playAudio(`http://localhost:3000/tts/${post.ttsAudioId}`, post.title, post.feed?.title || 'Unknown Feed', post.feed?.image || '', post._id, audioPosition)}>
                            Play TTS Audio
                        </Button>
                    </Box>
                )}
                <Typography variant="body1" gutterBottom>
                    {isYouTubeLink(post.link) && (
                        <div>
                            <iframe
                                width="560"
                                height="315"
                                src={getYouTubeEmbedUrl(post.link)}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
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
