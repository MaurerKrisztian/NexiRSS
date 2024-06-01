import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import axios from 'axios';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface Post {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
}

const PostContent: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/rss-feed/items/${postId}`);
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPost();
    }, [postId]);

    if (!post) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ mt: 2, mx: 'auto', maxWidth: 800, p: 2 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {post.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {new Date(post.pubDate).toLocaleString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {post.content.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </Typography>
                <IconButton
                    color="primary"
                    onClick={() => window.open(post.link, '_blank')}
                    sx={{ float: 'right' }}
                >
                    <OpenInNewIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default PostContent;
