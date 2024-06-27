import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ListItem, ListItemText, IconButton, Avatar, Box, Button, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PodcastIcon from '@mui/icons-material/Mic';
import YouTubeIcon from '@mui/icons-material/YouTube';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ArticleIcon from '@mui/icons-material/Article';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useTheme, useMediaQuery } from '@mui/material';
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
    feed?: { image?: string; title?: string, category?: string };
    labels?: string[];
    summary?: string;
}

interface User {
    openaiApiKey?: string;
    highlightedItems?: { itemId: string }[];
}

interface FeedItemPreviewProps {
    item: FeedItem;
    user: User | null;
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

const FeedItemPreview: React.FC<FeedItemPreviewProps> = ({ item, user }) => {
    const [showSummary, setShowSummary] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState(item.summary);
    const [labels, setLabels] = useState(item.labels || []);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const theme = useTheme(); // Get the current theme
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is mobile
    const audioPosition = localStorage.getItem(`audioPosition-${item._id}`);
    const audioLength = item.audioInfo ? bytesToSeconds(Number(item.audioInfo.length)) : 0;

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

    const getIcon = (category?: string) => {
        switch (category) {
            case 'YOUTUBE':
                return <YouTubeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />;
            case 'VIDEO':
                return <VideoLibraryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />;
            case 'PODCAST':
                return <PodcastIcon sx={{ verticalAlign: 'middle', mr: 1 }} />;
            case 'BLOG':
                return <ArticleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />;
            default:
                return <ArticleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />;
        }
    };

    const isHighlighted = user?.highlightedItems?.some(highlightedItem => highlightedItem.itemId === item._id);

    return (
        <ListItem component={RouterLink} to={`/items/${item._id}`} button sx={{ backgroundColor: isHighlighted ? '#2929b8' : 'inherit' }}>
            <Avatar
                variant="square"
                src={item.image || item?.feed?.image || placeholderImage}
                alt={item.title}
                sx={{ width: 56, height: 56, marginRight: 2 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>{item.title}</Typography>
                        </Box>
                    }
                    secondary={
                        <>
                            <Typography variant="body2" color="textSecondary">
                                {getIcon(item.feed?.category)} <i>{item.feed?.title}</i> - {timeAgo.format(new Date(item.pubDate))}
                            </Typography>
                            {item.audioInfo && (
                                <>
                                    {/*<PodcastIcon sx={{ verticalAlign: 'middle', mr: 1 }} />*/}
                                    {formatTime(audioLength)} | Listened: {audioPosition ? formatTime(Number(audioPosition)) : '0:00:00'}
                                </>
                            )}
                            {labels && labels.length > 0 && (
                                <Box mt={1} sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {labels.map((label, index) => (
                                        <Box
                                            key={index}
                                            component="span"
                                            sx={{
                                                mr: 1,
                                                mb: 1,
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
                                item.feed?.category !== 'YOUTUBE' && item.feed?.category !== 'VIDEO' && (
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
                                )
                            )}
                        </>
                    }
                />
            </Box>
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
