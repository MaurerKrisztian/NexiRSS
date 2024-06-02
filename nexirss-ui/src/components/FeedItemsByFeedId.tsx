import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {List, Typography, CircularProgress, Box, Paper, CardMedia, Divider} from '@mui/material';
import axios from 'axios';
import FeedItemPreview from './FeedItemPreview';

interface AudioInfo {
    length?: number;
    type: string;
    url: string;
}

interface Feed {
    _id: string;
    url: string;
    title: string;
    image: string;
    description: string;
}

interface FeedItem {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
    audioInfo?: AudioInfo;
}

const FeedItemsByFeedId: React.FC = () => {
    const { feedId } = useParams<{ feedId: string }>();
    const [feed, setFeed] = useState<Feed | null>(null);
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedDetails = async () => {
            try {
                const feedResponse = await axios.get(`http://localhost:3000/rss-feed/feeds/${feedId}`);
                setFeed(feedResponse.data);

                const itemsResponse = await axios.get(`http://localhost:3000/rss-feed/feeds/${feedId}/items`);
                const itemsWithAudioLength = await Promise.all(
                    itemsResponse.data.map(async (item: FeedItem) => {
                        if (item.audioInfo && !item.audioInfo.length) {
                            try {
                                const headResponse = await axios.head(item.audioInfo.url);
                                const contentLength = headResponse.headers['content-length'];
                                if (contentLength) {
                                    item.audioInfo.length = Number(contentLength);
                                }
                            } catch (error) {
                                console.error('Error fetching audio length:', error);
                            }
                        }
                        return item;
                    })
                );
                setItems(itemsWithAudioLength);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feed details and items:', error);
            }
        };

        fetchFeedDetails();
    }, [feedId]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            {feed && (
                <>
                    <CardMedia
                        component="img"
                        alt={feed.title}
                        height="200"
                        image={feed.image}
                        title={feed.title}
                        sx={{ borderRadius: '8px', mb: 2 }}
                    />
                    <Typography variant="h5" gutterBottom>
                        {feed.title}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {feed.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                </>
            )}
            <Typography variant="h4" gutterBottom>
                Feed Items
            </Typography>
            <Paper elevation={3} sx={{ p: 2 }}>
                <List>
                    {items.map((item) => (
                        <FeedItemPreview key={item._id} item={item} />
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default FeedItemsByFeedId;
