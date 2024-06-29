import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    MenuItem,
    Typography
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import apiClient from "../api-client/api";
import BrowsFeeds from "./BrowsFeeds";
import useUser from "../hooks/useUser";
import RSSFeedImporterExporter from "./rss-import-export";

interface Feed {
    _id: string;
    url: string;
    title: string;
    category: string;
}

const categories = {
    rss: ['BLOG', 'PODCAST', 'VIDEO', 'YOUTUBE', 'UNKNOWN'],
    youtube: ['YOUTUBE'],
    devto: ['BLOG'],
    medium: ['BLOG']
};

const FeedForm: React.FC = () => {
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    const [feedType, setFeedType] = useState('rss');
    const [mediumType, setMediumType] = useState('profile');
    const [mediumValue, setMediumValue] = useState('');
    const [maxItems, setMaxItems] = useState(3);
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const navigate = useNavigate();
    const { user, loading: userLoading, error: userError, refreshUser } = useUser();

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const response = await apiClient.get(`/rss-feed/user/feeds`);
                setFeeds(response.data);
            } catch (error) {
                console.error('Error fetching feeds:', error);
            }
        };

        fetchFeeds();
    }, []);

    useEffect(() => {
        // Automatically set category if there's only one option
        const availableCategories = categories[feedType];
        if (availableCategories.length === 1) {
            setCategory(availableCategories[0]);
        } else {
            setCategory(''); // Reset category if there are multiple options
        }
    }, [feedType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalUrl = url;
        if (feedType === 'youtube') {
            finalUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${url}`;
        } else if (feedType === 'devto') {
            finalUrl = `https://dev.to/feed/${url}`;
        } else if (feedType === 'medium') {
            if (mediumType === 'profile') {
                finalUrl = `https://medium.com/feed/${mediumValue}`;
            } else if (mediumType === 'publication') {
                finalUrl = `https://medium.com/feed/${mediumValue}`;
            } else if (mediumType === 'tag') {
                finalUrl = `https://medium.com/feed/tag/${mediumValue}`;
            } else if (mediumType === 'publication-tag') {
                finalUrl = `https://medium.com/feed/${mediumValue.split(':')[0]}/tagged/${mediumValue.split(':')[1]}`;
            }
        }

        try {
            await apiClient.post(`/rss-feed/fetch`, { url: finalUrl, category, maxItems });
            setUrl('');
            setCategory('');
            setFeedType('rss');
            setMediumType('profile');
            setMediumValue('');
            setMaxItems(3);
            const response = await apiClient.get(`/rss-feed/user/feeds`);
            setFeeds(response.data);
            refreshUser()
        } catch (error) {
            console.error('Error fetching the RSS feed:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiClient.delete(`/rss-feed/feed`, { data: { identifier: id } });
            setFeeds(feeds.filter(feed => feed._id !== id));
        } catch (error) {
            console.error('Error deleting feed:', error);
        }
        refreshUser()
    };

    const handleEdit = (id: string) => {
        const feed = feeds.find(feed => feed._id === id);
        if (feed) {
            setUrl(feed.url);
            setCategory(feed.category);
            refreshUser()
        }
    };

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 600, p: 2 }}>
            <BrowsFeeds></BrowsFeeds>
            <hr/>
            <RSSFeedImporterExporter></RSSFeedImporterExporter>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="h5" gutterBottom>
                        Add rss feed via link
                    </Typography>
                    <TextField
                        select
                        label="Feed Type"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={feedType}
                        onChange={(e) => {
                            setFeedType(e.target.value);
                            setCategory(''); // Reset category when feed type changes
                        }}
                    >
                        <MenuItem value="rss">RSS</MenuItem>
                        <MenuItem value="youtube">YouTube</MenuItem>
                        <MenuItem value="devto">Dev.to</MenuItem>
                        <MenuItem value="medium">Medium.com</MenuItem>
                    </TextField>
                    {feedType === 'medium' && (
                        <TextField
                            select
                            label="Medium Feed Type"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={mediumType}
                            onChange={(e) => setMediumType(e.target.value)}
                        >
                            <MenuItem value="profile">Profile</MenuItem>
                            <MenuItem value="publication">Publication</MenuItem>
                            <MenuItem value="tag">Tag</MenuItem>
                            <MenuItem value="publication-tag">Publication-Tag</MenuItem>
                        </TextField>
                    )}
                    <TextField
                        label={
                            feedType === 'youtube'
                                ? 'YouTube Channel ID'
                                : feedType === 'devto'
                                    ? 'Dev.to Profile Name'
                                    : feedType === 'medium'
                                        ? mediumType === 'profile' || mediumType === 'publication'
                                            ? 'Medium Username or Publication Name'
                                            : mediumType === 'tag'
                                                ? 'Medium Tag Name'
                                                : mediumType === 'publication-tag'
                                                    ? 'Medium Publication Name:Tag Name'
                                                    : 'Feed URL'
                                        : 'Feed URL'
                        }
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={feedType === 'medium' ? mediumValue : url}
                        onChange={(e) => feedType === 'medium' ? setMediumValue(e.target.value) : setUrl(e.target.value)}
                    />
                    <TextField
                        select
                        label="Category"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        {categories[feedType].map((cat) => (
                            <MenuItem key={cat} value={cat}>
                                {cat}
                            </MenuItem>
                        ))}
                    </TextField>
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
