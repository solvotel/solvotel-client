'use client';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Fab,
  Tooltip,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Image from 'next/image';
import Link from 'next/link';

const socialLinks = [
  {
    name: 'Facebook',
    icon: <FacebookIcon sx={{ fontSize: 20, color: 'white' }} />,
    url: 'https://www.facebook.com/Solvotel',
    hoverColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
  {
    name: 'Instagram',
    icon: <InstagramIcon sx={{ fontSize: 20, color: 'white' }} />,
    url: 'https://www.instagram.com/solvotel',
    hoverColor: 'linear-gradient(135deg, #d946ef 0%, #a21caf 100%)',
  },
  {
    name: 'Twitter/X',
    icon: <XIcon sx={{ fontSize: 20, color: 'white' }} />,
    url: 'https://www.x.com/solvotel',
    hoverColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
  {
    name: 'YouTube',
    icon: <YouTubeIcon sx={{ fontSize: 20, color: 'white' }} />,
    url: 'https://youtube.com/@solvotels?si=ac0DfuU5nUxVhDea',
    hoverColor: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
  },
];

const Footer = ({ menuItems }) => {
  return (
    <>
      <Box sx={{ py: 6, backgroundColor: '#0f172a', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Column 1: Logo and Description */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Image
                  src="https://res.cloudinary.com/deyxdpnom/image/upload/v1760010903/logo_f027a1ac91.webp"
                  alt="BookingMaster.in"
                  width={300}
                  height={85}
                  priority
                />
              </Box>
              <Typography
                variant="body1"
                sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.6 }}
              >
                Revolutionizing hotel and restaurant management with
                cutting-edge technology solutions that streamline operations and
                enhance guest experiences.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {socialLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                  >
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
                          background: item.hoverColor,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Link>
                ))}
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
                      (+91) 8967531369
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
                      solvotel@gmail.com
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
                      sx={{
                        color: '#e2e8f0',
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      Chaulkhola, Ramnagar-ii, Purba Medinipur, 721455
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
              Powered By Solvotel.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Floating WhatsApp Button */}
      <Tooltip title="Chat with us on WhatsApp">
        <Fab
          color="success"
          href="https://wa.me/918967531369"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#25D366',
            '&:hover': {
              backgroundColor: '#1ebe5d',
            },
            zIndex: 1500,
          }}
        >
          <WhatsAppIcon sx={{ color: 'white' }} />
        </Fab>
      </Tooltip>
    </>
  );
};

export default Footer;
