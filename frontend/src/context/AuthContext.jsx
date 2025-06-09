import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, []);

    const checkAuth = async () => {
        try {
            setError(null);
            const response = await axios.get('/user');
            setUser(response.data.data.user);
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            localStorage.removeItem('token');
            setError(error.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await axios.post('/login', { email, password });
            console.log('Login response:', response.data);
            
            if (response.data.status === 'success') {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                setUser(user);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const register = async (name, email, password, password_confirmation, role, company_name, company_description) => {
        try {
            setError(null);
            const registrationData = {
                name,
                email,
                password,
                password_confirmation,
                role
            };

            // Only include company fields if role is recruiter
            if (role === 'recruiter') {
                registrationData.company_name = company_name;
                registrationData.company_description = company_description;
            }

            console.log('Registration data:', registrationData);

            const response = await axios.post('/register', registrationData);
            
            console.log('Registration response:', response.data);
            
            if (response.data.status === 'success') {
                const { token } = response.data.data;
                localStorage.setItem('token', token);
                setUser(response.data.data.user);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('Registration error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            // Handle network errors
            if (!error.response) {
                setError('Network error. Please check your connection.');
                return { success: false, message: 'Network error. Please check your connection.' };
            }

            // Handle validation errors
            if (error.response.status === 422) {
                const validationErrors = error.response.data.errors;
                const errorMessage = Object.values(validationErrors)
                    .flat()
                    .join(', ');
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }

            // Handle server errors
            if (error.response.status === 500) {
                const errorMessage = error.response.data.message || 'Server error occurred';
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }

            // Handle other errors
            const errorMessage = error.response.data?.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await axios.post('/logout');
            localStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('token');
            setUser(null);
            setError('Logout failed');
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { useAuth }; 