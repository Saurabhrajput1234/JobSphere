import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        if (!name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (password !== password_confirmation) {
            setError('Passwords do not match');
            return false;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            console.log('Submitting registration form with data:', {
                name,
                email,
                password,
                password_confirmation
            });

            const response = await register(name, email, password, password_confirmation);
            console.log('Registration response:', response);

            if (response.success) {
                navigate('/dashboard');
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.errors) {
                // Handle Laravel validation errors
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError('An error occurred during registration. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h1 className="register-title">Register</h1>
                {error && <div className="register-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="register-form-group">
                        <label className="register-label" htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            className="register-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className="register-form-group">
                        <label className="register-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="register-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="register-form-group">
                        <label className="register-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="register-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            minLength="8"
                        />
                    </div>
                    <div className="register-form-group">
                        <label className="register-label" htmlFor="password_confirmation">Confirm Password</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            className="register-input"
                            value={password_confirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            placeholder="Confirm your password"
                            minLength="8"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <Link to="/login" className="register-link">
                    Already have an account? Login
                </Link>
            </div>
        </div>
    );
};

export default Register; 