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
      subtitle: 'Mon-Fri from 9am to 6pm',
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
      details: 'Chaulkhola, Ramnagar-ii, ',
      subtitle: 'Purba Medinipur, 721455',
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
            Get In Touch
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
            Ready to transform your hospitality business? Contact us today for a
            personalized demo and discover how Solvotel can help you achieve
            your goals.
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
                Let&apos;s Start a Conversation
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#64748b', mb: 4, lineHeight: 1.7 }}
              >
                Whether you&apos;re looking for a demo, have questions about our
                services, or need technical support, our team is here to help
                you succeed.
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
