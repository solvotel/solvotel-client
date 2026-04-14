'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
} from '@mui/material';
import { CalculateDays } from '@/utils/CalculateDays';
import { GetCustomDate } from '@/utils/DateFetcher';
import { AccountBalanceWallet, Add, Delete } from '@mui/icons-material';

const FinalPreviewStep = ({
  selectedGuest,
  bookingDetails,
  selectedRooms,
  roomTokens,
  setRoomTokens,
  advancePayments,
  setAdvancePayments,
  paymentMethods,
}) => {
  const [useBulkPrice, setUseBulkPrice] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');

  const totalDays = CalculateDays({
    checkin: bookingDetails.checkin_date,
    checkout: bookingDetails.checkout_date,
  });

  // ✅ Bidirectional handler
  const handleChange = (index, field, value) => {
    const updated = [...roomTokens];
    const room = { ...updated[index] };
    const numericValue = parseFloat(value) || 0;

    room[field] = numericValue;

    const rate = parseFloat(room.rate) || 0;
    const gst = parseFloat(room.gst) || 0;
    const days = parseFloat(room.days) || totalDays;
    const amount = parseFloat(room.amount) || 0;

    if (field === 'rate' || field === 'gst') {
      // Forward calc
      const newAmount = (rate + (rate * gst) / 100) * days;
      room.amount = parseFloat(newAmount.toFixed(2));
    } else if (field === 'amount') {
      // Reverse calc
      const base = amount / days;
      const newRate = base / (1 + gst / 100);
      room.rate = parseFloat(newRate.toFixed(2));
    }

    // Keep everything to 2 decimals
    room.rate = parseFloat((room.rate || 0).toFixed(2));
    room.amount = parseFloat((room.amount || 0).toFixed(2));

    updated[index] = room;
    setRoomTokens(updated);
  };

  // Handle bulk price update
  const handleBulkPriceChange = (value) => {
    setBulkPrice(value);
    const numericPrice = parseFloat(value) || 0;

    if (useBulkPrice && numericPrice > 0) {
      // Update all room rates with the bulk price
      const updated = roomTokens.map((room) => {
        const gst = parseFloat(room.gst) || 0;
        const days = parseFloat(room.days) || totalDays;
        const newAmount = (numericPrice + (numericPrice * gst) / 100) * days;

        return {
          ...room,
          rate: parseFloat(numericPrice.toFixed(2)),
          amount: parseFloat(newAmount.toFixed(2)),
        };
      });
      setRoomTokens(updated);
    }
  };

  const handleAdvanceChange = (index, field, value) => {
    setAdvancePayments((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleAddAdvance = () => {
    setAdvancePayments((prev) => [
      ...prev,
      {
        date: new Date().toISOString().split('T')[0],
        mode: '',
        amount: '',
        remark: '',
      },
    ]);
  };

  const handleRemoveAdvance = (index) => {
    setAdvancePayments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalAmount = roomTokens.reduce(
    (sum, r) => sum + (r.amount || null),
    0,
  );

  return (
    <Box>
      {/* Guest Info */}
      {selectedGuest && (
        <Card
          sx={{
            mb: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #e0f7fa, #e8f5e9)',
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {selectedGuest.name}
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6, sm: 4 }}>
                📞 {selectedGuest.mobile || '-'}
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                ✉️ {selectedGuest.email || '-'}
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                🏢 {selectedGuest.company_name || '-'}
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                🧾 GST: {selectedGuest.gst_no || '-'}
              </Grid>
              {selectedGuest.dob && (
                <Grid size={{ xs: 6, sm: 4 }}>🎂 DOB: {selectedGuest.dob}</Grid>
              )}
              {selectedGuest.doa && (
                <Grid size={{ xs: 6, sm: 4 }}>💍 DOA: {selectedGuest.doa}</Grid>
              )}
              {selectedGuest.id_type && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  🪪 {selectedGuest.id_type}: {selectedGuest.id_number || '-'}
                </Grid>
              )}
              {selectedGuest.passport_issue_date && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  📘 Passport Issue: {selectedGuest.passport_issue_date}
                </Grid>
              )}
              {selectedGuest.passport_exp_date && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  📘 Passport Expiry: {selectedGuest.passport_exp_date}
                </Grid>
              )}
              {selectedGuest.visa_number && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  🛂 Visa No: {selectedGuest.visa_number}
                </Grid>
              )}
              {selectedGuest.visa_issue_date && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  🛂 Visa Issue: {selectedGuest.visa_issue_date}
                </Grid>
              )}
              {selectedGuest.visa_exp_date && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  🛂 Visa Expiry: {selectedGuest.visa_exp_date}
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Booking Details */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff3e0, #fffde7)',
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Booking Details
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Chip
                label={`Check-in: ${bookingDetails.checkin_date}`}
                color="primary"
                size="small"
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Check-out: ${bookingDetails.checkout_date}`}
                color="secondary"
                size="small"
              />
            </Grid>
            <Grid item>
              <Chip label={`Total days: ${totalDays}`} size="small" />
            </Grid>
            {bookingDetails.adult && (
              <Grid item>
                <Chip label={`Adults: ${bookingDetails.adult}`} size="small" />
              </Grid>
            )}
            {bookingDetails.children && (
              <Grid item>
                <Chip
                  label={`Children: ${bookingDetails.children}`}
                  size="small"
                />
              </Grid>
            )}
            {bookingDetails.meal_plan && (
              <Grid item>
                <Chip
                  label={`Meal: ${bookingDetails.meal_plan}`}
                  size="small"
                />
              </Grid>
            )}
            {bookingDetails.remarks && (
              <Grid size={12}>
                <Typography variant="body2">
                  📝 Remarks: {bookingDetails.remarks}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Selected Rooms */}
      {selectedRooms.length > 0 && (
        <Card
          sx={{
            mb: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f3e5f5, #ede7f6)',
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Selected Rooms ({selectedRooms.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedRooms.map((room) => (
                <Chip
                  key={room.key}
                  label={`Room ${room.room_no} - ${room.category?.name} (${room.date})`}
                  color="info"
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Bulk Price Section */}
      {roomTokens.length > 0 && (
        <Card sx={{ mb: 2, borderRadius: 3, background: '#f5e6ff' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useBulkPrice}
                    onChange={(e) => setUseBulkPrice(e.target.checked)}
                  />
                }
                label="Set bulk price"
              />
              {useBulkPrice && (
                <TextField
                  type="number"
                  label="Enter price for all rooms"
                  placeholder="0.00"
                  value={bulkPrice}
                  onChange={(e) => handleBulkPriceChange(e.target.value)}
                  size="small"
                  sx={{ width: 250 }}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Rooms Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, overflow: 'hidden' }}
      >
        <Table size="small">
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Room No</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>

              <TableCell>Rate</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>GST %</TableCell>
              <TableCell>Final Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomTokens.map((room, index) => (
              <TableRow key={room.room}>
                <TableCell>{room.room}</TableCell>
                <TableCell>{room.item}</TableCell>
                <TableCell>{GetCustomDate(room.in_date)}</TableCell>
                <TableCell>{GetCustomDate(room.out_date)}</TableCell>

                <TableCell sx={{ width: '150px' }}>
                  <TextField
                    value={room.rate ?? ''}
                    inputProps={{ inputMode: 'decimal' }}
                    onChange={(e) => {
                      const value = e.target.value;

                      // allow only positive numbers with optional decimal
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleChange(index, 'rate', value);
                      }
                    }}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{room.days}</TableCell>
                <TableCell sx={{ width: '120px' }}>
                  <TextField
                    value={room.gst ?? ''}
                    inputProps={{ inputMode: 'decimal' }}
                    onChange={(e) => {
                      const value = e.target.value;

                      // allow only positive numbers with optional decimal and max 100
                      if (/^\d*\.?\d*$/.test(value) && Number(value) <= 100) {
                        handleChange(index, 'gst', value);
                      }
                    }}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{room.amount}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={7} sx={{ fontWeight: 600, textAlign: 'end' }}>
                Payable
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {totalAmount.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Advance Payment */}
      <Card
        sx={{
          my: 2,
          borderRadius: 3,
          boxShadow: 2,
          background: 'linear-gradient(135deg, #fffdf7, #fff3e0)',
        }}
      >
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWallet color="warning" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Advance Payments
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={handleAddAdvance}
              sx={{ borderRadius: 2, px: 2 }}
            >
              Add Advance Payment
            </Button>
          </Box>

          {advancePayments.length > 0 ? (
            advancePayments.map((payment, index) => (
              <Box key={`advance-${index}`} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      select
                      label="Payment Mode"
                      size="small"
                      fullWidth
                      value={payment.mode}
                      onChange={(e) =>
                        handleAdvanceChange(index, 'mode', e.target.value)
                      }
                    >
                      <MenuItem value="">--- Select ---</MenuItem>
                      {paymentMethods?.map((cat) => (
                        <MenuItem key={cat.documentId} value={cat.name}>
                          {cat?.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Amount"
                      size="small"
                      fullWidth
                      value={payment.amount ?? ''}
                      inputProps={{ inputMode: 'decimal' }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                          handleAdvanceChange(index, 'amount', value);
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Remark"
                      size="small"
                      fullWidth
                      value={payment.remark}
                      onChange={(e) =>
                        handleAdvanceChange(index, 'remark', e.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 1 }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveAdvance(index)}
                      sx={{ mt: 1.3 }}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 2,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                No advance payments added.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinalPreviewStep;
