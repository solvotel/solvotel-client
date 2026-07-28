'use client';

import { useMemo, useState } from 'react';
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
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const RoomTransferPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { auth } = useAuth();
  const [transferSelectionKeys, setTransferSelectionKeys] = useState(new Set());
  const [replacementAssignments, setReplacementAssignments] = useState({});
  const [loading, setLoading] = useState(false);

  const booking = GetSingleData({
    auth,
    endPoint: 'room-bookings',
    id: bookingId,
  });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });
  const allBookings = GetDataList({ auth, endPoint: 'room-bookings' });

  const bookingTokens = useMemo(
    () =>
      booking?.room_tokens
        ?.map((token) => ({
          ...token,
          key: `${token.room}-${token.in_date}-${token.out_date}`,
        }))
        .sort((a, b) => {
          if (a.in_date !== b.in_date)
            return a.in_date.localeCompare(b.in_date);
          if (a.room !== b.room) return a.room.localeCompare(b.room);
          return 0;
        }) || [],
    [booking?.room_tokens],
  );

  const getTokenKey = (token) => token.key;

  const getTokenRange = (token) => ({
    inDate: dayjs(token.in_date),
    outDate: dayjs(token.out_date),
  });

  const rangesOverlap = (a, b) =>
    a.inDate.isBefore(b.outDate, 'day') && b.inDate.isBefore(a.outDate, 'day');

  const getOccupiedRoomNosForToken = (token) => {
    const occupied = new Set();
    const tokenRange = getTokenRange(token);

    allBookings?.forEach((otherBooking) => {
      if (
        otherBooking?.documentId === booking?.documentId ||
        otherBooking?.checked_out === true ||
        otherBooking?.booking_status === 'Cancelled'
      ) {
        return;
      }

      otherBooking?.room_tokens?.forEach((otherToken) => {
        const otherRange = getTokenRange(otherToken);
        if (!rangesOverlap(tokenRange, otherRange)) return;

        const shouldBlock =
          otherBooking.booking_status === 'Blocked' ||
          (otherBooking.booking_status === 'Confirmed' &&
            otherBooking.checked_out !== true);

        if (shouldBlock) {
          occupied.add(otherToken.room);
        }
      });
    });

    booking?.room_tokens?.forEach((otherToken) => {
      const otherRange = getTokenRange(otherToken);
      if (!rangesOverlap(tokenRange, otherRange)) return;
      if (
        otherToken.room === token.room &&
        otherToken.in_date === token.in_date &&
        otherToken.out_date === token.out_date
      ) {
        return;
      }
      occupied.add(otherToken.room);
    });

    return occupied;
  };

  const getAvailableReplacementRoomsForToken = (token) => {
    const occupied = getOccupiedRoomNosForToken(token);
    return rooms?.filter(
      (room) => room.room_no !== token.room && !occupied.has(room.room_no),
    );
  };

  const handleToggleTokenSelection = (token) => {
    const key = getTokenKey(token);
    setTransferSelectionKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setReplacementAssignments((assignments) => {
          const nextAssignments = { ...assignments };
          delete nextAssignments[key];
          return nextAssignments;
        });
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAssignReplacement = (token, room) => {
    const key = getTokenKey(token);
    setTransferSelectionKeys((prev) => new Set(prev).add(key));
    setReplacementAssignments((prev) => ({
      ...prev,
      [key]: {
        room_no: room.room_no,
        roomDocumentId: room.documentId,
      },
    }));
  };

  const getReplacementForToken = (token) =>
    replacementAssignments[getTokenKey(token)] || null;

  const buildRoomTokens = () =>
    booking?.room_tokens?.map((token) => {
      const replacement = getReplacementForToken(token);
      if (!replacement) return token;
      return {
        ...token,
        room: replacement.room_no,
      };
    }) || [];

  const handleSave = async () => {
    if (!booking?.documentId) return;

    const selectedKeys = Array.from(transferSelectionKeys);
    if (!selectedKeys.length) {
      ErrorToast('Please select at least one room to transfer.');
      return;
    }

    const missingReplacement = selectedKeys.some(
      (key) => !replacementAssignments[key],
    );
    if (missingReplacement) {
      ErrorToast(
        'Please assign a replacement room for every selected transfer.',
      );
      return;
    }

    try {
      setLoading(true);
      const roomTokens = buildRoomTokens();
      const uniqueRoomIds = [
        ...new Set(
          roomTokens
            .map(
              (token) =>
                rooms.find((room) => room.room_no === token.room)?.documentId,
            )
            .filter(Boolean),
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
                <SwapHorizIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Edit Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                First select the token(s) you want to edit, then assign an
                available replacement room for each one.
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
            {bookingTokens.map((token, index) => {
              const availableReplacements =
                getAvailableReplacementRoomsForToken(token);
              const replacement = getReplacementForToken(token);
              const selected = transferSelectionKeys.has(getTokenKey(token));

              return (
                <motion.div
                  key={token.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', md: 'center' }}
                          spacing={2}
                        >
                          <Box>
                            <Typography fontWeight={700}>
                              Room {token.room}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(token.in_date).format('DD MMM YYYY')} to{' '}
                              {dayjs(token.out_date).format('DD MMM YYYY')}
                            </Typography>
                          </Box>
                          <Button
                            variant={selected ? 'contained' : 'outlined'}
                            onClick={() => handleToggleTokenSelection(token)}
                          >
                            {selected
                              ? 'Selected for transfer'
                              : 'Select to transfer'}
                          </Button>
                        </Stack>

                        {selected && (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              sx={{ mb: 1 }}
                            >
                              Assign replacement room
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {availableReplacements.length > 0 ? (
                                availableReplacements.map((room) => {
                                  const assigned =
                                    replacement?.room_no === room.room_no;
                                  return (
                                    <Button
                                      key={`${room.documentId}-${token.key}`}
                                      variant={
                                        assigned ? 'contained' : 'outlined'
                                      }
                                      size="small"
                                      onClick={() =>
                                        handleAssignReplacement(token, room)
                                      }
                                    >
                                      {room.room_no}
                                    </Button>
                                  );
                                })
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No available replacement rooms for this range.
                                </Typography>
                              )}
                            </Stack>

                            {replacement && (
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={`Replacement: ${replacement.room_no}`}
                                  size="small"
                                  color="success"
                                />
                              </Box>
                            )}
                          </Box>
                        )}
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

export default RoomTransferPage;
