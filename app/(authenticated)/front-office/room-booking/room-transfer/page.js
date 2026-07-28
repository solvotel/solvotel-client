'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context';
import { GetDataList, GetSingleData, UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { auth } = useAuth();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const booking = GetSingleData({
    auth,
    endPoint: 'room-bookings',
    id: bookingId,
  });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });
  const categories = GetDataList({ auth, endPoint: 'room-categories' });
  const allBookings = GetDataList({ auth, endPoint: 'room-bookings' });

  const dateRange = useMemo(() => {
    if (!booking?.checkin_date || !booking?.checkout_date) return [];

    const dates = [];
    let current = dayjs(booking.checkin_date);
    const checkout = dayjs(booking.checkout_date);

    while (current.isBefore(checkout, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    return dates;
  }, [booking?.checkin_date, booking?.checkout_date]);

  const initializeSelectedRooms = () => {
    if (!booking?.room_tokens?.length || !rooms?.length) return [];

    const selections = [];

    booking.room_tokens.forEach((token) => {
      const inDate = dayjs(token.in_date);
      const outDate = dayjs(token.out_date);
      let current = inDate;

      while (current.isBefore(outDate, 'day')) {
        const dateString = current.format('YYYY-MM-DD');
        selections.push({
          date: dateString,
          room_no: token.room,
          roomDocumentId: rooms.find((room) => room.room_no === token.room)
            ?.documentId,
        });
        current = current.add(1, 'day');
      }
    });

    return selections;
  };

  useEffect(() => {
    if (!booking?.documentId || selectedRooms.length > 0) return;
    setSelectedRooms(initializeSelectedRooms());
  }, [booking?.documentId, selectedRooms.length, booking?.room_tokens, rooms]);

  const roomsByCategory = useMemo(() => {
    if (!rooms || !categories) return {};

    const grouped = {};
    categories.forEach((cat) => {
      grouped[cat.documentId] = {
        name: cat.name,
        rooms: rooms.filter(
          (room) => room.category?.documentId === cat.documentId,
        ),
      };
    });
    return grouped;
  }, [rooms, categories]);

  const getOccupiedRoomNosForDate = (date) => {
    const occupied = new Set();
    const selectedDate = dayjs(date);

    allBookings?.forEach((otherBooking) => {
      if (
        otherBooking?.documentId === booking?.documentId ||
        otherBooking?.checked_out === true ||
        otherBooking?.booking_status === 'Cancelled'
      ) {
        return;
      }

      otherBooking?.room_tokens?.forEach((token) => {
        const inDate = dayjs(token.in_date);
        const outDate = dayjs(token.out_date);
        const occupiedOnDate =
          selectedDate.isSame(inDate, 'day') ||
          (selectedDate.isAfter(inDate, 'day') &&
            selectedDate.isBefore(outDate, 'day'));

        if (!occupiedOnDate) return;

        const shouldBlock =
          otherBooking.booking_status === 'Blocked' ||
          (otherBooking.booking_status === 'Confirmed' &&
            otherBooking.checked_out !== true);

        if (shouldBlock) {
          occupied.add(token.room);
        }
      });
    });

    return occupied;
  };

  const getAvailableRoomsForDate = (date) => {
    const occupied = getOccupiedRoomNosForDate(date);
    return Object.values(roomsByCategory).flatMap((catData) =>
      catData.rooms.filter((room) => !occupied.has(room.room_no)),
    );
  };

  const getCurrentSelectionForDate = (date) => {
    return selectedRooms.find((item) => item.date === date);
  };

  const handleSelectRoomForDate = (date, room) => {
    setSelectedRooms((prev) => {
      const existing = prev.find((item) => item.date === date);
      if (existing && existing.room_no === room.room_no) {
        return prev.filter((item) => item.date !== date);
      }
      return prev
        .filter((item) => item.date !== date)
        .concat({
          date,
          room_no: room.room_no,
          roomDocumentId: room.documentId,
        });
    });
  };

  const buildRoomTokens = () => {
    const grouped = selectedRooms.reduce((acc, selection) => {
      const roomKey = selection.room_no;
      if (!acc[roomKey]) acc[roomKey] = [];
      acc[roomKey].push(selection.date);
      return acc;
    }, {});

    const tokens = [];

    Object.entries(grouped).forEach(([roomNo, dates]) => {
      const sortedDates = [...new Set(dates)].sort();
      if (!sortedDates.length) return;

      let currentBlock = [sortedDates[0]];

      const pushToken = (blockDates) => {
        const in_date = blockDates[0];
        const outDateObj = new Date(blockDates[blockDates.length - 1]);
        outDateObj.setDate(outDateObj.getDate() + 1);
        const out_date = outDateObj.toISOString().split('T')[0];
        const days = blockDates.length;
        const currentRoom = rooms?.find((room) => room.room_no === roomNo);
        const category = currentRoom?.category;
        const rate = currentRoom?.rate ?? category?.tariff ?? 0;
        const gst = currentRoom?.gst ?? category?.gst ?? 0;

        tokens.push({
          room: roomNo,
          hsn: category?.hsn || '',
          item: category?.name || 'Room',
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
        if ((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) === 1) {
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

  const handleSave = async () => {
    if (!booking?.documentId) return;

    if (selectedRooms.length === 0) {
      ErrorToast('Please select at least one room for the booking.');
      return;
    }

    try {
      setLoading(true);
      const roomTokens = buildRoomTokens();
      const uniqueRoomIds = [
        ...new Set(
          selectedRooms.map((item) => item.roomDocumentId).filter(Boolean),
        ),
      ];

      await UpdateData({
        auth,
        endPoint: 'room-bookings',
        id: booking.documentId,
        payload: {
          data: {
            room_tokens: roomTokens,
            rooms: uniqueRoomIds,
            user_updated: auth?.user?.username || '',
          },
        },
      });

      SuccessToast('Room transfer updated successfully.');
      router.push(`/front-office/room-booking/${booking.documentId}`);
    } catch (err) {
      console.error(err);
      ErrorToast('Unable to update room transfer.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking || !rooms || !allBookings) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                <SwapHorizIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Room
                Transfer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review the current room assignment and move the booking to an
                available room for the selected dates.
              </Typography>
            </Box>
            <Chip
              icon={<CalendarMonthIcon />}
              label={booking?.booking_id || 'Booking'}
              color="primary"
              variant="outlined"
            />
          </Stack>

          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'white' }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Booking Range
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs(booking?.checkin_date).format('DD MMM YYYY')} to{' '}
              {dayjs(booking?.checkout_date).format('DD MMM YYYY')}
            </Typography>
          </Paper>

          <AnimatePresence mode="popLayout">
            {dateRange.map((date, index) => {
              const selection = getCurrentSelectionForDate(date);
              const availableRooms = getAvailableRoomsForDate(date);
              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={2}
                      >
                        <Box>
                          <Typography fontWeight={700}>
                            {dayjs(date).format('ddd, DD MMM YYYY')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current room: {selection?.room_no || 'Not selected'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {availableRooms.length > 0 ? (
                            availableRooms.map((room) => {
                              const isSelected =
                                selection?.room_no === room.room_no;
                              return (
                                <Button
                                  key={`${room.documentId}-${date}`}
                                  variant={
                                    isSelected ? 'contained' : 'outlined'
                                  }
                                  size="small"
                                  onClick={() =>
                                    handleSelectRoomForDate(date, room)
                                  }
                                  sx={{ borderRadius: 2 }}
                                >
                                  {room.room_no}
                                </Button>
                              );
                            })
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No available rooms for this date.
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <Divider sx={{ my: 2 }} />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            <Button variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? 'Updating...' : 'Update Rooms'}
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Page;
