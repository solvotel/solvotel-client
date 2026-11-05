'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import EventIcon from '@mui/icons-material/Event';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { GetDataList, UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { GetTodaysDate } from '@/utils/DateFetcher';

const dateKey = (date) => String(date || '').split('T')[0];

const formatCleanedAt = (timeStamp) => {
  const date = new Date(timeStamp);
  if (Number.isNaN(date.getTime())) return '';

  const datePart = `${String(date.getDate()).padStart(2, '0')}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}-${date.getFullYear()}`;
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart} ${timePart}`;
};

const roomMatches = (tokenRoom, roomNo) =>
  String(tokenRoom ?? '') === String(roomNo ?? '');

const getRoomBookingStatus = (booking, roomToken, selectedDate) => {
  if (booking.booking_status === 'Blocked') return 'Blocked';

  if (
    dateKey(roomToken.out_date) === selectedDate &&
    (roomToken.checked_out === true || booking.checked_out === true)
  ) {
    return 'Checked Out';
  }

  if (dateKey(roomToken.out_date) === selectedDate) return 'Check Out';

  if (roomToken.checked_in === true && roomToken.checked_out !== true) {
    return 'Checked In';
  }

  return booking.booking_status || 'Confirmed';
};

const statusColor = {
  Available: 'success',
  'Checked In': 'info',
  'Check Out': 'warning',
  'Checked Out': 'default',
  Confirmed: 'warning',
  Blocked: 'error',
  'Needs Cleaning': 'error',
};

const HousekeepingDashboard = () => {
  const { auth } = useAuth();
  const [selectedDate, setSelectedDate] = useState(GetTodaysDate().dateString);
  const [housekeepingFilter, setHousekeepingFilter] = useState('all');
  const [cleaningTaskKey, setCleaningTaskKey] = useState('');
  const rooms = GetDataList({ auth, endPoint: 'rooms' });
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });

  const roomCards = useMemo(
    () =>
      (rooms || []).map((room) => {
        const bookingInfo = (bookings || [])
          .filter((booking) => booking.booking_status !== 'Cancelled')
          .flatMap((booking) =>
            (booking.room_tokens || [])
              .filter((token) => roomMatches(token.room, room.room_no))
              .map((token) => ({ booking, token })),
          )
          .filter(({ booking, token }) => {
            const inDate = dateKey(token.in_date);
            const outDate = dateKey(token.out_date);
            return (
              (inDate <= selectedDate && selectedDate < outDate) ||
              outDate === selectedDate
            );
          })
          .sort((a, b) => {
            const aIsActive =
              dateKey(a.token.in_date) <= selectedDate &&
              selectedDate < dateKey(a.token.out_date);
            const bIsActive =
              dateKey(b.token.in_date) <= selectedDate &&
              selectedDate < dateKey(b.token.out_date);
            return Number(bIsActive) - Number(aIsActive);
          })[0];

        const housekeepingInfo = (bookings || [])
          .filter((booking) => booking.booking_status !== 'Cancelled')
          .flatMap((booking) =>
            (booking.housekeeping_tokens || []).flatMap((token) => {
              if (!roomMatches(token.room, room.room_no)) return [];

              if (
                dateKey(token.out_date) === selectedDate &&
                (token.checked_out === true || booking.checked_out === true)
              ) {
                return [{ booking, token, isAfterCheckout: true }];
              }

              if (dateKey(token.date) === selectedDate) {
                return [{ booking, token, isAfterCheckout: false }];
              }

              return [];
            }),
          )
          .sort(
            (a, b) => Number(b.isAfterCheckout) - Number(a.isAfterCheckout),
          )[0];
        const housekeepingStatus = housekeepingInfo?.isAfterCheckout
          ? housekeepingInfo.token.after_checkout?.status || 'dirty'
          : housekeepingInfo?.token.status;
        const cleaningDetails = housekeepingInfo?.isAfterCheckout
          ? housekeepingInfo.token.after_checkout
          : housekeepingInfo?.token;

        const needsCheckoutCleaning =
          housekeepingInfo?.isAfterCheckout &&
          housekeepingStatus?.toLowerCase() === 'dirty';
        const isCheckedOut =
          housekeepingInfo?.isAfterCheckout &&
          housekeepingStatus?.toLowerCase() === 'clean';

        return {
          room,
          booking: bookingInfo?.booking,
          bookingStatus: housekeepingInfo?.isAfterCheckout
            ? needsCheckoutCleaning
              ? 'Needs Cleaning'
              : isCheckedOut
                ? 'Checked Out'
                : 'Needs Cleaning'
            : bookingInfo
              ? getRoomBookingStatus(
                  bookingInfo.booking,
                  bookingInfo.token,
                  selectedDate,
                )
              : 'Available',
          bookingStatusPriority: needsCheckoutCleaning ? 0 : 1,
          housekeepingBooking: housekeepingInfo?.booking,
          housekeepingToken: housekeepingInfo?.token,
          isAfterCheckout: housekeepingInfo?.isAfterCheckout || false,
          housekeepingStatus,
          cleaningDetails,
        };
      }).sort(
        (a, b) => a.bookingStatusPriority - b.bookingStatusPriority,
      ),
    [rooms, bookings, selectedDate],
  );

  const housekeepingCounts = useMemo(
    () =>
      roomCards.reduce(
        (counts, roomCard) => {
          const status = roomCard.housekeepingStatus?.toLowerCase();
          if (status === 'clean') counts.clean += 1;
          if (status !== 'clean' && roomCard.housekeepingToken) {
            counts.dirty += 1;
          }
          return counts;
        },
        { all: roomCards.length, dirty: 0, clean: 0 },
      ),
    [roomCards],
  );

  const filteredRoomCards = useMemo(
    () =>
      roomCards.filter((roomCard) => {
        if (housekeepingFilter === 'all') return true;
        const status = roomCard.housekeepingStatus?.toLowerCase();
        if (housekeepingFilter === 'clean') return status === 'clean';
        return Boolean(roomCard.housekeepingToken) && status !== 'clean';
      }),
    [roomCards, housekeepingFilter],
  );

  const roomsByFloor = useMemo(
    () =>
      filteredRoomCards.reduce((groups, roomCard) => {
        const floor = roomCard.room.floor || 'Unknown';
        if (!groups[floor]) groups[floor] = [];
        groups[floor].push(roomCard);
        return groups;
      }, {}),
    [filteredRoomCards],
  );

  const handleMarkClean = async (roomCard) => {
    const {
      housekeepingBooking,
      housekeepingToken,
      isAfterCheckout,
      room,
    } = roomCard;
    if (!housekeepingBooking?.documentId || !housekeepingToken) return;

    const taskKey = `${housekeepingBooking.documentId}-${room.room_no}-${selectedDate}`;
    setCleaningTaskKey(taskKey);
    try {
      const housekeepingTokens = (
        housekeepingBooking.housekeeping_tokens || []
      ).map((token) => {
        const matchesTask =
          roomMatches(token.room, room.room_no) &&
          (isAfterCheckout
            ? dateKey(token.out_date) === selectedDate &&
              token.checked_out === true
            : dateKey(token.date) === selectedDate);
        if (!matchesTask) return token;

        const now = new Date().toISOString();
        if (isAfterCheckout) {
          return {
            ...token,
            after_checkout: {
              ...token.after_checkout,
              status: 'clean',
              cleaned_by: auth?.user?.username || null,
              time_stamp: now,
            },
          };
        }

        return {
          ...token,
          status: 'clean',
          cleaned_by: auth?.user?.username || null,
          time_stamp: now,
        };
      });
      const hasMatchingToken = housekeepingTokens.some(
        (token) =>
          roomMatches(token.room, room.room_no) &&
          (isAfterCheckout
            ? dateKey(token.out_date) === selectedDate &&
              token.checked_out === true
            : dateKey(token.date) === selectedDate),
      );
      if (!hasMatchingToken) {
        throw new Error('The housekeeping task is no longer available.');
      }

      await UpdateData({
        auth,
        endPoint: 'room-bookings',
        id: housekeepingBooking.documentId,
        payload: {
          data: {
            housekeeping_tokens: housekeepingTokens,
            user_updated: auth?.user?.username,
          },
        },
      });

      SuccessToast(`Room ${room.room_no} marked clean.`);
    } catch (error) {
      console.error('Unable to update housekeeping status:', error);
      ErrorToast(`Unable to mark room ${room.room_no} as clean.`);
    } finally {
      setCleaningTaskKey('');
    }
  };

  if (!rooms || !bookings) return <Loader />;

  const bookingStatuses = [
    'Needs Cleaning',
    'Available',
    'Confirmed',
    'Checked In',
    'Check Out',
    'Checked Out',
    'Blocked',
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7fb', pb: 5 }}>
      <Box sx={{ px: 3, py: 2, bgcolor: 'white' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Housekeeping</Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          mx: { xs: 2, md: 3 },
          mt: 3,
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          color: 'white',
          background: 'linear-gradient(120deg, #1565c0, #42a5f5)',
          boxShadow: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ApartmentIcon fontSize="large" />
              <Typography variant="h4" fontWeight={700}>
                Housekeeping
              </Typography>
            </Stack>
            <Typography sx={{ mt: 1, opacity: 0.9 }}>
              Room occupancy and cleaning tasks for the selected date
            </Typography>
          </Box>
          <TextField
            type="date"
            label="Date"
            size="small"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <EventIcon sx={{ mr: 1, color: 'action.active' }} />
              ),
            }}
            sx={{
              minWidth: 210,
              bgcolor: 'white',
              borderRadius: 1,
            }}
          />
        </Stack>
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 3 }}
          aria-label="Booking status summary"
        >
          {bookingStatuses.map((status) => {
            const count = roomCards.filter(
              (card) => card.bookingStatus === status,
            ).length;
            return (
              <Chip
                key={status}
                label={`${status}: ${count}`}
                color={statusColor[status]}
                variant="filled"
              />
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, mt: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Rooms for {selectedDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredRoomCards.length} of {roomCards.length} rooms
            </Typography>
          </Box>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={housekeepingFilter}
            onChange={(_, value) => {
              if (value) setHousekeepingFilter(value);
            }}
            aria-label="Filter by housekeeping status"
          >
            <ToggleButton value="all">
              All ({housekeepingCounts.all})
            </ToggleButton>
            <ToggleButton value="dirty">
              Dirty ({housekeepingCounts.dirty})
            </ToggleButton>
            <ToggleButton value="clean">
              Clean ({housekeepingCounts.clean})
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {filteredRoomCards.length === 0 ? (
          <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No rooms match this housekeeping filter for the selected date.
            </Typography>
          </Card>
        ) : (
          Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
            <Box key={floor} sx={{ mb: 4 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <ApartmentIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Floor {floor}
                </Typography>
                <Chip size="small" label={`${floorRooms.length} rooms`} />
              </Stack>
              <Grid container spacing={2}>
                {floorRooms.map((roomCard) => {
                  const {
                    room,
                    booking,
                    bookingStatus,
                    housekeepingBooking,
                    housekeepingToken,
                    isAfterCheckout,
                    housekeepingStatus,
                    cleaningDetails,
                  } = roomCard;
                  const isClean = housekeepingStatus?.toLowerCase() === 'clean';
                  const taskKey = `${housekeepingBooking?.documentId}-${room.room_no}-${selectedDate}`;
                  const hasTask = Boolean(housekeepingToken);

                  return (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                      key={room.documentId || room.room_no}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          borderColor: isClean
                            ? 'success.light'
                            : hasTask
                              ? 'warning.light'
                              : 'divider',
                          boxShadow: '0 3px 14px rgba(20, 45, 80, 0.06)',
                          transition:
                            'transform 160ms ease, box-shadow 160ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={1}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <MeetingRoomIcon color="primary" />
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  Room {room.room_no}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {room.category?.name ||
                                    room.room_type ||
                                    'Room'}
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              size="small"
                              label={bookingStatus}
                              color={statusColor[bookingStatus] || 'default'}
                            />
                          </Stack>

                          <Stack spacing={1.25} sx={{ mt: 2, minHeight: 76 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Housekeeping
                              </Typography>
                              <Chip
                                size="small"
                                label={
                                  !hasTask
                                    ? 'No task'
                                    : isClean
                                      ? 'Clean'
                                      : 'Dirty'
                                }
                                color={
                                  !hasTask
                                    ? 'default'
                                    : isClean
                                      ? 'success'
                                      : 'warning'
                                }
                                variant={hasTask ? 'filled' : 'outlined'}
                              />
                            </Stack>
                            {isAfterCheckout && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                After checkout
                              </Typography>
                            )}
                            {/* {booking && (
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {booking.customer?.name || booking.booking_id}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {booking.booking_id || ''}
                                </Typography>
                              </Box>
                            )} */}
                            {isClean && (
                              <Box>
                                {cleaningDetails?.cleaned_by && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    color="text.secondary"
                                  >
                                    Cleaned by: {cleaningDetails.cleaned_by}
                                  </Typography>
                                )}
                                {cleaningDetails?.time_stamp && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    color="text.secondary"
                                  >
                                    Cleaned at:{' '}
                                    {formatCleanedAt(
                                      cleaningDetails.time_stamp,
                                    )}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Stack>

                          <Button
                            fullWidth
                            variant={isClean ? 'outlined' : 'contained'}
                            color="success"
                            startIcon={<CleaningServicesIcon />}
                            disabled={
                              !hasTask || isClean || cleaningTaskKey === taskKey
                            }
                            onClick={() => handleMarkClean(roomCard)}
                            sx={{ mt: 2, textTransform: 'none' }}
                          >
                            {cleaningTaskKey === taskKey
                              ? 'Saving...'
                              : isClean
                                ? 'Clean'
                                : 'Mark Clean'}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default HousekeepingDashboard;
