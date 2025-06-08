import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        // Handle network errors
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }
        // Handle validation errors
        if (error.response?.status === 422) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default instance; 