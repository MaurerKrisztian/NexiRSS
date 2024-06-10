import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ListItem, ListItemText, IconButton, Avatar, Box, Button, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PodcastIcon from '@mui/icons-material/Mic';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useTheme } from '@mui/material/styles';
import apiClient from "../api-client/api";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en');

interface AudioInfo {
    length?: number;
    type: string;
    url: string;
}

interface FeedItem {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
    audioInfo?: AudioInfo;
    image?: string;
    feed?: { image?: string; title?: string };
    labels?: string[];
    summary?: string;
}

interface FeedItemPreviewProps {
    item: FeedItem;
}

interface User {
    openaiApiKey?: string;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const bytesToSeconds = (bytes: number, bitrate = 128000) => {
    return bytes / (bitrate / 8);
};

const placeholderImage = 'https://via.placeholder.com/150';

const FeedItemPreview: React.FC<FeedItemPreviewProps> = ({ item }) => {
    const [showSummary, setShowSummary] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState(item.summary);
    const [labels, setLabels] = useState(item.labels || []);
    const [user, setUser] = useState<User | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const theme = useTheme(); // Get the current theme
    const audioPosition = localStorage.getItem(`audioPosition-${item._id}`);
    const audioLength = item.audioInfo ? bytesToSeconds(Number(item.audioInfo.length)) : 0;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const handleSummaryToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowSummary(!showSummary);
    };

    const handleGenerateSummary = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!user?.openaiApiKey) {
            setOpenSnackbar(true);
            return;
        }
        setIsLoading(true);
        try {
            await apiClient.get(`/ai-assistant/generate-summary?item=${item._id}`);
            const updatedItemResponse = await apiClient.get(`/rss-feed/items/${item._id}`);
            setSummary(updatedItemResponse.data.summary);
            setLabels(updatedItemResponse.data.labels); // Correctly update labels
            setShowSummary(true);
        } catch (error) {
            console.error('Error generating summary:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ListItem component={RouterLink} to={`/items/${item._id}`} button>
            <Avatar
                variant="square"
                src={item.image || item?.feed?.image || placeholderImage}
                alt={item.title}
                sx={{ width: 56, height: 56, marginRight: 2 }}
            />
            <ListItemText
                primary={item.title}
                secondary={
                    <>
                        <i>{item.feed?.title}</i> - {timeAgo.format(new Date(item.pubDate))}
                        {item.audioInfo && (
                            <>
                                <br />
                                <PodcastIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {formatTime(audioLength)} | Listened: {audioPosition ? formatTime(Number(audioPosition)) : '0:00:00'}
                            </>
                        )}
                        {labels && labels.length > 0 && (
                            <Box mt={1}>
                                {labels.map((label, index) => ( // Use updated labels state
                                    <Box
                                        key={index}
                                        component="span"
                                        sx={{
                                            mr: 1,
                                            backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
                                            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                                            padding: '2px 4px',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        {label}
                                    </Box>
                                ))}
                            </Box>
                        )}
                        {summary ? (
                            <Box mt={1}>
                                <Button variant="outlined" size="small" onClick={handleSummaryToggle}>
                                    {showSummary ? 'Hide Summary' : 'View Summary'}
                                </Button>
                                {showSummary && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {summary}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Box mt={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleGenerateSummary}
                                    disabled={isLoading}
                                    startIcon={isLoading && <CircularProgress size={16} />}
                                >
                                    {isLoading ? 'Generating...' : 'Generate Summary'}
                                </Button>
                            </Box>
                        )}
                    </>
                }
            />
            <IconButton
                edge="end"
                aria-label="open-in-new"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(item.link, '_blank');
                }}
            >
                <OpenInNewIcon />
            </IconButton>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="warning" sx={{ width: '100%' }}>
                    Please set up the OpenAI API key in your profile.
                </Alert>
            </Snackbar>
        </ListItem>
    );
};

export default FeedItemPreview;
