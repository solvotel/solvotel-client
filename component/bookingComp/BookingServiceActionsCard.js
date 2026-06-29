'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from '@mui/material';

import {
  Print as PrintIcon,
  RoomService as RoomServiceIcon,
  Fastfood as FastfoodIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Hotel as HotelIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import {
  CreateInvoiceModal,
  ManageFood,
  ManagePayments,
  ManageRoomTariff,
  ManageServices,
} from './forms';
import { UpdateData } from '@/utils/ApiFunctions';
import CancelBookingDialog from './CancelBookingDialog';

import { SuccessToast } from '@/utils/GenerateToast';
import CheckoutDialog from './CheckoutDialog';
import CheckinDialog from './CheckinDialog';
import BookingConflictDialog from './BookingConflictDialog';

export default function BookingServiceActionsCard({
  booking,
  auth,
  paymentMethods,
  menuItems,
  handlePrintBookingSlip,
  roomInvoices,
  allBookings,
}) {
  const router = useRouter();
  const [invoiceModel, setInvoiceModel] = useState(false);
  const [serviceModel, setServiceModel] = useState(false);
  const [paymentModel, setPaymentModel] = useState(false);
  const [foodModel, setFoodModel] = useState(false);
  const [roomTariffDialog, setRoomTariffDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictingBookings, setConflictingBookings] = useState([]);

  // update service tokens
  const handleManageService = async (service) => {
    const prevServices = booking?.service_tokens || [];
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { service_tokens: [...prevServices, service] } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  // update food tokens
  const handleManageFood = async (food) => {
    const prevFoods = booking?.food_tokens || [];
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { food_tokens: [...prevFoods, food] } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleManageRoomTariff = async (roomTokens) => {
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { room_tokens: roomTokens } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleManagePayments = async (payment) => {
    const prevPayments = booking?.payment_tokens || [];
    const newPaymentArray = [...prevPayments, payment];
    const cleanedPaymemtsItems = newPaymentArray.map(({ id, ...rest }) => rest);
    const res = await UpdateData({
      endPoint: 'room-bookings',
      auth,
      id: booking?.documentId,
      payload: { data: { payment_tokens: cleanedPaymemtsItems } },
    });
    return res;
  };

  const handleCancelBooking = async () => {
    try {
      await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { booking_status: 'Cancelled' } },
      });
      setCancelDialog(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCheckin = async () => {
    await UpdateData({
      endPoint: 'room-bookings',
      auth,
      id: booking?.documentId,
      payload: {
        data: {
          checked_in: true,
          checkin_timeStamp: new Date().toISOString(),
        },
      },
    });
    setCheckinDialogOpen(false);
    SuccessToast('Checked In Successfully');
  };

  const findConflictingBookings = () => {
    const currentRoomTokens = booking?.room_tokens || [];

    if (!currentRoomTokens.length) return [];

    return (allBookings || [])
      .filter((otherBooking) => {
        // skip same booking
        if (otherBooking?.documentId === booking?.documentId) return false;

        // skip cancelled / checked out bookings
        if (
          otherBooking?.booking_status === 'Cancelled' ||
          otherBooking?.checked_out === true
        ) {
          return false;
        }

        const otherTokens = otherBooking?.room_tokens || [];

        return currentRoomTokens.some((currentToken) => {
          const currentRoom = currentToken?.room_no || currentToken?.room || '';

          const currentIn = new Date(currentToken?.in_date);
          const currentOut = new Date(currentToken?.out_date);

          return otherTokens.some((otherToken) => {
            const otherRoom = otherToken?.room_no || otherToken?.room || '';

            // room must match
            if (currentRoom !== otherRoom) return false;

            const otherIn = new Date(otherToken?.in_date);
            const otherOut = new Date(otherToken?.out_date);

            // date overlap check
            const hasConflict = currentIn < otherOut && currentOut > otherIn;

            return hasConflict;
          });
        });
      })
      .map((conflict) => ({
        documentId: conflict?.documentId,
        booking_id: conflict?.booking_id,
      }));
  };

  const handleCheckinClick = () => {
    const conflicts = findConflictingBookings();
    if (conflicts.length > 0) {
      setConflictingBookings(conflicts);
      setConflictDialogOpen(true);
      return;
    }

    setCheckinDialogOpen(true);
  };

  const handleNavigateToBooking = (bookingId) => {
    setConflictDialogOpen(false);
    router.push(`/front-office/room-booking/${bookingId}`);
  };

  const handleCheckout = async () => {
    await UpdateData({
      endPoint: 'room-bookings',
      auth,
      id: booking?.documentId,
      payload: {
        data: {
          checked_out: true,
          checkout_timeStamp: new Date().toISOString(),
        },
      },
    });
    setCheckoutDialogOpen(false);
    SuccessToast('Checked Out Successfully');
  };
  return (
    <>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          p: 2,
          mb: 3,
          pb: 14,
          background: 'linear-gradient(135deg, #fafafa, #ffffff)',
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, color: 'primary.main' }}
        >
          Manage Booking Services
        </Typography>

        <Grid container spacing={2}>
          {/* Edit */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              href={`/front-office/room-booking/edit-booking?bookingId=${booking?.documentId}`}
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<EditIcon />}
              sx={{ textTransform: 'none' }}
              disabled={booking.booking_status === 'Cancelled'}
            >
              Edit Booking
            </Button>
          </Grid>

          {/* Cancel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              sx={{ textTransform: 'none' }}
              onClick={() => setCancelDialog(true)}
              disabled={
                booking.booking_status === 'Cancelled' ||
                booking.checked_in === true ||
                booking.checked_out == true
              }
            >
              Cancel Booking
            </Button>
          </Grid>
          {!booking.checked_in && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                color="success"
                startIcon={<LoginIcon />}
                sx={{ textTransform: 'none' }}
                disabled={
                  booking.booking_status === 'Cancelled' ||
                  booking.booking_status === 'Blocked'
                }
                onClick={handleCheckinClick}
              >
                Mark Check-In
              </Button>
            </Grid>
          )}

          {booking.checked_in && !booking.checked_out ? (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setCheckoutDialogOpen(true)}
                  disabled={booking.booking_status === 'Blocked'}
                >
                  Mark Check-Out
                </Button>
              </Grid>
            </>
          ) : (
            <></>
          )}

          {/* Print */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              sx={{ textTransform: 'none' }}
              onClick={handlePrintBookingSlip}
              disabled={
                booking.booking_status === 'Cancelled' ||
                booking.booking_status === 'Blocked'
              }
            >
              Print Booking Slip
            </Button>
          </Grid>

          {/* Manage Services */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<RoomServiceIcon />}
              onClick={() => setServiceModel(true)}
              sx={{ textTransform: 'none' }}
              disabled={
                booking.booking_status === 'Cancelled' ||
                booking.booking_status === 'Blocked'
              }
            >
              Manage Services
            </Button>
          </Grid>

          {/* Manage Food */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="success"
              startIcon={<FastfoodIcon />}
              onClick={() => setFoodModel(true)}
              sx={{ textTransform: 'none' }}
              disabled={
                booking.booking_status === 'Cancelled' ||
                booking.booking_status === 'Blocked'
              }
            >
              Manage Food
            </Button>
          </Grid>

          {/* Manage Payment */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="info"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentModel(true)}
              sx={{ textTransform: 'none' }}
              disabled={
                booking.booking_status === 'Cancelled' ||
                booking.booking_status === 'Blocked'
              }
            >
              Manage Payment
            </Button>
          </Grid>
          {/* NEW: Manage Room Tariff */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              startIcon={<HotelIcon />}
              onClick={() => setRoomTariffDialog(true)}
              sx={{ textTransform: 'none' }}
              disabled={
                booking.booking_status === 'Cancelled' ||
                booking.booking_status === 'Blocked'
              }
            >
              Manage Tariff
            </Button>
          </Grid>
          {/* Create Invoice */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<ReceiptIcon />}
              sx={{ textTransform: 'none' }}
              onClick={() => setInvoiceModel(true)}
              disabled={
                booking.booking_status === 'Cancelled' ||
                booking.booking_status === 'Blocked'
              }
            >
              Create Invoice
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialogs */}
      <ManageServices
        open={serviceModel}
        setOpen={setServiceModel}
        booking={booking}
        handleManageService={handleManageService}
      />
      <ManagePayments
        open={paymentModel}
        setOpen={setPaymentModel}
        booking={booking}
        handleManagePayments={handleManagePayments}
        paymentMethods={paymentMethods}
      />
      <ManageFood
        open={foodModel}
        setOpen={setFoodModel}
        booking={booking}
        handleManageFood={handleManageFood}
        menuItems={menuItems}
      />
      <ManageRoomTariff
        open={roomTariffDialog}
        setOpen={setRoomTariffDialog}
        booking={booking}
        handleManageRoomTariff={handleManageRoomTariff}
      />
      <CreateInvoiceModal
        open={invoiceModel}
        setOpen={setInvoiceModel}
        booking={booking}
        roomInvoices={roomInvoices}
        paymentMethods={paymentMethods}
      />

      {/* Cancel Booking Confirmation Dialog */}
      <CancelBookingDialog
        cancelDialog={cancelDialog}
        setCancelDialog={setCancelDialog}
        handleCancelBooking={handleCancelBooking}
      />
      <CheckinDialog
        open={checkinDialogOpen}
        setOpen={setCheckinDialogOpen}
        handleSave={handleCheckin}
      />
      <CheckoutDialog
        open={checkoutDialogOpen}
        setOpen={setCheckoutDialogOpen}
        handleSave={handleCheckout}
      />
      <BookingConflictDialog
        conflictDialogOpen={conflictDialogOpen}
        setConflictDialogOpen={setConflictDialogOpen}
        conflictingBookings={conflictingBookings}
        handleNavigateToBooking={handleNavigateToBooking}
      />
    </>
  );
}
