'use client';
import React, { useEffect, useState } from 'react';
import { TextField, Grid, MenuItem } from '@mui/material';

export default function BookingDetailsStep({
  bookingDetails,
  setBookingDetails,
  hotelData,
}) {
  const handleChange = (field, value) => {
    setBookingDetails({ ...bookingDetails, [field]: value });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Booking Reference"
          fullWidth
          value={bookingDetails.booking_referance || ''}
          onChange={(e) => handleChange('booking_referance', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Reference No"
          fullWidth
          value={bookingDetails.reference_no || ''}
          onChange={(e) => handleChange('reference_no', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          select
          label="Booking Status"
          fullWidth
          value={bookingDetails.booking_status || ''}
          onChange={(e) => handleChange('booking_status', e.target.value)}
        >
          {' '}
          <MenuItem value="Confirmed">Confirmed</MenuItem>
          <MenuItem value="Blocked">Blocked</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          type="number"
          label="Adults"
          fullWidth
          value={bookingDetails.adult || ''}
          onChange={(e) => handleChange('adult', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          type="number"
          label="Children"
          fullWidth
          value={bookingDetails.children || ''}
          onChange={(e) => handleChange('children', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          type="date"
          label="Check-in Date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={bookingDetails.checkin_date || ''}
          disabled
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          type="date"
          label="Check-out Date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={bookingDetails.checkout_date || ''}
          disabled
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Check-in Time"
          fullWidth
          value={bookingDetails.checkin_time || ''}
          onChange={(e) => handleChange('checkin_time', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Check-out Time"
          fullWidth
          value={bookingDetails.checkout_time || ''}
          onChange={(e) => handleChange('checkout_time', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          label="Meal Plan"
          fullWidth
          value={bookingDetails.meal_plan || ''}
          onChange={(e) => handleChange('meal_plan', e.target.value)}
        >
          <MenuItem value="EP">EP (Room Only)</MenuItem>
          <MenuItem value="CP">CP (Room + Breakfast)</MenuItem>
          <MenuItem value="AP">AP (All Meals)</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Remarks"
          fullWidth
          value={bookingDetails.remarks || ''}
          onChange={(e) => handleChange('remarks', e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
