import axios from "axios";
import {apiUrl} from "../envs";

export const API_URL = apiUrl

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