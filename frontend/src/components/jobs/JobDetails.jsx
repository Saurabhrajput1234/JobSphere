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
import axios from '../../utils/axios';

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
    resume_id: '',
  });
  const [resumes, setResumes] = useState([]);
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    fetchJobDetails();
    if (user?.role === 'job_seeker') {
      fetchResumes();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await axios.get('/resumes');
      setResumes(response.data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
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

      const response = await axios.post('/applications', {
        job_id: id,
        ...applicationData,
      });

      setApplyDialogOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setApplicationError(err.response?.data?.message || 'Failed to submit application');
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

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {job.description}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Typography variant="body1" paragraph>
              {job.requirements}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Salary Range
                </Typography>
                <Typography variant="body1">{job.salary_range}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Application Deadline
                </Typography>
                <Typography variant="body1">
                  {new Date(job.application_deadline).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {user?.role === 'job_seeker' && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleApplyClick}
                fullWidth
              >
                Apply Now
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          {applicationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {applicationError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Resume"
              value={applicationData.resume_id}
              onChange={(e) => setApplicationData({ ...applicationData, resume_id: e.target.value })}
              sx={{ mb: 2 }}
            >
              {resumes.map((resume) => (
                <MenuItem key={resume.id} value={resume.id}>
                  {resume.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Cover Letter"
              value={applicationData.cover_letter}
              onChange={(e) => setApplicationData({ ...applicationData, cover_letter: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApplicationSubmit}
            variant="contained"
            color="primary"
            disabled={applying || !applicationData.resume_id}
          >
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails; 