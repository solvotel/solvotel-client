'use client';

import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Grid, Paper, Stack } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import { GetCustomDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { RoomInvoicePrint } from '../printables/RoomInvoicePrint';

const InvoiceListCard = ({ roomInvoices, booking, hotel }) => {
  const filteredInvoices = roomInvoices?.filter((inv) => {
    return inv?.room_booking?.documentId === booking?.documentId;
  });
  const [setectedInv, setSelectedInv] = useState(null);

  const componentRef = useRef(null);
  const handleReactToPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'room-invoive',
  });

  const handlePrint = (row) => {
    setSelectedInv(row);
    // wait for re-render to complete
    setTimeout(() => handleReactToPrint(), 100);
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
          Invoices
        </Typography>
        <Grid container spacing={3}>
          {filteredInvoices?.map((invoice, idx) => (
            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
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
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
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
                      onClick={() => handlePrint(invoice)}
                    >
                      Print
                    </Button>
                  </Box>

                  <Typography variant="body1">
                    <strong>Amount:</strong> ₹{invoice?.payable_amount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Date:</strong> {GetCustomDate(invoice.date)}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <div style={{ display: 'none' }}>
        <RoomInvoicePrint
          ref={componentRef}
          data={setectedInv}
          hotel={hotel}
          booking={booking}
        />
      </div>
    </>
  );
};

export default InvoiceListCard;
