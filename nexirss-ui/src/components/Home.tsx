import React, { useEffect, useState, useCallback } from 'react';
import { List, Typography, CircularProgress, Box, Divider } from '@mui/material';
import FeedItemPreview from './FeedItemPreview';
import SubscribedFeeds from './SubscribedFeeds';
import RefetchButton from "./RefetchButton";
import apiClient, {API_URL} from "../api-client/api";
import BrowsFeeds from "./BrowsFeeds";

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
        image?: string
        title: string;
    };
}

const Home: React.FC = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get(`/rss-feed/feeds`);
                const feeds: Feed[] = response.data;
                const uniqueCategories = Array.from(new Set(feeds.map(feed => feed.category))).filter(e => e !== undefined);
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
            const response = await apiClient.get(`/rss-feed/user/items?page=${page}&limit=10`);
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
            <SubscribedFeeds />
            <BrowsFeeds></BrowsFeeds>
            {/*<CategoriesList categories={categories} />*/}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h4" gutterBottom>
                 <RefetchButton></RefetchButton>
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

export default Home;
