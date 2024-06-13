import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import {
    Container, AppBar, Toolbar, Typography, Box, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import FeedList from './components/FeedList';
import FeedForm from './components/FeedForm';
import PostContent from './components/PostContent';
import Home from './components/Home';
import CategoryItems from './components/CategoryItems';
import FeedItemsByFeedId from './components/FeedItemsByFeedId';
import SearchBar from './components/SearchBar';
import { AudioProvider } from './components/AudioContext';
import MediaPlayer from './components/MediaPlayer';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import { updateToken } from "./api-client/api";
import UserInfo from "./components/UserInfo";
import AiAnalyticsSetup from "./components/AiAnalyticsSetup";
import LandingPage from "./components/LandingPage";

const App: React.FC = () => {
    const [authData, setAuthData] = useState<string | null>(localStorage.getItem('token'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleLoginSuccess = (token: string) => {
        setAuthData(token);
        updateToken(token)
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        updateToken()
        setAuthData(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography style={{ textDecoration: 'none', color: '#90caf9' }} component={Link} to="/" variant="h6" sx={{ my: 2 }}>
                NexiRSS
            </Typography>
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button component={Link} to="/feeds">
                    <ListItemText primary="Feeds" />
                </ListItem>
                <ListItem button component={Link} to="/ai">
                    <ListItemText primary="AI analytics" />
                </ListItem>
                <ListItem button component={Link} to="/create">
                    <ListItemText primary="Manage Feed" />
                </ListItem>
                <ListItem button component={Link} to="/profile">
                    <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AudioProvider>
                <GoogleOAuthProvider clientId="440254104992-djse639h0dbsclvmapdma4ga63rqfifd.apps.googleusercontent.com">
                    <Router>
                        {authData ? (
                            <>
                                <AppBar position="static">
                                    <Toolbar>
                                        <Typography  component={Link} to="/"  style={{ textDecoration: 'none', color: '#90caf9' }} variant="h6" sx={{ flexGrow: 1 }}>
                                            NexiRSS
                                        </Typography>
                                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                                            <Button color="inherit" component={Link} to="/">
                                                Home
                                            </Button>
                                            <Button color="inherit" component={Link} to="/feeds">
                                                Feeds
                                            </Button>
                                            <Button color="inherit" component={Link} to="/ai">
                                                AI analytics
                                            </Button>
                                            <Button color="inherit" component={Link} to="/create">
                                                Manage Feed
                                            </Button>
                                            <Button color="inherit" component={Link} to="/profile">
                                                Profile
                                            </Button>
                                            <Button color="inherit" onClick={handleLogout}>
                                                Logout
                                            </Button>
                                            <UserInfo showFullProfile={false} />
                                        </Box>
                                        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
                                                <MenuIcon />
                                            </IconButton>
                                        </Box>
                                    </Toolbar>
                                </AppBar>
                                <Box component="nav">
                                    <Drawer
                                        variant="temporary"
                                        open={mobileOpen}
                                        onClose={handleDrawerToggle}
                                        ModalProps={{
                                            keepMounted: true,
                                        }}
                                        sx={{
                                            display: { xs: 'block', sm: 'none' },
                                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                                        }}
                                    >
                                        {drawer}
                                    </Drawer>
                                </Box>
                                <Container>
                                    <Box mt={2}>
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/landingpage" element={<LandingPage />} />
                                            <Route path="/feeds" element={<FeedList />} />
                                            <Route path="/ai" element={<AiAnalyticsSetup />} />
                                            <Route path="/create" element={<FeedForm />} />
                                            <Route path="/feeds/:feedId/items" element={<FeedItemsByFeedId />} />
                                            <Route path="/items/:postId" element={<PostContent />} />
                                            <Route path="/categories/:category/items" element={<CategoryItems />} />
                                            <Route path="/profile" element={<UserInfo />} />
                                            <Route path="*" element={<Navigate to="/" />} />
                                        </Routes>
                                    </Box>
                                </Container>
                                <MediaPlayer />
                            </>
                        ) : (
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/landingpage" element={<LandingPage />} />
                                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />}  />
                                <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                            </Routes>
                        )}
                    </Router>
                </GoogleOAuthProvider>
            </AudioProvider>
        </ThemeProvider>
    );
};

export default App;
