'use client';
import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  Zoom,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  GuestStep,
  RoomAvailabilityStep,
  BookingDetailsStep,
  FinalPreviewStep,
} from '@/component/bookingComp/createBooking';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { GetTodaysDate } from '@/utils/DateFetcher';
import {
  CreateNewData,
  GetDataList,
  GetSingleData,
} from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { useRouter } from 'next/navigation';

const steps = [
  'Guest',
  'Booking Details',
  'Room Availability',
  'Preview & Checkout',
];

const generateNextBookingId = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return 'SOLV-1';
  }

  // Extract all numbers from booking_id like "INV-12" -> 12
  const numbers = bookings
    .map((inv) => parseInt(inv.booking_id?.replace('SOLV-', ''), 10))
    .filter((n) => !isNaN(n));

  const maxNumber = Math.max(...numbers);

  return `SOLV-${maxNumber + 1}`;
};

export default function BookingForm() {
  const router = useRouter();
  const { auth } = useAuth();
  const today = GetTodaysDate().dateString;
  const todaysdate = new Date(today);
  let tomorrow = new Date(today);
  tomorrow.setDate(todaysdate.getDate() + 1);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const hotelData = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Shared state
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    booking_type: 'FIT',
    booking_status: 'Confirmed',
    checkin_date: formatDate(todaysdate),
    checkout_date: formatDate(tomorrow),
  });

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomTokens, setRoomTokens] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({
    date: formatDate(todaysdate),
    mode: '',
    amount: 0,
    remark: '',
  });
  const [error, setError] = useState('');

  const validateStep = () => {
    setError(''); // clear previous errors

    // STEP 0 → Guest selection
    if (activeStep === 0 && !selectedGuest) {
      setError('Please select or add a guest before continuing.');
      return false;
    }

    // STEP 1 → Booking details
    if (activeStep === 1) {
      const { checkin_date, checkout_date } = bookingDetails;

      if (!checkin_date || !checkout_date) {
        setError('Please provide valid booking dates.');
        return false;
      }

      // ❌ Validation: Check-in must not be after Check-out
      if (checkin_date > checkout_date) {
        setError('Check-in date cannot be later than the check-out date.');
        return false;
      }
    }

    // STEP 2 → Rooms selection
    if (activeStep === 2 && selectedRooms.length === 0) {
      setError('Please select a room.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => {
      const newStep = prev - 1;

      // If going back from step 2 to 1
      if (prev === 2 && newStep === 1) {
        setSelectedRooms([]);
        setRoomTokens([]);
      }

      return newStep;
    });
  };
  const totalAmount = roomTokens.reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleSubmitBooking = async () => {
    if (!validateStep()) return;
    const rooms = selectedRooms.map((r) => {
      return r.documentId;
    });

    if (paymentDetails.amount > totalAmount) {
      setError('Advance payment cannot be more than total amount.');
      return;
    }
    try {
      setLoading(true);
      const newBookingId = generateNextBookingId(bookings);
      const payload = {
        booking_id: newBookingId,
        customer: selectedGuest.documentId,
        ...bookingDetails,
        rooms: rooms,
        room_tokens: roomTokens,
        advance_payment: paymentDetails,
        hotel_id: auth?.user?.hotel_id || '',
      };

      const res = await CreateNewData({
        auth,
        endPoint: 'room-bookings',
        payload: { data: payload },
      });
      SuccessToast('Booking Create Successfully');
      router.push(`/front-office/room-booking/${res.data.data.documentId}`);
    } catch (err) {
      console.log(`Error creating booking: ${err}`);
      setLoading(false);
      ErrorToast('Someting went wrong');
    }
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">New Revervation</Typography>
        </Breadcrumbs>
      </Box>
      {!hotelData || !paymentMethods || !bookings ? (
        <Loader />
      ) : (
        <>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: { xs: 2, md: 4 },
              bgcolor: 'linear-gradient(135deg, #e3f2fd, #e8f5e9)',
              minHeight: '100vh',
            }}
          >
            <Paper
              elevation={8}
              sx={{
                width: '100%',
                maxWidth: 1000,
                borderRadius: 4,
                p: { xs: 3, md: 5 },
                bgcolor: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {/* Stepper */}
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  mb: 5,
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#4caf50 !important',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: '#1976d2 !important',
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    fontWeight: 'bold',
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ mb: 3 }} />

              {/* Step Content */}
              <Box sx={{ minHeight: 300 }}>
                {activeStep === 0 && (
                  <GuestStep
                    selectedGuest={selectedGuest}
                    setSelectedGuest={setSelectedGuest}
                  />
                )}
                {activeStep === 1 && (
                  <BookingDetailsStep
                    bookingDetails={bookingDetails}
                    setBookingDetails={setBookingDetails}
                    hotelData={hotelData}
                  />
                )}
                {activeStep === 2 && (
                  <RoomAvailabilityStep
                    bookingDetails={bookingDetails}
                    selectedRooms={selectedRooms}
                    setSelectedRooms={setSelectedRooms}
                    roomTokens={roomTokens}
                    setRoomTokens={setRoomTokens}
                  />
                )}
                {activeStep === 3 && (
                  <FinalPreviewStep
                    selectedGuest={selectedGuest}
                    bookingDetails={bookingDetails}
                    paymentDetails={paymentDetails}
                    setPaymentDetails={setPaymentDetails}
                    onSubmit={handleSubmitBooking}
                    selectedRooms={selectedRooms}
                    roomTokens={roomTokens}
                    setRoomTokens={setRoomTokens}
                    paymentMethods={paymentMethods}
                  />
                )}
              </Box>
              {/* Error Handling */}
              <Zoom in={!!error}>
                <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Zoom>

              {/* Navigation */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 5,
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#fce4ec',
                      borderColor: '#f06292',
                    },
                  }}
                >
                  ⬅ Back
                </Button>

                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      boxShadow: '0 6px 16px rgba(25,118,210,0.4)',
                      transition: 'all 0.3s',
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#1565c0' },
                    }}
                  >
                    Next ➡
                  </Button>
                )}

                {activeStep === steps.length - 1 && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmitBooking}
                    disabled={loading}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      boxShadow: '0 6px 16px rgba(76,175,80,0.4)',
                      transition: 'all 0.3s',
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#388e3c' },
                    }}
                  >
                    {loading ? 'Creatinging Booking...' : '✅ Confirm Booking'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </>
  );
}
