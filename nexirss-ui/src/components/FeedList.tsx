import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

interface Feed {
    _id: string;
    category: string;
}

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

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
        </Box>
    );
};

export default CategoryList;
