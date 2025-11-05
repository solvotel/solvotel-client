'use client';
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import Image from 'next/image';

const Header = ({ menuItems }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Modern Navigation */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#1e293b',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Logo with Image */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {/* <Box
              sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                }}
              >
                S
              </Typography>
            </Box> */}
            <Image
              src="https://res.cloudinary.com/deyxdpnom/image/upload/v1762307588/20250413_222452_jdscca.jpg"
              alt="Solvotel"
              width={45}
              height={45}
              priority
              style={{ borderRadius: '5px', marginRight: '10px' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '1.6rem',
                letterSpacing: '-0.5px',
              }}
            >
              Solvotel
            </Typography>
          </Box>
          {/* <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Image
              src="https://res.cloudinary.com/deyxdpnom/image/upload/v1762307445/20251028_021437_ejluvd.png"
              alt="BookingMaster.in"
              width={130}
              height={30}
              priority
            />
          </Box> */}

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Navigation Menu */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.name}
                    href={item.href}
                    sx={{
                      color: '#1e293b',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      position: 'relative',
                      '&:hover': {
                        color: '#2563eb',
                        backgroundColor: 'transparent',
                        '&::after': {
                          width: '100%',
                        },
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -2,
                        left: 0,
                        width: '0%',
                        height: '2px',
                        background:
                          'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        transition: 'width 0.3s ease',
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  href="/login"
                  variant="outlined"
                  sx={{
                    background:
                      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      boxShadow: '0 6px 25px rgba(37, 99, 235, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Login
                </Button>
              </Box>
            </Box>
          ) : (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Enhanced Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="https://res.cloudinary.com/deyxdpnom/image/upload/v1760010903/logo_f027a1ac91.webp"
              alt="BookingMaster.in"
              width={130}
              height={30}
              priority
            />
          </Box>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ px: 2, py: 3 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.name}
              component="a"
              href={item.href}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemText
                primary={item.name}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontWeight: 600,
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Mobile Action Buttons */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            href="/login"
            variant="outlined"
            onClick={handleDrawerToggle}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              fontWeight: 700,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                boxShadow: '0 6px 25px rgba(37, 99, 235, 0.6)',
              },
            }}
          >
            Login
          </Button>
        </Box>
      </Drawer>

      {/* Spacer for fixed header */}
      <Toolbar />
    </>
  );
};

export default Header;
