import React, { useEffect, useState } from 'react';
import { Box, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, FormControlLabel, Switch, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import apiClient from '../api-client/api';
import { pushNotificationPublicKey } from '../envs';
import { requestPermission } from '../utils/permission.util';
import * as rdd from 'react-device-detect';
import dayjs from 'dayjs';

interface ISubscription {
    _id: string;
    endpoint: string;
    createdAt: string;
    deviceInfo?: { osName?: string; osVersion?: string; type?: string }
}

const PushNotification: React.FC = () => {
    const theme = useTheme();
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/worker.js')
                .then(swReg => {
                    console.log('Service Worker Registered', swReg);

                    swReg.pushManager.getSubscription()
                        .then(subscription => {
                            if (subscription === null) {
                                console.log('Not subscribed to push service!');
                                setIsSubscribed(false);
                            } else {
                                console.log('Subscription object: ', subscription);
                                setSubscription(subscription);
                                setIsSubscribed(true);
                            }
                        });
                })
                .catch(error => {
                    console.error('Service Worker Error', error);
                });
        }

        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await apiClient.get('/notifications/subscriptions');
            setSubscriptions(response.data);
        } catch (err) {
            setError('Failed to fetch subscriptions');
        }
    };

    const subscribeUser = (swReg: ServiceWorkerRegistration) => {
        const vapidPublicKey = pushNotificationPublicKey;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        const deviceInfo = { type: rdd.deviceType, osName: rdd.osName, osVersion: rdd.osVersion };
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        })
            .then(subscription => {
                console.log('User is subscribed:', { subscription, deviceInfo });

                apiClient.post('/notifications/subscribe', { subscription, deviceInfo })
                    .then(response => {
                        console.log('Subscription sent to server:', response.data);
                        setSubscription(subscription);
                        setIsSubscribed(true);
                        fetchSubscriptions(); // Refresh the subscription list
                    })
                    .catch(error => {
                        console.error('Error sending subscription to server:', error);
                    });
            })
            .catch(error => {
                console.error('Failed to subscribe the user: ', error);
            });
    };

    const unsubscribeUser = async () => {
        if (!subscription) return;

        try {
            await subscription.unsubscribe();
            console.log('Push subscription unsubscribed.');

            await apiClient.delete(`/notifications/subscriptions`, { data: { endpoint: subscription.endpoint } });
            console.log('Subscription removed from server.');

            setSubscription(null);
            setIsSubscribed(false);
            fetchSubscriptions(); // Refresh the subscription list
        } catch (error) {
            console.error('Failed to unsubscribe the user:', error);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleSendNotification = async () => {
        await requestPermission();
        try {
            await apiClient.post('/notifications', { message: 'Hello, this is a test notification!' });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const handleToggleSubscription = async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            console.error('Service worker registration not found');
            return;
        }

        if (isSubscribed) {
            await unsubscribeUser();
        } else {
            subscribeUser(registration);
        }
    };

    const handleDeleteSubscription = async (subscriptionId: string) => {
        try {
            const subscriptionToDelete = subscriptions.find(sub => sub._id === subscriptionId);
            if (subscriptionToDelete) {
                await apiClient.delete(`/notifications/subscriptions/${subscriptionId}`);
                setSubscriptions(subscriptions.filter(sub => sub._id !== subscriptionId));

                if (subscription && subscription.endpoint === subscriptionToDelete.endpoint) {
                    await unsubscribeUser();
                }
            }
        } catch (err) {
            setError('Failed to delete subscription');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
            <FormControlLabel
                control={<Switch checked={isSubscribed} onChange={handleToggleSubscription} />}
                label="Enable Push Notifications"
            />
            <Button variant="contained" onClick={handleSendNotification} disabled={!isSubscribed}>
                Test Push Notification
            </Button>
            <Box mt={4} width="100%">
                <Typography variant="h6">Notification Subscriptions</Typography>
                <List>
                    {subscriptions.map(subscriptionItem => (
                        <ListItem
                            key={subscriptionItem._id}
                            sx={{
                                backgroundColor: subscription?.endpoint === subscriptionItem.endpoint
                                    ? theme.palette.mode === 'dark' ? '#424242' : 'lightgray'
                                    : 'inherit'
                            }}
                        >
                            <ListItemText
                                primary={`${subscriptionItem?.deviceInfo?.osName} ${subscriptionItem?.deviceInfo?.osVersion} Subscription`}
                                secondary={`Created at: ${dayjs(subscriptionItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSubscription(subscriptionItem._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
                {error && <Typography color="error">{error}</Typography>}
            </Box>
        </Box>
    );
};

export default PushNotification;
