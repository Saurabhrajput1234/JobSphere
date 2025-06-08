import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchCompanyDetails();
    if (user) {
      checkFollowStatus();
    }
  }, [id, user]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${id}`);
      const data = await response.json();

      if (response.ok) {
        setCompany(data.company);
        setJobs(data.jobs);
      } else {
        setError(data.message || 'Failed to fetch company details');
      }
    } catch (err) {
      setError('An error occurred while fetching company details');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/companies/${id}/follow-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setFollowLoading(true);
      const response = await fetch(`/api/companies/${id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
    } finally {
      setFollowLoading(false);
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

  if (!company) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {company.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {company.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label={`${jobs.length} Jobs Posted`} sx={{ mr: 1 }} />
              <Chip label={`${company.location}`} sx={{ mr: 1 }} />
              <Chip label={`${company.industry}`} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            {user && user.role === 'job_seeker' && (
              <IconButton
                onClick={handleFollowToggle}
                disabled={followLoading}
                color="primary"
                size="large"
              >
                {isFollowing ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Posted Jobs
      </Typography>

      <Grid container spacing={3}>
        {jobs.map((job) => (
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
                        label={job.category}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={job.location}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CompanyProfile; 