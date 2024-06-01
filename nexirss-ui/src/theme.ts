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
    },
});

export default theme;
