import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
    },
    components: {
        MuiContainer: {
            styleOverrides: {
                root: {
                    paddingTop: '16px',
                    paddingBottom: '16px',
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: '#90caf9', // Default link color
                    '&:hover': {
                        color: '#19df0a', // Link color on hover
                    },
                    '&:visited': {
                        color: '#454747', // Link color for visited links
                    },
                },
            },
        },
    },
});

export default theme;
