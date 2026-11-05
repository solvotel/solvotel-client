'use client';

import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import EventIcon from '@mui/icons-material/Event';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useAuth } from '@/context';
import { GetDataList, UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { GetTodaysDate } from '@/utils/DateFetcher';

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */

const dateKey = (date) => String(date || '').split('T')[0];

const shiftDate = (date, days) => {
  const shifted = new Date(`${dateKey(date)}T00:00:00`);
  shifted.setDate(shifted.getDate() + days);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(shifted.getDate()).padStart(2, '0')}`;
};

const formatDate = (date) => {
  const [year, month, day] = dateKey(date).split('-');
  return year && month && day ? `${day}-${month}-${year}` : '—';
};

const isFutureDate = (date) => dateKey(date) > GetTodaysDate().dateString;

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

const getRoomBookingStatus = (booking, housekeepingToken) => {
  if (booking.booking_status === 'Blocked') return 'Blocked';
  if (housekeepingToken?.checked_out === true) {
    return housekeepingToken.after_checkout?.status?.toLowerCase() === 'clean'
      ? 'Available'
      : 'Checked Out';
  }
  if (housekeepingToken?.checked_in === true) return 'Checked In';
  return booking.booking_status || 'Confirmed';
};

const statusColor = {
  Available: 'success',
  'Checked In': 'info',
  'Checked Out': 'default',
  Confirmed: 'warning',
  Blocked: 'error',
  'Needs Cleaning': 'error',
};

const statusTone = {
  Available: { fg: '#047857', bg: '#ecfdf5', dot: '#10b981' },
  'Checked In': { fg: '#0369a1', bg: '#eff6ff', dot: '#3b82f6' },
  'Checked Out': { fg: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
  Confirmed: { fg: '#b45309', bg: '#fffbeb', dot: '#f59e0b' },
  Blocked: { fg: '#b91c1c', bg: '#fef2f2', dot: '#ef4444' },
  'Needs Cleaning': { fg: '#b91c1c', bg: '#fef2f2', dot: '#ef4444' },
};

/* ---------------------------------------------------------------- */
/* Small presentational pieces                                       */
/* ---------------------------------------------------------------- */

const StatPill = ({ icon, label, value, tone = 'primary' }) => {
  const palette = {
    primary: { bg: alpha('#ffffff', 0.16), fg: '#fff' },
    success: { bg: alpha('#bbf7d0', 0.22), fg: '#f0fdf4' },
    warning: { bg: alpha('#fde68a', 0.22), fg: '#fffbeb' },
    error: { bg: alpha('#fecaca', 0.22), fg: '#fef2f2' },
    info: { bg: alpha('#bae6fd', 0.22), fg: '#f0f9ff' },
  }[tone];

  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{
        px: 1.75,
        py: 1,
        borderRadius: 3,
        bgcolor: palette.bg,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha('#fff', 0.18)}`,
      }}
    >
      <Box sx={{ color: palette.fg, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography
          variant="caption"
          sx={{ color: palette.fg, opacity: 0.85, lineHeight: 1 }}
        >
          {label}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: palette.fg, lineHeight: 1.15 }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

const StatusChip = ({ status, size = 'small' }) => {
  const tone = statusTone[status] || statusTone.Available;
  return (
    <Chip
      size={size}
      label={
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: tone.dot,
              boxShadow: `0 0 0 3px ${alpha(tone.dot, 0.18)}`,
            }}
          />
          <Typography
            component="span"
            variant="caption"
            fontWeight={600}
            sx={{ color: tone.fg }}
          >
            {status}
          </Typography>
        </Stack>
      }
      sx={{
        bgcolor: tone.bg,
        border: `1px solid ${alpha(tone.fg, 0.15)}`,
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  );
};

const HousekeepingBadge = ({ hasTask, isClean }) => {
  if (!hasTask) {
    return (
      <Chip
        size="small"
        variant="outlined"
        label="No task"
        sx={{ borderColor: 'divider', color: 'text.secondary' }}
      />
    );
  }
  return (
    <Chip
      size="small"
      icon={
        isClean ? (
          <CheckCircleRoundedIcon fontSize="small" />
        ) : (
          <WarningAmberRoundedIcon fontSize="small" />
        )
      }
      label={isClean ? 'Clean' : 'Dirty'}
      sx={{
        bgcolor: isClean ? '#ecfdf5' : '#fef2f2',
        color: isClean ? '#047857' : '#b91c1c',
        border: `1px solid ${isClean ? '#a7f3d0' : '#fecaca'}`,
        '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
        fontWeight: 600,
      }}
    />
  );
};

/* ---------------------------------------------------------------- */
/* Main component                                                    */
/* ---------------------------------------------------------------- */

const HousekeepingDashboard = () => {
  const { auth } = useAuth();
  const [selectedDate, setSelectedDate] = useState(GetTodaysDate().dateString);
  const [housekeepingFilter, setHousekeepingFilter] = useState('all');
  const [cleaningTaskKey, setCleaningTaskKey] = useState('');
  const [search, setSearch] = useState('');
  const rooms = GetDataList({ auth, endPoint: 'rooms' });
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });

  const roomCards = useMemo(
    () =>
      (rooms || [])
        .map((room) => {
          /* ---- Active booking for the selected date ---- */
          const activeBookingInfo = (bookings || [])
            .filter((booking) => booking.booking_status !== 'Cancelled')
            .flatMap((booking) =>
              (booking.room_tokens || [])
                .filter(
                  (token) =>
                    roomMatches(token.room, room.room_no) &&
                    token.checked_out !== true &&
                    booking.checked_out !== true,
                )
                .map((token) => ({ booking, token })),
            )
            .filter(({ token }) => {
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

          const hasActiveStay =
            activeBookingInfo &&
            activeBookingInfo.token.checked_out !== true &&
            activeBookingInfo.booking.checked_out !== true &&
            dateKey(activeBookingInfo.token.in_date) <= selectedDate &&
            selectedDate < dateKey(activeBookingInfo.token.out_date);

          /* ---- Checked-out info ---- */
          const checkedOutInfo = (bookings || [])
            .filter((booking) => booking.booking_status !== 'Cancelled')
            .flatMap((booking) =>
              (booking.room_tokens || [])
                .filter(
                  (token) =>
                    roomMatches(token.room, room.room_no) &&
                    dateKey(token.out_date) >= selectedDate &&
                    (token.checked_out === true ||
                      booking.checked_out === true),
                )
                .map((roomToken) => {
                  const housekeepingToken = (
                    booking.housekeeping_tokens || []
                  ).find(
                    (token) =>
                      roomMatches(token.room, room.room_no) &&
                      dateKey(token.out_date) === dateKey(roomToken.out_date),
                  );
                  return { booking, roomToken, housekeepingToken };
                }),
            )
            .sort((a, b) =>
              dateKey(b.roomToken.out_date).localeCompare(
                dateKey(a.roomToken.out_date),
              ),
            )[0];

          /* ---- Housekeeping info ---- */
          const housekeepingInfo = (bookings || [])
            .filter((booking) => booking.booking_status !== 'Cancelled')
            .flatMap((booking) =>
              (booking.housekeeping_tokens || []).flatMap((token) => {
                if (!roomMatches(token.room, room.room_no)) return [];
                if (dateKey(token.date) === selectedDate) {
                  return [{ booking, token, isAfterCheckout: false }];
                }
                return [];
              }),
            )
            .sort(
              (a, b) => Number(b.isAfterCheckout) - Number(a.isAfterCheckout),
            )[0];

          const activeBookingHousekeepingToken = activeBookingInfo
            ? (activeBookingInfo.booking.housekeeping_tokens || []).find(
                (token) =>
                  roomMatches(token.room, room.room_no) &&
                  (dateKey(token.date) === selectedDate ||
                    dateKey(token.out_date) === selectedDate),
              )
            : null;

          const checkedOutStatus =
            checkedOutInfo?.housekeepingToken?.after_checkout?.status ||
            'dirty';
          const hasPendingCheckoutCleaning =
            Boolean(checkedOutInfo) &&
            checkedOutStatus.toLowerCase() !== 'clean';
          const hasCheckedOut =
            Boolean(checkedOutInfo) &&
            (!hasActiveStay || hasPendingCheckoutCleaning);

          const selectedHousekeepingInfo = hasCheckedOut
            ? {
                booking: checkedOutInfo.booking,
                token: checkedOutInfo.housekeepingToken,
                isAfterCheckout: true,
              }
            : hasActiveStay
              ? activeBookingHousekeepingToken
                ? {
                    booking: activeBookingInfo.booking,
                    token: activeBookingHousekeepingToken,
                    isAfterCheckout: false,
                  }
                : null
              : housekeepingInfo;

          const housekeepingStatus = selectedHousekeepingInfo?.isAfterCheckout
            ? selectedHousekeepingInfo.token?.after_checkout?.status || 'dirty'
            : selectedHousekeepingInfo?.token?.status;

          const cleaningDetails = selectedHousekeepingInfo?.isAfterCheckout
            ? selectedHousekeepingInfo.token?.after_checkout
            : selectedHousekeepingInfo?.token;

          const housekeepingTaskDate = selectedHousekeepingInfo?.isAfterCheckout
            ? dateKey(
                selectedHousekeepingInfo.token?.out_date ||
                  checkedOutInfo.roomToken.out_date,
              )
            : selectedDate;

          const needsCheckoutCleaning =
            selectedHousekeepingInfo?.isAfterCheckout &&
            housekeepingStatus?.toLowerCase() === 'dirty';

          return {
            room,
            booking: hasCheckedOut
              ? checkedOutInfo.booking
              : activeBookingInfo?.booking,
            roomToken: hasCheckedOut
              ? checkedOutInfo.roomToken
              : activeBookingInfo?.token,
            bookingStatus: selectedHousekeepingInfo?.isAfterCheckout
              ? needsCheckoutCleaning
                ? 'Checked Out'
                : 'Available'
              : hasActiveStay
                ? getRoomBookingStatus(
                    activeBookingInfo.booking,
                    activeBookingHousekeepingToken,
                  )
                : activeBookingInfo &&
                    dateKey(activeBookingInfo.token.out_date) === selectedDate
                  ? getRoomBookingStatus(
                      activeBookingInfo.booking,
                      activeBookingHousekeepingToken,
                    )
                  : 'Available',
            bookingStatusPriority: needsCheckoutCleaning ? 0 : 1,
            housekeepingBooking: selectedHousekeepingInfo?.booking,
            housekeepingToken: selectedHousekeepingInfo?.token,
            isAfterCheckout: selectedHousekeepingInfo?.isAfterCheckout || false,
            housekeepingStatus,
            cleaningDetails,
            housekeepingTaskDate,
          };
        })
        .sort((a, b) => a.bookingStatusPriority - b.bookingStatusPriority),
    [rooms, bookings, selectedDate],
  );

  const housekeepingCounts = useMemo(
    () =>
      roomCards.reduce(
        (counts, roomCard) => {
          const status = roomCard.housekeepingStatus?.toLowerCase();
          if (status === 'clean') counts.clean += 1;
          if (status !== 'clean' && roomCard.housekeepingToken)
            counts.dirty += 1;
          return counts;
        },
        { all: roomCards.length, dirty: 0, clean: 0 },
      ),
    [roomCards],
  );

  const bookingCounts = useMemo(
    () =>
      roomCards.reduce((acc, card) => {
        acc[card.bookingStatus] = (acc[card.bookingStatus] || 0) + 1;
        return acc;
      }, {}),
    [roomCards],
  );

  const filteredRoomCards = useMemo(
    () =>
      roomCards.filter((roomCard) => {
        const matchesFilter =
          housekeepingFilter === 'all'
            ? true
            : housekeepingFilter === 'clean'
              ? roomCard.housekeepingStatus?.toLowerCase() === 'clean'
              : Boolean(roomCard.housekeepingToken) &&
                roomCard.housekeepingStatus?.toLowerCase() !== 'clean';

        if (!matchesFilter) return false;
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
          String(roomCard.room.room_no).toLowerCase().includes(q) ||
          String(roomCard.room.category?.name || roomCard.room.room_type || '')
            .toLowerCase()
            .includes(q)
        );
      }),
    [roomCards, housekeepingFilter, search],
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
      housekeepingTaskDate,
      room,
    } = roomCard;
    if (!housekeepingBooking?.documentId || !housekeepingToken) return;

    const taskKey = `${housekeepingBooking.documentId}-${room.room_no}-${housekeepingTaskDate}`;
    setCleaningTaskKey(taskKey);
    try {
      const housekeepingTokens = (
        housekeepingBooking.housekeeping_tokens || []
      ).map((token) => {
        const matchesTask =
          roomMatches(token.room, room.room_no) &&
          (isAfterCheckout
            ? dateKey(token.out_date) === housekeepingTaskDate
            : dateKey(token.date) === housekeepingTaskDate);
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
            ? dateKey(token.out_date) === housekeepingTaskDate
            : dateKey(token.date) === housekeepingTaskDate),
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

  /* ---------------------------------------------------------------- */
  /* Loading skeleton                                                  */
  /* ---------------------------------------------------------------- */

  if (!rooms || !bookings) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fc', p: 3 }}>
        <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4 }} />
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Skeleton variant="rounded" height={52} width={220} />
          <Skeleton variant="rounded" height={52} width={220} />
        </Stack>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton
                variant="rounded"
                height={260}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fc', pb: 6 }}>
      {/* ============================== Breadcrumb ============================== */}
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'wrap' } }}
        >
          <Link
            underline="hover"
            color="text.secondary"
            href="/dashboard"
            sx={{ fontWeight: 500, fontSize: 14 }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary" fontSize={14} fontWeight={600}>
            Housekeeping
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* ============================== Hero ============================== */}
      <Box sx={{ px: { xs: 2, md: 3 }, mt: 2 }}>
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 2.5, md: 4 },
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #2563eb 100%)',
            boxShadow: '0 20px 40px -20px rgba(30, 58, 138, 0.6)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -80,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(96,165,250,0.45) 0%, rgba(96,165,250,0) 70%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -120,
              left: -60,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(14,165,233,0.35) 0%, rgba(14,165,233,0) 70%)',
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', lg: 'center' }}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha('#fff', 0.14),
                    display: 'flex',
                  }}
                >
                  <ApartmentIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    letterSpacing={-0.5}
                    sx={{ lineHeight: 1.1 }}
                  >
                    Housekeeping
                  </Typography>
                  <Typography sx={{ opacity: 0.85, fontSize: 14 }}>
                    Room occupancy & cleaning tasks · {formatDate(selectedDate)}
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}
              >
                <StatPill
                  icon={<HomeWorkRoundedIcon fontSize="small" />}
                  label="Total rooms"
                  value={housekeepingCounts.all}
                  tone="info"
                />
                <StatPill
                  icon={<WarningAmberRoundedIcon fontSize="small" />}
                  label="Dirty"
                  value={housekeepingCounts.dirty}
                  tone="warning"
                />
                <StatPill
                  icon={<CheckCircleRoundedIcon fontSize="small" />}
                  label="Clean"
                  value={housekeepingCounts.clean}
                  tone="success"
                />
                <StatPill
                  icon={<MeetingRoomIcon fontSize="small" />}
                  label="Occupied"
                  value={
                    (bookingCounts['Checked In'] || 0) +
                    (bookingCounts['Confirmed'] || 0)
                  }
                />
              </Box>
            </Box>

            <Stack spacing={1.25} sx={{ width: { xs: '100%', lg: 'auto' } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  aria-label="Previous date"
                  onClick={() =>
                    setSelectedDate((current) => shiftDate(current, -1))
                  }
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 2.5,
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  <ArrowBackIosNewRoundedIcon fontSize="small" />
                </IconButton>
                <TextField
                  type="date"
                  size="small"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: { xs: 0, lg: 240 },
                    flex: 1,
                    bgcolor: '#fff',
                    borderRadius: 2.5,
                    '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
                    '& fieldset': { border: 'none' },
                  }}
                />
                <IconButton
                  aria-label="Next date"
                  onClick={() =>
                    setSelectedDate((current) => shiftDate(current, 1))
                  }
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 2.5,
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  <ArrowForwardIosRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['Available', 'Checked In', 'Confirmed', 'Blocked'].map(
                  (status) =>
                    bookingCounts[status] > 0 && (
                      <StatusChip key={status} status={status} size="small" />
                    ),
                )}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* ============================== Toolbar ============================== */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backdropFilter: 'blur(12px)',
          bgcolor: alpha('#f6f8fc', 0.85),
          borderBottom: '1px solid',
          borderColor: alpha('#0f172a', 0.06),
          mt: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          sx={{ px: { xs: 2, md: 3 }, py: 2 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Rooms overview
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing {filteredRoomCards.length} of {roomCards.length} rooms
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              size="small"
              placeholder="Search room / category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                minWidth: { xs: '100%', sm: 260 },
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={housekeepingFilter}
              onChange={(_, value) => value && setHousekeepingFilter(value)}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                p: 0.5,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '8px !important',
                  px: 2,
                  py: 0.75,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: '#0f172a',
                    color: '#fff',
                    '&:hover': { bgcolor: '#0f172a' },
                  },
                },
              }}
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
        </Stack>
      </Box>

      {/* ============================== Content ============================== */}
      <Box sx={{ px: { xs: 2, md: 3 }, mt: 3 }}>
        {filteredRoomCards.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: '#fff',
            }}
          >
            <AutoAwesomeIcon
              sx={{ fontSize: 44, color: 'primary.main', mb: 1.5 }}
            />
            <Typography variant="h6" fontWeight={700}>
              Nothing here yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No rooms match this filter for {formatDate(selectedDate)}.
            </Typography>
          </Paper>
        ) : (
          Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
            <Box key={floor} sx={{ mb: 4 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 22,
                    borderRadius: 2,
                    background:
                      'linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)',
                  }}
                />
                <Typography variant="h6" fontWeight={700}>
                  Floor {floor}
                </Typography>
                <Chip
                  size="small"
                  label={`${floorRooms.length} rooms`}
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Stack>

              <Grid container spacing={2}>
                {floorRooms.map((roomCard) => {
                  const {
                    room,
                    roomToken,
                    bookingStatus,
                    housekeepingBooking,
                    housekeepingToken,
                    isAfterCheckout,
                    housekeepingStatus,
                    cleaningDetails,
                    housekeepingTaskDate,
                  } = roomCard;
                  const isClean = housekeepingStatus?.toLowerCase() === 'clean';
                  const taskKey = `${housekeepingBooking?.documentId}-${room.room_no}-${housekeepingTaskDate}`;
                  const hasTask = Boolean(housekeepingToken);
                  const isFutureSelectedDate =
                    isFutureDate(housekeepingTaskDate);
                  const isBusy = cleaningTaskKey === taskKey;

                  const accent = isClean
                    ? '#10b981'
                    : hasTask
                      ? '#f59e0b'
                      : '#94a3b8';

                  return (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                      key={room.documentId || room.room_no}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          position: 'relative',
                          height: '100%',
                          borderRadius: 3.5,
                          border: '1px solid',
                          borderColor: alpha('#0f172a', 0.06),
                          bgcolor: '#fff',
                          overflow: 'hidden',
                          transition:
                            'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${accent} 0%, ${alpha(accent, 0.4)} 100%)`,
                          },
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 16px 32px -16px rgba(15,23,42,0.25)',
                            borderColor: alpha(accent, 0.35),
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.25 }}>
                          {/* Header */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={1}
                          >
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                            >
                              <Avatar
                                variant="rounded"
                                sx={{
                                  bgcolor: alpha(accent, 0.12),
                                  color: accent,
                                  width: 40,
                                  height: 40,
                                  fontWeight: 700,
                                  fontSize: 14,
                                }}
                              >
                                {room.room_no}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={700}
                                  lineHeight={1.2}
                                >
                                  Room {room.room_no}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block' }}
                                >
                                  {room.category?.name ||
                                    room.room_type ||
                                    'Standard'}
                                </Typography>
                              </Box>
                            </Stack>
                            <StatusChip status={bookingStatus} />
                          </Stack>

                          {/* Booking dates */}
                          {roomToken && (
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{
                                mt: 2,
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: '#f8fafc',
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Check-in
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  lineHeight={1.2}
                                >
                                  {formatDate(roomToken.in_date)}
                                </Typography>
                              </Box>
                              <Divider orientation="vertical" flexItem />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Check-out
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  lineHeight={1.2}
                                >
                                  {formatDate(roomToken.out_date)}
                                </Typography>
                              </Box>
                            </Stack>
                          )}

                          {/* Housekeeping section */}
                          <Stack spacing={1} sx={{ mt: 2, minHeight: 68 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                fontWeight={600}
                                color="text.secondary"
                                sx={{
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.6,
                                  fontSize: 11,
                                }}
                              >
                                Housekeeping
                              </Typography>
                              <HousekeepingBadge
                                hasTask={hasTask}
                                isClean={isClean}
                              />
                            </Stack>

                            {isAfterCheckout && (
                              <Chip
                                size="small"
                                label="After checkout"
                                sx={{
                                  alignSelf: 'flex-start',
                                  height: 20,
                                  bgcolor: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              />
                            )}

                            {isClean &&
                              (cleaningDetails?.cleaned_by ||
                                cleaningDetails?.time_stamp) && (
                                <Stack spacing={0.25}>
                                  {cleaningDetails?.cleaned_by && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      ✦ Cleaned by{' '}
                                      <b>{cleaningDetails.cleaned_by}</b>
                                    </Typography>
                                  )}
                                  {cleaningDetails?.time_stamp && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      🕒{' '}
                                      {formatCleanedAt(
                                        cleaningDetails.time_stamp,
                                      )}
                                    </Typography>
                                  )}
                                </Stack>
                              )}
                          </Stack>

                          {/* Action */}
                          <Button
                            fullWidth
                            disableElevation
                            variant={isClean ? 'outlined' : 'contained'}
                            startIcon={
                              isBusy ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : isClean ? (
                                <CheckCircleRoundedIcon />
                              ) : (
                                <CleaningServicesIcon />
                              )
                            }
                            disabled={
                              !hasTask ||
                              isClean ||
                              (!isAfterCheckout && isFutureSelectedDate) ||
                              isBusy
                            }
                            onClick={() => handleMarkClean(roomCard)}
                            sx={{
                              mt: 2,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              py: 0.9,
                              ...(isClean
                                ? {
                                    borderColor: '#a7f3d0',
                                    color: '#047857',
                                    '&:hover': {
                                      borderColor: '#10b981',
                                      bgcolor: '#ecfdf5',
                                    },
                                  }
                                : {
                                    bgcolor: '#0f172a',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#1e293b' },
                                    '&.Mui-disabled': {
                                      bgcolor: '#e2e8f0',
                                      color: '#94a3b8',
                                    },
                                  }),
                            }}
                          >
                            {isBusy
                              ? 'Saving…'
                              : isClean
                                ? 'Clean'
                                : 'Mark clean'}
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
