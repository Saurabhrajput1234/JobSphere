import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/animations.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="container animate-fade-in">
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="title">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="button"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            <span className="font-medium">Email:</span> {user?.email}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Account Created:</span>{' '}
                            {new Date(user?.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card bg-blue-50 p-4">
                        <h3 className="font-semibold text-blue-700 mb-2">Quick Stats</h3>
                        <p className="text-blue-600">Your account is active and secure</p>
                    </div>
                    <div className="card bg-green-50 p-4">
                        <h3 className="font-semibold text-green-700 mb-2">Account Status</h3>
                        <p className="text-green-600">Verified and ready to use</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 