import React, { useEffect, useState, useCallback } from 'react';
import { List, Typography, CircularProgress, Box, Divider, Alert, Select, MenuItem, FormControl, InputLabel, Container } from '@mui/material';
import FeedItemPreview from './FeedItemPreview';
import SubscribedFeeds from './SubscribedFeeds';
import RefetchButton from "./RefetchButton";
import apiClient from "../api-client/api";
import { Link } from "react-router-dom";
import useUser from '../hooks/useUser';

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
    feed?: {
        image?: string;
        title: string;
    };
}

const Home: React.FC = () => {
    const { user, loading: userLoading, error: userError } = useUser();
    const [categories, setCategories] = useState<string[]>([]);
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchFeeds = async () => {
            if (user && user.feeds.length > 0) {
                try {
                    const response = await apiClient.get(`/rss-feed/user/feeds`, {
                        params: {
                            ids: user.feeds.join(',')
                        }
                    });
                    const feeds: Feed[] = response.data || [];
                    setFeeds(feeds);
                    const uniqueCategories = Array.from(new Set(feeds.map(feed => feed.category))).filter(e => e !== undefined);
                    setCategories(uniqueCategories);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching feeds:', error);
                }
            } else {
                setLoading(false);
            }
        };

        fetchFeeds();
    }, [user]);

    const fetchItems = useCallback(async (page: number, category: string) => {
        try {
            const categoryQuery = category !== 'all' ? category : '';
            const response = await apiClient.get(`/rss-feed/user/items?page=${page}&limit=10&category=${categoryQuery}`);
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
        if (!userLoading && user) {
            fetchItems(page, selectedCategory);
        }
    }, [page, selectedCategory, fetchItems, userLoading, user]);

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }, [hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleRefetch = () => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        fetchItems(1, selectedCategory);
    };

    const handleCategoryChange: any = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedCategory(event.target.value as string);
        setItems([]);
        setPage(1);
        setHasMore(true);
        fetchItems(1, event.target.value as string);
    };

    if (userLoading) {
        return <CircularProgress />;
    }

    if (userError) {
        return (
            <Container>
                <Typography color="error">{userError}</Typography>
            </Container>
        );
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            {feeds.length === 0 && (
                <Alert severity="warning">
                    No feed subscription. Please add a new feed in the <Link to={`/create`}> Feed Manager </Link> tab.
                </Alert>
            )}

            {feeds.length > 0 && (
                <div>
                    <SubscribedFeeds />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        <RefetchButton onRefetch={handleRefetch} />
                        <FormControl variant="outlined" sx={{ minWidth: 120, ml: 2 }}>
                            <InputLabel id="category-select-label">Category</InputLabel>
                            <Select
                                labelId="category-select-label"
                                id="category-select"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                label="Category"
                            >
                                <MenuItem value="all">All</MenuItem>
                                {categories.map(category => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Typography>
                    <List>
                        {items.map((item) => (
                            <FeedItemPreview key={item._id} item={item} user={user} />
                        ))}
                    </List>
                    {loading && <CircularProgress />}
                </div>
            )}
        </Box>
    );
};

export default Home;
