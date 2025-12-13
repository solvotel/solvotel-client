'use client';

import { GetTodaysDate } from '@/utils/DateFetcher';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  DoorOpen,
  DoorClosed,
  LogIn,
  LogOut,
  CheckCircle,
  Ban,
} from 'lucide-react';

const MotionCard = motion(Card);

const OverviewStats = ({ bookings, rooms }) => {
  const todaysDate = GetTodaysDate().dateString;
  const GetStats = () => {
    const today = new Date(todaysDate);
    const todayStr = today.toISOString().split('T')[0];

    let checkedIn = 0;
    let confirmed = 0;
    let blocked = 0;

    const occupiedNos = new Set();

    let expectedCheckins = 0;
    let expectedCheckouts = 0;

    bookings?.forEach((bk) => {
      const checkIn = new Date(bk.checkin_date);
      const checkOut = new Date(bk.checkout_date);

      // 📌 Expected Check-ins / Check-outs
      if (
        bk.checked_in !== true &&
        bk.checked_out !== true &&
        checkIn.toDateString() === today.toDateString() &&
        bk.booking_status === 'Confirmed'
      )
        expectedCheckins++;
      if (
        bk.checked_in === true &&
        bk.checked_out !== true &&
        checkOut.toDateString() === today.toDateString() &&
        bk.booking_status === 'Confirmed'
      )
        expectedCheckouts++;

      // -------------------------------
      // 📌 Checked-in rooms
      // -------------------------------
      if (
        bk.checked_in === true &&
        bk.checked_out !== true &&
        today >= checkIn &&
        today < checkOut
      ) {
        checkedIn += bk.rooms?.length || 0;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      }

      // -------------------------------
      // 📌 Confirmed (future check-ins)
      // -------------------------------
      if (
        bk.booking_status === 'Confirmed' &&
        bk.checked_in !== true &&
        today >= checkIn &&
        today < checkOut
      ) {
        confirmed += bk.rooms?.length || 0;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      }

      // -------------------------------
      // 📌 Blocked rooms
      // -------------------------------
      if (
        bk.booking_status === 'Blocked' &&
        bk.checked_in !== true &&
        today >= checkIn &&
        today < checkOut
      ) {
        blocked += bk.rooms?.length || 0;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      }
    });

    // 📌 Available rooms
    const available = rooms?.filter((r) => !occupiedNos.has(r.room_no)).length;

    return {
      available,
      checkedIn,
      confirmed,
      blocked,
      expectedCheckins,
      expectedCheckouts,
    };
  };
  const statsData = GetStats();

  console.log('Available Rooms in OverviewStats:', statsData);

  const stats = [
    {
      title: 'Available Rooms',
      count: statsData.available || 0,
      color: 'linear-gradient(135deg, #E3FCEC, #B2F5EA)',
      borderColor: '#047857',
      icon: <DoorOpen size={28} color="#047857" />,
    },
    {
      title: 'Occupied Rooms',
      count: statsData.checkedIn || 0,
      color: 'linear-gradient(135deg, #E0F2FF, #90CAF9)',
      borderColor: '#1E40AF',
      icon: <DoorClosed size={28} color="#1E40AF" />,
    },
    {
      title: 'Expected Check-In',
      count: statsData.expectedCheckins || 0,
      color: 'linear-gradient(135deg, #D1FAE5, #86EFAC)',
      borderColor: '#166534',
      icon: <LogIn size={28} color="#166534" />,
    },
    {
      title: 'Expected Checkout',
      count: statsData.expectedCheckouts || 0,
      color: 'linear-gradient(135deg, #FEE2E2, #FCA5A5)',
      borderColor: '#991B1B',
      icon: <LogOut size={28} color="#991B1B" />,
    },
    {
      title: 'Confirmed Rooms',
      count: statsData.confirmed || 0,
      color: 'linear-gradient(135deg, #EDE9FE, #C4B5FD)',
      borderColor: '#5B21B6',
      icon: <CheckCircle size={28} color="#5B21B6" />,
    },
    {
      title: 'Blocked Rooms',
      count: statsData.blocked || 0,
      color: 'linear-gradient(135deg, #FEF3C7, #FCD34D)',
      borderColor: '#92400E',
      icon: <Ban size={28} color="#92400E" />,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid
            key={index}
            size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 2 }}
            display="flex"
          >
            <MotionCard
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
              sx={{
                background: item.color,
                borderRadius: 3,
                // border: `2px solid ${item.borderColor}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                flexGrow: 1,
                overflow: 'hidden',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2.5,
                }}
              >
                {/* Left side - Icon + Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ color: '#1f2937', lineHeight: 1.1 }}
                  >
                    {item.title}
                  </Typography>
                </Box>

                {/* Right side - Stat */}
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    color: '#111827',
                    minWidth: 40,
                    textAlign: 'right',
                  }}
                >
                  {item.count}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverviewStats;
