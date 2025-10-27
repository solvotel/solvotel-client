import React from 'react';
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

export default function RoomInvoiceViewDialog({
  viewOpen,
  setViewOpen,
  viewData,
}) {
  if (!viewData) return null;

  // 🧮 Combine all chargeable items into one array
  const combinedItems = [];

  // Room tokens
  viewData.room_tokens?.forEach((r) => {
    combinedItems.push({
      type: 'Room Charge',
      room: r.room,
      item: r.item,
      hsn: r.hsn,
      rate: r.rate,
      qty: r.days || 1,
      gst: r.gst,
      amount: r.amount,
    });
  });

  // Service tokens
  viewData.service_tokens?.forEach((s) => {
    s.items?.forEach((it) => {
      combinedItems.push({
        type: 'Service',
        room: s.room_no,
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        qty: 1,
        gst: it.gst,
        amount: it.amount,
      });
    });
  });

  // Food tokens
  viewData.food_tokens?.forEach((f) => {
    f.items?.forEach((it) => {
      combinedItems.push({
        type: f.type,
        room: f.room_no,
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        qty: it.qty,
        gst: it.gst,
        amount: it.amount,
      });
    });
  });

  // 💰 Totals
  const subtotal = combinedItems.reduce(
    (a, b) => a + Number(b.rate * b.qty),
    0
  );
  const totalGst = combinedItems.reduce(
    (a, b) => a + (Number(b.rate * b.qty) * b.gst) / 100,
    0
  );
  const grandTotal = subtotal + totalGst;

  return (
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
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Room</strong>
                </TableCell>
                <TableCell>
                  <strong>Item</strong>
                </TableCell>
                <TableCell>
                  <strong>HSN</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Rate</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Qty</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>GST %</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Amount</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {combinedItems.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.room}</TableCell>
                  <TableCell>{row.item}</TableCell>
                  <TableCell>{row.hsn}</TableCell>
                  <TableCell align="right">
                    ₹{Number(row.rate).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{row.qty}</TableCell>
                  <TableCell align="right">{row.gst}%</TableCell>
                  <TableCell align="right">
                    ₹{Number(row.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals Section */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6">💰 Summary</Typography>
          <Typography>Subtotal: ₹{subtotal.toFixed(2)}</Typography>
          <Typography>GST: ₹{totalGst.toFixed(2)}</Typography>
          <Typography fontWeight="bold" color="primary">
            Grand Total: ₹{grandTotal.toFixed(2)}
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
          onClick={() => window.print()}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
