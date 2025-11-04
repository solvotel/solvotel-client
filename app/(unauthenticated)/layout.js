import Footer from '@/component/websiteComp/Footer';
import Header from '@/component/websiteComp/Header';
import { Box } from '@mui/material';
import React from 'react';

const Layout = ({ children }) => {
  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Services', href: '/services' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Header menuItems={menuItems} />
        {children}
        <Footer menuItems={menuItems} />
      </Box>
    </>
  );
};

export default Layout;
