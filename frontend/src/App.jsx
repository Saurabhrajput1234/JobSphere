import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';
import './index.css';

// Layout Components
import Layout from './components/layout/Layout';
import Navbar from './components/layout/Navbar';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Job Components
import JobList from './components/jobs/JobList';
import JobDetails from './components/jobs/JobDetails';
import JobPost from './components/jobs/JobPost';

// Dashboard Components
import UserDashboard from './components/dashboard/UserDashboard';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import CompanyProfile from './components/company/CompanyProfile';

// Resume Component
import ResumeUpload from './components/resumes/ResumeUpload';

// Home Component
import HomePage from './components/home/HomePage';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/companies/:id" element={<CompanyProfile />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute roles={['recruiter']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/post"
                element={
                  <ProtectedRoute roles={['recruiter']}>
                    <JobPost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume/upload"
                element={
                  <ProtectedRoute roles={['job_seeker']}>
                    <ResumeUpload />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
