import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, companiesRes] = await Promise.all([
        fetch('/api/applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/companies/followed', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      const applicationsData = await applicationsRes.json();
      const companiesData = await companiesRes.json();

      if (applicationsRes.ok) {
        setApplications(applicationsData);
      }
      if (companiesRes.ok) {
        setFollowedCompanies(companiesData);
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Please log in to view your dashboard
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Applications" />
          <Tab label="Followed Companies" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {applications.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                You haven't applied to any jobs yet. Browse jobs to start applying!
              </Alert>
            </Grid>
          ) : (
            applications.map((application) => (
              <Grid item xs={12} key={application.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" component="h2">
                          {application.job.title}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {application.job.company_name}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={application.status}
                            color={
                              application.status === 'accepted'
                                ? 'success'
                                : application.status === 'rejected'
                                ? 'error'
                                : 'default'
                            }
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={application.job.type}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={application.job.location}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/jobs/${application.job.id}`)}
                        >
                          View Job
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {followedCompanies.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                You haven't followed any companies yet. Browse companies to start following!
              </Alert>
            </Grid>
          ) : (
            followedCompanies.map((company) => (
              <Grid item xs={12} md={6} key={company.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2">
                      {company.name}
                    </Typography>
                    <Typography color="textSecondary" paragraph>
                      {company.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`${company.jobs_count} Jobs`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={company.location}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={company.industry}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/companies/${company.id}`)}
                      >
                        View Company
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default UserDashboard; 