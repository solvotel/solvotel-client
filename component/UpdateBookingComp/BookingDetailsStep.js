'use client';
import React, { useEffect, useState } from 'react';
import { TextField, Grid, MenuItem } from '@mui/material';

export default function BookingDetailsStep({
  bookingDetails,
  setBookingDetails,
  setSelectedRooms,
  setRoomTokens,
  isUpdate = false,
  selectedRooms = [],
  roomTokens = [],
}) {
  const handleChange = (field, value) => {
    // When not update flow, resetting rooms on date change is fine
    if (
      !isUpdate &&
      ((field === 'checkin_date' && bookingDetails.checkin_date !== value) ||
        (field === 'checkout_date' && bookingDetails.checkout_date !== value))
    ) {
      setSelectedRooms?.([]);
      setRoomTokens?.([]);
      setBookingDetails({ ...bookingDetails, [field]: value });
      return;
    }

    // In update flow: preserve selections that still fall within new date range
    if (
      isUpdate &&
      ((field === 'checkin_date' && bookingDetails.checkin_date !== value) ||
        (field === 'checkout_date' && bookingDetails.checkout_date !== value))
    ) {
      // compute new date window
      const newCheckin =
        field === 'checkin_date' ? value : bookingDetails.checkin_date;
      const newCheckout =
        field === 'checkout_date' ? value : bookingDetails.checkout_date;

      // normalize as Date objects
      const newCheckinDate = new Date(newCheckin);
      const newCheckoutDate = new Date(newCheckout);

      // filter selectedRooms to keep only dates in [newCheckin, newCheckout)
      const remainingSelections = (selectedRooms || []).filter((sel) => {
        const d = new Date(sel.date);
        return d >= newCheckinDate && d < newCheckoutDate;
      });

      // rebuild roomTokens from remainingSelections
      const grouped = {};
      remainingSelections.forEach((s) => {
        if (!grouped[s.room_no]) grouped[s.room_no] = [];
        grouped[s.room_no].push(s.date);
      });

      const newTokens = Object.entries(grouped).map(([roomNo, dates]) => {
        const sorted = dates.sort();
        const inDate = sorted[0];
        const lastDate = sorted[sorted.length - 1];
        const outDateObj = new Date(lastDate);
        outDateObj.setDate(outDateObj.getDate() + 1);
        const outDate = outDateObj.toISOString().split('T')[0];

        // try preserve existing token fields (rate, gst, item, hsn, invoice)
        const existing =
          (roomTokens || []).find((t) => t.room === roomNo) || {};

        const rate = Number(existing.rate) || 0;
        const gst = Number(existing.gst) || 0;
        const days = sorted.length;
        const amount = parseFloat(
          ((rate + (rate * gst) / 100) * days).toFixed(2),
        );

        return {
          ...existing,
          room: roomNo,
          in_date: inDate,
          out_date: outDate,
          days,
          rate,
          gst,
          amount,
        };
      });

      // apply updates
      setSelectedRooms?.(remainingSelections);
      setRoomTokens?.(newTokens);
      setBookingDetails({ ...bookingDetails, [field]: value });
      return;
    }

    // default: just update booking details
    setBookingDetails({ ...bookingDetails, [field]: value });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="Booking Reference"
          fullWidth
          value={bookingDetails.booking_referance || ''}
          onChange={(e) => handleChange('booking_referance', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
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
          label="Booking Type"
          fullWidth
          value={bookingDetails.booking_type || ''}
          onChange={(e) => handleChange('booking_type', e.target.value)}
        >
          <MenuItem value="FIT">FIT</MenuItem>
          <MenuItem value="Group">Group</MenuItem>
          <MenuItem value="Corporate">Corporate</MenuItem>
          <MenuItem value="Corporate Group">Corporate Group</MenuItem>
          <MenuItem value="Social Event">Social Event</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
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
          onChange={(e) => handleChange('checkin_date', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          type="date"
          label="Check-out Date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={bookingDetails.checkout_date || ''}
          onChange={(e) => handleChange('checkout_date', e.target.value)}
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
          <MenuItem value="MAP">
            MAP (Room + Breakfast + One Major Meal)
          </MenuItem>
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
