import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography, CircularProgress, Box, IconButton, Paper } from '@mui/material';
import axios from 'axios';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';

interface FeedItem {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
}

const CategoryItems: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/rss-feed/categories/${category}/items`);
                setItems(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, [category]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            <Typography variant="h4" gutterBottom>
                {category} Items
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

export default CategoryItems;
