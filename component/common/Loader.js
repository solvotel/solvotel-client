'use client';
import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

const Loader = () => {
  return (
    <Backdrop
      open
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: '#fff',
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
    >
      <Box
        sx={{
          bgcolor: '#607D8B',
          borderRadius: '50%',
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 6,
        }}
      >
        <div className="loader"></div>
        <Typography variant="body1" sx={{ mt: 2, color: 'white' }}>
          Loading
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default Loader;
