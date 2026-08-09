'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { GetTodaysDate, isDateInRange } from '@/utils/DateFetcher';
import { Loader } from '@/component/common';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const statusConfig = [
  {
    key: 'available',
    label: 'Available',
    color: '#16a34a',
    bg: '#ecfdf5',
    chipBg: '#bbf7d0',
  },
  {
    key: 'checkedIn',
    label: 'Checked In',
    color: '#0ea5e9',
    bg: '#e0f2fe',
    chipBg: '#bae6fd',
  },
  {
    key: 'checkedOut',
    label: 'Checked Out',
    color: '#64748b',
    bg: '#f1f5f9',
    chipBg: '#cbd5e1',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    color: '#9333ea',
    bg: '#f5e8ff',
    chipBg: '#e9d5ff',
  },
  {
    key: 'blocked',
    label: 'Blocked',
    color: '#f59e0b',
    bg: '#fff7ed',
    chipBg: '#fed7aa',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    color: '#dc2626',
    bg: '#fee2e2',
    chipBg: '#fecaca',
  },
];

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DayBasedReportPage = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const [selectedDate, setSelectedDate] = useState(todaysDate);

  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });

  const reportData = useMemo(() => {
    const groups = Object.fromEntries(
      statusConfig.map((item) => [item.key, []]),
    );

    const occupiedRoomNos = new Set();

    bookings?.forEach((booking) => {
      booking.room_tokens?.forEach((token) => {
        const tokenInDate = token.in_date;
        const tokenOutDate = token.out_date;
        const tokenAppliesToDate = isDateInRange(
          selectedDate,
          tokenInDate,
          tokenOutDate,
        );

        if (!tokenAppliesToDate) return;

        const roomInfo = rooms?.find((room) => room.room_no === token.room);
        const record = {
          room_no: token.room,
          category: roomInfo?.category?.name || 'Uncategorized',
          bookingId: booking.booking_id || 'N/A',
          guestName: booking.customer?.name || 'N/A',
          status: '',
          documentId: booking.documentId,
        };

        occupiedRoomNos.add(token.room);

        if (booking.checked_out === true) {
          record.status = 'Checked Out';
          groups.checkedOut.push(record);
        } else if (booking.checked_in === true) {
          record.status = 'Checked In';
          groups.checkedIn.push(record);
        } else if (booking.booking_status === 'Blocked') {
          record.status = 'Blocked';
          groups.blocked.push(record);
        } else if (booking.booking_status === 'Cancelled') {
          record.status = 'Cancelled';
          groups.cancelled.push(record);
        } else if (booking.booking_status === 'Confirmed') {
          record.status = 'Confirmed';
          groups.confirmed.push(record);
        }
      });
    });

    const availableRooms =
      rooms
        ?.filter((room) => !occupiedRoomNos.has(room.room_no))
        .map((room) => ({
          room_no: room.room_no,
          category: room.category?.name || 'Uncategorized',
          bookingId: 'N/A',
          guestName: 'Available',
          status: 'Available',
        })) || [];

    groups.available.push(...availableRooms);

    return groups;
  }, [bookings, rooms, selectedDate]);

  const rows = useMemo(() => {
    return Object.entries(reportData)
      .flatMap(([key, items]) => items.map((item) => ({ ...item, key })))
      .sort((a, b) => a.room_no.localeCompare(b.room_no));
  }, [reportData]);

  const handlePrev = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(toInputDate(date));
  };

  const handleNext = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(toInputDate(date));
  };

  const selectedLabel = new Date(selectedDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  });

  if (!bookings || !rooms) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Paper
          elevation={3}
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, bgcolor: '#f8fafc' }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                📅 Day Based Room Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review room status for the selected date across all booking
                states.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <Button variant="outlined" onClick={handlePrev}>
                <ChevronLeftIcon /> Prev
              </Button>
              <TextField
                size="small"
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="outlined" onClick={handleNext}>
                Next <ChevronRightIcon />
              </Button>
            </Stack>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
            }}
          >
            <CalendarMonthIcon color="primary" />
            <Typography fontWeight={600}>
              Showing report for {selectedLabel}
            </Typography>
          </Paper>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statusConfig.map((item) => {
              const data = reportData[item.key] || [];
              return (
                <Grid key={item.key} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: item.bg,
                      borderLeft: `4px solid ${item.color}`,
                      height: '100%',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.label} ({data.length})
                    </Typography>
                    <Box
                      sx={{
                        mt: 1.2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.6,
                      }}
                    >
                      {data.length > 0 ? (
                        data.map((room) => (
                          <Chip
                            key={`${room.room_no}-${room.bookingId}`}
                            label={room.room_no}
                            size="small"
                            sx={{ bgcolor: item.chipBg, fontWeight: 600 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No rooms
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Room Detail List
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell>Room No</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Guest</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <TableRow
                      key={`${row.room_no}-${row.bookingId}-${row.status}`}
                      hover
                    >
                      <TableCell>{row.room_no}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            bgcolor:
                              statusConfig.find(
                                (item) => item.label === row.status,
                              )?.chipBg || '#e2e8f0',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {row.documentId ? (
                          <Link
                            href={`/front-office/room-booking/${row.documentId}`}
                            passHref
                          >
                            {row.bookingId}
                          </Link>
                        ) : (
                          row.bookingId
                        )}
                      </TableCell>
                      <TableCell>{row.guestName}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 3, color: 'text.secondary' }}
                    >
                      No room entries for this date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default DayBasedReportPage;
