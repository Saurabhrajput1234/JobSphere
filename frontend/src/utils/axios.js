import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
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
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => {
        // Log successful responses for debugging
        console.log('Response:', response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.data || error.message);

        // Handle network errors
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        // Handle unauthorized errors
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        // Handle validation errors
        if (error.response?.status === 422) {
            const errors = error.response.data.errors;
            const errorMessage = Object.values(errors)
                .flat()
                .join(', ');
            return Promise.reject(new Error(errorMessage));
        }

        // Handle server errors
        if (error.response?.status === 500) {
            return Promise.reject(new Error(error.response.data.message || 'Server error occurred'));
        }

        return Promise.reject(error);
    }
);

export default instance; 