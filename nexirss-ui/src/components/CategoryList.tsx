import React, { useEffect, useState, useCallback } from 'react';
import {List, Typography, CircularProgress, Box, Divider, ListItem, ListItemText} from '@mui/material';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import FeedItemPreview from './FeedItemPreview';

interface Feed {
    _id: string;
    category: string;
}

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
    feed: {
        title: string;
    };
}

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:3000/rss-feed/feeds');
                const feeds: Feed[] = response.data;
                const uniqueCategories = Array.from(new Set(feeds.map(feed => feed.category)));
                setCategories(uniqueCategories);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const fetchItems = useCallback(async (page: number) => {
        try {
            const response = await axios.get(`http://localhost:3000/rss-feed/items?page=${page}&limit=10`);
            const newItems: FeedItem[] = response.data;
            setItems(prevItems => [...prevItems, ...newItems]);
            if (newItems.length === 0) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }, []);

    useEffect(() => {
        fetchItems(page);
    }, [page, fetchItems]);

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }, [hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Categories
            </Typography>
            <List>
                {categories.map((category, index) => (
                    <ListItem key={index} component={RouterLink} to={`/categories/${category}/items`} button>
                        <ListItemText primary={category} />
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h4" gutterBottom>
                New items
            </Typography>
            <List>
                {items.map(item => (
                    <FeedItemPreview
                        key={item._id}
                        item={item}
                    />
                ))}
            </List>
            {loading && <CircularProgress />}
        </Box>
    );
};

export default CategoryList;
