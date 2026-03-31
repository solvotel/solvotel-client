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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SuccessToast, WarningToast } from '@/utils/GenerateToast';

export default function ManageServices({
  open,
  setOpen,
  booking,
  handleManageService,
}) {
  const [room, setRoom] = useState('');
  const [services, setServices] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const handleAddRow = () => {
    setServices((prev) => [
      ...prev,
      { item: '', hsn: '', rate: '', gst: '', amount: '' },
    ]);
    setHighlightedIndex(services.length);
    setTimeout(() => setHighlightedIndex(null), 1200);
  };

  const handleInlineChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;

    let rate =
      updated[index].rate === '' ? null : parseFloat(updated[index].rate);
    let gst = updated[index].gst === '' ? null : parseFloat(updated[index].gst);
    let amount =
      updated[index].amount === '' ? null : parseFloat(updated[index].amount);

    // Keep GST optional, treat missing GST as 0 for calc
    const gstVal = gst !== null ? gst : 0;

    if (field === 'rate' || field === 'gst') {
      if (rate !== null) {
        amount = +(rate + (rate * gstVal) / 100).toFixed(2);
        updated[index].amount = amount;
      } else if (amount !== null && gst !== null) {
        rate = +(amount / (1 + gst / 100)).toFixed(2);
        updated[index].rate = rate;
      }
    }

    if (field === 'amount') {
      if (amount !== null) {
        if (gst !== null) {
          rate = +(amount / (1 + gst / 100)).toFixed(2);
        } else {
          rate = +amount.toFixed(2);
        }
        updated[index].rate = rate;
      }
    }

    // If GST gets cleared but we have rate, keep amount in sync
    if (field === 'gst' && gst === null && rate !== null) {
      updated[index].amount = +rate.toFixed(2);
    }

    setServices(updated);
    setHighlightedIndex(index);
    setTimeout(() => setHighlightedIndex(null), 800);
  };

  const handleDeleteRow = (index) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const handleSaveAll = () => {
    if (!room) {
      WarningToast('Select Room No');
      return;
    }
    if (services.length < 1) {
      WarningToast('Atleast 1 Item required');
      return;
    }

    let normalizedServices;

    try {
      normalizedServices = services.map((service) => {
        const item = service.item?.trim();
        if (!item) {
          throw new Error('Item name is required for every service row.');
        }

        let rate =
          service.rate === '' || service.rate === null
            ? null
            : parseFloat(service.rate);
        let gst =
          service.gst === '' || service.gst === null
            ? 0
            : parseFloat(service.gst);
        let amount =
          service.amount === '' || service.amount === null
            ? null
            : parseFloat(service.amount);

        if (rate === null && amount === null) {
          throw new Error('Rate or Amount is required for every service row.');
        }

        if (amount === null && rate !== null) {
          amount = +(rate + (rate * gst) / 100).toFixed(2);
        }

        if (rate === null && amount !== null) {
          if (gst === 0) {
            rate = +amount.toFixed(2);
          } else {
            rate = +(amount / (1 + gst / 100)).toFixed(2);
          }
        }

        return {
          ...service,
          item,
          hsn: service.hsn || '',
          rate: +(rate || 0).toFixed(2),
          gst: +(gst || 0).toFixed(2),
          amount: +(amount || 0).toFixed(2),
        };
      });
    } catch (err) {
      WarningToast(err.message);
      return;
    }

    const total_gst = normalizedServices.reduce((acc, item) => {
      const baseRate = parseFloat(item.rate) || 0;
      const gstAmount = (baseRate * (parseFloat(item.gst) || 0)) / 100;
      return acc + gstAmount;
    }, 0);

    const total_amount = normalizedServices.reduce(
      (acc, item) => acc + (parseFloat(item.amount) || 0),
      0,
    );

    const payload = {
      id: new Date().getTime().toString(36),
      room_no: room,
      total_gst: total_gst || 0,
      total_amount: total_amount || 0,
      invoice: false,
      items: normalizedServices,
    };

    handleManageService(payload);
    setRoom('');
    setServices([]);
    SuccessToast('Services added successfully');
    setOpen(false);
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
          width: { xs: '95%', sm: 850 },
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
            Add Services
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'gray' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Room Selector */}
        <Box width={200} mb={1}>
          <TextField
            select
            label="Select Room No"
            size="small"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            fullWidth
            sx={{
              '& .Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            }}
          >
            {booking?.rooms.map((r, i) => (
              <MenuItem key={i} value={r.room_no}>
                {r.room_no}
              </MenuItem>
            ))}
          </TextField>
        </Box>

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
                  'Item',
                  'HSN',
                  'Rate (₹)',
                  'GST (%)',
                  'Amount (₹)',
                  'Actions',
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
              {services.map((service, index) => (
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
                    <TableCell>
                      <TextField
                        size="small"
                        value={service.item}
                        onChange={(e) =>
                          handleInlineChange(index, 'item', e.target.value)
                        }
                        fullWidth
                        sx={{
                          '& .Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={service.hsn}
                        onChange={(e) =>
                          handleInlineChange(index, 'hsn', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={service.rate ?? ''}
                        inputProps={{ inputMode: 'decimal' }}
                        onChange={(e) => {
                          const value = e.target.value;

                          // positive decimal
                          if (/^\d*\.?\d*$/.test(value)) {
                            handleInlineChange(index, 'rate', value);
                          }
                        }}
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={service.gst ?? ''}
                        inputProps={{ inputMode: 'decimal' }}
                        onChange={(e) => {
                          const value = e.target.value;

                          // positive decimal + max 100
                          if (
                            /^\d*\.?\d*$/.test(value) &&
                            Number(value) <= 100
                          ) {
                            handleInlineChange(index, 'gst', value);
                          }
                        }}
                        fullWidth
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={service.amount ?? ''}
                        inputProps={{ inputMode: 'decimal' }}
                        onChange={(e) => {
                          const value = e.target.value;

                          // positive decimal with max 2 decimal places (currency)
                          if (/^\d*\.?\d{0,2}$/.test(value)) {
                            handleInlineChange(index, 'amount', value);
                          }
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteRow(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </Fade>
              ))}
            </TableBody>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                  >
                    Add Row
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        {/* Buttons */}
        <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
          <Button variant="contained" color="success" onClick={handleSaveAll}>
            Submit
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
