import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PrivateRoute.css';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="private-route-loading">
                <div className="private-route-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute; 