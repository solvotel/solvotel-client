'use client';
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
import { styled } from '@mui/system';
import { GetCustomDate } from '@/utils/DateFetcher';
import { CalculateDays } from '@/utils/CalculateDays';
import { amountToWords } from '@/utils/AmountToWords';

// Replace theme colors with fixed hex values
const HEADER_BG_COLOR = '#1976d2'; // blue
const HEADER_TEXT_COLOR = '#ffffff'; // white
const TABLE_HEAD_BG = '#e0f7fa'; // light cyan
const ROW_ODD_BG = '#f5f5f5'; // light grey
const INFO_BG = '#f9f9f9'; // very light grey
const HIGHLIGHT_COLOR = '#1976d2'; // blue

const HeaderBox = styled(Box)({
  backgroundColor: HEADER_BG_COLOR,
  color: HEADER_TEXT_COLOR,
  padding: '16px',
  borderRadius: '8px 8px 0 0',
});

const InfoBox = styled(Box)({
  padding: '16px',
  backgroundColor: INFO_BG,
});

const Highlight = styled(Typography)({
  color: HIGHLIGHT_COLOR,
  fontWeight: 600,
});

const PaymentSlip = React.forwardRef((props, ref) => {
  const { booking, hotel, data } = props;

  const roomTokens = booking?.room_tokens || [];

  const totalDays = CalculateDays({
    checkin: booking?.checkin_date,
    checkout: booking?.checkout_date,
  });
  return (
    <Box
      ref={ref}
      sx={{
        backgroundColor: '#ffffff',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        color: '#333',
        fontSize: '13px',
      }}
    >
      {/* Header */}
      <HeaderBox>
        <Grid container>
          <Grid size={6}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {hotel?.hotel_name}
            </Typography>
            <Typography variant="body2">
              {hotel?.hotel_address_line1}, {hotel?.hotel_address_line2},{' '}
              {hotel?.hotel_state}, PIN-{hotel?.hotel_pincode}
            </Typography>
            <Typography variant="body2">
              Email: {hotel?.hotel_email || 'N/A'}
            </Typography>
            <Typography variant="body2">
              Phone: +91‑{hotel?.hotel_mobile || 'N/A'}
            </Typography>
            <Typography variant="body2">
              GST #: {hotel?.hotel_gst_no || 'N/A'}
            </Typography>
          </Grid>
          <Grid size={6} textAlign="right">
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Payment Slip
            </Typography>
            <Typography>Booking ID: {booking.booking_id}</Typography>
            <Typography>
              Created On: {GetCustomDate(booking.createdAt)}
            </Typography>
            {/* <Typography>Created By: {booking.created_by}</Typography> */}
          </Grid>
        </Grid>
      </HeaderBox>

      {/* Guest & Booking Info */}
      <InfoBox>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Guest Information
            </Typography>
            <Typography>
              <b>Name:</b> {booking?.customer?.name || 'N/A'}
            </Typography>
            <Typography>
              <b>Company:</b> {booking?.customer?.company_name || 'N/A'}
            </Typography>
            <Typography>
              <b>GST #:</b> {booking?.customer?.gst_no || 'N/A'}
            </Typography>
            <Typography>
              <b>Address:</b> {booking?.customer?.address || 'N/A'}
            </Typography>
            <Typography>
              <b>Phone:</b> {booking?.customer?.mobile || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Booking Details
            </Typography>
            <Typography>
              <b>Check‑In:</b> {GetCustomDate(booking?.checkin_date)}
            </Typography>
            <Typography>
              <b>Check‑Out:</b> {GetCustomDate(booking?.checkout_date)}
            </Typography>
            <Typography>
              <b>Type:</b> {booking?.booking_type}
            </Typography>

            <Typography>
              <b>No. of Nights:</b>{' '}
              {CalculateDays({
                checkin: booking?.checkin_date,
                checkout: booking?.checkout_date,
              })}
            </Typography>
          </Grid>
        </Grid>
      </InfoBox>

      {/* Payment & Requests */}
      {/* <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          p: 2,
          gap: 2,
        }}
      >
        <Box
          sx={{ flex: 2, backgroundColor: INFO_BG, p: 2, borderRadius: '4px' }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Payment Summary
          </Typography>
          <Typography>
            <b>Total Amount:</b> <Highlight>₹{totalRoomAmount}/‑</Highlight> (
            {amountToWords(totalRoomAmount)})
          </Typography>
          <Typography>
            <b>Advance Paid:</b>{' '}
            <Highlight>₹{booking.advance_payment?.amount || 0}/‑</Highlight>(
            {amountToWords(booking.advance_payment?.amount || 0)})
          </Typography>
        </Box>
        <Box
          sx={{ flex: 1, backgroundColor: INFO_BG, p: 2, borderRadius: '4px' }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Guest Requests / Notes
          </Typography>
          <Typography whiteSpace="pre-line">{booking.remarks}</Typography>
        </Box>
      </Box> */}

      {/* Rooms Table */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography
          variant="h6"
          textAlign={'center'}
          sx={{ mt: 1, fontWeight: 600 }}
        >
          Payment Details
        </Typography>
        <Table
          size="small"
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '0',
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: TABLE_HEAD_BG }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mode Of Payment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Remark</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ '&:nth-of-type(odd)': { backgroundColor: ROW_ODD_BG } }}
            >
              <TableCell>{GetCustomDate(data?.date)}</TableCell>
              <TableCell>₹{data?.amount}</TableCell>
              <TableCell>{data?.mode}</TableCell>
              <TableCell>{data?.remark}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Divider />

      {/* Footer notes & signature */}
      <Box sx={{ p: 1, textAlign: 'end', mt: 10 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Cashier / Front Office Signature
        </Typography>
      </Box>
    </Box>
  );
});

PaymentSlip.displayName = 'PaymentSlip';

export { PaymentSlip };
