'use client';

import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Fade,
  Button,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SuccessToast } from '@/utils/GenerateToast';
import { GetTodaysDate } from '@/utils/DateFetcher';

export default function ManagePayments({
  open,
  setOpen,
  booking,
  paymentMethods,
  handleManagePayments,
}) {
  const todaysDate = GetTodaysDate().dateString;
  const [errorMessage, setErrorMessage] = useState('');
  const prevPayments = booking?.payment_tokens || [];
  const roomTokens = booking?.room_tokens || [];
  const services = booking?.service_tokens || [];
  const foodItems = booking?.food_tokens || [];
  // ---- Summary calculations ----
  const totalAmount = prevPayments.reduce(
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
  const [form, setForm] = useState({
    date: todaysDate,
    amount: null,
    mode: '',
    remark: '',
  });

  const handleSaveAll = () => {
    // Field validation

    if (!form.date || !form.mode || !form.amount) {
      setErrorMessage('Please fill Date, Mode, and Amount for all rows.');
      return;
    }

    // Calculate total input payments

    // Validation: prevent overpayment
    if (form.amount > dueAmount) {
      setErrorMessage(
        `Total payment (₹${
          form.amount
        }) cannot exceed due amount (₹${dueAmount.toFixed(1)}).`
      );
      return;
    }

    // Clear any previous errors
    setErrorMessage('');

    // Save
    handleManagePayments(form);
    SuccessToast('Payments added successfully');
    setForm({
      date: todaysDate,
      amount: null,
      remark: '',
      mode: '',
    });
    setOpen(false);
  };

  const handleClose = () => setOpen(false);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: 750 },
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 3,
          boxShadow: 30,
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold" color="primary">
            Add Payments
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'gray' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {errorMessage && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 1,
              bgcolor: 'error.light',
              color: 'error.contrastText',
              fontWeight: 'bold',
              fontSize: 14,
            }}
          >
            {errorMessage}
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {' '}
            <TextField
              select
              label="Mode"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              fullWidth
            >
              {paymentMethods.map((mode, index) => (
                <MenuItem key={index} value={mode?.name}>
                  {mode?.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Amount (₹)"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              label="Remark"
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
          <Button variant="contained" color="success" onClick={handleSaveAll}>
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
