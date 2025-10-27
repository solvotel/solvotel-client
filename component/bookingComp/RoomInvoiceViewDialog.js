'use client';
import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Box,
  Divider,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { GetCustomDate } from '@/utils/DateFetcher';
import { RoomInvoicePrint } from '../printables/RoomInvoicePrint';
import { useReactToPrint } from 'react-to-print';

export default function RoomInvoiceViewDialog({
  viewOpen,
  setViewOpen,
  viewData,
  hotel,
  roomBookings,
}) {
  const componentRef = useRef(null);
  const handleReactToPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'room-invoive',
  });
  if (!viewData) return null;

  const roomTokens = [];
  const serviceTokens = [];
  const foodTokens = [];

  // room tokens
  viewData?.room_tokens?.forEach((room) => {
    const gstAmount = (room.amount * room.gst) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;
    roomTokens.push({
      item: room.item,
      hsn: room.hsn,
      rate: room.rate,
      gst: gstAmount,
      sgst,
      cgst,
      amount: room.amount,
    });
  });

  // service tokens
  viewData?.service_tokens?.forEach((service) => {
    service.items?.forEach((it) => {
      const gstAmount = (it.amount * it.gst) / 100;
      const sgst = gstAmount / 2;
      const cgst = gstAmount / 2;
      serviceTokens.push({
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        gst: gstAmount,
        sgst,
        cgst,
        amount: it.amount,
      });
    });
  });

  // Food tokens
  viewData?.food_tokens?.forEach((food) => {
    food.items?.forEach((it) => {
      const gstAmount = (it.amount * it.gst) / 100;
      const sgst = gstAmount / 2;
      const cgst = gstAmount / 2;
      foodTokens.push({
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        gst: gstAmount,
        sgst,
        cgst,
        amount: it.amount,
      });
    });
  });

  const allTokens = [...roomTokens, ...serviceTokens, ...foodTokens];
  // ✅ Calculate totals
  const totals = allTokens.reduce(
    (acc, curr) => {
      acc.totalSgst += curr?.sgst;
      acc.totalCgst += curr?.cgst;
      acc.totalAmount += curr?.amount;
      return acc;
    },
    { totalSgst: 0, totalCgst: 0, totalAmount: 0 }
  );

  const booking = roomBookings?.find((item) => {
    return item?.documentId === viewData?.room_booking?.documentId;
  });

  return (
    <>
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          🧾 Invoice: {viewData.invoice_no}
        </DialogTitle>

        <DialogContent dividers>
          {/* Invoice + Customer Details */}
          <Box mb={2}>
            <Typography variant="subtitle1">
              <strong>Date:</strong> {GetCustomDate(viewData.date)} |{' '}
              <strong>Time:</strong> {viewData.time}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Customer:</strong> {viewData.customer_name} (
              {viewData.customer_phone})
            </Typography>
            <Typography variant="subtitle1">
              <strong>GST:</strong> {viewData.customer_gst || 'N/A'}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Address:</strong> {viewData.customer_address}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Combined Items Table */}
          <Typography variant="h6" gutterBottom>
            Items Summary
          </Typography>
          <TableContainer sx={{ mb: 2 }}>
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
                {allTokens?.map((token, index) => (
                  <TableRow key={index}>
                    <TableCell>{token.item}</TableCell>
                    <TableCell>{token.hsn}</TableCell>
                    <TableCell align="right">
                      {parseFloat(
                        token?.amount - (token?.cgst + token?.sgst)
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">{token?.sgst}</TableCell>
                    <TableCell align="right">{token?.cgst}</TableCell>
                    <TableCell align="right">{token?.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals Section */}
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="h6">💰 Summary</Typography>
            <Typography>
              Subtotal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ₹
              {(
                totals?.totalAmount -
                (totals?.totalSgst + totals?.totalCgst)
              ).toFixed(2)}
            </Typography>
            <Typography>
              SGST&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
              ₹{totals?.totalSgst?.toFixed(2)}
            </Typography>
            <Typography>
              CGST&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
              ₹{totals?.totalCgst?.toFixed(2)}
            </Typography>
            <Typography fontWeight="bold" color="primary">
              Grand Total&nbsp;: ₹{totals?.totalAmount?.toFixed(2)}
            </Typography>
            <Typography mt={1}>
              <strong>Payment Method:</strong> {viewData.mop || '—'}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handleReactToPrint}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: 'none' }}>
        <RoomInvoicePrint
          ref={componentRef}
          data={viewData}
          hotel={hotel}
          booking={booking}
        />
      </div>
    </>
  );
}
