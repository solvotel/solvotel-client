'use client';

import React, { useState, useMemo } from 'react';
import { GetDataList } from '@/utils/ApiFunctions';
import {
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Building, Users } from 'lucide-react';
import dayjs from 'dayjs';

// Animation variants
const buttonAnimation = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.1 },
  },
};

const rowAnimation = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const RoomAvailabilityStep = ({
  bookingDetails,
  selectedRooms,
  setSelectedRooms,
  roomTokens,
  setRoomTokens,
}) => {
  const { auth } = useAuth();

  const categories = GetDataList({ auth, endPoint: 'room-categories' });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });

  // Generate date range from check-in to day before check-out
  const dateRange = useMemo(() => {
    const dates = [];
    const current = new Date(bookingDetails.checkin_date);
    const checkoutDate = new Date(bookingDetails.checkout_date);

    // Include at least the check-in date (even for same-day bookings)
    while (current < checkoutDate || dates.length === 0) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
      // Prevent infinite loop: stop after adding the checkout date equivalent
      if (dates.length > 0 && current >= checkoutDate) break;
    }

    return dates;
  }, [bookingDetails.checkin_date, bookingDetails.checkout_date]);

  // Check if a room is available for a specific date
  const isRoomAvailableForDate = (room, date) => {
    // Keep for backward-compat - prefer using getOccupiedRoomNosForDate
    const occupied = getOccupiedRoomNosForDate(date);
    return !occupied.has(room.room_no);
  };

  // Build a set of occupied room numbers for a given date using booking tokens and statuses
  const getOccupiedRoomNosForDate = (date) => {
    const occupiedRoomNos = new Set();
    const selectedDate = new Date(date);

    // If we have global bookings, use them (mirrors RoomGridLayout)
    if (bookings && bookings.length > 0) {
      bookings.forEach((bk) => {
        const checkIn = new Date(bk.checkin_date);
        const checkOut = new Date(bk.checkout_date);
        const isSameDay = checkIn.toDateString() === checkOut.toDateString();

        // Check booking-level applicability: include same-day bookings
        const bookingAppliesToDate =
          (selectedDate >= checkIn && selectedDate < checkOut) ||
          (isSameDay && selectedDate.toDateString() === checkIn.toDateString());

        if (!bookingAppliesToDate) return;

        bk.room_tokens?.forEach((token) => {
          const tokenIn = new Date(token.in_date);
          const tokenOut = new Date(token.out_date);

          const tokenAppliesToDate =
            selectedDate >= tokenIn && selectedDate < tokenOut;
          if (!tokenAppliesToDate) return;

          if (bk.checked_in === true && bk.checked_out !== true) {
            occupiedRoomNos.add(token.room);
          } else if (
            bk.checked_in !== true &&
            bk.checked_out !== true &&
            bk.booking_status === 'Confirmed'
          ) {
            occupiedRoomNos.add(token.room);
          } else if (bk.booking_status === 'Blocked') {
            occupiedRoomNos.add(token.room);
          }
        });
      });
    }

    return occupiedRoomNos;
  };

  // Group rooms by category
  const roomsByCategory = useMemo(() => {
    if (!rooms || !categories) return {};

    const grouped = {};
    categories?.forEach((cat) => {
      grouped[cat.documentId] = {
        name: cat.name,
        rooms: rooms.filter((r) => r.category?.documentId === cat.documentId),
      };
    });

    return grouped;
  }, [rooms, categories]);

  // Create a unique key for room-date combination
  const getRoomDateKey = (roomNo, date) => `${roomNo}-${date}`;

  // Handle room + date selection
  const handleRoomDateSelection = (room, date) => {
    const key = getRoomDateKey(room.room_no, date);
    const exists = selectedRooms.some(
      (r) => r.room_no === room.room_no && r.date === date,
    );

    if (exists) {
      // Remove this date from selectedRooms
      const updatedSelectedRooms = selectedRooms.filter(
        (r) => !(r.room_no === room.room_no && r.date === date),
      );
      setSelectedRooms(updatedSelectedRooms);

      // Get all remaining dates for this room (sorted)
      const remainingDatesForRoom = updatedSelectedRooms
        .filter((r) => r.room_no === room.room_no)
        .map((r) => r.date)
        .sort();

      if (remainingDatesForRoom.length === 0) {
        // No more dates for this room, remove token
        setRoomTokens(roomTokens.filter((t) => t.room !== room.room_no));
      } else {
        // Update token with new date range and days
        const inDate = remainingDatesForRoom[0];
        const outDateObj = new Date(
          remainingDatesForRoom[remainingDatesForRoom.length - 1],
        );
        outDateObj.setDate(outDateObj.getDate() + 1);
        const outDate = outDateObj.toISOString().split('T')[0];

        const updatedTokens = roomTokens.map((t) => {
          if (t.room === room.room_no) {
            return {
              ...t,
              in_date: inDate,
              out_date: outDate,
              days: remainingDatesForRoom.length,
              amount:
                (t.rate + (t.rate * t.gst) / 100) *
                remainingDatesForRoom.length,
            };
          }
          return t;
        });
        setRoomTokens(updatedTokens);
      }
    } else {
      // Add this date to selectedRooms
      const newRoom = {
        key,
        ...room,
        date,
      };
      const updatedSelectedRooms = [...selectedRooms, newRoom];
      setSelectedRooms(updatedSelectedRooms);

      // Get all dates for this room (sorted)
      const allDatesForRoom = updatedSelectedRooms
        .filter((r) => r.room_no === room.room_no)
        .map((r) => r.date)
        .sort();

      const rate = room.category?.tariff || 0;
      const gst = room.category?.gst || 0;
      const baseAmount = rate;
      const gstAmount = (baseAmount * gst) / 100;
      const totalAmountPerNight = baseAmount + gstAmount;

      const inDate = allDatesForRoom[0];
      const outDateObj = new Date(allDatesForRoom[allDatesForRoom.length - 1]);
      outDateObj.setDate(outDateObj.getDate() + 1);
      const outDate = outDateObj.toISOString().split('T')[0];
      const daysCount = allDatesForRoom.length;

      // Check if token already exists for this room
      const existingTokenIndex = roomTokens.findIndex(
        (t) => t.room === room.room_no,
      );

      if (existingTokenIndex >= 0) {
        // Update existing token
        const updatedTokens = [...roomTokens];
        updatedTokens[existingTokenIndex] = {
          ...updatedTokens[existingTokenIndex],
          in_date: inDate,
          out_date: outDate,
          days: daysCount,
          amount: totalAmountPerNight * daysCount,
        };
        setRoomTokens(updatedTokens);
      } else {
        // Create new token (no key attribute)
        const newToken = {
          room: room.room_no,
          hsn: room.category?.hsn || '',
          item: room.category?.name || '',
          rate: rate,
          gst: gst,
          amount: totalAmountPerNight * daysCount,
          days: daysCount,
          invoice: false,
          in_date: inDate,
          out_date: outDate,
        };
        setRoomTokens([...roomTokens, newToken]);
      }
    }
  };

  // Check if room is selected for a specific date
  const isRoomSelectedForDate = (roomNo, date) => {
    return selectedRooms.some((r) => r.room_no === roomNo && r.date === date);
  };

  // Remove a specific selection (remove all dates for that room)
  const removeSelection = (key) => {
    const roomNo = key.split('-')[0];
    // Remove all dates for this room
    const updatedSelectedRooms = selectedRooms.filter(
      (r) => r.room_no !== roomNo,
    );
    setSelectedRooms(updatedSelectedRooms);
    // Remove token for this room
    setRoomTokens(roomTokens.filter((t) => t.room !== roomNo));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Date Rows */}
      <AnimatePresence mode="popLayout">
        {dateRange.map((date, dateIndex) => {
          const dateObj = new Date(date);
          const formattedDate = dayjs(date).format('ddd, MMM DD');

          return (
            <motion.div
              key={date}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={rowAnimation}
              transition={{ delay: dateIndex * 0.1 }}
            >
              <Card
                sx={{
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 1,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* Date Header */}
                <Box
                  sx={{
                    bgcolor: '#1976d2',
                    color: 'white',
                    p: { xs: 1, sm: 1.5 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.8, sm: 1.5 },
                    flexWrap: 'wrap',
                  }}
                >
                  <Calendar size={16} />
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {formattedDate}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 'auto',
                      opacity: 0.85,
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    }}
                  >
                    Night
                  </Typography>
                </Box>

                <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                  {/* Rooms grouped by category */}
                  <Box>
                    {Object.entries(roomsByCategory).map(([catId, catData]) => {
                      const availableRoomsForDate = catData.rooms.filter(
                        (room) => isRoomAvailableForDate(room, date),
                      );

                      if (availableRoomsForDate.length === 0) return null;

                      return (
                        <Box key={catId} mb={{ xs: 1.5, sm: 2 }}>
                          {/* Category Label */}
                          <Typography
                            variant="caption"
                            fontWeight="600"
                            sx={{
                              mb: 0.75,
                              pb: 0.5,
                              display: 'block',
                              borderBottom: '1px solid #e0e0e0',
                              color: '#424242',
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            }}
                          >
                            {catData.name}
                          </Typography>

                          {/* Room Buttons */}
                          <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={{ xs: 0.5, sm: 0.75 }}
                          >
                            <AnimatePresence mode="popLayout">
                              {availableRoomsForDate.map((room) => {
                                const isSelected = isRoomSelectedForDate(
                                  room.room_no,
                                  date,
                                );

                                return (
                                  <motion.div
                                    key={`${room.documentId}-${date}`}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    whileHover="hover"
                                    variants={buttonAnimation}
                                  >
                                    <Button
                                      onClick={() =>
                                        handleRoomDateSelection(room, date)
                                      }
                                      variant={
                                        isSelected ? 'contained' : 'outlined'
                                      }
                                      color={isSelected ? 'primary' : 'inherit'}
                                      sx={{
                                        px: { xs: 0.8, sm: 1.2 },
                                        py: { xs: 0.4, sm: 0.6 },
                                        minWidth: { xs: '36px', sm: '48px' },
                                        fontWeight: 'bold',
                                        fontSize: {
                                          xs: '0.7rem',
                                          sm: '0.85rem',
                                        },
                                        textTransform: 'uppercase',
                                        borderRadius: 0.5,
                                        border: isSelected
                                          ? '2px solid #1976d2'
                                          : '1px solid #bdbdbd',
                                        transition: 'all 0.2s ease-in-out',
                                        bgcolor: isSelected
                                          ? '#1976d2'
                                          : 'transparent',
                                        color: isSelected ? 'white' : '#424242',
                                        '&:hover': {
                                          bgcolor: isSelected
                                            ? '#1565c0'
                                            : '#f5f5f5',
                                          boxShadow: 1,
                                        },
                                      }}
                                    >
                                      {room.room_no}
                                    </Button>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Selection Summary */}
      {selectedRooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Card
            sx={{
              mt: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: '#f5f5f5',
              borderLeft: '4px solid #4caf50',
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Users size={16} color="#4caf50" />
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' } }}
                >
                  {selectedRooms.length} Room
                  {selectedRooms.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={0.75}>
                {selectedRooms.map((selection) => (
                  <motion.div
                    key={selection.key}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <Chip
                      label={`${selection.room_no} (${dayjs(selection.date).format('M/D')})`}
                      onDelete={() => removeSelection(selection.key)}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        '& .MuiChip-deleteIcon': {
                          color: '#d32f2f !important',
                          fontSize: 'inherit',
                          '&:hover': {
                            color: '#b71c1c !important',
                          },
                        },
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
};

export default RoomAvailabilityStep;
