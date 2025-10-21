'use client';

import React from 'react';
import { Box, Typography, Button, Grid, Paper, Stack } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import { GetCustomDate } from '@/utils/DateFetcher';

const InvoiceCard = ({ invoice }) => {
  const totalRoomAmount = invoice?.room_tokens.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0
  );
  const totalServiceAmount = invoice?.service_tokens.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
    0
  );
  const totalFoodAmount = invoice?.food_tokens.reduce(
    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
    0
  );
  console.log(totalFoodAmount, 'hh');

  const totalAmount = totalFoodAmount + totalRoomAmount + totalServiceAmount;
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #e9ffefff, #e2ffe7ff)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' },
      }}
    >
      <Stack spacing={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptLongIcon color="primary" />
            <Typography variant="h6" fontWeight="600">
              {invoice.invoice_no}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="success"
            startIcon={<PrintIcon />}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Print
          </Button>
        </Box>

        <Typography variant="body1">
          <strong>Amount:</strong> ₹{totalAmount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Date:</strong> {GetCustomDate(invoice.date)}
        </Typography>
      </Stack>
    </Paper>
  );
};

const InvoiceListCard = ({ roomInvoices, booking }) => {
  const filteredInvoices = roomInvoices?.filter((inv) => {
    return inv?.room_booking?.documentId === booking?.documentId;
  });
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
          Invoices
        </Typography>
        <Grid container spacing={3}>
          {filteredInvoices?.map((inv, idx) => (
            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
              <InvoiceCard invoice={inv} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  );
};

export default InvoiceListCard;
