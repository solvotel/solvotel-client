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
import { GetTodaysDate } from '@/utils/DateFetcher';

export default function ManagePayments({
  open,
  setOpen,
  booking,
  paymentMethods,
  handleManagePayments,
}) {
  const todaysDate = GetTodaysDate().dateString;
  const [payments, setPayments] = useState([
    ...(booking?.payment_tokens || []),
  ]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const handleAddRow = () => {
    setPayments((prev) => [
      ...prev,
      { date: todaysDate, mode: '', amount: '', remark: '' },
    ]);
    setHighlightedIndex(payments.length);
    setTimeout(() => setHighlightedIndex(null), 1200);
  };

  const handleInlineChange = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;
    setPayments(updated);
    setHighlightedIndex(index);
    setTimeout(() => setHighlightedIndex(null), 800);
  };

  const handleDeleteRow = (index) => {
    const updated = [...payments];
    updated.splice(index, 1);
    setPayments(updated);
  };

  const handleSaveAll = () => {
    for (let p of payments) {
      if (!p.date || !p.mode || !p.amount) {
        alert('Please fill Date, Mode, and Amount for all rows before saving.');
        return;
      }
    }
    handleManagePayments(payments);
    SuccessToast('Payments added successfully');
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
          width: { xs: '95%', sm: 750 },
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
            Manage Payments
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
                {['Mode', 'Amount (₹)', 'Remark', 'Actions'].map((header) => (
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
              {payments.map((payment, index) => (
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
                        value={payment.mode}
                        onChange={(e) =>
                          handleInlineChange(index, 'mode', e.target.value)
                        }
                        fullWidth
                      >
                        {paymentMethods.map((mode, index) => (
                          <MenuItem key={index} value={mode?.name}>
                            {mode?.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={payment.amount}
                        onChange={(e) =>
                          handleInlineChange(index, 'amount', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={payment.remark}
                        onChange={(e) =>
                          handleInlineChange(index, 'remark', e.target.value)
                        }
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
          </Table>
        </Paper>

        {/* Buttons */}
        <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
          >
            Add Payment
          </Button>
          <Button variant="contained" color="success" onClick={handleSaveAll}>
            Save All
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
