import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface CategoriesListProps {
    categories: string[];
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Categories
            </Typography>
            <Grid container spacing={2}>
                {categories.map((category, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box
                            component={RouterLink}
                            to={`/categories/${category}/items`}
                            sx={{
                                display: 'block',
                                textAlign: 'center',
                                textDecoration: 'none',
                                color: 'inherit',
                                border: '1px solid',
                                borderRadius: '8px',
                                padding: '6px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            {category}
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CategoriesList;
