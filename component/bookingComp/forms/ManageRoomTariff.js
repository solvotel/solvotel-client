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
    updated[index][field] = value;

    let rate = parseFloat(updated[index].rate) || 0;
    let gst = parseFloat(updated[index].gst) || 0;
    let amount = parseFloat(updated[index].amount) || 0;

    // 🔹 If Rate and GST entered → calculate Amount
    if (field === 'rate' || field === 'gst') {
      if (rate && gst) {
        amount = +(rate + (rate * gst) / 100).toFixed(2);
        updated[index].amount = amount;
      }
    }

    // 🔹 If Amount and GST entered → calculate Rate
    if (field === 'amount' || field === 'gst') {
      if (amount && gst && field === 'amount') {
        rate = +(amount / (1 + gst / 100)).toFixed(2);
        updated[index].rate = rate;
      }
    }

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
                        type="number"
                        value={room.rate}
                        onChange={(e) =>
                          handleInlineChange(index, 'rate', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={room.gst}
                        onChange={(e) =>
                          handleInlineChange(index, 'gst', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={room.amount}
                        onChange={(e) =>
                          handleInlineChange(index, 'amount', e.target.value)
                        }
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
