import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Typography, Container } from '@mui/material';
import apiClient, { updateToken } from '../api-client/api';
import useUser from '../hooks/useUser';

interface LoginProps {
    onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const { setUser } = useUser();

    const handleLoginSuccess = async (credentialResponse: any) => {
        console.log('Google credential response:', credentialResponse);
        try {
            const response = await apiClient.post(`/auth/google`, {
                token: credentialResponse.credential,
            });
            const { access_token } = response.data;
            updateToken(access_token)
            localStorage.setItem('token', access_token);
            onLoginSuccess(access_token);
            console.log('JWT token:', access_token);

            // Fetch and set the user data
            const userResponse = await apiClient.get('/auth/me');
            setUser(userResponse.data);
        } catch (error) {
            console.error('Error during Google login:', error);
        }
    };

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <Typography variant="h2" gutterBottom>
                    NexiRSS
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Ignore the noise, focus on the important things.
                </Typography>
                <Typography variant="body1" paragraph>
                    NexiRSS is your one-stop RSS feed web app that supports any RSS feed, provides TSS features, podcast listening with saved progress, and YouTube channel subscriptions.
                </Typography>
                <Typography variant="h4" gutterBottom>
                    Login to NexiRSS
                </Typography>
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                />
            </Box>
        </Container>
    );
};

export default Login;
