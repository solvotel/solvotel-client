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

    let checkedIn = 0;
    let confirmed = 0;
    let blocked = 0;
    let expectedCheckins = 0;
    let expectedCheckouts = 0;

    const occupiedNos = new Set();

    const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

    bookings?.forEach((bk) => {
      const checkIn = new Date(bk.checkin_date);
      const checkOut = new Date(bk.checkout_date);

      const roomCount = bk.rooms?.length || 0;
      const sameDayBooking = isSameDay(checkIn, checkOut);
      const activeStay = today >= checkIn && today < checkOut;

      // -------------------------------------------------
      // 📌 Expected Check-ins (ROOM BASED)
      // -------------------------------------------------
      if (
        bk.booking_status === 'Confirmed' &&
        bk.checked_in !== true &&
        bk.checked_out !== true &&
        isSameDay(checkIn, today)
      ) {
        expectedCheckins += roomCount;
      }

      // -------------------------------------------------
      // 📌 Expected Check-outs (ROOM BASED)
      // -------------------------------------------------
      if (
        bk.booking_status === 'Confirmed' &&
        bk.checked_in === true &&
        bk.checked_out !== true &&
        isSameDay(checkOut, today)
      ) {
        expectedCheckouts += roomCount;
      }

      // ⛔ Fully checked-out bookings do not affect stats
      if (bk.checked_out === true) return;

      // -------------------------------------------------
      // 📌 SAME-DAY BOOKINGS (checkin === checkout)
      // -------------------------------------------------
      if (sameDayBooking && isSameDay(today, checkIn)) {
        if (bk.checked_in === true) {
          checkedIn += roomCount;
          bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
        } else if (bk.booking_status === 'Confirmed') {
          confirmed += roomCount;
          bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
        } else if (bk.booking_status === 'Blocked') {
          blocked += roomCount;
          bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
        }
        return; // ⛔ skip normal date logic
      }

      // -------------------------------------------------
      // 📌 MULTI-DAY BOOKINGS
      // -------------------------------------------------
      if (!activeStay) return;

      if (bk.checked_in === true) {
        checkedIn += roomCount;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      } else if (bk.booking_status === 'Confirmed') {
        confirmed += roomCount;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      } else if (bk.booking_status === 'Blocked') {
        blocked += roomCount;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      }
    });

    // -------------------------------------------------
    // 📌 Available rooms
    // -------------------------------------------------
    const available =
      rooms?.filter((r) => !occupiedNos.has(r.room_no)).length || 0;

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
