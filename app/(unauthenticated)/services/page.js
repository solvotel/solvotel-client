'use client';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import InventoryIcon from '@mui/icons-material/Inventory';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';

export default function Services() {
  const services = [
    {
      icon: <HotelIcon sx={{ fontSize: 48, color: '#2563eb' }} />,
      title: 'Room Management & Booking',
      features: [
        'Room inventory management',
        'Online room booking system',
        'Real-time availability tracking',
        'Room assignment automation',
        'Check-in/check-out management',
        'Room rate management',
        'Occupancy forecasting',
      ],
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 48, color: '#059669' }} />,
      title: 'Restaurant Operations',
      features: [
        'Table management system',
        'Online table reservations',
        'Order management system',
        'Menu engineering tools',
        'Kitchen display system',
        'Waitlist management',
        'Table turnover optimization',
      ],
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 48, color: '#d97706' }} />,
      title: 'Inventory & Stock Management',
      features: [
        'Real-time inventory tracking',
        'Stock level monitoring',
        'Supplier management',
        'Purchase order automation',
        'Waste reduction analytics',
        'Inventory forecasting',
        'Cost control tools',
      ],
    },
    {
      icon: <CleaningServicesIcon sx={{ fontSize: 48, color: '#dc2626' }} />,
      title: 'Housekeeping & Maintenance',
      features: [
        'Housekeeping task management',
        'Room status tracking',
        'Maintenance request system',
        'Cleaning schedule automation',
        'Quality control checks',
        'Staff performance tracking',
        'Preventive maintenance',
      ],
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 48, color: '#7c3aed' }} />,
      title: 'Billing & Payment Processing',
      features: [
        'Unified billing system',
        'Invoice generation',
        'Payment processing',
        'Tax calculation automation',
        'Receipt management',
        'Payment gateway integration',
        'Financial reporting',
      ],
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: '#0891b2' }} />,
      title: 'Business Intelligence & Analytics',
      features: [
        'Performance dashboards',
        'Revenue management',
        'Guest behavior analytics',
        'Competitive analysis',
        'Forecasting tools',
        'KPI monitoring',
        'Custom reporting',
      ],
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 48, color: '#db2777' }} />,
      title: 'Guest Experience Management',
      features: [
        'Guest communication platform',
        'Review management system',
        'Loyalty programs',
        'Personalized services',
        'Feedback collection',
        'Guest preference tracking',
        'Complaint resolution',
      ],
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: '#ea580c' }} />,
      title: 'User & Access Management',
      features: [
        'Role-based access control',
        'Staff profile management',
        'Permission settings',
        'Multi-level user hierarchy',
        'Audit trail logging',
        'Security compliance',
        'Data privacy controls',
      ],
    },
    {
      icon: <TableRestaurantIcon sx={{ fontSize: 48, color: '#65a30d' }} />,
      title: 'Table & Reservation Management',
      features: [
        'Smart table allocation',
        'Reservation calendar',
        'Walk-in management',
        'Table merging/splitting',
        'Reservation reminders',
        'No-show tracking',
        'Table turn-time optimization',
      ],
    },
    {
      icon: <ReceiptIcon sx={{ fontSize: 48, color: '#0d9488' }} />,
      title: 'Invoice & Accounting',
      features: [
        'Automated invoice generation',
        'Expense tracking',
        'Accounts receivable',
        'Financial statements',
        'Tax compliance tools',
        'Multi-currency support',
        'Integration with accounting software',
      ],
    },
    {
      icon: <PointOfSaleIcon sx={{ fontSize: 48, color: '#c2410c' }} />,
      title: 'Point of Sale (POS)',
      features: [
        'Unified POS system',
        'Order processing',
        'Payment collection',
        'Sales reporting',
        'Inventory sync',
        'Customer database',
        'Multi-location support',
      ],
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 48, color: '#4338ca' }} />,
      title: 'Staff Management',
      features: [
        'Employee scheduling',
        'Time and attendance',
        'Performance tracking',
        'Training management',
        'Payroll integration',
        'Task assignment',
        'Communication tools',
      ],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Comprehensive Hospitality Solutions
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              color: '#64748b',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            End-to-end management solutions covering every aspect of your hotel
            and restaurant operations. From room bookings to inventory control,
            we&apos;ve got you covered.
          </Typography>
        </Container>
      </Box>

      {/* Services Grid */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      {service.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      align="center"
                      sx={{
                        fontWeight: 700,
                        mb: 3,
                        color: '#1e293b',
                        minHeight: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {service.title}
                    </Typography>

                    <List sx={{ mb: 3, flex: 1 }}>
                      {service.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 35 }}>
                            <CheckCircleIcon
                              sx={{ color: '#059669', fontSize: 20 }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            sx={{
                              '& .MuiListItemText-primary': {
                                color: '#64748b',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: '#2563eb',
                          color: '#2563eb',
                          px: 3,
                          '&:hover': {
                            backgroundColor: '#2563eb',
                            color: 'white',
                            borderColor: '#2563eb',
                          },
                        }}
                      >
                        Learn More
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing CTA Section */}
      <Box sx={{ py: 8, backgroundColor: '#1e293b' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Ready to Get Started?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, color: '#cbd5e1', maxWidth: 600, mx: 'auto' }}
            >
              Contact us for customized pricing tailored to your business needs.
              We offer flexible plans for businesses of all sizes.
            </Typography>
            <Button
              href="/contact"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#059669',
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#047857',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Contact Us for Pricing
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
