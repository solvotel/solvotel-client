'use client';

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';
import { GetCustomDate } from '@/utils/DateFetcher';

const TABLE_HEAD_BG = '#e0f7fa';
const ROW_ODD_BG = '#f5f5f5';
const HIGHLIGHT_COLOR = '#1976d2';

const HeaderBox = styled(Box)({
  border: '1px solid #747474ff',
  padding: '16px',
  marginBottom: '16px',
});

const BillingSummaryPrint = React.forwardRef((props, ref) => {
  const { booking, hotel } = props;

  const roomTokens = booking?.room_tokens || [];
  const services = booking?.service_tokens || [];
  const foodItems = booking?.food_tokens || [];

  // ---- Summary calculations ----
  const totalRoomAmount = roomTokens.reduce(
    (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
    0,
  );
  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
    0,
  );
  const totalFoodAmount = foodItems.reduce(
    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
    0,
  );
  const grandTotal = totalRoomAmount + totalServiceAmount + totalFoodAmount;

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
        padding: '15px',
      }}
    >
      {/* Header */}
      <HeaderBox>
        <Grid container>
          {hotel?.hotel_logo?.url && (
            <Grid size={2.5}>
              <Box
                sx={{
                  width: 130,
                  height: 130,
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={
                    hotel?.hotel_logo?.url ||
                    'https://res.cloudinary.com/deyxdpnom/image/upload/v1760012402/demo_hpzblb.png'
                  }
                  alt="Hotel Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Grid>
          )}

          <Grid size={hotel?.hotel_logo?.url ? 4.5 : 7}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
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
              Phone: +91 {hotel?.hotel_mobile || 'N/A'}
            </Typography>
            <Typography variant="body2">
              GSTIN: {hotel?.hotel_gst_no || 'N/A'}
            </Typography>
          </Grid>
          <Grid size={5} textAlign="right">
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Billing Summary
            </Typography>
            <Typography>Booking ID: {booking.booking_id}</Typography>
            <Typography>Generated On: {GetCustomDate(new Date())}</Typography>
          </Grid>
        </Grid>
      </HeaderBox>

      {/* Summary Cards */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#e3f2fd',
                border: '1px solid #1976d2',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Room Tokens
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {totalRoomAmount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#fff0f1',
                border: '1px solid #c2185b',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Services
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {totalServiceAmount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f0fff4',
                border: '1px solid #388e3c',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Food Items
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {totalFoodAmount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#fff8e1',
                border: '1px solid #f57f17',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Grand Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                ₹ {grandTotal.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ROOM TOKENS TABLE */}
      {roomTokens.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Room Tokens
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: TABLE_HEAD_BG }}>
                  <TableCell>
                    <b>Room No</b>
                  </TableCell>
                  <TableCell>
                    <b>Check In/Out</b>
                  </TableCell>
                  <TableCell>
                    <b>Items</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>SGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>CGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Total (₹)</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomTokens.map((room, index) => {
                  const rate = room.rate * room.days;
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? ROW_ODD_BG : '#fff',
                      }}
                    >
                      <TableCell>{room.room || room.room_no}</TableCell>
                      <TableCell>
                        {GetCustomDate(room.in_date)} <br />
                        {GetCustomDate(room.out_date)}
                      </TableCell>
                      <TableCell>{room.item}</TableCell>
                      <TableCell align="right">
                        {parseFloat((room.amount - rate) / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat((room.amount - rate) / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(room.amount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}

      {/* SERVICES TABLE */}
      {services.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Services
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: TABLE_HEAD_BG }}>
                  <TableCell>
                    <b>Room No</b>
                  </TableCell>
                  <TableCell>
                    <b>Items</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>SGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>CGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Total (₹)</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, index) => {
                  const itemsString =
                    service.items?.map((i) => i.item).join(', ') || '—';
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? ROW_ODD_BG : '#fff',
                      }}
                    >
                      <TableCell>{service.room_no}</TableCell>
                      <TableCell>{itemsString}</TableCell>
                      <TableCell align="right">
                        {parseFloat(service.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(service.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(service.total_amount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}

      {/* FOOD TABLE */}
      {foodItems.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Food Items
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: TABLE_HEAD_BG }}>
                  <TableCell>
                    <b>Room No</b>
                  </TableCell>
                  <TableCell>
                    <b>Items</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>SGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>CGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Total (₹)</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {foodItems.map((food, index) => {
                  const itemsString =
                    food.items?.map((i) => i.item).join(', ') || '—';
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? ROW_ODD_BG : '#fff',
                      }}
                    >
                      <TableCell>{food.room_no}</TableCell>
                      <TableCell>{itemsString}</TableCell>
                      <TableCell align="right">
                        {parseFloat(food.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(food.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(food.total_amount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
});

BillingSummaryPrint.displayName = 'BillingSummaryPrint';

export default BillingSummaryPrint;
