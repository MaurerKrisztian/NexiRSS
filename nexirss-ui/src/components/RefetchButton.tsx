import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import {API_URL} from "../api-client/api";

const RefetchButton: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/rss-feed/fetch-all`);
        } catch (error) {
            console.error('Error fetching the RSS feed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleClick}
                disabled={loading}
                sx={{ position: 'relative' }}
            >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Refresh All Feeds'}
            </Button>
        </Box>
    );
};

export default RefetchButton;
