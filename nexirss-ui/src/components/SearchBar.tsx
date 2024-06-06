import React, { useState, useEffect, useCallback, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { TextField, Box, MenuItem, Select, CircularProgress, Typography, Popper, Paper, List, ListItem } from '@mui/material';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
import apiClient, {API_URL} from "../api-client/api";

interface FeedItem {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
    feed: {
        title: string;
    };
}

interface Category {
    _id: string;
    name: string;
}

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [categories, setCategories] = useState<Category[]>([]);
    const [suggestions, setSuggestions] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get(`/rss-feed/feeds`);
                const feeds = response.data;
                const uniqueCategories: string[] = Array.from(new Set(feeds.map((feed: any) => feed.category)));
                setCategories(uniqueCategories.map((cat, index) => ({ _id: index.toString(), name: cat })));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const fetchSuggestions = async (searchQuery: string) => {
        if (searchQuery.trim() === '') {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post(`/rss-feed/vector-search`, { query: searchQuery, category });
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
        setLoading(false);
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 1000), [category]);

    const handleSearchChange = (event: any, { newValue }: any) => {
        setQuery(newValue);
        debouncedFetchSuggestions(newValue);
    };

    const handleCategoryChange: any = (e: React.ChangeEvent<{ value: unknown }>) => {
        setCategory(e.target.value as string);
    };

    const getSuggestionValue = (suggestion: FeedItem) => suggestion.title;

    const handleSuggestionSelected = (event: any, { suggestion }: any) => {
        navigate(`/items/${suggestion._id}`);
        setQuery('');
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setQuery('');
        }
    };

    // todo: add feed.title  tothe response
    const renderSuggestion = (suggestion: FeedItem) => (
        <ListItem sx={{ '&:hover': { backgroundColor: '#434343' }, cursor: 'pointer' }}>
            <Typography>
                {suggestion.title}
                <br />
                <small>
                    {new Date(suggestion.pubDate).toLocaleString()} - {suggestion?.feed?.title}
                </small>
            </Typography>
        </ListItem>
    );

    const inputProps = {
        placeholder: 'Search',
        value: query,
        onChange: handleSearchChange,
        onKeyDown: handleKeyDown,
        ref: inputRef,
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 1 }}>
            <Select value={category} onChange={handleCategoryChange} sx={{ mr: 2 }}>
                <MenuItem value="all">All</MenuItem>
                {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat.name}>
                        {cat.name}
                    </MenuItem>
                ))}
            </Select>
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={() => {}} // No need to call fetch here
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
                onSuggestionSelected={handleSuggestionSelected}
                renderInputComponent={(inputProps: any) => (
                    <TextField
                        {...inputProps}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                            ...inputProps.InputProps,
                            endAdornment: loading ? <CircularProgress size={20} /> : null,
                        }}
                    />
                )}
                renderSuggestionsContainer={({ containerProps, children, query }) => (
                    <Popper {...containerProps} open={Boolean(children)} anchorEl={inputRef.current} placement="bottom-start">
                        <Paper square>
                            <List>
                                {children}
                            </List>
                        </Paper>
                    </Popper>
                )}
            />
        </Box>
    );
};

export default SearchBar;
