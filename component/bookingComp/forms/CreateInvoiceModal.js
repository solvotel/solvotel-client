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
}) {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  // 🔹 Initialize all states with empty arrays
  const [roomTokens, setRoomTokens] = useState([]);
  const [services, setServices] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [billedRoomTokens, setBilledRoomTokens] = useState([]);
  const [billedServices, setBilledServices] = useState([]);
  const [billedFoodItems, setBilledFoodItems] = useState([]);

  // 🔹 Update lists whenever booking changes (API refresh)
  useEffect(() => {
    if (!booking) return;

    const unBilledRoomTokens =
      booking.room_tokens?.filter((r) => !r.invoice) || [];
    const unBilledServices =
      booking.service_billing?.filter((s) => !s.invoice) || [];
    const unBilledFoodItems =
      booking.food_items?.filter((f) => !f.invoice) || [];

    const billedRoomTokens =
      booking.room_tokens?.filter((r) => r.invoice) || [];
    const billedServices =
      booking.service_billing?.filter((s) => s.invoice) || [];
    const billedFoodItems = booking.food_items?.filter((f) => f.invoice) || [];

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

  // 🔹 Checkbox toggle handler
  const handleCheckboxToggle = (type, index) => {
    const toggle = (arr, setArr) =>
      setArr((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, invoice: !item.invoice } : item
        )
      );

    if (type === 'room') toggle(roomTokens, setRoomTokens);
    else if (type === 'service') toggle(services, setServices);
    else if (type === 'food') toggle(foodItems, setFoodItems);
  };

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
          service_billing: sanitizeArray(selectedServices),
          food_items: sanitizeArray(selectedFood),
          hotel_id: auth?.user?.hotel_id,
          room_booking: booking.documentId,
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
          service_billing: sanitizeArray(updatedServices),
          food_items: sanitizeArray(updatedFood),
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
      setOpen(false);
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
          <IconButton onClick={handleClose} sx={{ color: 'gray' }}>
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
            <Grid key={i} xs={12} md={6} item>
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
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Room Tokens */}
        <SectionTable
          title="Room Tokens"
          icon={<RoomIcon color="primary" />}
          rows={roomTokens}
          onToggle={(i) => handleCheckboxToggle('room', i)}
          columns={[
            { key: 'room', label: 'Room No' },
            { key: 'item', label: 'Type' },
            { key: 'rate', label: 'Tariff', prefix: '₹' },
            { key: 'gst', label: 'GST', suffix: '%' },
            { key: 'amount', label: 'Amount', prefix: '₹' },
          ]}
        />

        <Divider sx={{ my: 2 }} />

        {/* Services */}
        <SectionTable
          title="Services"
          icon={<LocalMallIcon color="secondary" />}
          rows={services}
          onToggle={(i) => handleCheckboxToggle('service', i)}
          columns={[
            { key: 'room', label: 'Room' },
            { key: 'item', label: 'Item' },
            { key: 'hsn', label: 'HSN' },
            { key: 'rate', label: 'Rate', prefix: '₹' },
            { key: 'gst', label: 'GST', suffix: '%' },
            { key: 'amount', label: 'Amount', prefix: '₹' },
          ]}
        />

        <Divider sx={{ my: 2 }} />

        {/* Food Items */}
        <SectionTable
          title="Food Items"
          icon={<RestaurantIcon color="success" />}
          rows={foodItems}
          onToggle={(i) => handleCheckboxToggle('food', i)}
          columns={[
            { key: 'room', label: 'Room' },
            { key: 'item', label: 'Item' },
            { key: 'rate', label: 'Rate', prefix: '₹' },
            { key: 'qty', label: 'Qty' },
            { key: 'gst', label: 'GST', suffix: '%' },
            { key: 'amount', label: 'Amount', prefix: '₹' },
          ]}
        />

        <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
          <Button variant="contained" color="success" onClick={handleSave}>
            Save Changes
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// 🔹 Reusable Table Section
const SectionTable = ({ title, icon, rows = [], columns, onToggle }) => (
  <Box>
    <Box display="flex" alignItems="center" gap={1} mb={1}>
      {icon}
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{
          background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {title}
      </Typography>
    </Box>
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f9f9f9' }}>
          <TableRow>
            <TableCell></TableCell>
            {columns.map((col, i) => (
              <TableCell key={i} sx={{ fontWeight: 'bold' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <TableRow key={i} hover>
                <TableCell sx={{ width: '50px' }}>
                  <Checkbox
                    size="small"
                    checked={row.invoice || false}
                    onChange={() => onToggle(i)}
                  />
                </TableCell>
                {columns.map((col, j) => (
                  <TableCell key={j}>
                    {col.prefix || ''}
                    {row[col.key]}
                    {col.suffix || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);
