'use client';

import React, { use, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '@/context';
import { GetSingleData, GetDataList } from '@/utils/ApiFunctions';
import { Loader } from '@/component/common';
import { RoomInvoicePrint } from '@/component/printables/RoomInvoicePrint';
import { GetCustomDate } from '@/utils/DateFetcher';

const toInt = (n) => Math.round(Number(n) || 0);

export default function Page({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);
  const componentRef = useRef(null);

  // ✅ Data fetching (same style you use)
  const invoiceData = GetSingleData({
    auth,
    endPoint: 'room-invoices',
    id: id,
  });

  const hotel = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  const roomBookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'room-invoice',
  });

  if (!invoiceData || !hotel || !roomBookings) {
    return <Loader />;
  }

  const booking = roomBookings?.find(
    (item) => item?.documentId === invoiceData?.room_booking?.documentId
  );

  // ✅ Build tokens and totals
  const roomTokens = [];
  const serviceTokens = [];
  const foodTokens = [];

  invoiceData?.service_tokens?.forEach((service) => {
    service.items?.forEach((it) => {
      const gstAmount = it.amount - toInt(it.rate);
      const sgst = parseFloat(gstAmount / 2).toFixed(1);
      const cgst = parseFloat(gstAmount / 2).toFixed(1);
      serviceTokens.push({
        item: it.item,
        hsn: it.hsn || '-',
        rate: it.rate,
        gst: gstAmount,
        sgst,
        cgst,
        room: service.room_no,
        amount: it.amount,
      });
    });
  });

  invoiceData?.room_tokens?.forEach((room) => {
    const finalRate = room?.rate * room.days;
    const gstAmount = (finalRate * room.gst) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;
    roomTokens.push({
      item: room.item,
      room: room.room,
      hsn: room.hsn,
      rate: room.rate,
      gst: gstAmount,
      sgst,
      cgst,
      amount: room.amount,
    });
  });

  invoiceData?.food_tokens?.forEach((food) => {
    const gst = parseFloat(food.total_gst).toFixed(1);
    const payable = parseFloat(food.total_amount).toFixed(1);

    foodTokens.push({
      item: 'Food Charges',
      room: food.room_no,
      hsn: '996331',
      rate: payable - gst,
      gst: gst,
      sgst: gst / 2,
      cgst: gst / 2,
      amount: payable,
    });
  });

  const allTokens = [...roomTokens, ...serviceTokens, ...foodTokens];

  return (
    <>
      {/* ✅ Breadcrumb Header */}
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
            href="/front-office/room-invoice/"
          >
            Room Invoices
          </Link>
          <Typography color="text.primary">{invoiceData.invoice_no}</Typography>
        </Breadcrumbs>
      </Box>

      {/* ✅ Main Content */}
      <Box p={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            🧾 Invoice: {invoiceData.invoice_no}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>
        </Box>

        {/* Invoice + Customer Info */}
        <Box mb={2}>
          <Typography variant="subtitle1">
            <strong>Date:</strong> {GetCustomDate(invoiceData.date)} |{' '}
            <strong>Time:</strong> {invoiceData.time}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Customer:</strong> {invoiceData.customer_name} (
            {invoiceData.customer_phone})
          </Typography>
          <Typography variant="subtitle1">
            <strong>GST:</strong> {invoiceData.customer_gst || 'N/A'}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Address:</strong> {invoiceData.customer_address}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Items Summary Table */}
        <Typography variant="h6" gutterBottom>
          Items Summary
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Item</strong>
                </TableCell>
                <TableCell>
                  <strong>HSN</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Rate (₹)</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>SGST (₹)</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>CGST (₹)</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Amount (₹)</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allTokens.map((token, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {token.item} <br />
                    <span style={{ fontSize: '12px' }}>Room: {token.room}</span>
                  </TableCell>
                  <TableCell>{token.hsn}</TableCell>
                  <TableCell align="right">{toInt(token.rate)}</TableCell>
                  <TableCell align="right">{toInt(token?.sgst)}</TableCell>
                  <TableCell align="right">{toInt(token?.cgst)}</TableCell>
                  <TableCell align="right">{toInt(token?.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6">💰 Summary</Typography>
          <Typography>Subtotal : ₹{toInt(invoiceData.total_amount)}</Typography>
          <Typography>SGST : ₹{toInt(invoiceData.tax / 2)}</Typography>
          <Typography>CGST : ₹{toInt(invoiceData.tax / 2)}</Typography>
          <Typography fontWeight="bold" color="primary">
            Grand Total : ₹{toInt(invoiceData.payable_amount)}
          </Typography>
          <Typography mt={1}>
            <strong>Payment Method:</strong> {invoiceData.mop || 'N/A'}
          </Typography>
        </Box>
      </Box>

      {/* ✅ Hidden printable component */}
      <div style={{ display: 'block' }}>
        <RoomInvoicePrint
          ref={componentRef}
          data={invoiceData}
          hotel={hotel}
          booking={booking}
        />
      </div>
    </>
  );
}
