'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SuccessToast } from '@/utils/GenerateToast';

export default function ManageRoomTariff({
  open,
  setOpen,
  booking,
  handleManageRoomTariff,
}) {
  const [roomTokens, setRoomTokens] = useState([...booking?.room_tokens]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const handleInlineChange = (index, field, value) => {
    const updated = [...roomTokens];

    const row = {
      ...updated[index],
    };

    // Preserve original numeric types
    row[field] = value === '' ? '' : Number(value);

    let rate = Number(row.rate) || 0;
    let gst = Number(row.gst) || 0;
    let days = Number(row.days) || 1;
    let amount = Number(row.amount) || 0;

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

  const handleSaveAll = () => {
    for (let s of roomTokens) {
      if (!s.room || !s.item || !s.rate) {
        alert('Please fill Room, Item, and Rate for all rows before saving.');
        return;
      }
    }

    handleManageRoomTariff(roomTokens);
    SuccessToast('Room Tariff updated successfully');
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
