'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
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
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SuccessToast } from '@/utils/GenerateToast';
import { useSWRConfig } from 'swr';
import { BASEURL } from '@/config/MainApi';

export default function ManageRoomTariff({
  open,
  setOpen,
  booking,
  handleManageRoomTariff,
}) {
  const { mutate } = useSWRConfig();
  const [roomTokens, setRoomTokens] = useState([
    ...(booking?.room_tokens || []),
  ]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [useBulkPrice, setUseBulkPrice] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkGst, setBulkGst] = useState('');
  const [bulkTotal, setBulkTotal] = useState('');

  useEffect(() => {
    setRoomTokens([...(booking?.room_tokens || [])]);
  }, [booking?.room_tokens]);

  const applyBulkChanges = React.useCallback(
    (priceValue, gstValue, totalValue) => {
      const numericPrice = parseFloat(priceValue) || 0;
      const numericGst = parseFloat(gstValue) || 0;
      const numericTotal = parseFloat(totalValue) || 0;
      const hasPrice = priceValue !== '' && numericPrice >= 0;
      const hasGst = gstValue !== '' && numericGst >= 0;
      const hasTotal = totalValue !== '' && numericTotal >= 0;

      if (useBulkPrice && (hasPrice || hasGst || hasTotal)) {
        setRoomTokens((currentRoomTokens) =>
          currentRoomTokens.map((room) => {
            const rate = hasPrice
              ? numericPrice
              : hasTotal
                ? hasGst
                  ? numericTotal / (1 + numericGst / 100)
                  : numericTotal
                : parseFloat(room.rate) || 0;
            const gst = hasGst
              ? numericGst
              : hasTotal && hasPrice
                ? (numericTotal / numericPrice - 1) * 100
                : parseFloat(room.gst) || 0;
            const days = parseFloat(room.days) || 1;
            const newAmount = (rate + (rate * gst) / 100) * days;

            return {
              ...room,
              rate: parseFloat(rate.toFixed(2)),
              gst: parseFloat(gst.toFixed(2)),
              amount: parseFloat(newAmount.toFixed(2)),
            };
          }),
        );
      }
    },
    [useBulkPrice],
  );

  useEffect(() => {
    if (useBulkPrice) {
      applyBulkChanges(bulkPrice, bulkGst, bulkTotal);
    }
  }, [useBulkPrice, bulkPrice, bulkGst, bulkTotal, applyBulkChanges]);

  const handleBulkModeChange = (checked) => {
    setUseBulkPrice(checked);
    if (!checked) {
      setBulkPrice('');
      setBulkGst('');
      setBulkTotal('');
    }
  };

  const formatBulkValue = (value) => {
    const number = Number(value);
    return Number.isInteger(number) ? String(number) : number.toFixed(2);
  };

  const getBulkValues = (field, value) => {
    let price = field === 'price' ? value : bulkPrice;
    let gst = field === 'gst' ? value : bulkGst;
    let total = field === 'total' ? value : bulkTotal;

    const numericPrice = parseFloat(price);
    const numericGst = parseFloat(gst);
    const numericTotal = parseFloat(total);

    if (field === 'price') {
      if (
        gst !== '' &&
        Number.isFinite(numericPrice) &&
        Number.isFinite(numericGst)
      ) {
        total = formatBulkValue(numericPrice * (1 + numericGst / 100));
      } else if (
        total !== '' &&
        Number.isFinite(numericTotal) &&
        numericPrice > 0
      ) {
        gst = formatBulkValue((numericTotal / numericPrice - 1) * 100);
      }
    }

    if (field === 'gst') {
      if (
        price !== '' &&
        Number.isFinite(numericPrice) &&
        Number.isFinite(numericGst)
      ) {
        total = formatBulkValue(numericPrice * (1 + numericGst / 100));
      } else if (
        total !== '' &&
        Number.isFinite(numericTotal) &&
        Number.isFinite(numericGst)
      ) {
        price = formatBulkValue(numericTotal / (1 + numericGst / 100));
      }
    }

    if (field === 'total') {
      if (
        gst !== '' &&
        Number.isFinite(numericTotal) &&
        Number.isFinite(numericGst)
      ) {
        price = formatBulkValue(numericTotal / (1 + numericGst / 100));
      } else if (
        price !== '' &&
        Number.isFinite(numericTotal) &&
        numericPrice > 0
      ) {
        gst = formatBulkValue((numericTotal / numericPrice - 1) * 100);
      }
    }

    return { price, gst, total };
  };

  const handleBulkPriceChange = (value) => {
    const values = getBulkValues('price', value);
    setBulkPrice(values.price);
    setBulkGst(values.gst);
    setBulkTotal(values.total);
    applyBulkChanges(values.price, values.gst, values.total);
  };

  const handleBulkGstChange = (value) => {
    const values = getBulkValues('gst', value);
    setBulkPrice(values.price);
    setBulkGst(values.gst);
    setBulkTotal(values.total);
    applyBulkChanges(values.price, values.gst, values.total);
  };

  const handleBulkTotalChange = (value) => {
    const values = getBulkValues('total', value);
    setBulkPrice(values.price);
    setBulkGst(values.gst);
    setBulkTotal(values.total);
    applyBulkChanges(values.price, values.gst, values.total);
  };

  const handleInlineChange = (index, field, value) => {
    const updated = [...roomTokens];

    const row = {
      ...updated[index],
    };

    row[field] = value === '' ? '' : Number(value);

    const rate = Number(row.rate) || 0;
    const gst = Number(row.gst) || 0;
    const days = Number(row.days) || 1;
    const amount = Number(row.amount) || 0;

    if (field === 'rate' || field === 'gst') {
      row.amount = Number(((rate + (rate * gst) / 100) * days).toFixed(2));
    }

    if (field === 'amount') {
      row.rate = Number((amount / ((1 + gst / 100) * days)).toFixed(2));
    }

    updated[index] = row;

    setRoomTokens(updated);

    setHighlightedIndex(index);
    setTimeout(() => setHighlightedIndex(null), 800);
  };

  const handleSaveAll = async () => {
    for (let s of roomTokens) {
      if (!s.room || !s.item || !s.rate) {
        alert('Please fill Room, Item, and Rate for all rows before saving.');
        return;
      }
    }

    try {
      const res = await handleManageRoomTariff(roomTokens);
      if (res) {
        await mutate(
          `${BASEURL}/room-bookings/${booking?.documentId}?populate=*`,
        );
      }
      SuccessToast('Room Tariff updated successfully');
      setOpen(false);
    } catch (err) {
      console.error('ManageRoomTariff save error', err);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: 900 },
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
            Manage Room Tariff
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'gray' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Bulk Price Section */}
        <Card sx={{ mb: 2, borderRadius: 2, background: '#f5e6ff' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useBulkPrice}
                    onChange={(e) => handleBulkModeChange(e.target.checked)}
                  />
                }
                label="Set bulk price and GST"
              />
            </Box>
            {useBulkPrice && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                <TextField
                  type="number"
                  label="Enter GST % for all rooms"
                  placeholder="0.00"
                  value={bulkGst}
                  onChange={(e) => handleBulkGstChange(e.target.value)}
                  size="small"
                  sx={{ width: 250 }}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
                <TextField
                  type="number"
                  label="Total price for all rooms"
                  placeholder="0.00"
                  value={bulkTotal}
                  onChange={(e) => handleBulkTotalChange(e.target.value)}
                  size="small"
                  sx={{ width: 250 }}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Paper
          sx={{
            borderRadius: 2,
            boxShadow: 5,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.light' }}>
              <TableRow>
                {[
                  'Room No',
                  'Type',
                  'HSN',
                  'Rate (₹)',
                  'GST (%)',
                  'Days',
                  'Amount (₹)',
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTokens.map((room, index) => (
                <Fade in={true} key={index} timeout={300}>
                  <TableRow
                    sx={{
                      bgcolor:
                        highlightedIndex === index
                          ? 'rgba(255, 229, 100, 0.3)'
                          : 'inherit',
                      '&:hover': { bgcolor: 'grey.100', transition: '0.3s' },
                      transition: 'background-color 0.5s',
                    }}
                  >
                    <TableCell>{room.room}</TableCell>
                    <TableCell>{room.item}</TableCell>
                    <TableCell>{room.hsn}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={room.rate ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            handleInlineChange(index, 'rate', value);
                          }
                        }}
                        inputProps={{ inputMode: 'decimal' }}
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={room.gst ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            handleInlineChange(index, 'gst', value);
                          }
                        }}
                        inputProps={{ inputMode: 'decimal' }}
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>{room.days}</TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={room.amount ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            handleInlineChange(index, 'amount', value);
                          }
                        }}
                        inputProps={{ inputMode: 'decimal' }}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                </Fade>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Buttons */}
        <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
          <Button variant="contained" color="success" onClick={handleSaveAll}>
            Save Changes
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
