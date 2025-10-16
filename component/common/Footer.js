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
        <Typography>© 2025, Solvotel . All Rights Reserved.</Typography>
      </Box>
    </>
  );
};

export default Footer;
