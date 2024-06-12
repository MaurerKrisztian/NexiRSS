import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardActions, CardMedia } from '@mui/material';
import {Link} from "react-router-dom";

const features = [
    {
        title: 'RSS Feed Handling',
        description: 'Easily manage RSS feed links, YouTube videos, and podcasts in one place.',
        image: 'assets/rss_feed.webp',
    },
    {
        title: 'Push Notifications',
        description: 'Get real-time push notifications for new content on multiple devices.',
        image: 'assets/push_notifications.webp',
    },
    {
        title: 'AI-Powered Summaries',
        description: 'Generate AI summaries for articles and tag them automatically.',
        image: 'assets/ai_summaries.webp',
    },
    {
        title: 'AI Triggers',
        description: 'Set AI triggers to highlight and notify you about specific content.',
        image: 'assets/ai_triggers.webp',
    },
    {
        title: 'Custom Notifications',
        description: 'Subscribe to feeds and customize notifications with AI prompts.',
        image: 'assets/custom_notifications.webp',
    },
    {
        title: 'Generate text-to-speech',
        description: 'Convert text content into natural-sounding speech with our advanced text-to-speech functionality.',
        image: 'assets/tts.webp',
    },
];

function App() {
    return (
        <Container maxWidth="lg" style={{ padding: '2rem 0' }}>
            <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {/*<Typography variant="h2" component="h1" gutterBottom>*/}
                {/*    NexiRSS*/}
                {/*</Typography>*/}
                <Typography variant="h2" gutterBottom>
                    Welcome to NexiRSS
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Ignore the noise, focus on the important things.
                </Typography>
                <Typography variant="body1" paragraph>

                    Your all-in-one solution for managing RSS feeds, videos, podcasts, and more.
                </Typography>
                <Box mt={4}>
                    <Button color="primary" size={"large"} component={Link} to="/login">
                        Get Started
                    </Button>
                </Box>
            </header>

            <main>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={feature.image}
                                    alt={feature.title}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" color="primary">
                                        Learn More
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </main>

            <footer style={{ textAlign: 'center', marginTop: '4rem' }}>
                <Typography variant="body2" color="textSecondary">
                    © 2024 NexiRRS. All rights reserved.
                </Typography>
            </footer>
        </Container>
    );
}

export default App;
