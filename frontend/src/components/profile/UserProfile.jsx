import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import ResumeUpload from '../resumes/ResumeUpload';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resumes, setResumes] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    company_description: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        company_name: user.company_name || '',
        company_description: user.company_description || '',
      });
      if (user.role === 'job_seeker') {
        fetchResumes();
      }
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const response = await axios.get('/resumes');
      setResumes(response.data);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/user/profile', formData);
      setUser(response.data.data.user);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      await axios.delete(`/resumes/${resumeId}`);
      fetchResumes();
      setSuccess('Resume deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  const handleDownloadResume = async (resumeId) => {
    try {
      const response = await axios.get(`/resumes/${resumeId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download resume');
    }
  };

  const handleSetDefault = async (resumeId) => {
    try {
      await axios.patch(`/resumes/${resumeId}`, { is_default: true });
      fetchResumes();
      setSuccess('Default resume updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update default resume');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Please log in to view your profile</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>

            {user.role === 'recruiter' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Description"
                    name="company_description"
                    value={formData.company_description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {user.role === 'job_seeker' && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">My Resumes</Typography>
              <Button
                variant="contained"
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload New Resume
              </Button>
            </Box>

            <List>
              {resumes.map((resume) => (
                <ListItem
                  key={resume.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={resume.title}
                    secondary={`Uploaded on ${new Date(resume.uploaded_at).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleSetDefault(resume.id)}
                      color={resume.is_default ? 'primary' : 'default'}
                    >
                      {resume.is_default ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDownloadResume(resume.id)}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteResume(resume.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload New Resume</DialogTitle>
        <DialogContent>
          <ResumeUpload onSuccess={() => {
            setUploadDialogOpen(false);
            fetchResumes();
          }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile; 