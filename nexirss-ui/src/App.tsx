import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import FeedList from './components/FeedList';
import FeedForm from './components/FeedForm';
import PostContent from './components/PostContent';
import CategoryList from './components/CategoryList';
import CategoryItems from './components/CategoryItems';
import FeedItemsByFeedId from './components/FeedItemsByFeedId';
import SearchBar from './components/SearchBar';

const App: React.FC = () => {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
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
                RSS Feeds
              </Button>
              <Button color="inherit" component={Link} to="/create">
                Create Feed
              </Button>
            </Toolbar>
          </AppBar>
          <Container>
            <Box mt={2}>
              <Routes>
                <Route path="/" element={<CategoryList />} />
                <Route path="/feeds" element={<FeedList />} />
                <Route path="/create" element={<FeedForm />} />
                <Route path="/feeds/:feedId/items" element={<FeedItemsByFeedId />} />
                <Route path="/items/:postId" element={<PostContent />} />
                <Route path="/categories/:category/items" element={<CategoryItems />} />
              </Routes>
            </Box>
          </Container>
        </Router>
      </ThemeProvider>
  );
};

export default App;
