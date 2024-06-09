import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControlLabel, Checkbox, Typography, Alert, List, ListItem, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import apiClient from "../api-client/api";

const AiAnalyticsSetup: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [notifications, setNotifications] = useState(false);
    const [highlight, setHighlight] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [aiItems, setAiItems] = useState([]);
    const [editId, setEditId] = useState('');

    useEffect(() => {
        // Fetch user profile to get OpenAI API key and AI settings
        const fetchUserProfile = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                const user = response.data;
                setApiKey(user.openaiApiKey || '');
                if (user.aiAnalysisSettings) {
                    setAiItems(user.aiAnalysisSettings);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleSave = async () => {
        try {
            const newItem = { prompt, notifications, highlight };
            if (editId) {
                await apiClient.patch(`/ai-analytics/update-ai/${editId}`, newItem);
                setAiItems(aiItems.map(item => item._id === editId ? { ...item, ...newItem } : item));
                setEditId('');
            } else {
                const response = await apiClient.post('/ai-analytics/setup-ai', newItem);
                console.log("creaate new ", response.data)
                setAiItems([...aiItems, response.data]);
            }
            setPrompt('');
            setNotifications(false);
            setHighlight(false);
        } catch (error) {
            console.error('Error saving AI analytics settings:', error);
        }
    };

    const handleEdit = (id) => {
        const item = aiItems.find(item => item._id === id);
        setPrompt(item.prompt);
        setNotifications(item.notifications);
        setHighlight(item.highlight);
        setEditId(id);
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/ai-analytics/delete-ai/${id}`);
            setAiItems(aiItems.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error deleting AI analytics item:', error);
        }
    };

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 600, p: 2 }}>
            <Typography variant="h5" gutterBottom>
                AI Content Analytics Setup
            </Typography>
            <Typography variant="body1" gutterBottom>
                Use this feature to analyze new RSS feed items based on your custom prompts. You can set up specific criteria to receive notifications or highlight certain types of content. For example, you might want to get notified if a post is about AI safety or highlight posts about gaming.
            </Typography>
            { !apiKey && (
                <Alert severity="warning">
                    Please set up your OpenAI API key in your profile settings.
                </Alert>
            )}
            <TextField
                fullWidth
                label="AI Analysis Prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                margin="normal"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                    />
                }
                label="Send Notifications"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={highlight}
                        onChange={(e) => setHighlight(e.target.checked)}
                    />
                }
                label="Highlight Feed"
            />
            <Button variant="contained" color="primary" onClick={handleSave}>
                {editId ? 'Update' : 'Save'}
            </Button>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Saved AI Items
            </Typography>
            <List>
                {aiItems.map((item) => (
                    <ListItem key={item._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>
                            {item.prompt} - Notifications: {item.notifications ? 'Yes' : 'No'} - Highlight: {item.highlight ? 'Yes' : 'No'}
                        </Typography>
                        <Box>
                            <IconButton onClick={() => handleEdit(item._id)}>
                                <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(item._id)}>
                                <Delete />
                            </IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default AiAnalyticsSetup;
