'use client';
import { Box, Button, Container, Typography, Grid } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Image from 'next/image';

const Footer = ({ menuItems }) => {
  return (
    <Box sx={{ py: 6, backgroundColor: '#0f172a', color: 'white' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Column 1: Logo and Description */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Image
                src="https://res.cloudinary.com/deyxdpnom/image/upload/v1760010903/logo_f027a1ac91.webp"
                alt="BookingMaster.in"
                width={130}
                height={30}
                priority
              />
            </Box>
            <Typography
              variant="body1"
              sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.6 }}
            >
              Revolutionizing hotel and restaurant management with cutting-edge
              technology solutions that streamline operations and enhance guest
              experiences.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #334155 0%, #475569 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  f
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #334155 0%, #475569 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  in
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #334155 0%, #475569 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  t
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, color: '#f8fafc' }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  href={item.href}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#94a3b8',
                    fontWeight: 500,
                    px: 0,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      color: '#60a5fa',
                      backgroundColor: 'transparent',
                      transform: 'translateX(5px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* Column 3: Contact Details */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, color: '#f8fafc' }}
            >
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Phone */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}
                  >
                    Phone
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#e2e8f0', fontWeight: 600 }}
                  >
                    +1 (555) 123-4567
                  </Typography>
                </Box>
              </Box>

              {/* Email */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#e2e8f0', fontWeight: 600 }}
                  >
                    hello@solvotel.com
                  </Typography>
                </Box>
              </Box>

              {/* Address */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}
                  >
                    Address
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}
                  >
                    123 Business Avenue
                    <br />
                    Suite 100
                    <br />
                    San Francisco, CA 94107
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ borderTop: '1px solid #334155', mt: 6, pt: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              textAlign: 'center',
              fontSize: '0.9rem',
              mb: 1,
            }}
          >
            © 2024 Solvotel. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              textAlign: 'center',
              fontSize: '0.8rem',
            }}
          >
            Design & Developed by{' '}
            <Box
              component="a"
              href="https://nexdev.in"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#60a5fa',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  color: '#3b82f6',
                  textDecoration: 'underline',
                },
                transition: 'color 0.3s ease',
              }}
            >
              NexDev Software Solution
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
