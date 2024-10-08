import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import apiClient from "../api-client/api";
import BrowsFeeds from "./BrowsFeeds";
import {getDefaultImage} from "./SubscribedFeeds";

interface Feed {
    _id: string;
    url: string;
    title: string;
    image: string;
    description: string;
    category: string;
}


const FeedListPage: React.FC = () => {
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
            <BrowsFeeds></BrowsFeeds>
            <Typography variant="h4" gutterBottom>
                Subscribed Feeds
            </Typography>
            <Grid container spacing={2}>
                {feeds.map((feed) => (
                    <Grid item key={feed._id} xs={12} sm={6} md={4}>
                        <Card>
                            <Link to={`/feeds/${feed._id}/items`} style={{ textDecoration: 'none', color: '#90caf9' }}>
                                <CardMedia
                                    component="img"
                                    alt={feed.title}
                                    height="140"
                                    image={feed.image || getDefaultImage(feed.category)}
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
    );
};

export default FeedListPage;
