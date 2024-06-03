import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Paper, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Feed {
    _id: string;
    url: string;
    title: string;
    category: string;
}

const FeedForm: React.FC = () => {
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    const [feedType, setFeedType] = useState('rss');
    const [maxItems, setMaxItems] = useState(3);
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const response = await axios.get('http://localhost:3000/rss-feed/feeds');
                setFeeds(response.data);
            } catch (error) {
                console.error('Error fetching feeds:', error);
            }
        };

        fetchFeeds();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalUrl = url;
        if (feedType === 'youtube') {
            finalUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${url}`;
        } else if (feedType === 'devto') {
            finalUrl = `https://dev.to/feed/${url}`;
        }

        try {
            await axios.post('http://localhost:3000/rss-feed/fetch', { url: finalUrl, category, maxItems });
            setUrl('');
            setCategory('');
            setFeedType('rss');
            setMaxItems(3);
            const response = await axios.get('http://localhost:3000/rss-feed/feeds');
            setFeeds(response.data);
        } catch (error) {
            console.error('Error fetching the RSS feed:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete('http://localhost:3000/rss-feed/feed', { data: { identifier: id } });
            setFeeds(feeds.filter(feed => feed._id !== id));
        } catch (error) {
            console.error('Error deleting feed:', error);
        }
    };

    const handleEdit = (id: string) => {
        const feed = feeds.find(feed => feed._id === id);
        if (feed) {
            setUrl(feed.url);
            setCategory(feed.category);
        }
    };

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 600, p: 2 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        select
                        label="Feed Type"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={feedType}
                        onChange={(e) => setFeedType(e.target.value)}
                    >
                        <MenuItem value="rss">RSS</MenuItem>
                        <MenuItem value="youtube">YouTube</MenuItem>
                        <MenuItem value="devto">Dev.to</MenuItem>
                    </TextField>
                    <TextField
                        label={feedType === 'youtube' ? 'YouTube Channel ID' : feedType === 'devto' ? 'Dev.to Profile Name' : 'Feed URL'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <TextField
                        label="Category"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                    <TextField
                        label="Max Items"
                        type="number"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={maxItems}
                        onChange={(e) => setMaxItems(parseInt(e.target.value))}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        {feeds.some(feed => feed.url === url) ? 'Update Feed' : 'Fetch Feed'}
                    </Button>
                </Box>
            </Paper>
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                <List>
                    {feeds.map(feed => (
                        <ListItem key={feed._id}>
                            <ListItemText
                                primary={<RouterLink to={`/feeds/${feed._id}/items`}>{feed.title}</RouterLink>}
                                secondary={feed.category}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(feed._id)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(feed._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default FeedForm;
