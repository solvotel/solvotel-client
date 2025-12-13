'use client';

import React, { useEffect, useState } from 'react';
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
  Divider,
  Button,
  TableContainer,
  Checkbox,
  Grid,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useAuth } from '@/context';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { GetCurrentTime } from '@/utils/Timefetcher';
import { CreateNewData, UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';

const generateNextInvoiceNo = (roomInvoices) => {
  if (!roomInvoices || roomInvoices.length === 0) return 'SOLVINV-1';
  const numbers = roomInvoices
    .map((inv) => parseInt(inv.invoice_no?.replace('SOLVINV-', ''), 10))
    .filter((n) => !isNaN(n));
  const maxNumber = Math.max(...numbers);
  return `SOLVINV-${maxNumber + 1}`;
};

export default function CreateInvoiceModal({
  open,
  setOpen,
  booking,
  roomInvoices,
  paymentMethods,
}) {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  const [roomTokens, setRoomTokens] = useState([]);
  const [services, setServices] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [billedRoomTokens, setBilledRoomTokens] = useState([]);
  const [billedServices, setBilledServices] = useState([]);
  const [billedFoodItems, setBilledFoodItems] = useState([]);

  const [mop, setMop] = useState('');

  useEffect(() => {
    if (!booking) return;

    const unBilledRoomTokens =
      booking.room_tokens?.filter((r) => !r.invoice) || [];
    const unBilledServices =
      booking.service_tokens?.filter((s) => !s.invoice) || [];
    const unBilledFoodItems =
      booking.food_tokens?.filter((f) => !f.invoice) || [];

    const billedRoomTokens =
      booking.room_tokens?.filter((r) => r.invoice) || [];
    const billedServices =
      booking.service_tokens?.filter((s) => s.invoice) || [];
    const billedFoodItems = booking.food_tokens?.filter((f) => f.invoice) || [];

    setRoomTokens(unBilledRoomTokens);
    setServices(unBilledServices);
    setFoodItems(unBilledFoodItems);
    setBilledRoomTokens(billedRoomTokens);
    setBilledServices(billedServices);
    setBilledFoodItems(billedFoodItems);
  }, [booking]);

  const [customerData, setCustomerData] = useState({
    customer_name: booking?.customer?.name || '',
    customer_phone: booking?.customer?.mobile || '',
    customer_gst: booking?.customer?.gst_no || '',
    customer_address: booking?.customer?.address || '',
  });

  // ✅ Toggle Handlers
  const handleRoomToggle = (index) =>
    setRoomTokens((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, invoice: !item.invoice } : item
      )
    );

  const handleServiceToggle = (index) =>
    setServices((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, invoice: !item.invoice } : item
      )
    );

  const handleFoodToggle = (index) =>
    setFoodItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, invoice: !item.invoice } : item
      )
    );

  // Select / Deselect All - Rooms
  const handleSelectAllRooms = (checked) =>
    setRoomTokens((prev) =>
      prev.map((item) => ({ ...item, invoice: checked }))
    );

  // Select / Deselect All - Services
  const handleSelectAllServices = (checked) =>
    setServices((prev) => prev.map((item) => ({ ...item, invoice: checked })));

  // Select / Deselect All - Food
  const handleSelectAllFood = (checked) =>
    setFoodItems((prev) => prev.map((item) => ({ ...item, invoice: checked })));

  const sanitizeArray = (arr, keysToRemove = ['id']) =>
    arr.map((obj) => {
      const cleanObj = { ...obj };
      keysToRemove.forEach((key) => delete cleanObj[key]);
      return cleanObj;
    });

  const createInvoice = async () => {
    try {
      const selectedRooms = roomTokens.filter((r) => r.invoice);
      const selectedServices = services.filter((s) => s.invoice);
      const selectedFood = foodItems.filter((f) => f.invoice);
      const serviceAndFood = [...selectedServices, ...selectedFood];

      const totalRoomRate = selectedRooms.reduce(
        (sum, item) => sum + (parseFloat(item.rate * item.days) || 0),
        0
      );

      const totalRoomAmount = selectedRooms.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );
      const totalRoomGst = totalRoomAmount - totalRoomRate;

      const totalOtherAmount = serviceAndFood.reduce(
        (sum, item) => sum + (parseFloat(item.total_amount) || 0),
        0
      );
      const totalOtherGst = serviceAndFood.reduce(
        (sum, item) => sum + (parseFloat(item.total_gst) || 0),
        0
      );

      const totalGst = totalRoomGst + totalOtherGst;

      const payableAmount = totalOtherAmount + totalRoomAmount;

      if (
        selectedRooms.length === 0 &&
        selectedServices.length === 0 &&
        selectedFood.length === 0
      ) {
        ErrorToast('Please select at least one item.');
        return null;
      }

      const newInvoiceNo = generateNextInvoiceNo(roomInvoices);
      const time = GetCurrentTime();

      const finalPayload = {
        data: {
          invoice_no: newInvoiceNo,
          date: todaysDate,
          time,
          customer_name: customerData.customer_name,
          customer_phone: customerData.customer_phone,
          customer_gst: customerData.customer_gst,
          customer_address: customerData.customer_address,
          room_tokens: sanitizeArray(selectedRooms),
          service_tokens: selectedServices,
          food_tokens: selectedFood,
          hotel_id: auth?.user?.hotel_id,
          room_booking: booking.documentId,
          payable_amount: payableAmount,
          tax: totalGst,
          total_amount: payableAmount - totalGst,
          mop: mop,
        },
      };

      const res = await CreateNewData({
        auth,
        endPoint: 'room-invoices',
        payload: finalPayload,
      });

      return res;
    } catch (err) {
      ErrorToast('Failed to create invoice');
      return null;
    }
  };

  const updateBooking = async () => {
    const updatedRoomTokens = [...billedRoomTokens, ...roomTokens];
    const updatedServices = [...billedServices, ...services];
    const updatedFood = [...billedFoodItems, ...foodItems];

    await UpdateData({
      auth,
      endPoint: 'room-bookings',
      payload: {
        data: {
          service_tokens: sanitizeArray(updatedServices),
          food_tokens: sanitizeArray(updatedFood),
          room_tokens: sanitizeArray(updatedRoomTokens),
        },
      },
      id: booking.documentId,
    });
  };

  const handleSave = async () => {
    const res = await createInvoice();
    if (res) {
      await updateBooking();
      SuccessToast('Invoice created successfully');
      setMop('');
      setOpen(false);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          maxHeight: '90vh',
          overflowY: 'scroll',
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
            Create Invoice
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'gray' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Customer Info */}
        <Grid container spacing={1}>
          {[
            { label: 'Customer Name', key: 'customer_name' },
            { label: 'Customer Phone No', key: 'customer_phone' },
            { label: 'GSTIN', key: 'customer_gst' },
            { label: 'Address', key: 'customer_address' },
          ].map((field, i) => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <TextField
                margin="dense"
                label={field.label}
                size="small"
                fullWidth
                value={customerData[field.key]}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    [field.key]: e.target.value,
                  })
                }
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Mode of payment"
              select
              size="small"
              value={mop}
              onChange={(e) => setMop(e.target.value)}
              fullWidth
            >
              {paymentMethods.map((mode, index) => (
                <MenuItem key={index} value={mode?.name}>
                  {mode?.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ✅ Room Tokens Table */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <RoomIcon color="primary" />
            <Typography fontWeight="bold" variant="subtitle1">
              Room Tokens
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={
                        roomTokens.length > 0 &&
                        roomTokens.every((r) => r.invoice)
                      }
                      indeterminate={
                        roomTokens.some((r) => r.invoice) &&
                        !roomTokens.every((r) => r.invoice)
                      }
                      onChange={(e) => handleSelectAllRooms(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>Room No</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">SGST (₹)</TableCell>
                  <TableCell align="right">CGST (₹)</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {roomTokens.length ? (
                  roomTokens.map((row, i) => {
                    const rate = row.rate * row.days;
                    return (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Checkbox
                            checked={row.invoice || false}
                            onChange={() => handleRoomToggle(i)}
                          />
                        </TableCell>
                        <TableCell>{row.room}</TableCell>
                        <TableCell>{row.item}</TableCell>
                        <TableCell align="right">
                          {(row.amount - rate) / 2}
                        </TableCell>
                        <TableCell align="right">
                          {(row.amount - rate) / 2}
                        </TableCell>
                        <TableCell align="right">{row.amount}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Room Tokens
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ✅ Service Tokens Table */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocalMallIcon color="secondary" />
            <Typography fontWeight="bold" variant="subtitle1">
              Service Tokens
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={
                        services.length > 0 && services.every((s) => s.invoice)
                      }
                      indeterminate={
                        services.some((s) => s.invoice) &&
                        !services.every((s) => s.invoice)
                      }
                      onChange={(e) =>
                        handleSelectAllServices(e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>Room No</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">SGST (₹)</TableCell>
                  <TableCell align="right">CGST (₹)</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {services.length ? (
                  services.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>
                        <Checkbox
                          checked={row.invoice || false}
                          onChange={() => handleServiceToggle(i)}
                        />
                      </TableCell>
                      <TableCell>{row.room_no}</TableCell>
                      <TableCell>
                        {row.items?.map((i) => i.item).join(', ')}
                      </TableCell>
                      <TableCell align="right">{row.total_gst / 2}</TableCell>
                      <TableCell align="right">{row.total_gst / 2}</TableCell>
                      <TableCell align="right">{row.total_amount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Service Tokens
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ✅ Food Tokens Table */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <RestaurantIcon color="success" />
            <Typography fontWeight="bold" variant="subtitle1">
              Food Tokens
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={
                        foodItems.length > 0 &&
                        foodItems.every((f) => f.invoice)
                      }
                      indeterminate={
                        foodItems.some((f) => f.invoice) &&
                        !foodItems.every((f) => f.invoice)
                      }
                      onChange={(e) => handleSelectAllFood(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>Room No</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">SGST (₹)</TableCell>
                  <TableCell align="right">CGST (₹)</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {foodItems.length ? (
                  foodItems.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>
                        <Checkbox
                          checked={row.invoice || false}
                          onChange={() => handleFoodToggle(i)}
                        />
                      </TableCell>
                      <TableCell>{row.room_no}</TableCell>
                      <TableCell>
                        {row.items?.map((i) => i.item).join(', ')}
                      </TableCell>
                      <TableCell align="right">{row.total_gst / 2}</TableCell>
                      <TableCell align="right">{row.total_gst / 2}</TableCell>
                      <TableCell align="right">{row.total_amount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Food Tokens
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
          <Button variant="contained" color="success" onClick={handleSave}>
            Save Changes
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
