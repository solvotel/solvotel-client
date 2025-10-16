'use client';
import { Footer, Header } from '@/component/common';
import { Box } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Box sx={{ minHeight: '83vh' }}>{children}</Box>
      <Footer />
    </>
  );
};

export default Layout;
