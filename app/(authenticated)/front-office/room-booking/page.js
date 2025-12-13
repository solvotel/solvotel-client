'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { useState, useMemo } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Login as LoginIcon, Logout as LogoutIcon } from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Loader } from '@/component/common';
import { useRouter } from 'next/navigation';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { color } from 'framer-motion';

const Page = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const data = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });

  const [search, setSearch] = useState('');

  // filter data by name
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!startDate) {
      return data;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return data.filter((booking) => {
      const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
      const checkin = booking.checkin_date
        ? new Date(booking.checkin_date)
        : null;
      const checkout = booking.checkout_date
        ? new Date(booking.checkout_date)
        : null;

      return (
        (createdAt && createdAt >= start && createdAt <= end) ||
        (checkin && checkin >= start && checkin <= end) ||
        (checkout && checkout >= start && checkout <= end)
      );
    });
  }, [data, startDate, endDate]);

  const getStatus = (booking) => {
    // Destructure for easier reading
    const { checked_in, checked_out, booking_status } = booking;

    if (!checked_in && !checked_out) {
      if (booking_status === 'Cancelled') {
        return { status: 'Cancelled', color: 'error' };
      } else if (booking_status === 'Blocked') {
        return { status: 'Blocked', color: 'warning' };
      } else {
        return { status: booking_status, color: 'primary' };
      }
    }

    if (checked_in && !checked_out) {
      return { status: 'Checked In', color: 'success' };
    }

    if (checked_in && checked_out) {
      return { status: 'Checked Out', color: 'error' };
    }

    // Optional fallback
    return { status: 'Unknown', color: 'default' };
  };

  if (!data) {
    <Loader />;
  }
  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Room Booking</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <TextField
                size="small"
                label="Start Date"
                variant="outlined"
                type="date"
                InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ mr: 1 }}
              />
              <TextField
                size="small"
                label="End Date"
                variant="outlined"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ mr: 1 }}
                InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
              />

              {startDate || endDate !== todaysDate ? (
                <Tooltip title="Reset Dates">
                  <IconButton
                    onClick={() => {
                      setStartDate('');
                      setEndDate(todaysDate);
                    }}
                    size="small"
                    color="error"
                    sx={{
                      borderRadius: '4px',
                      width: 40,
                      height: 40,
                    }}
                  >
                    <RestartAltIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              ) : (
                <></>
              )}
            </Box>

            <Button
              href="/front-office/room-booking/create-new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              New Booking
            </Button>
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    '#ID',
                    'Guest',
                    'Room No',
                    'Check In/Out',
                    'Booked On',
                    'No. Of Guest',
                    'Meal Plan',
                    'Notes',
                    'Status',
                    'Actions',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => {
                  let currentStatus = getStatus(row);

                  return (
                    <TableRow
                      key={row.documentId}
                      hover
                      onClick={() =>
                        router.push(
                          `/front-office/room-booking/${row.documentId}`
                        )
                      }
                      sx={{
                        cursor: 'pointer',
                        transition: '0.2s',
                        borderLeft: '4px solid transparent', // default transparent
                        '&:hover': {
                          borderLeft: (theme) =>
                            `4px solid ${theme.palette.primary.main}`,
                        },
                      }}
                    >
                      <TableCell>{row.booking_id}</TableCell>
                      <TableCell>
                        {row?.customer?.name}
                        <br />
                        {row?.customer?.mobile}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {row.rooms?.map((room, index) => (
                            <Chip
                              variant="filled"
                              color="primary"
                              key={index}
                              label={room.room_no}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                borderRadius: '50px',
                              }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <LoginIcon fontSize="small" color="success" />
                          {GetCustomDate(row.checkin_date)}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <LogoutIcon fontSize="small" color="error" />
                          {GetCustomDate(row.checkout_date)}
                        </div>
                      </TableCell>
                      <TableCell>{GetCustomDate(row.createdAt)}</TableCell>
                      <TableCell>
                        Adult: {row?.adult}
                        <br />
                        Child: {row?.children}
                      </TableCell>
                      <TableCell>{row.meal_plan}</TableCell>
                      <TableCell>{row.remarks}</TableCell>
                      <TableCell>
                        <Chip
                          label={currentStatus?.status}
                          color={currentStatus?.color}
                          size="small"
                        />
                      </TableCell>

                      {/* Stop row click for actions */}
                      <TableCell
                        sx={{ width: '50px' }}
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() =>
                              router.push(
                                `/front-office/room-booking/${row.documentId}`
                              )
                            }
                            size="small"
                            sx={{
                              borderRadius: '4px',
                              width: 32,
                              height: 32,
                              backgroundColor: (theme) =>
                                theme.palette.warning.main,
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: (theme) =>
                                  theme.palette.warning.dark,
                              },
                            }}
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No Booking found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default Page;
