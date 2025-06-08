import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [application, setApplication] = useState({
    resume_id: '',
    cover_letter: '',
  });
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    if (user?.role === 'job_seeker') {
      fetchResumes();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error loading job details');
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await axios.get('/api/resumes');
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOpenDialog(true);
  };

  const handleSubmitApplication = async () => {
    try {
      await axios.post('/api/applications', {
        job_id: id,
        ...application,
      });
      setOpenDialog(false);
      navigate('/applications');
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Error submitting application');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {job.company_name}
        </Typography>
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" paragraph>
            {job.location} • {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
          </Typography>
          <Typography variant="body1" paragraph>
            Salary: {job.salary_range}
          </Typography>
          <Typography variant="body1" paragraph>
            Posted: {new Date(job.created_at).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" paragraph>
            Application Deadline: {new Date(job.application_deadline).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {job.description}
          </Typography>
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Requirements
          </Typography>
          <Typography variant="body1" paragraph>
            {job.requirements}
          </Typography>
        </Box>

        {user?.role === 'job_seeker' && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleApply}
              disabled={job.status !== 'active'}
            >
              Apply Now
            </Button>
          </Box>
        )}

        {user?.role === 'recruiter' && user.id === job.recruiter_id && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/jobs/${id}/edit`)}
            >
              Edit Job
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Resume"
              value={application.resume_id}
              onChange={(e) => setApplication({ ...application, resume_id: e.target.value })}
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
              value={application.cover_letter}
              onChange={(e) => setApplication({ ...application, cover_letter: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitApplication}
            variant="contained"
            disabled={!application.resume_id}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetail; 