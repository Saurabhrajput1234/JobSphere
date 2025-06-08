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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [jobsRes, applicationsRes] = await Promise.all([
        fetch('/api/jobs/company', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/applications/company', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      const jobsData = await jobsRes.json();
      const applicationsData = await applicationsRes.json();

      if (jobsRes.ok) {
        setJobs(jobsData);
      }
      if (applicationsRes.ok) {
        setApplications(applicationsData);
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

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchCompanyData();
      }
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  if (!user || user.role !== 'recruiter') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. This page is for recruiters only.
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
        Company Dashboard
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
          <Tab label="Posted Jobs" />
          <Tab label="Applications" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {jobs.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                You haven't posted any jobs yet. Click the button below to post your first job!
              </Alert>
            </Grid>
          ) : (
            jobs.map((job) => (
              <Grid item xs={12} key={job.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" component="h2">
                          {job.title}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={job.type}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={job.location}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={`${job.applications_count} Applications`}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          sx={{ mr: 1 }}
                        >
                          View Job
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/jobs/${job.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/jobs/post')}
              sx={{ mt: 2 }}
            >
              Post New Job
            </Button>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Alert severity="info">
                      No applications received yet.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {application.user.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {application.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{application.job.title}</TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.status}
                        color={
                          application.status === 'accepted'
                            ? 'success'
                            : application.status === 'rejected'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => navigate(`/applications/${application.id}`)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleApplicationStatus(application.id, 'accepted')}
                            sx={{ mr: 1 }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleApplicationStatus(application.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default CompanyDashboard; 