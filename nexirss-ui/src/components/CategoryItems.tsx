import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { List, Typography, CircularProgress, Box, Paper } from '@mui/material';
import axios from 'axios';
import FeedItemPreview from './FeedItemPreview';
import {API_URL} from "../api-client/api";

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
}

const CategoryItems: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(`${API_URL}/rss-feed/categories/${category}/items`);
                const itemsWithAudioLength = await Promise.all(
                    response.data.map(async (item: FeedItem) => {
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
                        <FeedItemPreview
                            key={item._id}
                            item={item}
                        />
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default CategoryItems;
