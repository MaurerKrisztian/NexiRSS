import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardActionArea, CardContent, CardMedia, Grid } from '@mui/material';
import axios from 'axios';

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
                const response = await axios.get('http://localhost:3000/rss-feed/feeds');
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
            <Box sx={{ display: 'flex', overflowX: 'auto', p: 1 }}>
                <Grid container spacing={2} wrap="nowrap">
                    {feeds.map((feed) => (
                        <Grid item key={feed._id} xs={12} sm={6} md={4} sx={{ flexShrink: 0 }}>
                            <Card>
                                <CardActionArea href={`http://localhost:3001/feeds/${feed._id}/items`}>
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
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default SubscribedFeeds;
