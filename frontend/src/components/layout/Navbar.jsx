import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Work,
  Business,
  Person,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [registerAnchorEl, setRegisterAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRegisterMenu = (event) => {
    setRegisterAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRegisterClose = () => {
    setRegisterAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleRegister = (type) => {
    handleRegisterClose();
    navigate('/register', { state: { type } });
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'background.paper' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Work sx={{ fontSize: 28 }} />
          JobSphere
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/jobs"
            color="inherit"
            sx={{ color: 'text.primary' }}
          >
            Browse Jobs
          </Button>

          {user ? (
            <>
              {user.role === 'job_seeker' && (
                <>
                  <Button
                    component={RouterLink}
                    to="/resume/upload"
                    color="inherit"
                    sx={{ color: 'text.primary' }}
                  >
                    Upload Resume
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    color="inherit"
                    sx={{ color: 'text.primary' }}
                  >
                    My Applications
                  </Button>
                </>
              )}

              {user.role === 'recruiter' && (
                <>
                  <Button
                    component={RouterLink}
                    to="/jobs/post"
                    color="inherit"
                    sx={{ color: 'text.primary' }}
                  >
                    Post a Job
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/company/dashboard"
                    color="inherit"
                    sx={{ color: 'text.primary' }}
                  >
                    Dashboard
                  </Button>
                </>
              )}

              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{ color: 'text.primary' }}
              >
                {user.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                >
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={handleRegisterMenu}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Register
              </Button>
              <Menu
                anchorEl={registerAnchorEl}
                open={Boolean(registerAnchorEl)}
                onClose={handleRegisterClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                  },
                }}
              >
                <MenuItem onClick={() => handleRegister('user')}>
                  <Person sx={{ mr: 1 }} />
                  Register as Job Seeker
                </MenuItem>
                <MenuItem onClick={() => handleRegister('company')}>
                  <Business sx={{ mr: 1 }} />
                  Register as Company
                </MenuItem>
              </Menu>

              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 