'use client';
import {
  Typography,
  Container,
  Box,
  Breadcrumbs,
  Link,
  Grid,
} from '@mui/material';

import { UpdateProfileForm } from '@/component/updateForms';
import { GetDataList, GetSingleData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { useParams } from 'next/navigation';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { use, useRef } from 'react';
import {
  BillingSummaryCard,
  BookingDetailsCard,
  BookingServiceActionsCard,
  InvoiceListCard,
  PaymentHistoryCard,
} from '@/component/bookingComp';
import { BookingSlip } from '@/component/printables/RoomBookingSlip';
import { useReactToPrint } from 'react-to-print';

export default function RoomBookings({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);

  const hotel = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  const data = GetSingleData({
    endPoint: 'room-bookings',
    auth: auth,
    id: id,
  });
  const roomInvoices = GetDataList({
    endPoint: 'room-invoices',
    auth: auth,
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  const menuItems = GetDataList({
    auth,
    endPoint: 'restaurant-menus',
  });

  const bookingSlipComponentRef = useRef(null);
  const handlePrintBookingSlip = useReactToPrint({
    contentRef: bookingSlipComponentRef,
    documentTitle: 'booking-slip',
  });

  return (
    <>
      {!data || !menuItems || !paymentMethods || !roomInvoices ? (
        <Loader />
      ) : (
        <>
          <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link underline="hover" color="inherit" href="/dashboard">
                Dashboard
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href="/front-office/room-booking"
              >
                Room Booking
              </Link>
              <Typography color="text.primary">{data?.booking_id}</Typography>
            </Breadcrumbs>
          </Box>
          <Box p={3}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 6 }}>
                <BookingDetailsCard booking={data} />
                <BillingSummaryCard booking={data} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <BookingServiceActionsCard
                  booking={data}
                  auth={auth}
                  paymentMethods={paymentMethods}
                  menuItems={menuItems}
                  handlePrintBookingSlip={handlePrintBookingSlip}
                  roomInvoices={roomInvoices}
                />
                <PaymentHistoryCard booking={data} hotel={hotel} auth={auth} />
                <InvoiceListCard
                  booking={data}
                  roomInvoices={roomInvoices}
                  hotel={hotel}
                />
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ display: 'none' }}>
            <BookingSlip
              hotel={hotel}
              booking={data}
              ref={bookingSlipComponentRef}
            />
          </Box>
        </>
      )}
    </>
  );
}
