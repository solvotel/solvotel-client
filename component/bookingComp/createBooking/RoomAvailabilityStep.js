'use client';

import React, { useState } from 'react';
import { GetDataList } from '@/utils/ApiFunctions';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Checkbox,
  Chip,
} from '@mui/material';
import { useAuth } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed,
  Hotel,
  Tag,
  Building,
  ArrowRight,
  CheckCircle,
  Users,
} from 'lucide-react';
import { CalculateDays } from '@/utils/CalculateDays';

// Animation variants
const modalAnimation = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};

const filterAnimation = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const cardAnimation = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const RoomAvailabilityStep = ({
  bookingDetails,
  selectedRooms,
  setSelectedRooms,
  roomTokens,
  setRoomTokens,
}) => {
  const { auth } = useAuth();
  const totalDays = CalculateDays({
    checkin: bookingDetails.checkin_date,
    checkout: bookingDetails.checkout_date,
  });
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [loading, setLoading] = useState(false);

  const categories = GetDataList({ auth, endPoint: 'room-categories' });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });

  // Check if a room is available for given bookingDetails
  const isRoomAvailable = (room, bookingDetails) => {
    const { checkin_date, checkout_date } = bookingDetails;
    if (!room.room_bookings || room.room_bookings.length === 0) return true;

    return !room.room_bookings.some((booking) => {
      return (
        (checkin_date >= booking.checkin_date &&
          checkin_date < booking.checkout_date) ||
        (checkout_date > booking.checkin_date &&
          checkout_date <= booking.checkout_date) ||
        (checkin_date <= booking.checkin_date &&
          checkout_date >= booking.checkout_date)
      );
    });
  };

  // Filter rooms based on selected category AND availability
  const filteredRooms = React.useMemo(() => {
    if (!rooms) return [];

    return rooms.filter((room) => {
      const categoryMatch =
        selectedCategory === 'all' ||
        room.category?.documentId === selectedCategory;
      const available = isRoomAvailable(room, bookingDetails);
      return categoryMatch && available;
    });
  }, [rooms, selectedCategory, bookingDetails]);

  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle room selection
  const handleRoomSelection = (room) => {
    const exists = selectedRooms.find((r) => r.documentId === room.documentId);
    if (exists) {
      setSelectedRooms(
        selectedRooms.filter((r) => r.documentId !== room.documentId)
      );
      setRoomTokens(roomTokens.filter((token) => token.room !== room.room_no));
    } else {
      const roomToAdd = rooms.find((r) => r.documentId === room.documentId);
      if (roomToAdd) {
        setSelectedRooms([...selectedRooms, roomToAdd]);
        setRoomTokens([
          ...roomTokens,
          {
            room: room.room_no,
            hsn: room?.category.hsn,
            item: room.category.name,
            days: totalDays,
            rate: room.category.tariff,
            gst: room.category.gst,
            amount: room.category.total * totalDays,
          },
        ]);
      }
    }
  };

  return (
    <>
      <Box>
        {/* Category Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={filterAnimation}
        >
          <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
            <Button
              variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleCategoryFilter('all')}
              startIcon={<Building size={16} />}
              sx={{
                textTransform: 'none',
                transition: 'all 0.5s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'scale(1.02)',
                },
              }}
            >
              All Rooms
            </Button>

            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.documentId
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => handleCategoryFilter(category.documentId)}
                startIcon={<Tag size={16} />}
                sx={{
                  textTransform: 'none',
                  transition: 'all 0.5s ease-in-out',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'scale(1.02)',
                  },
                }}
              >
                {category.name}
              </Button>
            ))}
          </Box>
        </motion.div>

        {/* Room Grid */}
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={2}
        >
          <AnimatePresence mode="popLayout">
            {filteredRooms?.map((room, index) => {
              const isSelected = selectedRooms.some(
                (r) => r.documentId === room.documentId
              );

              return (
                <motion.div
                  key={room.documentId}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover="hover"
                  variants={cardAnimation}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    onClick={() => handleRoomSelection(room)}
                    sx={{
                      cursor: 'pointer',
                      border: isSelected ? 2 : 1,
                      borderColor: isSelected ? 'primary.main' : 'grey.200',
                      boxShadow: isSelected ? 3 : 1,
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
                      overflow: 'visible',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'grey.50',
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1.5, position: 'relative' }}>
                      {/* Room Header */}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={0.5}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Bed size={20} color="#1976d2" />
                          </motion.div>
                          <Typography variant="h6" fontWeight="bold">
                            Room {room.room_no}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Room Details */}
                      <Box sx={{ space: 2 }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          color="grey.600"
                          sx={{
                            '&:hover': {
                              transform: 'translateX(4px)',
                              transition: 'transform 0.3s',
                            },
                          }}
                        >
                          <ArrowRight size={16} style={{ marginRight: 8 }} />
                          <Typography variant="body2">
                            Floor {room.floor}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                          }}
                        >
                          <CheckCircle size={20} color="#4caf50" />
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          bgcolor: 'grey.50',
          borderTop: 1,
          borderColor: 'grey.200',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Box display="flex" alignItems="center" gap={1} color="grey.600">
            <Users size={20} />
            <Typography variant="body1">
              {selectedRooms.length} rooms selected
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 3 }}>
            {selectedRooms.map((room) => (
              <Chip
                key={room?.documentId}
                label={`Room: ${room?.room_no}`}
                size="small"
                color="secondary"
              />
            ))}
          </Box>
        </motion.div>
      </Box>
    </>
  );
};

export default RoomAvailabilityStep;
