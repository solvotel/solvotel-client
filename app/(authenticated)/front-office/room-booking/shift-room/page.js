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
  Avatar,
  IconButton,
  Tooltip,
  alpha,
  Grid,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import BedIcon from '@mui/icons-material/Bed';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HotelIcon from '@mui/icons-material/Hotel';
import CloseIcon from '@mui/icons-material/Close';

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

  const getReplacementRoomsForDate = (date, excludeRowKey = null) => {
    const replacedRooms = new Set();

    expandedBookingDays.forEach((row) => {
      if (row.date === date && row.key !== excludeRowKey) {
        const replacement = replacementAssignments[row.key];
        if (replacement) {
          replacedRooms.add(replacement.room_no);
        }
      }
    });

    return replacedRooms;
  };

  const getAvailableRoomsForDate = (date, currentRoom, rowKey) => {
    const occupied = getOccupiedRoomNosForDate(date, rowKey);
    const replacedRoomsForDate = getReplacementRoomsForDate(date, rowKey);
    return rooms?.filter(
      (room) =>
        !occupied.has(room.room_no) && !replacedRoomsForDate.has(room.room_no),
    );
  };

  const getRoomTokenDetailsFromRoom = (room) => {
    const category = room.category || {};

    return {
      item: category.name || room.item || room.room_type || 'Room',
    };
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
    const replacement = replacementAssignments[row.key];

    if (replacement && replacement.room_no === room.room_no) {
      setReplacementAssignments((prev) => {
        const updated = { ...prev };
        delete updated[row.key];
        return updated;
      });
      return;
    }

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
      const item = replacement?.item ?? row.item;

      const rate = row.rate;
      const gst = row.gst;
      const hsn = row.hsn;
      const amount = row.amount ?? row.perDayAmount;

      const date = dayjs(row.date);

      const baseToken = {
        room,
        rate,
        gst,
        item,
        hsn,
        in_date: row.date,
        out_date: date.add(1, 'day').format('YYYY-MM-DD'),
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
        addToken(baseToken);
        return;
      }

      const lastToken = mergedTokens[mergedTokens.length - 1];
      const lastOutDate = dayjs(lastToken.out_date);

      if (
        lastToken.room === room &&
        lastToken.item === item &&
        date.isSame(lastOutDate, 'day')
      ) {
        lastToken.out_date = date.add(1, 'day').format('YYYY-MM-DD');

        lastToken.amount = (lastToken.amount || 0) + amount;

        lastToken.days = dayjs(lastToken.out_date).diff(
          dayjs(lastToken.in_date),
          'day',
        );

        lastToken.id = `${lastToken.room}-${lastToken.in_date}-${lastToken.out_date}`;
      } else {
        addToken(baseToken);
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
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: 'linear-gradient(145deg, #f6f9fc 0%, #eef3f8 100%)',
        minHeight: '100vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 44,
                  height: 44,
                  boxShadow: '0 4px 12px rgba(25,118,210,0.25)',
                }}
              >
                <SwapHorizIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Shift Room
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  Drag & drop or tap to reassign rooms
                </Typography>
              </Box>
            </Stack>
            <Chip
              icon={<HotelIcon />}
              label={booking?.booking_id || 'Booking'}
              color="primary"
              sx={{
                fontWeight: 600,
                px: 1.5,
                py: 2.5,
                borderRadius: 2,
                // background: (theme) => alpha(theme.palette.primary.main, 0.08),
                border: '1px solid',
                borderColor: 'primary.main',
              }}
            />
          </Stack>

          {/* Booking Range & Available Rooms */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 3,
                borderColor: 'divider',
                background: 'white',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <EventNoteIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Stay Period
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {dayjs(booking?.checkin_date).format('DD MMM YYYY')}
                <span style={{ margin: '0 8px' }}>→</span>
                {dayjs(booking?.checkout_date).format('DD MMM YYYY')}
              </Typography>
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={0.75}
                sx={{ mt: 1.5 }}
              >
                {bookingTokens.map((token) => (
                  <Chip
                    key={token.key}
                    size="small"
                    icon={<BedIcon sx={{ fontSize: 14 }} />}
                    label={`${token.room}  •  ${dayjs(token.in_date).format('DD MMM')} – ${dayjs(token.out_date).format('DD MMM')}`}
                    sx={{
                      borderRadius: 1.5,
                      background: (theme) =>
                        alpha(theme.palette.info.main, 0.1),
                      border: '1px solid',
                      borderColor: 'info.light',
                    }}
                  />
                ))}
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 3,
                borderColor: 'divider',
                background: 'white',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <CheckCircleIcon fontSize="small" color="success" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Available Rooms
                </Typography>
                <Chip
                  label={availableRoomsForBookingRange?.length || 0}
                  size="small"
                  sx={{ ml: 'auto', fontWeight: 700, height: 20 }}
                />
              </Stack>
              {availableRoomsForBookingRange?.length > 0 ? (
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {availableRoomsForBookingRange.map((room) => (
                    <Chip
                      key={room.documentId}
                      label={room.room_no}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No available rooms for this period
                </Typography>
              )}
            </Paper>
          </Stack>

          {/* Room Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {expandedBookingDays.map((row, index) => {
              const availableRooms = getAvailableRoomsForDate(
                row.date,
                row.room,
                row.key,
              );
              const replacement = getReplacementForRow(row);
              const isChanged = !!replacement;

              return (
                <Grid size={{ xs: 12, md: 6 }} key={row.key}>
                  <Card
                    sx={{
                      mb: 1.5,
                      borderRadius: 3,
                      transition: 'all 0.2s',
                      border: '1px solid',
                      borderColor: isChanged ? 'success.light' : 'divider',
                      boxShadow: isChanged
                        ? '0 4px 16px rgba(46,125,50,0.12)'
                        : 'none',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1.5}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: isChanged ? 'success.light' : 'grey.100',
                              color: isChanged
                                ? 'success.dark'
                                : 'text.secondary',
                            }}
                          >
                            {dayjs(row.date).format('DD')}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {dayjs(row.date).format('ddd, DD MMM YYYY')}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <BedIcon
                                sx={{ fontSize: 14, color: 'text.secondary' }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Current Room: <strong>{row.room}</strong>
                              </Typography>
                              {isChanged && (
                                <>
                                  <CircleIcon
                                    sx={{
                                      fontSize: 6,
                                      color: 'success.main',
                                      mx: 0.5,
                                    }}
                                  />
                                  <Chip
                                    label={`→ ${replacement.room_no}`}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      bgcolor: 'success.main',
                                      color: 'white',
                                      fontWeight: 600,
                                      '& .MuiChip-label': { px: 1, py: 0 },
                                    }}
                                  />
                                </>
                              )}
                            </Stack>
                          </Box>
                        </Stack>

                        {isChanged && (
                          <Tooltip title="Clear replacement">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setReplacementAssignments((prev) => {
                                  const updated = { ...prev };
                                  delete updated[row.key];
                                  return updated;
                                });
                              }}
                              sx={{
                                bgcolor: 'grey.100',
                                '&:hover': { bgcolor: 'grey.200' },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      <Box sx={{ mt: 1.5 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          Select alternative room:
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.75}>
                          {availableRooms
                            ?.filter((room) => room.room_no !== row.room)
                            .map((room) => {
                              const assigned =
                                replacement?.room_no === room.room_no;
                              return (
                                <Button
                                  key={`${room.documentId}-${row.key}`}
                                  variant={assigned ? 'contained' : 'outlined'}
                                  size="small"
                                  onClick={() =>
                                    handleAssignReplacement(row, room)
                                  }
                                  sx={{
                                    borderRadius: 2,
                                    minWidth: 52,
                                    px: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderColor: assigned
                                      ? 'success.main'
                                      : 'divider',
                                    bgcolor: assigned
                                      ? 'success.main'
                                      : 'transparent',
                                    color: assigned ? 'white' : 'text.primary',
                                    '&:hover': {
                                      bgcolor: assigned
                                        ? 'success.dark'
                                        : 'action.hover',
                                      borderColor: assigned
                                        ? 'success.dark'
                                        : 'success.main',
                                    },
                                  }}
                                >
                                  {room.room_no}
                                </Button>
                              );
                            })}
                          {availableRooms?.filter(
                            (room) => room.room_no !== row.room,
                          ).length === 0 && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: 13 }}
                            >
                              No other rooms available for this date
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Actions */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={() => router.back()}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                boxShadow: '0 6px 20px rgba(25,118,210,0.25)',
                '&:hover': {
                  boxShadow: '0 8px 28px rgba(25,118,210,0.35)',
                },
              }}
            >
              {loading ? 'Updating...' : 'Update Rooms'}
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default RoomTransferPage;
