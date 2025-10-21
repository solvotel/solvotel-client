'use client';

import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import {
  CurrencyRupee as RupeeIcon,
  CalendarTodayOutlined,
  Notes as NotesIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';

import { GetCustomDate } from '@/utils/DateFetcher';
import { PaymentSlip } from '../printables/PaymentSlip';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

export default function PaymentHistoryCard({ booking, hotel }) {
  const payments = booking?.payment_tokens || [];
  const roomTokens = booking?.room_tokens || [];
  const services = booking?.service_tokens || [];
  const foodItems = booking?.food_tokens || [];
  const [selectedPayment, setSelectedPayment] = useState(null);

  // ---- Summary calculations ----
  const totalAmount = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  const advancePayment = booking?.advance_payment || null;
  const advanceAmount = advancePayment?.amount || 0;

  const totalRoomAmount = roomTokens.reduce(
    (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
    0
  );
  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
    0
  );
  const totalFoodAmount = foodItems.reduce(
    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
    0
  );

  const grandTotal = totalRoomAmount + totalServiceAmount + totalFoodAmount;
  const amountPayed = totalAmount + advanceAmount;
  const dueAmount = grandTotal - amountPayed;

  const componentRef = useRef(null);
  const handleReactToPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'res-inv',
  });

  const handlePrint = (row) => {
    setSelectedPayment(row);
    // wait for re-render to complete
    setTimeout(() => handleReactToPrint(), 100);
  };

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #fafafa, #ffffff)',
        }}
      >
        {/* Header */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 3, color: 'primary.main' }}
        >
          💳 Payment History
        </Typography>

        {/* Summary Card */}
        <Card
          elevation={4}
          sx={{
            borderRadius: 3,
            py: 0.5,
            px: 2,
            mb: 3,
            background: 'linear-gradient(135deg, #e0f7fa, #ffffff)',
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              {/* Grand total */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <RupeeIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Grand Total
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {grandTotal}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Total Amount */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <RupeeIcon color="success" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Paid
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {amountPayed}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Due Payment */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <RupeeIcon color="error" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Due Payment
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {dueAmount.toFixed(2) || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {/* Advance Payment Card */}
          {advancePayment && (
            <Grid size={{ xs: 12 }}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fff3e0, #ffffff)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Top Row */}
                  <Box display="flex" alignItems="center" gap={1.2}>
                    <PaymentIcon color="warning" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Advance Payment
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Amount */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.5}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      color="warning.main"
                      fontWeight="bold"
                    >
                      <RupeeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {advancePayment.amount}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Date */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarTodayOutlined fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {GetCustomDate(advancePayment.date) || '—'}
                      </Typography>
                    </Box>

                    {/* Mode */}
                    {advancePayment.mode && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PaymentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {advancePayment.mode}
                        </Typography>
                      </Box>
                    )}

                    {/* Note */}
                    {advancePayment.remark && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <NotesIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {advancePayment.remark}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Payment Tokens Cards */}
          {payments?.length > 0 ? (
            payments.map((p, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #fdfbfb, #ebedee)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Top Row */}
                    <Box display="flex" justifyContent={'space-between'}>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <PaymentIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {p.mode}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handlePrint(p)}>
                        <PrintIcon fontSize="inherit" />
                      </IconButton>
                    </Box>

                    <Divider />

                    {/* Amount */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1.5}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Box
                        display="flex"
                        alignItems="center"
                        color="success.main"
                        fontWeight="bold"
                      >
                        <RupeeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="h6" fontWeight="bold">
                          {p.amount}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Date */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarTodayOutlined fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {GetCustomDate(p.date) || '—'}
                      </Typography>
                    </Box>

                    {/* Note */}
                    {p.remark && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <NotesIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {p.remark}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              py={2}
            >
              No payment records found.
            </Typography>
          )}
        </Grid>
      </Paper>
      <div style={{ display: 'none' }}>
        <PaymentSlip
          ref={componentRef}
          data={selectedPayment}
          hotel={hotel}
          booking={booking}
          size="58mm"
        />
      </div>
    </>
  );
}
