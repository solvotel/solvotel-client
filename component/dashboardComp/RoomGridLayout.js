'use client';

import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Box,
  Chip,
  Paper,
  Button,
  TextField,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { GetTodaysDate } from '@/utils/DateFetcher';
import AddIcon from '@mui/icons-material/Add';

const RoomGridLayout = ({ bookings, rooms }) => {
  const todaysDate = GetTodaysDate().dateString;
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [startDate, setStartDate] = useState(todaysDate);

  const handleAccordionChange = (index) => (event, isExpanded) => {
    setExpandedIndex(isExpanded ? index : false);
  };

  // 🔹 Helper: Format date as "14-Oct-25 (Tue)"
  const formatDate = (date) =>
    date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      weekday: 'short',
    });

  // 🔹 Generate 7 days from today
  const next7Days = useMemo(() => {
    const today = new Date(startDate);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  }, [startDate]);

  const handlePrev = () => {
    const prev = new Date(startDate);
    prev.setDate(prev.getDate() - 7);
    setStartDate(prev.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + 7);
    setStartDate(next.toISOString().split('T')[0]);
  };

  const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

  // 🔹 For each date, compute filtered data
  const getDayWiseData = (selectedDate) => {
    const checkedInRooms = [];
    const blockedRooms = [];
    const confirmedRooms = [];
    const occupiedRoomNos = new Set();

    bookings?.forEach((bk) => {
      const checkIn = new Date(bk.checkin_date);
      const checkOut = new Date(bk.checkout_date);

      const sameDayBooking = isSameDay(checkIn, checkOut);
      const isInRange = selectedDate >= checkIn && selectedDate < checkOut;

      // 🔹 SAME DAY BOOKINGS (override date logic)
      if (sameDayBooking && isSameDay(selectedDate, checkIn)) {
        bk.rooms?.forEach((room) => {
          const roomInfo = rooms.find((r) => r.room_no === room.room_no);

          // 🟢 Checked-in
          if (bk.checked_in === true && bk.checked_out !== true) {
            checkedInRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
            });
            occupiedRoomNos.add(room.room_no);
          }

          // 🟡 Confirmed (not checked-in yet)
          else if (bk.checked_in !== true && bk.checked_out !== true) {
            confirmedRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
            });
            occupiedRoomNos.add(room.room_no);
          }

          // 🔵 Checked-out → AVAILABLE (do nothing)
        });

        return; // ⛔ skip normal logic
      }

      // 🔹 NORMAL MULTI-DAY LOGIC
      if (isInRange) {
        // Checked-in
        if (bk.checked_in === true && bk.checked_out !== true) {
          bk.rooms?.forEach((room) => {
            const roomInfo = rooms.find((r) => r.room_no === room.room_no);
            checkedInRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
            });
            occupiedRoomNos.add(room.room_no);
          });
        }

        // Confirmed
        if (bk.booking_status === 'Confirmed' && bk.checked_in !== true) {
          bk.rooms?.forEach((room) => {
            const roomInfo = rooms.find((r) => r.room_no === room.room_no);
            confirmedRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
            });
            occupiedRoomNos.add(room.room_no);
          });
        }

        // Blocked
        if (bk.booking_status === 'Blocked' && bk.checked_in !== true) {
          bk.rooms?.forEach((room) => {
            const roomInfo = rooms.find((r) => r.room_no === room.room_no);
            blockedRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
            });
            occupiedRoomNos.add(room.room_no);
          });
        }
      }
    });

    // 🔹 Available rooms
    const availableRooms = rooms
      ?.filter((room) => !occupiedRoomNos.has(room.room_no))
      .map((room) => ({
        ...room,
        category: room.category?.name || 'Uncategorized',
      }));

    const groupByCategory = (roomArray) => {
      const grouped = {};
      roomArray?.forEach((room) => {
        const cat = room.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({
          room_no: room.room_no,
          bookingId: room.bookingId || null,
        });
      });
      return grouped;
    };

    return {
      availableGrouped: groupByCategory(availableRooms),
      checkedInGrouped: groupByCategory(checkedInRooms),
      confirmedGrouped: groupByCategory(confirmedRooms),
      blockedGrouped: groupByCategory(blockedRooms),
    };
  };

  return (
    <Box p={3}>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Button variant="contained" sx={{ minWidth: 0 }} onClick={handlePrev}>
            <ChevronLeftIcon />
          </Button>
          <TextField
            size="small"
            label="📅 Select Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ mx: 1 }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Button variant="contained" sx={{ minWidth: 0 }} onClick={handleNext}>
            <ChevronRightIcon />
          </Button>
        </Box>

        <Button
          href="/front-office/room-booking/create-new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          New Booking
        </Button>
      </Box>

      {next7Days.map((date, index) => {
        const {
          availableGrouped,
          checkedInGrouped,
          confirmedGrouped,
          blockedGrouped,
        } = getDayWiseData(date);

        const availableCount = Object.values(availableGrouped).flat().length;
        const checkedInCount = Object.values(checkedInGrouped).flat().length;
        const confirmedCount = Object.values(confirmedGrouped).flat().length;
        const blockedCount = Object.values(blockedGrouped).flat().length;

        return (
          <motion.div
            key={index}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: 8 }}
          >
            <Accordion
              expanded={expandedIndex === index}
              onChange={handleAccordionChange(index)}
              disableGutters
              sx={{
                p: 1,
                borderRadius: 3,
                bgcolor: '#fdfff3ff',
                border: 'none',
                overflow: 'hidden',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600, flex: 1 }}>
                  📆 {formatDate(date)}
                </Typography>

                <Typography
                  variant="body2"
                  color="green"
                  sx={{ fontWeight: 500, mr: 4 }}
                >
                  Available ({availableCount})
                </Typography>
                <Typography
                  variant="body2"
                  color="#0284c7"
                  sx={{ fontWeight: 500, mr: 4 }}
                >
                  Checked In ({checkedInCount})
                </Typography>
                <Typography
                  variant="body2"
                  color="purple"
                  sx={{ fontWeight: 500, mr: 4 }}
                >
                  Confirmed ({confirmedCount})
                </Typography>
                <Typography
                  variant="body2"
                  color="orange"
                  sx={{ fontWeight: 500 }}
                >
                  Blocked ({blockedCount})
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Grid container spacing={2}>
                  {[
                    {
                      title: `Available (${availableCount})`,
                      data: availableGrouped,
                      color: '#22c55e',
                      bg: '#f0fdf4',
                      chipBg: '#bbf7d0',
                    },
                    {
                      title: `Checked In (${checkedInCount})`,
                      data: checkedInGrouped,
                      color: '#0ea5e9',
                      bg: '#e0f2fe',
                      chipBg: '#bae6fd',
                    },
                    {
                      title: `Confirmed (${confirmedCount})`,
                      data: confirmedGrouped,
                      color: 'purple',
                      bg: '#ffccfdff',
                      chipBg: '#ffb0ecff',
                    },
                    {
                      title: `Blocked (${blockedCount})`,
                      data: blockedGrouped,
                      color: 'orange',
                      bg: '#fff7e6',
                      chipBg: '#ffe0b3',
                    },
                  ].map((col, idx) => (
                    <Grid key={idx} size={{ xs: 12, md: 3 }}>
                      <Paper
                        component={motion.div}
                        whileHover={{ scale: 1.01 }}
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          borderLeft: `4px solid ${col.color}`,
                          bgcolor: col.bg,
                          borderRadius: 2,
                          height: '100%',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          {col.title}
                        </Typography>
                        {Object.entries(col.data).map(([cat, rooms]) => (
                          <Box key={cat} mt={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {cat}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                              }}
                            >
                              {rooms.map((room) => (
                                <Chip
                                  key={room.room_no}
                                  label={room.room_no}
                                  size="small"
                                  clickable={!col.title.startsWith('Available')}
                                  component={
                                    !col.title.startsWith('Available')
                                      ? 'a'
                                      : 'div'
                                  }
                                  href={
                                    !col.title.startsWith('Available')
                                      ? `/front-office/room-booking/${room.bookingId}`
                                      : undefined
                                  }
                                  sx={{
                                    bgcolor: col.chipBg,
                                    cursor: col.title.startsWith('Available')
                                      ? 'default'
                                      : 'pointer',
                                    '&:hover': {
                                      opacity: 0.8,
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default RoomGridLayout;
