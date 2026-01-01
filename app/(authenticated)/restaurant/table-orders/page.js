'use client';
import { Box, Breadcrumbs, Link, Typography, Grid } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import {
  GetDataList,
  CreateNewData,
  UpdateData,
  DeleteData,
} from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { useState } from 'react';
import { GetCurrentTime } from '@/utils/Timefetcher';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import {
  CreateNewOrder,
  CreateOrderInvoice,
  DeleteDialog,
  OrderTable,
  TableGrid,
  TransferOrder,
} from '@/component/tableOrderComp';

const generateNextOrderNo = (orders) => {
  if (!orders || orders.length === 0) {
    return 'ODR-1';
  }

  const numbers = orders
    .map((inv) => parseInt(inv.order_id?.replace('ODR-', ''), 10))
    .filter((n) => !isNaN(n));

  const maxNumber = Math.max(...numbers);

  return `ODR-${maxNumber + 1}`;
};

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const tables = GetDataList({ auth, endPoint: 'tables' });
  const orders = GetDataList({ auth, endPoint: 'table-orders' });
  const menuItems = GetDataList({
    auth,
    endPoint: 'restaurant-menus',
  });
  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });
  const invoices = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });

  const activeBookings = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);
    const today = new Date(todaysDate);

    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      today >= checkIn &&
      today <= checkOut
    );
  });

  // Step 2: Flatten all rooms from those active bookings
  const activeRooms = activeBookings?.flatMap(
    (bk) =>
      bk.rooms?.map((room) => ({
        booking_id: bk.documentId,
        room_no: room.room_no,
      })) || []
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Create/Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    food_items: [],
    hotel_id: auth?.user?.hotel_id || '',
  });
  const [editing, setEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState();

  // room transfer/invoice state
  const [transferOpen, setTransferOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');

  const handleTransferOrder = (order) => {
    setSelectedRow(order);
    setTransferOpen(true);
  };
  const handleOrderInvoice = (order) => {
    setSelectedRow(order);
    setInvoiceOpen(true);
  };

  // handle edit
  const handleEdit = (order) => {
    setEditing(true);
    setFormData({ ...order, table: order.table?.documentId });
    setFormOpen(true);
  };

  // handle create
  const handleCreate = (tableId) => {
    setEditing(false);
    setFormData({
      food_items: [],
      hotel_id: auth?.user?.hotel_id || '',
      table: tableId,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    // ✅ Clean food_items (remove id/documentId/etc.)
    const cleanedMenuItems = formData.food_items.map(
      ({ id, documentId, ...rest }) => rest
    );

    const finalData = {
      ...formData,
      food_items: cleanedMenuItems,
    };

    if (editing) {
      const {
        id,
        documentId,
        publishedAt,
        updatedAt,
        createdAt,
        ...updateBody
      } = finalData;

      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: formData.documentId, // ✅ only for URL
        payload: { data: updateBody },
      });
      SuccessToast('Order updated successfully');
    } else {
      const newOrderNO = generateNextOrderNo(orders);
      const time = GetCurrentTime();
      await CreateNewData({
        auth,
        endPoint: 'table-orders',
        payload: {
          data: {
            ...finalData,
            order_id: newOrderNO,
            date: todaysDate,
            time: time,
          },
        },
      });
      SuccessToast('Order created successfully');
    }

    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'table-orders',
      id: selectedRow.documentId,
    });
    SuccessToast('Invoice deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  if (!tables || !orders || !paymentMethods || !invoices) return <Loader />;

  return (
    <>
      {/* Breadcrumb Header */}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#f5f5f5' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Table Orders</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Side - Table Cards */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TableGrid
              tables={tables}
              orders={orders}
              handleCreate={handleCreate}
              handleTransferOrder={handleTransferOrder}
              handleOrderInvoice={handleOrderInvoice}
              handleEdit={handleEdit}
            />
          </Grid>

          {/* Right Side - Orders Table */}
          <Grid size={{ xs: 12, md: 6 }}>
            <OrderTable
              orders={orders}
              handleEdit={handleEdit}
              setSelectedRow={setSelectedRow}
              setDeleteOpen={setDeleteOpen}
            />
          </Grid>
        </Grid>
      </Box>
      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        handleConfirmDelete={handleConfirmDelete}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />

      {/* Create/Edit Dialog */}
      <CreateNewOrder
        formOpen={formOpen}
        setFormOpen={setFormOpen}
        editing={editing}
        formData={formData}
        setFormData={setFormData}
        tables={tables}
        menuItems={menuItems}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        handleSave={handleSave}
      />

      {/* Transfer Dialog */}
      <TransferOrder
        auth={auth}
        transferOpen={transferOpen}
        setTransferOpen={setTransferOpen}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        activeRooms={activeRooms}
        selectedBooking={selectedBooking}
        setSelectedBooking={setSelectedBooking}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        bookings={bookings}
      />

      {/* create Invoice */}
      <CreateOrderInvoice
        auth={auth}
        invoiceOpen={invoiceOpen}
        setInvoiceOpen={setInvoiceOpen}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        invoices={invoices}
        paymentMethods={paymentMethods}
      />
    </>
  );
};

export default Page;
