'use client';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <>
      <Box
        sx={{
          background: '#1e3a8a',
          color: '#fff',
          textAlign: 'center',
          py: 2,
        }}
      >
        <Typography>@ Solvotel</Typography>
      </Box>
    </>
  );
};

export default Footer;
