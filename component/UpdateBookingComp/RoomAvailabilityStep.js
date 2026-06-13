'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GetDataList } from '@/utils/ApiFunctions';
import {
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Collapse,
  IconButton,
} from '@mui/material';
import { useAuth } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';
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
  bookingData,
}) => {
  const { auth } = useAuth();

  const categories = GetDataList({ auth, endPoint: 'room-categories' });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });

  // Generate date range from check-in to day before check-out
  const dateRange = useMemo(() => {
    const dates = [];

    let current = dayjs(bookingDetails.checkin_date);
    const checkout = dayjs(bookingDetails.checkout_date);

    while (current.isBefore(checkout, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    return dates;
  }, [bookingDetails.checkin_date, bookingDetails.checkout_date]);

  const [expandedDates, setExpandedDates] = useState(() => new Set());

  useEffect(() => {
    setExpandedDates(new Set());
  }, [dateRange]);

  useEffect(() => {
    if (
      bookingData?.documentId &&
      roomTokens?.length > 0 &&
      selectedRooms?.length === 0 &&
      rooms?.length
    ) {
      const selections = [];

      roomTokens.forEach((token) => {
        const room = rooms.find((r) => r.room_no === token.room);

        if (!room) return;

        let current = dayjs(token.in_date);
        const checkout = dayjs(token.out_date);

        while (current.isBefore(checkout, 'day')) {
          selections.push({
            key: `${token.room}-${current.format('YYYY-MM-DD')}`,
            ...room,
            date: current.format('YYYY-MM-DD'),
          });

          current = current.add(1, 'day');
        }
      });

      setSelectedRooms(selections);
    }
  }, [bookingData?.documentId, roomTokens, rooms]);

  const toggleDateExpansion = (date) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  // Check if a room is available for a specific date (uses token/status logic)
  const isRoomAvailableForDate = (room, date) => {
    return !getOccupiedRoomNosForDate(date).has(room.room_no);
  };

  // Build a set of occupied room numbers for a given date using booking tokens and statuses
  // For update flow we must ignore the booking currently being edited (`bookingData`)
  const getOccupiedRoomNosForDate = (date) => {
    const occupied = new Set();

    const selectedDate = dayjs(date);

    bookings?.forEach((booking) => {
      if (
        booking.documentId === bookingData?.documentId ||
        booking.checked_out ||
        booking.booking_status === 'Cancelled'
      ) {
        return;
      }

      booking.room_tokens?.forEach((token) => {
        const inDate = dayjs(token.in_date);
        const outDate = dayjs(token.out_date);

        const occupiedOnDate =
          selectedDate.isSame(inDate, 'day') ||
          (selectedDate.isAfter(inDate, 'day') &&
            selectedDate.isBefore(outDate, 'day'));

        if (!occupiedOnDate) return;

        const shouldBlock =
          booking.booking_status === 'Blocked' ||
          (booking.booking_status === 'Confirmed' &&
            booking.checked_out !== true);

        if (shouldBlock) {
          occupied.add(token.room);
        }
      });
    });

    return occupied;
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

  const buildRoomTokens = (selections) => {
    const groupedByRoom = selections.reduce((acc, selection) => {
      if (!acc[selection.room_no]) {
        acc[selection.room_no] = {
          room: selection,
          dates: [],
        };
      }

      acc[selection.room_no].dates.push(selection.date);

      return acc;
    }, {});

    const tokens = [];

    Object.values(groupedByRoom).forEach(({ room, dates }) => {
      const sortedDates = [...new Set(dates)].sort();

      if (!sortedDates.length) return;

      const rate = room.category?.tariff || 0;
      const gst = room.category?.gst || 0;

      let currentBlock = [sortedDates[0]];

      const pushToken = (blockDates) => {
        const in_date = blockDates[0];

        const outDateObj = new Date(blockDates[blockDates.length - 1]);

        outDateObj.setDate(outDateObj.getDate() + 1);

        const out_date = outDateObj.toISOString().split('T')[0];

        const days = blockDates.length;

        tokens.push({
          id: `${room.room_no}-${in_date}-${out_date}`,
          room: room.room_no,
          hsn: room.category?.hsn || '',
          item: room.category?.name || '',
          rate,
          gst,
          amount: (rate + (rate * gst) / 100) * days,
          days,
          invoice: false,
          in_date,
          out_date,
        });
      };

      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);

        const diffDays =
          (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentBlock.push(sortedDates[i]);
        } else {
          pushToken(currentBlock);
          currentBlock = [sortedDates[i]];
        }
      }

      pushToken(currentBlock);
    });

    return tokens;
  };

  const getAvailableRoomsForDate = (date) => {
    return Object.values(roomsByCategory).flatMap((catData) =>
      catData.rooms.filter((room) => isRoomAvailableForDate(room, date)),
    );
  };

  const isRoomSelectedForDate = (roomNo, date) => {
    return selectedRooms.some((r) => r.room_no === roomNo && r.date === date);
  };

  const isDateFullySelected = (date) => {
    const availableRooms = getAvailableRoomsForDate(date);
    return (
      availableRooms.length > 0 &&
      availableRooms.every((room) => isRoomSelectedForDate(room.room_no, date))
    );
  };

  const isAllSelected = () => {
    return dateRange.every((date) => {
      const availableRooms = getAvailableRoomsForDate(date);
      return (
        availableRooms.length === 0 ||
        availableRooms.every((room) =>
          isRoomSelectedForDate(room.room_no, date),
        )
      );
    });
  };

  const handleToggleDateSelection = (date) => {
    const availableRooms = getAvailableRoomsForDate(date);
    const currentlySelected = isDateFullySelected(date);

    let updatedSelectedRooms;

    if (currentlySelected) {
      updatedSelectedRooms = selectedRooms.filter((r) => r.date !== date);
    } else {
      const newSelections = availableRooms.reduce((acc, room) => {
        const exists = selectedRooms.some(
          (r) => r.room_no === room.room_no && r.date === date,
        );

        if (!exists) {
          acc.push({
            key: getRoomDateKey(room.room_no, date),
            ...room,
            date,
          });
        }

        return acc;
      }, []);

      updatedSelectedRooms = [...selectedRooms, ...newSelections];
    }

    setSelectedRooms(updatedSelectedRooms);
    setRoomTokens(buildRoomTokens(updatedSelectedRooms));
  };

  const handleToggleAllRooms = () => {
    const currentlyAllSelected = isAllSelected();

    if (currentlyAllSelected) {
      setSelectedRooms([]);
      setRoomTokens([]);
      return;
    }

    const allSelections = dateRange.flatMap((date) =>
      getAvailableRoomsForDate(date).map((room) => ({
        key: getRoomDateKey(room.room_no, date),
        ...room,
        date,
      })),
    );

    setSelectedRooms(allSelections);
    setRoomTokens(buildRoomTokens(allSelections));
  };

  // Handle room + date selection
  const handleRoomDateSelection = (room, date) => {
    const exists = selectedRooms.some(
      (r) => r.room_no === room.room_no && r.date === date,
    );

    let updatedSelectedRooms;

    if (exists) {
      updatedSelectedRooms = selectedRooms.filter(
        (r) => !(r.room_no === room.room_no && r.date === date),
      );
    } else {
      updatedSelectedRooms = [
        ...selectedRooms,
        {
          key: getRoomDateKey(room.room_no, date),
          ...room,
          date,
        },
      ];
    }

    setSelectedRooms(updatedSelectedRooms);
    setRoomTokens(buildRoomTokens(updatedSelectedRooms));
  };

  // Check if all rooms in a category are selected for a specific date
  const isCategoryFullySelectedForDate = (catId, date) => {
    const categoryRooms = roomsByCategory[catId]?.rooms || [];
    const availableRoomsForDate = categoryRooms.filter((room) =>
      isRoomAvailableForDate(room, date),
    );

    return (
      availableRoomsForDate.length > 0 &&
      availableRoomsForDate.every((room) =>
        isRoomSelectedForDate(room.room_no, date),
      )
    );
  };

  // Check if any rooms in a category are selected for a specific date (for indeterminate state)
  const isCategoryPartiallySelectedForDate = (catId, date) => {
    const categoryRooms = roomsByCategory[catId]?.rooms || [];
    const availableRoomsForDate = categoryRooms.filter((room) =>
      isRoomAvailableForDate(room, date),
    );

    if (availableRoomsForDate.length === 0) return false;

    const selectedCount = availableRoomsForDate.filter((room) =>
      isRoomSelectedForDate(room.room_no, date),
    ).length;

    return selectedCount > 0 && selectedCount < availableRoomsForDate.length;
  };

  // Handle category checkbox toggle for a specific date
  const handleToggleCategorySelection = (catId, date) => {
    const categoryRooms = roomsByCategory[catId]?.rooms || [];

    const availableRoomsForDate = categoryRooms.filter((room) =>
      isRoomAvailableForDate(room, date),
    );

    const isFullySelected = isCategoryFullySelectedForDate(catId, date);

    let updatedSelectedRooms;

    if (isFullySelected) {
      updatedSelectedRooms = selectedRooms.filter(
        (r) =>
          !(
            r.date === date &&
            categoryRooms.some((cr) => cr.room_no === r.room_no)
          ),
      );
    } else {
      const newSelections = availableRoomsForDate.reduce((acc, room) => {
        const exists = selectedRooms.some(
          (r) => r.room_no === room.room_no && r.date === date,
        );

        if (!exists) {
          acc.push({
            key: getRoomDateKey(room.room_no, date),
            ...room,
            date,
          });
        }

        return acc;
      }, []);

      updatedSelectedRooms = [...selectedRooms, ...newSelections];
    }

    setSelectedRooms(updatedSelectedRooms);
    setRoomTokens(buildRoomTokens(updatedSelectedRooms));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllSelected()}
              onChange={handleToggleAllRooms}
              color="primary"
            />
          }
          label="Select all rooms"
          sx={{
            '.MuiFormControlLabel-label': {
              fontWeight: 600,
              color: '#424242',
            },
          }}
        />
      </Box>
      {/* Date Rows */}
      <AnimatePresence mode="popLayout">
        {dateRange.map((date, dateIndex) => {
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isDateFullySelected(date)}
                        onChange={() => handleToggleDateSelection(date)}
                        sx={{
                          color: 'white',
                          '&.Mui-checked': {
                            color: 'white',
                          },
                        }}
                      />
                    }
                    label="All"
                    sx={{
                      color: 'white',
                      '.MuiFormControlLabel-label': {
                        color: 'white',
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => toggleDateExpansion(date)}
                    sx={{
                      ml: 'auto',
                      color: 'white',
                      p: 0.5,
                    }}
                    aria-label={
                      expandedDates.has(date)
                        ? 'Collapse room list'
                        : 'Expand room list'
                    }
                    size="small"
                  >
                    {expandedDates.has(date) ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={expandedDates.has(date)}>
                  <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                    {/* Rooms grouped by category */}
                    <Box>
                      {Object.entries(roomsByCategory).map(
                        ([catId, catData]) => {
                          const availableRoomsForDate = catData.rooms.filter(
                            (room) => isRoomAvailableForDate(room, date),
                          );

                          if (availableRoomsForDate.length === 0) return null;

                          const isCategoryFullySelected =
                            isCategoryFullySelectedForDate(catId, date);
                          const isCategoryPartiallySelected =
                            isCategoryPartiallySelectedForDate(catId, date);

                          return (
                            <Box key={catId} mb={{ xs: 1.5, sm: 2 }}>
                              {/* Category Label with Checkbox */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                  mb: 0.75,
                                  pb: 0.5,
                                  borderBottom: '1px solid #e0e0e0',
                                }}
                              >
                                <Checkbox
                                  checked={isCategoryFullySelected}
                                  indeterminate={isCategoryPartiallySelected}
                                  onChange={() =>
                                    handleToggleCategorySelection(catId, date)
                                  }
                                  size="small"
                                  sx={{
                                    p: '4px',
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  fontWeight="600"
                                  sx={{
                                    color: '#424242',
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                  }}
                                >
                                  {catData.name}
                                </Typography>
                              </Box>

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
                                            isSelected
                                              ? 'contained'
                                              : 'outlined'
                                          }
                                          color={
                                            isSelected ? 'primary' : 'inherit'
                                          }
                                          sx={{
                                            px: { xs: 0.8, sm: 1.2 },
                                            py: { xs: 0.4, sm: 0.6 },
                                            minWidth: {
                                              xs: '36px',
                                              sm: '48px',
                                            },
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
                                            color: isSelected
                                              ? 'white'
                                              : '#424242',
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
                        },
                      )}
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Box>
  );
};

export default RoomAvailabilityStep;
