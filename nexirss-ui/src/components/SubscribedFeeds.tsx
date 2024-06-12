import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid, Avatar, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import apiClient from "../api-client/api";

interface Feed {
    _id: string;
    url: string;
    title: string;
    image: string;
    description: string;
}

interface SubscribedFeedsProps {
    view?: 'mini' | 'full';
}

const placeholderImage = 'https://via.placeholder.com/150';

const SubscribedFeeds: React.FC<SubscribedFeedsProps> = ({ view = 'full' }) => {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const response = await apiClient.get(`/rss-feed/user/feeds`);
                setFeeds(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feeds:', error);
            }
        };

        fetchFeeds();
    }, []);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            {view === 'full' && (
                <Typography variant="h4" gutterBottom>
                    Subscribed Feeds
                </Typography>
            )}
            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    p: 1,
                    '&::-webkit-scrollbar': {
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#2b2b2b',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#6c6c6c',
                        borderRadius: '4px',
                        border: '2px solid #2b2b2b',
                    },
                }}
            >
                <Grid container spacing={2} wrap="nowrap">
                    {feeds.map((feed) => (
                        <Grid item key={feed._id} xs={view === 'full' ? 12 : 'auto'} sm={view === 'full' ? 6 : 'auto'} md={view === 'full' ? 4 : 'auto'} sx={{ flexShrink: 0 }}>
                            {view === 'full' ? (
                                <Card>
                                    <Link to={`/feeds/${feed._id}/items`} style={{ textDecoration: 'none', color: '#90caf9' }}>
                                        <CardMedia
                                            component="img"
                                            alt={feed.title}
                                            height="122"
                                            image={feed.image || placeholderImage}
                                            title={feed.title}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {feed.title}
                                            </Typography>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ) : (
                                <Link to={`/feeds/${feed._id}/items`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Box sx={{ textAlign: 'center', m: 1 }}>
                                        <Tooltip title={feed.title} arrow placement="top">
                                            <Avatar
                                                src={feed.image || placeholderImage}
                                                alt={feed.title}
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    transition: 'transform 0.3s',
                                                    '&:hover': {
                                                        transform: 'scale(1.5)'
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 56 }}>
                                            {feed.title}
                                        </Typography>
                                    </Box>
                                </Link>
                            )}
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default SubscribedFeeds;
