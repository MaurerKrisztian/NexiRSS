import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Avatar, Box, TextField, Button, IconButton, InputAdornment, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Visibility, VisibilityOff, Delete as DeleteIcon } from '@mui/icons-material';
import apiClient from "../api-client/api";
import { Link } from "react-router-dom";
import PushNotification from "./PushNotification";

export interface IUser {
    _id: string;
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    feeds: string[];
    openaiApiKey?: string;
    __v: number;
}

interface UserInfoProps {
    showFullProfile?: boolean;
}

interface ISubscription {
    _id: string;
    endpoint: string;
    deviceInfo?: { osName?: string; osVersion?: string; type?: string }
}

const UserInfo: React.FC<UserInfoProps> = ({ showFullProfile = true }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [showApiKey, setShowApiKey] = useState<boolean>(false);
    const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                const user: IUser = response.data;
                setUser(user);
                setApiKey(user.openaiApiKey || '');
            } catch (err) {
                setError('Failed to fetch user info');
            } finally {
                setLoading(false);
            }
        };

        const fetchSubscriptions = async () => {
            try {
                const response = await apiClient.get('/notifications/subscriptions');
                setSubscriptions(response.data);
            } catch (err) {
                setError('Failed to fetch subscriptions');
            }
        };

        fetchUserInfo();
        fetchSubscriptions();
    }, []);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
    };

    const handleApiKeyUpdate = async () => {
        if (!user) return;
        setIsUpdating(true);
        try {
            await apiClient.patch(`/users/${user._id}`, { openaiApiKey: apiKey });
            setUser({ ...user, openaiApiKey: apiKey });
        } catch (err) {
            setError('Failed to update API key');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleApiKeyVisibility = () => {
        setShowApiKey(!showApiKey);
    };

    const handleDeleteSubscription = async (subscriptionId: string) => {
        try {
            await apiClient.delete(`/notifications/subscriptions/${subscriptionId}`);
            setSubscriptions(subscriptions.filter(sub => sub._id !== subscriptionId));
        } catch (err) {
            setError('Failed to delete subscription');
        }
    };

    if (loading) {
        return (
            <Container>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            {showFullProfile ? (
                <Box display="flex" alignItems="center" flexDirection="column" mt={4}>
                    <Avatar src={user.picture} alt={user.name} sx={{ width: 100, height: 100 }} />
                    <Typography variant="h4" gutterBottom>
                        {user.name}
                    </Typography>
                    <Typography variant="h6">
                        {user.email}
                    </Typography>
                    <Typography variant="body1">
                        Given Name: {user.given_name}
                    </Typography>
                    <Typography variant="body1">
                        Family Name: {user.family_name}
                    </Typography>
                    <Typography variant="body1">
                        Email Verified: {user.email_verified ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                        Feeds: {user.feeds.length}
                    </Typography>
                    <Box mt={4} width="100%">
                        <Typography variant="h6">OpenAI API Key</Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={apiKey}
                            onChange={handleApiKeyChange}
                            placeholder="Enter your OpenAI API Key"
                            type={showApiKey ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle API key visibility"
                                            onClick={handleToggleApiKeyVisibility}
                                            edge="end"
                                        >
                                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleApiKeyUpdate}
                            disabled={isUpdating}
                            sx={{ mt: 2 }}
                        >
                            {isUpdating ? 'Updating...' : 'Update API Key'}
                        </Button>
                    </Box>
                    <Box mt={4} width="100%">
                        <Typography variant="h6">Notification Subscriptions</Typography>
                        <List>
                            {subscriptions.map(subscription => (
                                <ListItem key={subscription._id}>
                                    <ListItemText
                                        primary={`${`${subscription?.deviceInfo?.osName} ${subscription?.deviceInfo?.osVersion}`} Subscription`}
                                        secondary={"active"}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSubscription(subscription._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <PushNotification />
                </Box>
            ) : (
                <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Avatar style={{ margin: '10px' }} src={user.picture} alt={user.name} />
                </Link>
            )}
        </div>
    );
};

export default UserInfo;
