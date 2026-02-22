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
  KOTPrintDialog,
  OrderTable,
  TableGrid,
  TransferOrder,
} from '@/component/tableOrderComp';
import { CheckUserPermission } from '@/utils/UserPermissions';
import { generateKOTChanges } from '@/utils/generateKOTChanges';

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
  const permissions = CheckUserPermission(auth?.user?.permissions);
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
      })) || [],
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

  const [selectedKot, setSelectedKot] = useState(null);
  const [kotOpen, setKotOpen] = useState(false);

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
    const cleanedItems = formData.food_items.map(
      ({ id, documentId, ...r }) => r,
    );
    const cleanedKots = formData.kots?.map((kot) => {
      return kot.documentId;
    });
    const finalData = {
      ...formData,
      food_items: cleanedItems,
      kots: cleanedKots,
    };

    if (editing) {
      // Get previous order data
      const prevOrder = orders.find(
        (o) => o.documentId === formData.documentId,
      );
      const prevItems = prevOrder?.food_items || [];

      // 1️⃣ Compare differences
      const changes = generateKOTChanges(prevItems, cleanedItems);

      const { id, documentId, updatedAt, createdAt, ...cleansedData } =
        finalData;

      // 2️⃣ Update the order
      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: formData.documentId,
        payload: {
          data: {
            ...cleansedData,
            user_updated: auth?.user?.username,
          },
        },
      });

      // 3️⃣ If there are changes, create a new KOT
      if (changes.length > 0) {
        const kotNumber = (prevOrder.kots?.length || 0) + 1;

        await CreateNewData({
          auth,
          endPoint: 'kots',
          payload: {
            data: {
              kot_number: kotNumber,
              type: 'update', // overall KOT type
              items: changes, // each item has its own type (+ or cancel)
              table_order: prevOrder.documentId,
            },
          },
        });

        // 4️⃣ Open print dialog for latest KOT
        setSelectedKot({
          kot_number: kotNumber,
          items: changes,
          type: 'update',
          table_order: prevOrder,
        });
        setKotOpen(true);
      }

      SuccessToast('Order updated successfully');
    } else {
      // New order creation
      const newOrderNo = generateNextOrderNo(orders);
      const time = GetCurrentTime();
      const orderRes = await CreateNewData({
        auth,
        endPoint: 'table-orders',
        payload: {
          data: {
            ...finalData,
            order_id: newOrderNo,
            date: todaysDate,
            time,
            user_created: auth?.user?.username,
          },
        },
      });

      const newOrderId = orderRes.data?.data?.documentId;
      console.log(orderRes);
      await CreateNewData({
        auth,
        endPoint: 'kots',
        payload: {
          data: {
            kot_number: 1,
            type: 'new',
            items: cleanedItems.map((i) => ({
              name: i.item,
              qty: `+${i.qty}`,
              type: 'new',
            })),
            table_order: newOrderId,
          },
        },
      });

      // Print the first KOT
      setSelectedKot({
        kot_number: 1,
        type: 'new',
        items: cleanedItems.map((i) => ({
          name: i.item,
          qty: `+${i.qty}`,
        })),
        table_no:
          tables?.find((t) => t.documentId === formData.table)?.table_no ||
          null,
        table_order: { documentId: newOrderId, table: formData.table },
      });
      setKotOpen(true);

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
              permissions={permissions}
              setKotOpen={setKotOpen}
              setSelectedKot={setSelectedKot}
            />
          </Grid>

          {/* Right Side - Orders Table */}
          <Grid size={{ xs: 12, md: 6 }}>
            <OrderTable
              orders={orders}
              handleEdit={handleEdit}
              setSelectedRow={setSelectedRow}
              setDeleteOpen={setDeleteOpen}
              permissions={permissions}
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

      {/* KOT Print Dialog */}
      <KOTPrintDialog
        open={kotOpen}
        setOpen={setKotOpen}
        selectedKot={selectedKot}
        setSelectedKot={setSelectedKot}
      />
    </>
  );
};

export default Page;
