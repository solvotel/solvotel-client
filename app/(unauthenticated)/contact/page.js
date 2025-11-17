'use client';
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function Contact() {
  const contactInfo = [
    {
      icon: <PhoneIcon sx={{ fontSize: 32, color: '#2563eb' }} />,
      title: 'Phone',
      details: '(+91) 8967531369',
      subtitle: '24/7 Available',
    },
    {
      icon: <EmailIcon sx={{ fontSize: 32, color: '#059669' }} />,
      title: 'Email',
      details: 'solvotel@gmail.com',
      subtitle: 'We reply within 24 hours',
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 32, color: '#d97706' }} />,
      title: 'Office',
      details: 'Chaulkhola, Digha-Mandermani Road',
      subtitle: 'East Medinipur, WB-721455',
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 32, color: '#dc2626' }} />,
      title: 'Support Hours',
      details: '24/7 Technical Support',
      subtitle: 'Dedicated support team',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3730a3 0%, #1e1b4b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
            }}
          >
            PMS Providers Near Me
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              color: '#64748b',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Looking for PMS providers near you? Solvotel is available nationwide
            — with cloud access, you can manage your property from anywhere in
            India.
          </Typography>
        </Container>
      </Box>

      {/* Contact Form & Info */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Contact Information */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}
              >
                🚀 Get Started Today
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#64748b', mb: 4, lineHeight: 1.7 }}
              >
                Experience the power of Solvotel — the best property management
                software for small hotels and large enterprises alike. <br />
                👉 Request your free hotel PMS demo today and transform the way
                you manage your property.
              </Typography>

              <Grid container spacing={3}>
                {contactInfo.map((info, index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Card
                      sx={{
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                        >
                          <Box sx={{ mr: 2 }}>{info.icon}</Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: '#1e293b' }}
                            >
                              {info.title}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: '#2563eb' }}
                            >
                              {info.details}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: '#64748b', mt: 0.5 }}
                            >
                              {info.subtitle}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Contact Form */}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
