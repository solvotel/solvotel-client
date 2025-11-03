'use client';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Image from 'next/image';

export default function About() {
  const stats = [
    { number: '500+', label: 'Hotels Partnered' },
    { number: '1M+', label: 'Bookings Processed' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Customer Support' },
  ];

  const team = [
    {
      name: 'Mr. Manas Sahoo',
      role: 'Co-founder & COO',
      avatar:
        'https://res.cloudinary.com/deyxdpnom/image/upload/v1762178538/WhatsApp_Image_2025-11-03_at_18.21.16_0f1fd727_iymbqj.jpg',
    },
    {
      name: 'Mr. Nanda Giri',
      role: 'Co-founder & CEO',
      avatar:
        'https://res.cloudinary.com/deyxdpnom/image/upload/v1762178538/WhatsApp_Image_2025-11-03_at_18.23.00_98c98d0a_jorjhk.jpg',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
            }}
          >
            About Solvotel
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
            We are revolutionizing the hospitality industry with innovative
            technology solutions that empower hotels and restaurants to deliver
            exceptional guest experiences.
          </Typography>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUpIcon
                      sx={{ fontSize: 40, color: '#2563eb', mr: 2 }}
                    />
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: '#1e293b' }}
                    >
                      Our Mission
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      fontSize: '1.1rem',
                      lineHeight: 1.7,
                    }}
                  >
                    To empower hospitality businesses with cutting-edge
                    technology that simplifies operations, enhances guest
                    satisfaction, and drives sustainable growth in an
                    increasingly competitive market.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EmojiEventsIcon
                      sx={{ fontSize: 40, color: '#d97706', mr: 2 }}
                    />
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: '#1e293b' }}
                    >
                      Our Vision
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      fontSize: '1.1rem',
                      lineHeight: 1.7,
                    }}
                  >
                    To become the global standard in hospitality management
                    solutions, creating a connected ecosystem where technology
                    enhances every aspect of the guest journey and business
                    operations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 700, mb: 6, color: '#1e293b' }}
          >
            Our Impact in Numbers
          </Typography>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 12, sm: 3 }} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 800, color: '#2563eb', mb: 1 }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#64748b' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}
          >
            Meet Our Team
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ color: '#64748b', mb: 6 }}
          >
            Passionate professionals dedicated to transforming the hospitality
            industry
          </Typography>

          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Card
                  sx={{
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    textAlign: 'center',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Image
                      src={member.avatar}
                      height={360}
                      width={300}
                      alt={member.name}
                      style={{ borderRadius: '10%' }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}
                    >
                      {member.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {member.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
