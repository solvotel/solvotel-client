'use client';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

import RestaurantIcon from '@mui/icons-material/Restaurant';
import HotelIcon from '@mui/icons-material/Hotel';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import Footer from '@/component/websiteComp/Footer';
import Header from '@/component/websiteComp/Header';

export default function Home() {
  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Services', href: '/services' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const features = [
    {
      icon: <HotelIcon sx={{ fontSize: 40, color: '#2563eb' }} />,
      title: 'Hotel Management',
      description:
        'Complete suite for room bookings, guest management, and housekeeping.',
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 40, color: '#059669' }} />,
      title: 'Restaurant Management',
      description:
        'Table reservations, menu management, and order processing system.',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#d97706' }} />,
      title: 'Analytics Dashboard',
      description:
        'Real-time insights and performance metrics for your business.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#dc2626' }} />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee.',
    },
  ];

  const services = [
    {
      icon: <HotelIcon sx={{ fontSize: 32, color: '#2563eb' }} />,
      title: 'Room Management',
      description: 'Booking, housekeeping, and room status tracking',
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 32, color: '#059669' }} />,
      title: 'Restaurant Operations',
      description: 'Table reservations, orders, and menu management',
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 32, color: '#d97706' }} />,
      title: 'Inventory Control',
      description: 'Real-time stock tracking and supplier management',
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 32, color: '#7c3aed' }} />,
      title: 'Billing & Payments',
      description: 'Invoicing, payment processing, and financial reports',
    },
    {
      icon: <CleaningServicesIcon sx={{ fontSize: 32, color: '#dc2626' }} />,
      title: 'Housekeeping',
      description: 'Maintenance scheduling and quality control',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32, color: '#0891b2' }} />,
      title: 'Guest Experience',
      description: 'Loyalty programs and personalized services',
    },
  ];

  const clients = [
    { name: 'Grand Plaza Hotel', logo: 'GPH' },
    { name: 'Urban Bistro', logo: 'UB' },
    { name: 'Seaside Resort', logo: 'SR' },
    { name: 'Metro Restaurants', logo: 'MR' },
    { name: 'Luxury Stays', logo: 'LS' },
    { name: 'Food Court Chain', logo: 'FCC' },
  ];

  return (
    <>
      <Header menuItems={menuItems} />

      {/* Hero Section */}
      <Box
        sx={{
          pt: 12,
          pb: 8,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '2.5rem' },
                  background:
                    'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 3,
                }}
              >
                Solvotel – India’s No.1 Hotel Management Software
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: '#64748b', mb: 4, fontSize: '1.2rem' }}
              >
                Welcome to Solvotel, the best hotel management software trusted
                by hotels, resorts, hostels, and boutique properties across
                India. Designed to simplify every aspect of hotel operations,
                Solvotel is a powerful cloud-based hotel PMS (Property
                Management System) that helps you manage reservations, front
                desk, housekeeping, billing, and more — all in one place.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  href="/contact"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: '#2563eb',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#1d4ed8' },
                  }}
                >
                  Get Started
                </Button>
                {/* <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      backgroundColor: '#f0f9ff',
                    },
                  }}
                >
                  View Demo
                </Button> */}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  borderRadius: 4,
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden', // ensures image fits neatly within rounded corners
                }}
              >
                <Box
                  component="img"
                  src="https://res.cloudinary.com/deyxdpnom/image/upload/v1763418043/banner-1_s2tjtr.png"
                  alt="App Dashboard Preview"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // keeps aspect ratio and fills the box
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Us Section */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: '#1e293b',
            }}
          >
            All-in-One Cloud Hotel Management System
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 3,

              lineHeight: 1.7,
            }}
          >
            Solvotel is more than just a property management system (PMS) —
            it&apos;s a complete hospitality management software built to
            streamline your hotel operations. Whether you manage a small B&amp;B
            or a large resort, our all-in-one hotel management system includes:
          </Typography>
          <Grid container spacing={2}>
            {[
              'Hotel Booking Management System – Manage room inventory, bookings, and cancellations in real time.',
              'Hotel Reservation System Software – Simplify reservations with our integrated online booking engine.',
              'Hotel Front Desk Software – Handle guest check-ins, check-outs, and room assignments effortlessly.',
              'Hotel Housekeeping Software – Assign tasks, track room status, and maintain cleanliness standards efficiently.',
              'Hotel Billing and Invoicing Sotiware – Generate accurate bills, manage taxes, and automate invoicing.',
              'Hotel Channel Manager Integration – Sync your hotel with leading OTAs and prevent double bookings.',
              'Hotel Software with Mobile App – Access your PMS from anywhere, anytime, with Solvotel’s mobile-friendly app.',
              'Contactless Check-in Software – Offer a seamless guest experience with digital check-in and check-out options.',
              'Hotel Analytics and Reporting Tools – Get insights into revenue, occupancy, and guest behavior to make data-driven decisions.',
              'Accounting/Financial Integration – Provides the necessary data  such as daily audit reports, transaction summaries, tax details etc.',
            ].map((text, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Box
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 3,
                    p: 2.5,
                    height: '100%',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      borderColor: '#2563eb',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#1e293b',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="outlined"
            href="/about-us"
            sx={{
              mt: 4,
              borderColor: '#2563eb',
              color: '#2563eb',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                borderColor: '#1d4ed8',
                backgroundColor: '#f0f9ff',
              },
            }}
          >
            View More
          </Button>
        </Container>
      </Box>

      {/* Services Summary Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#1e293b',
            }}
          >
            Why Choose Solvotel&apos;s Cloud-Based Hotel PMS?
          </Typography>
          <Typography
            align="center"
            sx={{
              color: '#64748b',
              mb: 6,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Our cloud hotel management software gives hoteliers the freedom to
            operate from any device, anywhere. Unlike tradional on-premise
            systems, Solvotel ensures data security, real-time updates, and zero
            maintenance.
          </Typography>

          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>{service.icon}</Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}
                    >
                      {service.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              href="/services"
              sx={{
                backgroundColor: '#2563eb',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { backgroundColor: '#1d4ed8' },
              }}
            >
              View All Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Our Clients Section */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#1e293b',
            }}
          >
            Trusted By Industry Leaders
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#64748b',
              mb: 6,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join hundreds of hotels and restaurants that trust Solvotel
          </Typography>

          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center"
          >
            {clients.map((client, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                <Box
                  sx={{
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      borderColor: '#2563eb',
                    },
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        background:
                          'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 1,
                      }}
                    >
                      {client.logo}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    >
                      {client.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#1e293b',
            }}
          >
            Why Choose Solvotel?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#64748b',
              mb: 6,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Comprehensive features designed specifically for the hospitality
            industry
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, backgroundColor: '#1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Ready to Transform Your Business?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, color: '#cbd5e1', maxWidth: 600, mx: 'auto' }}
            >
              Join hundreds of hotels and restaurants already using Solvotel to
              streamline their operations.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#059669',
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#047857' },
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer menuItems={menuItems} />
    </>
  );
}
