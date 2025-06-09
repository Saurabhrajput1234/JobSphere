import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});

// Request interceptor
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

// Response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific error cases
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    // Forbidden - show access denied message
                    console.error('Access denied');
                    break;
                case 422:
                    // Validation error - handled by form components
                    break;
                case 500:
                    // Server error - show generic error message
                    console.error('Server error occurred');
                    break;
                default:
                    console.error('An error occurred:', error.response.data);
            }
        } else if (error.request) {
            // Network error
            console.error('Network error:', error.request);
        } else {
            // Other errors
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance; 