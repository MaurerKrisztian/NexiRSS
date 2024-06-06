import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import apiClient from '../api-client/api';
import debounce from 'lodash/debounce';

interface Feed {
    _id: string;
    url: string;
    title: string;
    image: string;
    description: string;
}

const placeholderImage = 'https://via.placeholder.com/150';

const FeedBrowser: React.FC = () => {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchFeeds = useCallback(
        debounce(async (search: string, page: number) => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/rss-feed/feeds?search=${search}&page=${page}&limit=10`);
                setFeeds(response.data.feeds);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feeds:', error);
                setLoading(false);
            }
        }, 1000),
        []
    );

    useEffect(() => {
        if (searchTerm) {
            fetchFeeds(searchTerm, page);
        } else {
            setFeeds([]);
        }
    }, [searchTerm, page, fetchFeeds]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1); // Reset to the first page on new search
    };

    const handlePrevPage = () => {
        setPage((prevPage) => Math.max(prevPage, 1));
    };

    const handleNextPage = () => {
        setPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Browse Feeds
            </Typography>
            <TextField
                label="Search Feeds"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleSearchChange}
            />
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {(feeds || []).map((feed) => (
                            <Grid item key={feed._id} xs={12} sm={6} md={4}>
                                <Card>
                                    <Link to={`/feeds/${feed._id}/items`} style={{ textDecoration: 'none', color: '#90caf9' }}>
                                        <CardMedia
                                            component="img"
                                            alt={feed.title}
                                            height="140"
                                            image={feed.image || placeholderImage}
                                            title={feed.title}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {feed.title}
                                            </Typography>
                                        </CardContent>
                                    </Link>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="contained" onClick={handlePrevPage} disabled={page === 1}>
                            Previous
                        </Button>
                        <Typography>Page {page} of {totalPages}</Typography>
                        <Button variant="contained" onClick={handleNextPage} disabled={page === totalPages}>
                            Next
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default FeedBrowser;
