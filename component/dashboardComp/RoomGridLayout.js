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
  Card,
  Button,
  TextField,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { GetTodaysDate } from '@/utils/DateFetcher';

const RoomGridLayout = ({ bookings, rooms }) => {
  const todaysDate = GetTodaysDate().dateString;
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [startDate, setStartDate] = useState(todaysDate);
  console.log(startDate);

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

  // 🔹 For each date, compute filtered data
  const getDayWiseData = (selectedDate) => {
    const checkedInRooms = [];
    const expectedCheckoutRooms = [];
    const confirmedRooms = [];
    const occupiedRoomNos = new Set();

    bookings?.forEach((bk) => {
      const checkIn = new Date(bk.checkin_date);
      const checkOut = new Date(bk.checkout_date);

      // 🔹 Checked-in rooms
      if (
        bk.checked_in === true &&
        bk.checked_out !== true &&
        selectedDate >= checkIn &&
        selectedDate <= checkOut
      ) {
        bk.rooms?.forEach((room) => {
          const roomInfo = rooms.find((r) => r.room_no === room.room_no);
          checkedInRooms.push({
            ...room,
            category: roomInfo?.category?.name || 'Uncategorized',
          });
          occupiedRoomNos.add(room.room_no);
        });
      }

      // 🔹 Expected checkout rooms
      if (
        bk.checked_in === true &&
        bk.checked_out !== true &&
        checkOut.toDateString() === selectedDate.toDateString()
      ) {
        bk.rooms?.forEach((room) => {
          const roomInfo = rooms.find((r) => r.room_no === room.room_no);
          expectedCheckoutRooms.push({
            ...room,
            category: roomInfo?.category?.name || 'Uncategorized',
          });
        });
      }

      // 🔹 Confirmed rooms (not yet checked-in)
      if (
        bk.booking_status === 'Confirmed' &&
        bk.checked_in !== true &&
        selectedDate >= checkIn &&
        selectedDate <= checkOut
      ) {
        bk.rooms?.forEach((room) => {
          const roomInfo = rooms.find((r) => r.room_no === room.room_no);
          confirmedRooms.push({
            ...room,
            category: roomInfo?.category?.name || 'Uncategorized',
          });
        });
      }
    });

    // 🔹 Combine occupied room numbers (checked-in + confirmed)
    const occupiedNos = new Set([
      ...occupiedRoomNos,
      ...confirmedRooms.map((r) => r.room_no),
    ]);

    // 🔹 Available rooms = not in occupiedNos
    const availableRooms = rooms
      ?.filter((room) => !occupiedNos.has(room.room_no))
      .map((room) => ({
        ...room,
        category: room.category?.name || 'Uncategorized', // ensure string
      }));

    // 🔹 Helper: group rooms by category
    const groupByCategory = (roomArray) => {
      const grouped = {};
      roomArray?.forEach((room) => {
        const cat = room.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(room.room_no);
      });
      return grouped;
    };

    return {
      availableGrouped: groupByCategory(availableRooms),
      checkedInGrouped: groupByCategory(checkedInRooms),
      expectedCheckoutGrouped: groupByCategory(expectedCheckoutRooms),
      confirmedGrouped: groupByCategory(confirmedRooms),
    };
  };

  return (
    <Box p={3}>
      <Box sx={{ mb: 1 }}>
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
      {next7Days.map((date, index) => {
        const {
          availableGrouped,
          checkedInGrouped,
          expectedCheckoutGrouped,
          confirmedGrouped,
        } = getDayWiseData(date);

        const availableCount = Object.values(availableGrouped).flat().length;
        const checkedInCount = Object.values(checkedInGrouped).flat().length;
        const expectedCheckoutCount = Object.values(
          expectedCheckoutGrouped
        ).flat().length;
        const confirmedCount = Object.values(confirmedGrouped).flat().length;

        return (
          <motion.div
            key={index}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: 8 }}
          >
            <Accordion
              expanded={expandedIndex === index} // controlled
              onChange={handleAccordionChange(index)}
              disableGutters
              sx={{
                p: 1,

                borderRadius: 3,
                bgcolor: '#fdfff3ff', // subtle bg
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
                  color="red"
                  sx={{ fontWeight: 500 }}
                >
                  Checkout ({expectedCheckoutCount})
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
                      title: `Expected Checkout (${expectedCheckoutCount})`,
                      data: expectedCheckoutGrouped,
                      color: 'red',
                      bg: '#ffe0e0ff',
                      chipBg: '#ffbcbcff',
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
                              {rooms.map((num) => (
                                <Chip
                                  key={num}
                                  label={num}
                                  size="small"
                                  sx={{ bgcolor: col.chipBg }}
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
