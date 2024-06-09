import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
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
import {updateToken} from "./api-client/api";
import UserInfo from "./components/UserInfo";
import AiAnalyticsSetup from "./components/AiAnalyticsSetup";

const App: React.FC = () => {
  const [authData, setAuthData] = useState<string | null>(localStorage.getItem('token'));

  const handleLoginSuccess = (token: string) => {
    setAuthData(token);
    updateToken(token)
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    updateToken()
    setAuthData(null);
  };

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
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          NexiRSS
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, width: '100%' }}>
                          <SearchBar />
                        </Box>
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


                        <Button color="inherit" onClick={handleLogout}>
                          Logout
                        </Button>

                          <UserInfo showFullProfile={false} ></UserInfo>
                      </Toolbar>
                    </AppBar>
                    <Container>
                      <Box mt={2}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/feeds" element={<FeedList />} />
                          <Route path="/ai" element={<AiAnalyticsSetup />} />
                          <Route path="/create" element={<FeedForm />} />
                          <Route path="/feeds/:feedId/items" element={<FeedItemsByFeedId />} />
                          <Route path="/items/:postId" element={<PostContent />} />
                          <Route path="/categories/:category/items" element={<CategoryItems />} />
                          <Route path="/profile" element={<UserInfo />} />
                          {/*<Route path="/browsfeeds" element={<BrowsFeeds />} />*/}
                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                      </Box>
                    </Container>
                    <MediaPlayer />
                  </>
              ) : (
                  <Routes>
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
