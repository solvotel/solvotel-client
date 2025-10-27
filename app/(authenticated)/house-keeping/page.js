'use client';

import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  TextField,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { Loader } from '@/component/common';
import { useState } from 'react';

const Page = () => {
  const { auth } = useAuth();
  const rooms = GetDataList({ auth, endPoint: 'rooms' });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  if (!rooms) return <Loader />;

  // ✅ Check if room is available on a given date
  const isRoomAvailable = (room) => {
    if (!room.room_bookings || room.room_bookings.length === 0) return true;

    return !room.room_bookings.some((booking) => {
      const checkin = new Date(booking.checkin_date);
      const checkout = new Date(booking.checkout_date);
      const date = new Date(selectedDate);

      return (
        booking.checked_in === true &&
        booking.checked_out === false &&
        date >= checkin &&
        date <= checkout
      );
    });
  };

  // ✅ Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor || 'Unknown';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const totalRooms = rooms.length;

  return (
    <>
      {/* Breadcrumb */}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#f5f5f5' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Housekeeping</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header Stats */}
      <Box
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #42a5f5, #478ed1)',
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
          mt: 2,
          mx: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ApartmentIcon fontSize="large" />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Housekeeping Overview
            </Typography>
            <Typography>Total Rooms: {totalRooms}</Typography>
          </Box>
        </Box>

        {/* Date Picker */}
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputProps={{
            startAdornment: <EventIcon sx={{ mr: 1, color: 'gray' }} />,
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 2,
            minWidth: 200,
          }}
        />
      </Box>

      {/* Floors */}
      <Box sx={{ p: 3 }}>
        {Object.keys(roomsByFloor).map((floor) => {
          const floorRooms = roomsByFloor[floor];
          const availableCount = floorRooms.filter((room) =>
            isRoomAvailable(room)
          ).length;
          const occupiedCount = floorRooms.length - availableCount;

          return (
            <Box key={floor} sx={{ mb: 5 }}>
              {/* Floor Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                  flexWrap: 'wrap',
                }}
              >
                <ApartmentIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Floor {floor}
                </Typography>
                <Chip
                  label={`${floorRooms.length} Rooms`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`✅ ${availableCount} vacant`}
                  color="success"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`❌ ${occupiedCount} Occupied`}
                  color="error"
                  size="small"
                  variant="outlined"
                />
              </Box>

              {/* Rooms */}
              <Grid container spacing={3}>
                {floorRooms.map((room) => {
                  const available = isRoomAvailable(room);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={room.id}>
                      <Card
                        elevation={4}
                        sx={{
                          borderRadius: 3,
                          background:
                            'linear-gradient(135deg, #ffffff, #f1f8ff)',
                          transition: '0.3s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <MeetingRoomIcon color="secondary" />
                              <Typography variant="subtitle1" fontWeight="bold">
                                Room {room.room_no}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={available ? 'Vacant' : 'Occupied'}
                              color={available ? 'success' : 'error'}
                            />
                          </Box>

                          <Divider sx={{ my: 1 }} />

                          <Typography variant="body2" color="text.secondary">
                            Category:{' '}
                            <Chip
                              size="small"
                              label={room.category.name}
                              color="info"
                              variant="outlined"
                            />
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <GroupIcon fontSize="small" color="action" />
                            Adults: {room.category.base_adults} | Child:{' '}
                            {room.category.base_child}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default Page;
