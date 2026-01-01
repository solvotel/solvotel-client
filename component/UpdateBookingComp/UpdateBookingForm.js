'use client';
import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Paper,
  Divider,
  Alert,
  Zoom,
} from '@mui/material';

import { CreateNewData, UpdateData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { useRouter } from 'next/navigation';
import GuestStep from './GuestStep';
import BookingDetailsStep from './BookingDetailsStep';
import RoomAvailabilityStep from './RoomAvailabilityStep';
import FinalPreviewStep from './FinalPreviewStep';
import { GetTodaysDate } from '@/utils/DateFetcher';

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

const UpdateBookingForm = ({
  hotelData,
  paymentMethods,
  bookings,
  bookingData,
}) => {
  const router = useRouter();
  const { auth } = useAuth();
  const today = GetTodaysDate().dateString;
  const todaysdate = new Date(today);
  let tomorrow = new Date(today);
  tomorrow.setDate(todaysdate.getDate() + 1);
  const formatDate = (date) => date.toISOString().split('T')[0];
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Shared state
  const [selectedGuest, setSelectedGuest] = useState(bookingData?.customer);
  const [bookingDetails, setBookingDetails] = useState({
    booking_type: bookingData?.booking_type || 'FIT',
    booking_status: bookingData?.booking_status || 'Confirmed',
    checkin_date: bookingData?.checkin_date || formatDate(todaysdate),
    checkout_date: bookingData?.checkout_date || formatDate(tomorrow),
    checkin_time: bookingData.checkin_time,
    checkout_time: bookingData.checkout_time,
    booking_referance: bookingData?.booking_referance,
    reference_no: bookingData?.reference_no,
    meal_plan: bookingData?.meal_plan || null,
    remarks: bookingData?.remarks || '',
    adult: bookingData?.adult || 1,
    children: bookingData?.children || 0,
  });

  const [selectedRooms, setSelectedRooms] = useState([...bookingData?.rooms]);
  const cleanedTokens = bookingData.room_tokens.map(({ id, ...rest }) => rest);
  const [roomTokens, setRoomTokens] = useState([...cleanedTokens]);
  const [paymentDetails, setPaymentDetails] = useState({
    date: bookingData?.advance_payment?.date,
    mode: bookingData?.advance_payment?.mode || '',
    amount: bookingData?.advance_payment?.amount || 0,
    remark: bookingData?.advance_payment?.remark || '',
  });
  const [error, setError] = useState('');

  const validateStep = () => {
    setError(''); // clear previous errors
    if (activeStep === 0 && !selectedGuest) {
      setError('Please select or add a guest before continuing.');
      return false;
    }
    if (
      activeStep === 1 &&
      (!bookingDetails.checkin_date || !bookingDetails.checkout_date)
    ) {
      setError('Please provide valid booking dates.');
      return false;
    }
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

      return newStep;
    });
  };

  const handleSubmitBooking = async () => {
    if (!validateStep()) return;
    const rooms = selectedRooms.map((r) => {
      return r.documentId;
    });
    try {
      setLoading(true);

      const payload = {
        customer: selectedGuest.documentId,
        ...bookingDetails,
        rooms: rooms,
        room_tokens: roomTokens,
        advance_payment: paymentDetails,
      };

      const res = await UpdateData({
        auth,
        endPoint: 'room-bookings',
        payload: { data: payload },
        id: bookingData.documentId,
      });
      SuccessToast('Booking Updated Successfully');
      router.push(`/front-office/room-booking/${res.data.data.documentId}`);
    } catch (err) {
      console.log(`Error creating booking: ${err}`);
      setLoading(false);
      ErrorToast('Someting went wrong');
    }
  };
  return (
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
                setSelectedRooms={setSelectedRooms}
                setRoomTokens={setRoomTokens}
              />
            )}
            {activeStep === 2 && (
              <RoomAvailabilityStep
                bookingDetails={bookingDetails}
                selectedRooms={selectedRooms}
                setSelectedRooms={setSelectedRooms}
                roomTokens={roomTokens}
                setRoomTokens={setRoomTokens}
                bookingData={bookingData}
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
                {loading ? 'Creatinging Booking...' : '✅ Update Booking'}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default UpdateBookingForm;
