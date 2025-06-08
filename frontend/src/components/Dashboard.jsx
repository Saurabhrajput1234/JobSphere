import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

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
        <div className="dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <button onClick={handleLogout} className="dashboard-button">
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                <h2>Welcome, {user?.name}!</h2>
                <div className="user-info">
                    <span className="user-info-label">Name:</span>
                    <span className="user-info-value">{user?.name}</span>
                </div>
                <div className="user-info">
                    <span className="user-info-label">Email:</span>
                    <span className="user-info-value">{user?.email}</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 