import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { List, Typography, CircularProgress, Box, Paper, CardMedia, Divider, Button, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import FeedItemPreview from './FeedItemPreview';
import apiClient from "../api-client/api";
import { requestPermission } from "../utils/permission.util";
import useUser from "../hooks/useUser";

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
    const { user, loading: userLoading, error: userError, refreshUser } = useUser();
    const [feed, setFeed] = useState<Feed | null>(null);
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [aiTriggerEnabled, setAiTriggerEnabled] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // Set the limit of items per page

    useEffect(() => {
        const fetchFeedDetails = async () => {
            try {
                const feedResponse = await apiClient.get(`/rss-feed/feeds/${feedId}`);
                setFeed(feedResponse.data);
                await fetchItems(page, limit);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feed details and items:', error);
            }
        };

        const checkSubscriptionStatus = async () => {
            try {
                const response = await apiClient.get(`/rss-feed/user/subscriptions`);
                const subscribedFeeds = response.data;
                const subscribedFeed = subscribedFeeds.find((sub: any) => sub.feed === feedId);
                setIsSubscribed(!!subscribedFeed);
                setNotificationsEnabled(subscribedFeed?.notifications || false);
                setAiTriggerEnabled(subscribedFeed?.enableAITrigger || false);
            } catch (error) {
                console.error('Error checking subscription status:', error);
            }
        };

        fetchFeedDetails();
        checkSubscriptionStatus();
    }, [feedId, page, limit]);

    const fetchItems = async (page: number, limit: number) => {
        try {
            const itemsResponse = await apiClient.get(`/rss-feed/feeds/${feedId}/items`, { params: { page, limit } });
            const itemsWithAudioLength = await Promise.all(
                itemsResponse.data.map(async (item: FeedItem) => {
                    if (item.audioInfo && !item.audioInfo.length) {
                        try {
                            const headResponse = await apiClient.head(item.audioInfo.url);
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
            setItems((prevItems) => [...prevItems, ...itemsWithAudioLength]);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSubscribe = async () => {
        try {
            await apiClient.post('/rss-feed/user/add-feed', { feedId, notifications: notificationsEnabled, enableAITrigger: aiTriggerEnabled });
            setIsSubscribed(true);
            await refreshUser();
        } catch (error) {
            console.error('Error subscribing to feed:', error);
        }
    };

    const handleUnsubscribe = async () => {
        try {
            await apiClient.delete('/rss-feed/user/remove-feed', { data: { feedId } });
            setIsSubscribed(false);
            await refreshUser();
        } catch (error) {
            console.error('Error unsubscribing from feed:', error);
        }
    };

    const toggleNotifications = async () => {
        await requestPermission();

        try {
            const newNotificationStatus = !notificationsEnabled;
            await apiClient.patch('/rss-feed/user/update-feed', { feedId, notifications: newNotificationStatus, enableAITrigger: aiTriggerEnabled });
            setNotificationsEnabled(newNotificationStatus);
            await refreshUser();
        } catch (error) {
            console.error('Error updating notification status:', error);
        }
    };

    const toggleAiTrigger = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAITriggerStatus = event.target.checked;

        try {
            await apiClient.patch('/rss-feed/user/update-feed', { feedId, notifications: notificationsEnabled, enableAITrigger: newAITriggerStatus });
            setAiTriggerEnabled(newAITriggerStatus);
            await refreshUser();
        } catch (error) {
            console.error('Error updating AI Trigger status:', error);
        }
    };

    const loadMore = () => {
        setPage((prevPage) => prevPage + 1);
    };

    if (userError) {
        return (
            <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
                <Typography color="error">{userError}</Typography>
            </Box>
        );
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color={isSubscribed ? "secondary" : "primary"}
                            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                        >
                            {isSubscribed ? "Unsubscribe" : "Subscribe"}
                        </Button>
                        {isSubscribed && (
                            <>
                                <IconButton onClick={toggleNotifications} sx={{ ml: 2 }}>
                                    {notificationsEnabled ? <Notifications /> : <NotificationsOff />}
                                </IconButton>
                                <FormControlLabel
                                    control={<Checkbox checked={aiTriggerEnabled} onChange={toggleAiTrigger} />}
                                    label="Enable AI Trigger Analytics"
                                    sx={{ ml: 2 }}
                                />
                            </>
                        )}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                </>
            )}
            <Typography variant="h4" gutterBottom>
                Feed Items
            </Typography>
            <Paper elevation={3} sx={{ p: 2 }}>
                <List>
                    {items.map((item) => (
                        <FeedItemPreview key={item._id} item={item} user={user} />
                    ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    {loading ? <CircularProgress /> : (
                        <Button onClick={loadMore} variant="contained" color="primary">
                            Load More
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default FeedItemsByFeedId;
