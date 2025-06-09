import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../../utils/axios';

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary',
  'Remote',
];

const experienceLevels = [
  'Entry Level',
  'Junior',
  'Mid Level',
  'Senior',
  'Lead',
  'Manager',
];

const requiredSkills = [
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'Machine Learning',
  'Data Science',
  'DevOps',
  'UI/UX Design',
  'Project Management',
  'Agile',
];

const validationSchema = Yup.object({
  title: Yup.string().required('Job title is required'),
  description: Yup.string().required('Job description is required'),
  requirements: Yup.string().required('Job requirements are required'),
  location: Yup.string().required('Job location is required'),
  type: Yup.string().required('Job type is required'),
  salary_range: Yup.string().required('Salary range is required'),
  category: Yup.string().required('Job category is required'),
  application_deadline: Yup.date()
    .min(new Date(), 'Deadline must be in the future')
    .required('Application deadline is required'),
});

const JobPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      requirements: '',
      location: '',
      type: '',
      salary_range: '',
      category: '',
      application_deadline: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.post('/jobs', values);
        navigate(`/jobs/${response.data.id}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to post job');
      } finally {
        setLoading(false);
      }
    },
  });

  if (!user || user.role !== 'recruiter') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Only recruiters can post jobs. Please log in with a recruiter account.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            Post a New Job
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Job Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Requirements"
                  name="requirements"
                  value={formik.values.requirements}
                  onChange={formik.handleChange}
                  error={formik.touched.requirements && Boolean(formik.errors.requirements)}
                  helperText={formik.touched.requirements && formik.errors.requirements}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Job Type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                >
                  <MenuItem value="full-time">Full Time</MenuItem>
                  <MenuItem value="part-time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary Range"
                  name="salary_range"
                  value={formik.values.salary_range}
                  onChange={formik.handleChange}
                  error={formik.touched.salary_range && Boolean(formik.errors.salary_range)}
                  helperText={formik.touched.salary_range && formik.errors.salary_range}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Application Deadline"
                  name="application_deadline"
                  value={formik.values.application_deadline}
                  onChange={formik.handleChange}
                  error={formik.touched.application_deadline && Boolean(formik.errors.application_deadline)}
                  helperText={formik.touched.application_deadline && formik.errors.application_deadline}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default JobPost; 