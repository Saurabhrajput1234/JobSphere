import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/animations.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('job_seeker');
    const [companyName, setCompanyName] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await register(
                name,
                email,
                password,
                passwordConfirmation,
                role,
                role === 'recruiter' ? companyName : null,
                role === 'recruiter' ? companyDescription : null
            );
            if (response.success) {
                navigate('/dashboard');
            } else {
                setError(response.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in">
            <div className="card">
                <h1 className="title">Create Account</h1>
                <p className="text-gray-600 mb-6">Join us and start your journey</p>

                {error && (
                    <div className="error mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label htmlFor="name" className="label">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="label">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role" className="label">I am a</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="input"
                            required
                        >
                            <option value="job_seeker">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>

                    {role === 'recruiter' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="companyName" className="label">Company Name</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="input"
                                    placeholder="Enter your company name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="companyDescription" className="label">Company Description</label>
                                <textarea
                                    id="companyDescription"
                                    value={companyDescription}
                                    onChange={(e) => setCompanyDescription(e.target.value)}
                                    className="input"
                                    placeholder="Enter your company description"
                                    rows="3"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="password" className="label">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="passwordConfirmation" className="label">Confirm Password</label>
                        <input
                            type="password"
                            id="passwordConfirmation"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="input"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="button w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register; 