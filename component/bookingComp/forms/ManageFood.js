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

export default function ManageFood({
  open,
  setOpen,
  booking, // or invoice
  menuItems,
  handleManageFood,
}) {
  const [room, setRoom] = useState('');
  const [foods, setFoods] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const handleAddRow = () => {
    setFoods((prev) => [
      ...prev,
      {
        item: '',
        hsn: '',
        rate: '',
        qty: 1,
        gst: '',
        amount: 0,
      },
    ]);
    setHighlightedIndex(foods.length);
    setTimeout(() => setHighlightedIndex(null), 1200);
  };

  const handleInlineChange = (index, field, value) => {
    const updated = [...foods];
    updated[index][field] = value;

    // auto calc total whenever rate/qty/gst changes
    const qty = parseFloat(updated[index].qty) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    const gst = parseFloat(updated[index].gst) || 0;
    const gstValue = (qty * rate * gst) / 100;
    updated[index].amount = qty * rate + gstValue;

    setFoods(updated);
    setHighlightedIndex(index);
    setTimeout(() => setHighlightedIndex(null), 800);
  };

  const handleDeleteRow = (index) => {
    const updated = [...foods];
    updated.splice(index, 1);
    setFoods(updated);
  };

  const handleSaveAll = () => {
    for (let f of foods) {
      if (!f.item || !f.rate || !f.qty) {
        WarningToast(
          'Please fill Item, Rate, and Qty for all rows before saving.'
        );
        return;
      }
    }
    if (!room) {
      WarningToast('Select Room No');
      return;
    }
    if (foods.length < 1) {
      WarningToast('Atleast 1 Item required');
      return;
    }
    const total_gst = foods.reduce((acc, item) => {
      const gstAmount = (item.amount * (item.gst || 0)) / 100;
      return acc + gstAmount;
    }, 0);

    const total_amount = foods.reduce((acc, item) => acc + item.amount, 0);

    const payload = {
      id: new Date().getTime().toString(36),
      room_no: room,
      type: 'Room Service',
      total_gst: parseFloat(total_gst).toFixed(2) || 0,
      total_amount: parseFloat(total_amount).toFixed(2) || 0,
      invoice: false,
      items: foods,
    };
    handleManageFood(payload);
    setRoom('');
    setFoods([]);
    SuccessToast('Food items updated successfully');
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
            Add Food Items
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'gray' }}>
            <CloseIcon />
          </IconButton>
        </Box>
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
                  'Qty',
                  'GST %',
                  'Total (₹)',
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
              {foods.map((food, index) => (
                <Fade in={true} key={index} timeout={300}>
                  <TableRow
                    sx={{
                      bgcolor:
                        highlightedIndex === index
                          ? 'rgba(255,229,100,0.3)'
                          : 'inherit',
                      '&:hover': { bgcolor: 'grey.100', transition: '0.3s' },
                      transition: 'background-color 0.5s',
                    }}
                  >
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={food.item}
                        onChange={(e) => {
                          const item = menuItems.find(
                            (m) => m.item === e.target.value
                          );
                          if (item) {
                            handleInlineChange(index, 'item', item.item);
                            handleInlineChange(index, 'hsn', item.hsn || '');
                            handleInlineChange(index, 'rate', item.rate || 0);
                            handleInlineChange(index, 'gst', item.gst || 0);
                          } else {
                            handleInlineChange(index, 'item', e.target.value);
                          }
                        }}
                        fullWidth
                      >
                        {menuItems.map((m) => (
                          <MenuItem key={m.documentId} value={m.item}>
                            {m.item}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={food.hsn}
                        onChange={(e) =>
                          handleInlineChange(index, 'hsn', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={food.rate}
                        onChange={(e) =>
                          handleInlineChange(index, 'rate', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={food.qty}
                        onChange={(e) =>
                          handleInlineChange(index, 'qty', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={food.gst}
                        onChange={(e) =>
                          handleInlineChange(index, 'gst', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      {parseFloat(food.amount || 0).toFixed(2)}
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
                <TableCell colSpan={7} align="center">
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
