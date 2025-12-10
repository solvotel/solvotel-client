'use client';
import React from 'react';
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
} from '@mui/material';
import { CalculateDays } from '@/utils/CalculateDays';

const FinalPreviewStep = ({
  selectedGuest,
  bookingDetails,
  selectedRooms,
  roomTokens,
  setRoomTokens,
  paymentDetails,
  setPaymentDetails,
  paymentMethods,
}) => {
  const totalDays = CalculateDays({
    checkin: bookingDetails.checkin_date,
    checkout: bookingDetails.checkout_date,
  });

  const handleChange = (index, field, value) => {
    const updated = [...roomTokens];

    // Update the field
    updated[index][field] =
      field === 'rate' || field === 'gst' ? Number(value) : value;

    // Calculate final amount considering totalDays
    const rate = updated[index].rate || 0;
    const gst = updated[index].gst || 0;
    updated[index].amount = (rate + (rate * gst) / 100) * totalDays;

    setRoomTokens(updated);
  };

  const handleAdvanceChange = (field, value) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalAmount = roomTokens.reduce((sum, r) => sum + r.amount, 0);

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
              <Grid item xs={6} sm={4}>
                📞 {selectedGuest.mobile || '-'}
              </Grid>
              <Grid item xs={6} sm={4}>
                ✉️ {selectedGuest.email || '-'}
              </Grid>
              <Grid item xs={6} sm={4}>
                🏢 {selectedGuest.company_name || '-'}
              </Grid>
              <Grid item xs={6} sm={4}>
                🧾 GST: {selectedGuest.gst_no || '-'}
              </Grid>
              {selectedGuest.dob && (
                <Grid item xs={6} sm={4}>
                  🎂 DOB: {selectedGuest.dob}
                </Grid>
              )}
              {selectedGuest.doa && (
                <Grid item xs={6} sm={4}>
                  💍 DOA: {selectedGuest.doa}
                </Grid>
              )}
              {selectedGuest.id_type && (
                <Grid item xs={6} sm={4}>
                  🪪 {selectedGuest.id_type}: {selectedGuest.id_number || '-'}
                </Grid>
              )}
              {selectedGuest.passport_issue_date && (
                <Grid item xs={6} sm={4}>
                  📘 Passport Issue: {selectedGuest.passport_issue_date}
                </Grid>
              )}
              {selectedGuest.passport_exp_date && (
                <Grid item xs={6} sm={4}>
                  📘 Passport Expiry: {selectedGuest.passport_exp_date}
                </Grid>
              )}
              {selectedGuest.visa_number && (
                <Grid item xs={6} sm={4}>
                  🛂 Visa No: {selectedGuest.visa_number}
                </Grid>
              )}
              {selectedGuest.visa_issue_date && (
                <Grid item xs={6} sm={4}>
                  🛂 Visa Issue: {selectedGuest.visa_issue_date}
                </Grid>
              )}
              {selectedGuest.visa_exp_date && (
                <Grid item xs={6} sm={4}>
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
              <Grid item xs={12}>
                <Typography variant="body2">
                  📝 Remarks: {bookingDetails.remarks}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Selected Rooms */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f3e5f5, #ede7f6)',
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Selected Rooms
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedRooms.map((room) => (
              <Chip
                key={room.room_no}
                label={room?.room_no}
                color="info"
                size="small"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

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
              <TableCell>HSN</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>GST %</TableCell>
              <TableCell>Final Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomTokens.map((room, index) => (
              <TableRow key={index}>
                <TableCell>{room.room}</TableCell>
                <TableCell>{room.item}</TableCell>

                <TableCell>{room.hsn}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={room.rate}
                    onChange={(e) =>
                      handleChange(index, 'rate', e.target.value)
                    }
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{room.days}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={room.gst}
                    onChange={(e) => handleChange(index, 'gst', e.target.value)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {room.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 600, textAlign: 'end' }}>
                Total Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {totalAmount.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Card
        sx={{
          my: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff8e1, #fff3e0)',
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Advance Payment
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Mode"
                size="small"
                fullWidth
                value={paymentDetails.mode}
                onChange={(e) => handleAdvanceChange('mode', e.target.value)}
              >
                <MenuItem value="">--- Select ---</MenuItem>
                {paymentMethods?.map((cat) => (
                  <MenuItem key={cat.documentId} value={cat.name}>
                    {cat?.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Amount"
                type="number"
                size="small"
                fullWidth
                value={paymentDetails.amount}
                onChange={(e) => handleAdvanceChange('amount', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Remark"
                size="small"
                fullWidth
                value={paymentDetails.remark}
                onChange={(e) => handleAdvanceChange('remark', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinalPreviewStep;
