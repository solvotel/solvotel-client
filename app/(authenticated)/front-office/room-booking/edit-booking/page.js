'use client';
import React, { Suspense } from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { GetDataList, GetSingleData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { useSearchParams } from 'next/navigation';
import { UpdateBookingForm } from '@/component/UpdateBookingComp';

const BookingForm = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const { auth } = useAuth();

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

  const bookingData = GetSingleData({
    auth,
    endPoint: 'room-bookings',
    id: bookingId,
  });

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Update Revervation</Typography>
          <Typography color="text.primary">
            {bookingData?.booking_id}
          </Typography>
        </Breadcrumbs>
      </Box>
      {!hotelData || !paymentMethods || !bookings || !bookingData ? (
        <Loader />
      ) : (
        <>
          <UpdateBookingForm
            hotelData={hotelData}
            paymentMethods={paymentMethods}
            bookings={bookings}
            bookingData={bookingData}
          />
        </>
      )}
    </>
  );
};

const Page = () => {
  return (
    <Suspense>
      <BookingForm />
    </Suspense>
  );
};
export default Page;
