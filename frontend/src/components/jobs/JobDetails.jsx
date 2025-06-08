import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
  });
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${id}`);
      const data = await response.json();

      if (response.ok) {
        setJob(data);
      } else {
        setError(data.message || 'Failed to fetch job details');
      }
    } catch (err) {
      setError('An error occurred while fetching job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      // Store the current job ID in sessionStorage for redirect after login
      sessionStorage.setItem('pendingJobApplication', id);
      navigate('/login');
      return;
    }
    setApplyDialogOpen(true);
  };

  const handleApplicationSubmit = async () => {
    try {
      setApplying(true);
      setApplicationError('');

      const response = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (response.ok) {
        setApplyDialogOpen(false);
        navigate('/applications');
      } else {
        setApplicationError(data.message || 'Failed to submit application');
      }
    } catch (err) {
      setApplicationError('An error occurred while submitting your application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {job.company_name}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label={job.type} sx={{ mr: 1 }} />
              <Chip label={job.category} sx={{ mr: 1 }} />
              <Chip label={job.location} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body1" paragraph>
              {job.description}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Typography variant="body1" paragraph>
              {job.requirements}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Benefits
            </Typography>
            <Typography variant="body1" paragraph>
              {job.benefits}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Salary Range
                </Typography>
                <Typography variant="body1">
                  {job.salary_range}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Posted Date
                </Typography>
                <Typography variant="body1">
                  {new Date(job.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Application Deadline
                </Typography>
                <Typography variant="body1">
                  {new Date(job.deadline).toLocaleDateString()}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleApplyClick}
                disabled={user?.role === 'recruiter'}
              >
                {user?.role === 'recruiter' 
                  ? 'Recruiters Cannot Apply' 
                  : user 
                    ? 'Apply Now' 
                    : 'Login to Apply'}
              </Button>
              {!user && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Don't have an account?{' '}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => {
                        sessionStorage.setItem('pendingJobApplication', id);
                        navigate('/register');
                      }}
                    >
                      Sign up here
                    </Link>
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          {applicationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {applicationError}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Cover Letter"
            value={applicationData.cover_letter}
            onChange={(e) => setApplicationData({ ...applicationData, cover_letter: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApplicationSubmit}
            variant="contained"
            disabled={applying || !applicationData.cover_letter}
          >
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails; 