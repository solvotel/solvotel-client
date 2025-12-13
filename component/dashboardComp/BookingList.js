'use client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Link,
} from '@mui/material';
import { motion } from 'framer-motion';

import { Hotel, LogIn, LogOut } from 'lucide-react';

const MotionBox = motion(Box);

const BookingList = ({ stayOver, expectedCheckin, expectedCheckout }) => {
  // Small card for each booking
  const renderBookingMiniCard = (bk) => (
    <MotionBox
      key={bk.documentId}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`front-office/room-booking/${bk.documentId}`}
        underline="none"
        sx={{ textDecoration: 'none' }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 1.5,
            borderRadius: 3,
            background: '#fff',
            color: '#333',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transform: 'translateY(-3px)',
            },
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Booking ID: {bk.booking_id}
          </Typography>
          <Typography variant="body2">
            Rooms: {bk.rooms?.map((r) => r.room_no).join(', ') || '—'}
          </Typography>
        </Paper>
      </Link>
    </MotionBox>
  );
  return (
    <>
      {' '}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Expected Check In */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #d0f8ce, #a5d6a7)',
                borderRadius: 4,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                maxHeight: '500px',
                overflowY: 'auto',
                // Thin scrollbar
                '&::-webkit-scrollbar': {
                  width: '6px', // scrollbar width
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent', // track color
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)', // thumb color
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)', // on hover
                },
                // For Firefox
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.2) transparent',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1.2} mb={2}>
                  <LogIn size={22} color="#1b5e20" />
                  <Typography variant="h6" fontWeight="bold" color="#1b5e20">
                    Expected Check-In ({expectedCheckin?.length || 0})
                  </Typography>
                </Box>

                <Box>
                  {expectedCheckin?.length > 0 ? (
                    expectedCheckin.map((bk) => renderBookingMiniCard(bk))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No expected check-ins today.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Currently Staying */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #e0f2ff, #b3e5fc)',
                borderRadius: 4,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                maxHeight: '500px',
                overflowY: 'auto',
                // Thin scrollbar
                '&::-webkit-scrollbar': {
                  width: '6px', // scrollbar width
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent', // track color
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)', // thumb color
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)', // on hover
                },
                // For Firefox
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.2) transparent',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1.2} mb={2}>
                  <Hotel size={22} color="#01579b" />
                  <Typography variant="h6" fontWeight="bold" color="#01579b">
                    Stay Over ({stayOver?.length || 0})
                  </Typography>
                </Box>

                <Box>
                  {stayOver?.length > 0 ? (
                    stayOver.map((bk) => renderBookingMiniCard(bk))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No guests currently staying.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Expected Checkout */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                borderRadius: 4,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                maxHeight: '500px',
                overflowY: 'auto',
                // Thin scrollbar
                '&::-webkit-scrollbar': {
                  width: '6px', // scrollbar width
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent', // track color
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)', // thumb color
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)', // on hover
                },
                // For Firefox
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.2) transparent',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1.2} mb={2}>
                  <LogOut size={22} color="#b71c1c" />
                  <Typography variant="h6" fontWeight="bold" color="#b71c1c">
                    Expected Checkout ({expectedCheckout?.length || 0})
                  </Typography>
                </Box>

                <Box>
                  {expectedCheckout?.length > 0 ? (
                    expectedCheckout.map((bk) => renderBookingMiniCard(bk))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No expected check-outs today.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default BookingList;
