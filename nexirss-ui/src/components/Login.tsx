import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Typography, Container } from '@mui/material';
import axios from 'axios';
import apiClient, {API_URL, updateToken} from '../api-client/api';

interface LoginProps {
    onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
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
        } catch (error) {
            console.error('Error during Google login:', error);
        }
    };

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
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
