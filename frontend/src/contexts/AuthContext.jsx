import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/user');
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      setError(null);
      console.log('Login data:', formData);

      const response = await axios.post('/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (!error.response) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle validation errors
      if (error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.values(validationErrors)
          .flat()
          .join(', ');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle authentication errors
      if (error.response.status === 401) {
        const errorMessage = error.response.data.message || 'Invalid credentials';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle server errors
      if (error.response.status === 500) {
        const errorMessage = error.response.data.message || 'Server error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle other errors
      const errorMessage = error.response.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      console.log('Registration data:', formData);

      const response = await axios.post('/register', formData);
      console.log('Registration response:', response.data);
      
      if (response.data.status === 'success') {
        // Check if token exists in response
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        setUser(response.data.data.user);
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle network errors
      if (!error.response) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle validation errors
      if (error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.values(validationErrors)
          .flat()
          .join(', ');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle server errors
      if (error.response.status === 500) {
        const errorMessage = error.response.data.message || 'Server error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle other errors
      const errorMessage = error.response.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 