import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography, CircularProgress, Box, IconButton, Paper } from '@mui/material';
import axios from 'axios';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface FeedItem {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
}

const FeedItemsByFeedId: React.FC = () => {
    const { feedId } = useParams<{ feedId: string }>();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/rss-feed/feeds/${feedId}/items`);
                setItems(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, [feedId]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Feed Items
            </Typography>
            <Paper elevation={3} sx={{ p: 2 }}>
                <List>
                    {items.map((item) => (
                        <ListItem key={item._id} component={RouterLink} to={`/items/${item._id}`} button>
                            <ListItemText primary={item.title} secondary={new Date(item.pubDate).toLocaleString()} />
                            <IconButton edge="end" aria-label="open-in-new" onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                window.open(item.link, '_blank');
                            }}>
                                <OpenInNewIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default FeedItemsByFeedId;
