import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {API_URL} from "../api-client/api";

interface Feed {
    _id: string;
    url: string;
    title: string;
    image: string;
    description: string;
}

const placeholderImage = 'https://via.placeholder.com/150';

const SubscribedFeeds: React.FC = () => {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const response = await axios.get(`${API_URL}/rss-feed/feeds`);
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
            <Typography variant="h4" gutterBottom>
                Subscribed Feeds
            </Typography>
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
                        <Grid item key={feed._id} xs={12} sm={6} md={4} sx={{ flexShrink: 0 }}>
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
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default SubscribedFeeds;
