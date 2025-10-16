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
import { SuccessToast } from '@/utils/GenerateToast';

export default function ManageServices({
  open,
  setOpen,
  booking,
  handleManageService,
}) {
  const [services, setServices] = useState([...booking?.service_billing]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const handleAddRow = () => {
    setServices((prev) => [
      ...prev,
      { room: '', item: '', hsn: '', rate: '', gst: '', amount: 0 },
    ]);
    setHighlightedIndex(services.length);
    setTimeout(() => setHighlightedIndex(null), 1200);
  };

  const handleInlineChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;

    // Calculate amount whenever rate or gst changes
    const rate = parseFloat(updated[index].rate) || 0;
    const gst = parseFloat(updated[index].gst) || 0;
    updated[index].amount = +(rate + (rate * gst) / 100).toFixed(2);

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
    for (let s of services) {
      if (!s.room || !s.item || !s.rate) {
        alert('Please fill Room, Item, and Rate for all rows before saving.');
        return;
      }
    }
    handleManageService(services);

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
            Manage Services
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
                  'Room',
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
                        select
                        size="small"
                        value={service.room}
                        onChange={(e) =>
                          handleInlineChange(index, 'room', e.target.value)
                        }
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
                    </TableCell>
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
                        type="number"
                        value={service.rate}
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
                        value={service.gst}
                        onChange={(e) =>
                          handleInlineChange(index, 'gst', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>{service.amount.toFixed(2)}</TableCell>
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
          </Table>
        </Paper>

        {/* Buttons */}
        <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
          >
            Add Row
          </Button>
          <Button variant="contained" color="success" onClick={handleSaveAll}>
            Save All
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
