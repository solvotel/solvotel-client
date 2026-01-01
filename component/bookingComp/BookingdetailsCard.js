'use client';

import { Paper, Typography, Stack, Divider, Box, Chip } from '@mui/material';
import {
  CalendarMonth,
  Bed,
  Phone,
  People,
  Notes,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Cancel as CancelIcon,
  Email,
  SupervisedUserCircle,
} from '@mui/icons-material';
import { GetCustomDate } from '@/utils/DateFetcher';

const getStatusConfig = (status) => {
  switch (status) {
    case 'Confirmed':
      return {
        icon: <CheckCircleIcon />,
        color: 'success',
        label: 'Confirmed',
      };
    case 'Blocked':
      return {
        icon: <BlockIcon />,
        color: 'warning',
        label: 'Blocked',
      };
    case 'Cancelled':
      return {
        icon: <CancelIcon />,
        color: 'error',
        label: 'Cancelled',
      };
    default:
      return {
        icon: null,
        color: 'default',
        label: 'Booking',
      };
  }
};

export default function BookingDetailsCard({ booking }) {
  const statusConfig = getStatusConfig(booking?.booking_status);
  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        mb: 3,
        background: '#fff',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
          color: 'white',
          p: 2,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight="bold">
            Booking ID: {booking?.booking_id}
          </Typography>
          <Chip
            label={statusConfig.label}
            icon={statusConfig.icon}
            color={statusConfig.color}
            variant="outlined"
            sx={{
              fontWeight: 'bold',
              px: 1,
              backgroundColor: '#fff',
            }}
          />
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={1} divider={<Divider />}>
          {/* Dates & Contact */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonth color="success" />
              <Typography variant="body2">
                <strong>Check-In:</strong>{' '}
                {GetCustomDate(booking?.checkin_date)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonth color="error" />
              <Typography variant="body2">
                <strong>Check-Out:</strong>{' '}
                {GetCustomDate(booking?.checkout_date)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonth color="primary" />
              <Typography variant="body2">
                <strong>Booked On:</strong> {GetCustomDate(booking?.createdAt)}
              </Typography>
            </Stack>
          </Stack>

          {/* Booking Meta */}
          <Stack direction="row" flexWrap="wrap" spacing={2}>
            <Typography variant="body2">
              <strong>Booking Type:</strong> {booking?.booking_type || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Reference:</strong> {booking?.booking_referance || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Ref No:</strong> {booking?.reference_no || 'N/A'}
            </Typography>

            <Typography variant="body2">
              <strong>Meal Plan:</strong> {booking?.meal_plan}
            </Typography>
          </Stack>

          {/* Guests */}
          <Stack spacing={3} direction="row">
            <Stack direction="row" spacing={1} alignItems="center">
              <SupervisedUserCircle color="warning" />
              <Typography variant="body2">
                <strong>Name:</strong> {booking?.customer?.name}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Phone color="primary" />
              <Typography variant="body2">
                <strong>Phone:</strong> {booking?.customer?.mobile}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Email color="success" />
              <Typography variant="body2">
                <strong>Email:</strong> {booking?.customer?.email || 'N/A'}
              </Typography>
            </Stack>
          </Stack>

          {/* Notes */}
          <Stack spacing={3} direction="row">
            <Stack direction="row" spacing={1} alignItems="center">
              <People color="primary" />
              <Typography variant="body2">
                <strong>Guests:</strong> {booking?.adult} Adult,{' '}
                {booking?.children} Child
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Notes color="secondary" />
              <Typography variant="body2">
                <strong>Notes:</strong> {booking?.remarks || '—'}
              </Typography>
            </Stack>
          </Stack>

          {/* Rooms */}
          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              <Bed sx={{ mr: 1, verticalAlign: 'middle' }} /> Rooms Booked
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {booking?.rooms?.map((room, index) => (
                <Chip
                  key={index}
                  label={`${room?.room_no}`}
                  size="small"
                  color="primary"
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: '12px',
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
