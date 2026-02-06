'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import {
  Assessment,
  AssessmentOutlined,
  Dashboard,
  Inventory,
  Logout,
  Receipt,
} from '@mui/icons-material';
import { LogOut } from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    icon: <Dashboard size={18} />,
    href: '/pos-outlet/dashboard',
  },
  {
    label: 'Invoices',
    icon: <Receipt size={18} />,
    href: '/pos-outlet/invoices',
  },
  {
    label: 'Item Master',
    icon: <Inventory size={18} />,
    href: '/pos-outlet/item-master',
  },

  {
    label: 'Invoice Report',
    icon: <Receipt size={18} />,
    href: '/pos-outlet/invoice-report',
  },
  {
    label: 'Collection Report',
    icon: <AssessmentOutlined size={18} />,
    href: '/pos-outlet/collection-report',
  },
];

const PosOutletNav = ({ auth, logout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => setDrawerOpen(open);
  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: '#1e3a8a',
          boxShadow: 3,
          zIndex: 1200,
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/dashboard" passHref>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <Image
                src="https://res.cloudinary.com/deyxdpnom/image/upload/v1760010903/logo_f027a1ac91.webp"
                alt="BookingMaster.in"
                width={130}
                height={30}
                priority
              />
            </Box>
          </Link>

          {/* Desktop Menu */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            {menuItems.map((item, idx) => (
              <Button
                key={idx}
                component={Link}
                href={item.href}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
            {/* Logout */}
            <Button
              onClick={logout}
              sx={{
                bgcolor: 'red',
                '&:hover': { bgcolor: 'darkred' },
                color: '#fff',
                borderRadius: 2,
                px: 2,
              }}
              startIcon={<LogOut size={18} />}
            >
              Logout
            </Button>
          </Box>
          {/* Mobile Hamburger */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton onClick={toggleDrawer(true)} color="inherit">
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 280 }} role="presentation">
          <List>
            {menuItems.map((item, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={toggleDrawer(false)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Logout Button */}
          <Box sx={{ mt: 1, borderTop: '1px solid #eee', pt: 1 }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                >
                  <ListItemIcon>
                    <Logout size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default PosOutletNav;

/* 🔹 Reusable dropdown component */
function DropdownMenu({ items }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        bgcolor: 'white',
        color: 'black',
        borderRadius: 1,
        boxShadow: 3,
        minWidth: 200,
        zIndex: 2000,
      }}
    >
      {items.map((item, idx) => (
        <Link key={idx} href={item.href} className="my-link">
          <Box
            sx={{
              fontSize: '15px',
              lineHeight: '1em',
              p: 1.2,
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                bgcolor: '#f0f0f0',
                color: 'primary.main',
                borderRadius: 1,
              },
            }}
          >
            {item.icon}
            <span style={{ marginLeft: 8 }}>{item.label}</span>
          </Box>
        </Link>
      ))}
    </Box>
  );
}
