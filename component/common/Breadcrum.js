'use client';
import { Breadcrumbs, Typography } from '@mui/material';
import { Box, Link } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrum = ({ pageName }) => {
  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">{pageName}</Typography>
        </Breadcrumbs>
      </Box>
    </>
  );
};

export default Breadcrum;
