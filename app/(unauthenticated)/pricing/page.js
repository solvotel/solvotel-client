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
  Chip,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WebIcon from '@mui/icons-material/Web';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AnalyticsIcon from '@mui/icons-material/Analytics';

export default function Pricing() {
  const plans = [
    {
      name: 'European Plan (EP)',
      description: 'Perfect for small hotels & B&Bs',
      //   originalPrice: '₹8,999',
      discountedPrice: '₹1,799',
      //   savings: '₹2000',
      //   popular: false,
      features: [
        'Up to 20 rooms management',
        'Basic booking engine',
        'Front desk operations',
        'Housekeeping module',
        'Basic reporting',
        'Email support',
        '1 property',
        'Mobile app access',
      ],
      //   cta: 'Get Started',
    },
    {
      name: 'Continental Plan (CP)',
      description: 'Ideal for growing hotels',
      //   originalPrice: '₹15,999',
      discountedPrice: '₹2299',
      //   savings: '₹3,000',
      //   popular: true,
      features: [
        'Up to 50 rooms management',
        'Advanced booking engine',
        'Channel manager integration',
        'Restaurant POS',
        'Inventory management',
        'Advanced analytics',
        '3 properties',
        'Priority support',
        'API access',
      ],
      cta: 'Start Free Trial',
    },
    {
      name: 'Modified American Plan (MAP)',
      description: 'For large hotel chains & resorts',
      //   originalPrice: '₹28,999',
      discountedPrice: '₹2699',
      //   savings: '₹7,000',
      //   popular: false,
      features: [
        'Unlimited rooms',
        'Multi-property management',
        'Revenue management system',
        'Full restaurant suite',
        'Custom integrations',
        'Dedicated account manager',
        'Unlimited properties',
        '24/7 phone support',
        'White-label solutions',
      ],
      //   cta: 'Contact Sales',
    },
    {
      name: 'American Plan (AP)',
      description: 'Complete hospitality ecosystem',
      //   originalPrice: '₹45,999',
      discountedPrice: '₹3499',
      //   savings: '₹13,000',
      //   popular: false,
      features: [
        'Everything in Enterprise',
        'AI-powered revenue optimization',
        'Custom mobile app development',
        'Advanced business intelligence',
        'On-premise deployment option',
        'SLA guarantee',
        'Training & implementation',
        'Custom feature development',
      ],
      //   cta: 'Book Demo',
    },
  ];

  const addonServices = [
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#059669' }} />,
      title: 'Revenue Management',
      description:
        "We'll take your business 45%-50% higher in growth within months",
      originalPrice: '₹24,000',
      discountedPrice: '₹21,500',
      features: [
        'Dynamic pricing optimization',
        'Competitor rate analysis',
        'Demand forecasting',
        'Revenue analytics dashboard',
        'Weekly performance reports',
      ],
    },
    {
      icon: <WebIcon sx={{ fontSize: 40, color: '#2563eb' }} />,
      title: 'Website Development',
      description: 'Custom hotel website with integrated booking engine',
      originalPrice: '₹35,000',
      discountedPrice: '₹25,000',
      features: [
        'Responsive design',
        'Booking engine integration',
        'SEO optimization',
        'Mobile-friendly',
        'Content management system',
      ],
    },
    {
      icon: <HotelIcon sx={{ fontSize: 40, color: '#d97706' }} />,
      title: 'Booking Engine',
      description: 'Direct booking system to reduce OTA commissions',
      originalPrice: '₹15,000',
      discountedPrice: '₹10,000',
      features: [
        'Commission-free direct bookings',
        'Payment gateway integration',
        'Multi-language support',
        'Real-time availability',
        'Booking analytics',
      ],
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#7c3aed' }} />,
      title: 'Advanced Analytics',
      description: 'Deep business insights and performance tracking',
      originalPrice: '₹12,000',
      discountedPrice: '₹8,500',
      features: [
        'Custom reporting dashboards',
        'Guest behavior analysis',
        'Competitive benchmarking',
        'Predictive analytics',
        'KPI monitoring',
      ],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
              fontSize: { xs: '1.5rem', md: '0.8rem' },
            }}
          >
            Cost of Hotel Property Management Systems
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: '#64748b',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            Solvotel offers affordable hotel software plans suitable for every
            budget. Choose from flexible subscription models that fit your
            property size and business goals. Request a hotel PMS demo today and
            see how you can save Ɵme, reduce errors, and grow revenue.
          </Typography>
        </Container>
      </Box>

      {/* Pricing Plans */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="cl">
          <Grid container spacing={4}>
            {plans.map((plan, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: plan.popular
                      ? '2px solid #2563eb'
                      : '1px solid #e2e8f0',
                    boxShadow: plan.popular
                      ? '0 8px 32px rgba(37, 99, 235, 0.15)'
                      : '0 4px 20px rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: plan.popular
                        ? '0 16px 48px rgba(37, 99, 235, 0.2)'
                        : '0 12px 40px rgba(0,0,0,0.12)',
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
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}
                      >
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {plan.description}
                      </Typography>
                    </Box>

                    {/* Pricing */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#1e293b',
                            fontSize: { xs: '1.75rem', md: '2rem' },
                          }}
                        >
                          {plan.discountedPrice}
                        </Typography>
                        {/* <Typography
                          variant="h6"
                          sx={{
                            color: '#64748b',
                            textDecoration: 'line-through',
                            fontSize: '1.1rem',
                          }}
                        >
                          {plan.originalPrice}
                        </Typography> */}
                      </Box>
                      {/* <Chip
                        label={`Save ${plan.savings}`}
                        size="small"
                        sx={{
                          backgroundColor: '#059669',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      /> */}
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', display: 'block', mt: 1 }}
                      >
                        per month
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Features */}
                    <List sx={{ mb: 3, flex: 1 }}>
                      {plan.features.map((feature, idx) => (
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
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Addon Services Section */}
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
            Addon Services
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
            Enhance your experience with these powerful addon services
          </Typography>

          <Grid container spacing={4}>
            {addonServices.map((service, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
                        mb: 2,
                        color: '#1e293b',
                      }}
                    >
                      {service.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      align="center"
                      sx={{
                        color: '#64748b',
                        mb: 3,
                        lineHeight: 1.6,
                        flex: 1,
                      }}
                    >
                      {service.description}
                    </Typography>

                    {/* Pricing */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: '#059669',
                            fontSize: '1.5rem',
                          }}
                        >
                          {service.discountedPrice}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#64748b',
                            textDecoration: 'line-through',
                            fontSize: '1rem',
                          }}
                        >
                          {service.originalPrice}
                        </Typography>
                      </Box>
                    </Box>
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
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Need a Custom Solution?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, color: '#cbd5e1', maxWidth: 600, mx: 'auto' }}
            >
              Contact us for enterprise solutions and custom pricing tailored to
              your specific needs.
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
              Contact Sales
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
