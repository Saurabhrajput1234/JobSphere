import React from 'react';
import { Box, Container } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        pt: 8, // Add padding top to account for the fixed navbar
        pb: 4,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
};

export default Layout; 