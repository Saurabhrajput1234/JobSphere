import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Work,
  Business,
  Search,
  TrendingUp,
  People,
  LocationOn,
  AttachMoney,
  Schedule,
} from '@mui/icons-material';

const features = [
  {
    icon: <Search sx={{ fontSize: 40 }} />,
    title: 'Smart Job Search',
    description: 'Find the perfect job with our advanced search and filtering options.',
  },
  {
    icon: <Business sx={{ fontSize: 40 }} />,
    title: 'Company Profiles',
    description: 'Explore company profiles and learn about their culture and values.',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: 'Career Growth',
    description: 'Discover opportunities that match your career goals and aspirations.',
  },
  {
    icon: <People sx={{ fontSize: 40 }} />,
    title: 'Networking',
    description: 'Connect with professionals and expand your professional network.',
  },
];

const stats = [
  { icon: <Work />, value: '10K+', label: 'Active Jobs' },
  { icon: <Business />, value: '500+', label: 'Companies' },
  { icon: <People />, value: '50K+', label: 'Job Seekers' },
  { icon: <LocationOn />, value: '100+', label: 'Locations' },
];

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      width: '100%', 
      overflow: 'hidden',
      '& .MuiContainer-root': {
        maxWidth: '100% !important',
        width: '100%',
        padding: { xs: 2, sm: 3, md: 4 },
      }
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          width: '100%',
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Find Your Dream Job Today
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}
              >
                Connect with top companies and take the next step in your career
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 4 }}
              >
                <Button
                  component={RouterLink}
                  to="/jobs"
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Browse Jobs
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Post a Job
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4,
                  p: 3,
                }}
              >
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Quick Job Search
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/jobs"
                    variant="contained"
                    fullWidth
                    startIcon={<Search />}
                    sx={{
                      py: 1.5,
                      textTransform: 'none',
                      borderRadius: 2,
                    }}
                  >
                    Search Jobs
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth={false} sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8, width: '100%' }}>
        <Container maxWidth={false}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Why Choose JobSphere?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          py: 8,
          width: '100%',
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h2" gutterBottom>
                Ready to Start Your Journey?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of job seekers and companies on JobSphere
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.5,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={RouterLink}
                  to="/jobs"
                  variant="outlined"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Browse Jobs
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 