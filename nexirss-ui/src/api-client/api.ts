import axios from "axios";

export const API_URL = "https://nexirss-production.up.railway.app/api"
// export const API_URL = "http://localhost:3000/api"//"https://nexirss-production.up.railway.app/api"

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const updateToken = (token?: string) => {
    console.log("update token", token);
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
    apiClient.defaults.headers['Authorization'] = token ? `Bearer ${token}` : '';
};

export default apiClient;