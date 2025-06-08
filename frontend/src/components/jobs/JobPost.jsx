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

const JobPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      title: '',
      company: user?.company_name || '',
      location: '',
      type: '',
      experienceLevel: '',
      salary: '',
      description: '',
      requirements: '',
      responsibilities: '',
      benefits: '',
      skills: [],
      applicationDeadline: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Job title is required'),
      company: Yup.string().required('Company name is required'),
      location: Yup.string().required('Location is required'),
      type: Yup.string().required('Job type is required'),
      experienceLevel: Yup.string().required('Experience level is required'),
      salary: Yup.string().required('Salary range is required'),
      description: Yup.string()
        .required('Job description is required')
        .min(100, 'Description should be at least 100 characters'),
      requirements: Yup.string()
        .required('Requirements are required')
        .min(50, 'Requirements should be at least 50 characters'),
      responsibilities: Yup.string()
        .required('Responsibilities are required')
        .min(50, 'Responsibilities should be at least 50 characters'),
      benefits: Yup.string()
        .required('Benefits are required')
        .min(50, 'Benefits should be at least 50 characters'),
      skills: Yup.array()
        .min(1, 'At least one skill is required')
        .required('Skills are required'),
      applicationDeadline: Yup.date()
        .min(new Date(), 'Deadline must be in the future')
        .required('Application deadline is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Failed to post job');
        }

        const data = await response.json();
        navigate(`/jobs/${data.id}`);
      } catch (err) {
        setError(err.message || 'Failed to post job');
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="company"
                  value={formik.values.company}
                  onChange={formik.handleChange}
                  error={formik.touched.company && Boolean(formik.errors.company)}
                  helperText={formik.touched.company && formik.errors.company}
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    label="Job Type"
                  >
                    {jobTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.experienceLevel && Boolean(formik.errors.experienceLevel)}
                >
                  <InputLabel>Experience Level</InputLabel>
                  <Select
                    name="experienceLevel"
                    value={formik.values.experienceLevel}
                    onChange={formik.handleChange}
                    label="Experience Level"
                  >
                    {experienceLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salary Range"
                  name="salary"
                  value={formik.values.salary}
                  onChange={formik.handleChange}
                  error={formik.touched.salary && Boolean(formik.errors.salary)}
                  helperText={formik.touched.salary && formik.errors.salary}
                  placeholder="e.g., $50,000 - $70,000"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  name="applicationDeadline"
                  type="date"
                  value={formik.values.applicationDeadline}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.applicationDeadline &&
                    Boolean(formik.errors.applicationDeadline)
                  }
                  helperText={
                    formik.touched.applicationDeadline && formik.errors.applicationDeadline
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={requiredSkills}
                  value={formik.values.skills}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('skills', newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Required Skills"
                      error={formik.touched.skills && Boolean(formik.errors.skills)}
                      helperText={formik.touched.skills && formik.errors.skills}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  }
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
                  rows={3}
                  label="Requirements"
                  name="requirements"
                  value={formik.values.requirements}
                  onChange={formik.handleChange}
                  error={formik.touched.requirements && Boolean(formik.errors.requirements)}
                  helperText={formik.touched.requirements && formik.errors.requirements}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Responsibilities"
                  name="responsibilities"
                  value={formik.values.responsibilities}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.responsibilities &&
                    Boolean(formik.errors.responsibilities)
                  }
                  helperText={
                    formik.touched.responsibilities && formik.errors.responsibilities
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Benefits"
                  name="benefits"
                  value={formik.values.benefits}
                  onChange={formik.handleChange}
                  error={formik.touched.benefits && Boolean(formik.errors.benefits)}
                  helperText={formik.touched.benefits && formik.errors.benefits}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Post Job'
                  )}
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