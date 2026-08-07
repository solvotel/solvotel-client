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

  const getDateKey = (token, date) =>
    `${token.key}-${dayjs(date).format('YYYY-MM-DD')}`;

  const getOccupiedRoomNosForDate = (date, rowKey) => {
    const occupied = new Set();
    const targetDate = dayjs(date);

    allBookings?.forEach((otherBooking) => {
      if (
        otherBooking?.checked_out === true ||
        otherBooking?.booking_status === 'Cancelled'
      ) {
        return;
      }

      otherBooking?.room_tokens?.forEach((otherToken) => {
        const otherRange = getTokenRange(otherToken);
        const dateMatches =
          targetDate.isBefore(otherRange.outDate, 'day') &&
          !targetDate.isBefore(otherRange.inDate, 'day');

        if (!dateMatches) return;

        const tokenKey = `${otherToken.room}-${otherToken.in_date}-${otherToken.out_date}`;
        if (
          otherBooking.documentId === booking?.documentId &&
          tokenKey === rowKey
        ) {
          return;
        }

        occupied.add(otherToken.room);
      });
    });

    return occupied;
  };

  const getAvailableRoomsForDate = (date, currentRoom, rowKey) => {
    const occupied = getOccupiedRoomNosForDate(date, rowKey);
    return rooms?.filter((room) => !occupied.has(room.room_no));
  };

  const getRoomTokenDetailsFromRoom = (room) => {
    const category = room.category || {};
    const item = category.name || room.item || room.room_type || 'Room';
    const rate = category.tariff ?? room.rate;
    const gst = category.gst ?? room.gst;
    const hsn = category.hsn ?? room.hsn;

    const replacement = {
      item,
      hsn,
    };

    if (rate !== undefined && rate !== null) replacement.rate = Number(rate);
    if (gst !== undefined && gst !== null) replacement.gst = Number(gst);
    if (replacement.rate !== undefined && replacement.gst !== undefined) {
      replacement.amount =
        replacement.rate + (replacement.rate * replacement.gst) / 100;
    }

    return replacement;
  };

  const expandedBookingDays = useMemo(() => {
    return bookingTokens.flatMap((token) => {
      const rows = [];
      let currentDate = dayjs(token.in_date);
      const endDate = dayjs(token.out_date);
      const tokenDays = dayjs(token.out_date).diff(dayjs(token.in_date), 'day');
      const perDayAmount = token.amount
        ? token.amount / Math.max(tokenDays, 1)
        : token.rate * (1 + (token.gst || 0) / 100);

      while (currentDate.isBefore(endDate, 'day')) {
        rows.push({
          key: getDateKey(token, currentDate),
          tokenKey: token.key,
          date: currentDate.format('YYYY-MM-DD'),
          room: token.room,
          rate: token.rate,
          gst: token.gst,
          item: token.item,
          hsn: token.hsn,
          invoice: token.invoice,
          perDayAmount,
          amount: perDayAmount,
        });
        currentDate = currentDate.add(1, 'day');
      }

      return rows;
    });
  }, [bookingTokens]);

  const availableRoomsForBookingRange = useMemo(() => {
    const occupied = new Set();
    const currentRooms = new Set(bookingTokens.map((token) => token.room));

    bookingTokens.forEach((token) => {
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
    });

    return rooms?.filter(
      (room) => !currentRooms.has(room.room_no) && !occupied.has(room.room_no),
    );
  }, [bookingTokens, allBookings, rooms]);

  const handleAssignReplacement = (row, room) => {
    const replacementMeta = getRoomTokenDetailsFromRoom(room);

    setReplacementAssignments((prev) => ({
      ...prev,
      [row.key]: {
        room_no: room.room_no,
        roomDocumentId: room.documentId,
        ...replacementMeta,
      },
    }));
  };

  const getReplacementForRow = (row) => replacementAssignments[row.key] || null;

  const buildRoomTokens = () => {
    const mergedTokens = [];

    expandedBookingDays.forEach((row) => {
      const replacement = getReplacementForRow(row);
      const room = replacement?.room_no || row.room;
      const date = dayjs(row.date);
      const rate = replacement?.rate ?? row.rate;
      const gst = replacement?.gst ?? row.gst;
      const item = replacement?.item ?? row.item;
      const hsn = replacement?.hsn ?? row.hsn;
      const amount = replacement?.amount ?? row.amount ?? row.perDayAmount;

      const baseToken = {
        room,
        rate,
        gst,
        item,
        hsn,
        invoice: row.invoice,
        amount,
      };

      const addToken = (tokenData) => {
        const in_date = tokenData.in_date;
        const out_date = tokenData.out_date;
        const days = dayjs(out_date).diff(dayjs(in_date), 'day');
        mergedTokens.push({
          ...tokenData,
          id: `${tokenData.room}-${in_date}-${out_date}`,
          days,
        });
      };

      if (!mergedTokens.length) {
        addToken({
          ...baseToken,
          in_date: date.format('YYYY-MM-DD'),
          out_date: date.add(1, 'day').format('YYYY-MM-DD'),
        });
        return;
      }

      const lastToken = mergedTokens[mergedTokens.length - 1];
      const lastOutDate = dayjs(lastToken.out_date);

      if (lastToken.room === room && date.isSame(lastOutDate, 'day')) {
        lastToken.out_date = date.add(1, 'day').format('YYYY-MM-DD');
        lastToken.amount = (lastToken.amount || 0) + amount;
        lastToken.days = dayjs(lastToken.out_date).diff(
          dayjs(lastToken.in_date),
          'day',
        );
        lastToken.id = `${lastToken.room}-${lastToken.in_date}-${lastToken.out_date}`;
      } else {
        addToken({
          ...baseToken,
          in_date: date.format('YYYY-MM-DD'),
          out_date: date.add(1, 'day').format('YYYY-MM-DD'),
        });
      }
    });

    return mergedTokens;
  };

  const handleSave = async () => {
    if (!booking?.documentId) return;

    const replacementKeys = Object.keys(replacementAssignments);
    if (!replacementKeys.length) {
      ErrorToast('Please select at least one room to transfer.');
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
                Shift Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                First select the token(s) you want to shift, then assign an
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

          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'white' }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Booked rooms in this date range
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {bookingTokens.map((token) => (
                    <Chip
                      key={token.key}
                      label={`Room ${token.room}: ${dayjs(token.in_date).format('DD MMM')} - ${dayjs(token.out_date).format('DD MMM')}`}
                      size="small"
                      color="info"
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Available rooms
                </Typography>
                {availableRoomsForBookingRange?.length > 0 ? (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {availableRoomsForBookingRange.map((room) => (
                      <Chip
                        key={room.documentId}
                        label={room.room_no}
                        size="small"
                        color="success"
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No available rooms found for the booked date range.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>

          <AnimatePresence mode="popLayout">
            {expandedBookingDays.map((row, index) => {
              const availableRooms = getAvailableRoomsForDate(
                row.date,
                row.room,
                row.key,
              );
              const replacement = getReplacementForRow(row);

              return (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
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
                              {dayjs(row.date).format('DD MMM YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Current room: {row.room}
                            </Typography>
                          </Box>
                          {replacement ? (
                            <Chip
                              label={`Replacement: ${replacement.room_no}`}
                              color="success"
                            />
                          ) : (
                            <Chip label="Keep current room" color="default" />
                          )}
                        </Stack>

                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{ mb: 1 }}
                          >
                            Select room for this date
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={1}>
                            {availableRooms
                              ?.filter((room) => room.room_no !== row.room)
                              .map((room) => {
                                const assigned =
                                  replacement?.room_no === room.room_no;
                                return (
                                  <Button
                                    key={`${room.documentId}-${row.key}`}
                                    variant={
                                      assigned ? 'contained' : 'outlined'
                                    }
                                    size="small"
                                    onClick={() =>
                                      handleAssignReplacement(row, room)
                                    }
                                  >
                                    {room.room_no}
                                  </Button>
                                );
                              })}
                          </Stack>

                          {availableRooms?.filter(
                            (room) => room.room_no !== row.room,
                          ).length === 0 && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              No alternative rooms available for this date.
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

export default RoomTransferPage;
