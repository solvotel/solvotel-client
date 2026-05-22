'use client';
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Grid,
  TableContainer,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableBody,
  Chip,
  IconButton,
  TablePagination,
  Paper,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { GetDataList, DeleteData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { useState } from 'react';

import { formatDateTime, GetTodaysDate } from '@/utils/DateFetcher';
import { SuccessToast } from '@/utils/GenerateToast';
import { DeleteDialog } from '@/component/tableOrderComp';
import { CheckUserPermission } from '@/utils/UserPermissions';
import { generateKOTChanges } from '@/utils/generateKOTChanges';
import ViewTableOrder from '@/component/tableOrderComp/ViewTableOrder';
import { Delete, RemoveRedEyeOutlined } from '@mui/icons-material';

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const todaysDate = GetTodaysDate().dateString;
  const orders = GetDataList({ auth, endPoint: 'table-orders' });

  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedOrders = orders?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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

  if (!orders) return <Loader />;

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
          <Typography color="text.primary"> Order History</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Date/Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => {
                const totalAmount = order.food_items?.reduce(
                  (sum, item) => sum + item.amount,
                  0,
                );

                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      '&:hover': { backgroundColor: '#f1f8ff' },
                      transition: '0.2s',
                    }}
                  >
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>{order.order_id}</TableCell>
                    <TableCell>{order.table?.table_no}</TableCell>
                    <TableCell>
                      <Chip
                        sx={{
                          fontSize: 10,
                        }}
                        label={order.token_status}
                        color={
                          order.token_status === 'Closed'
                            ? 'secondary'
                            : order.token_status === 'Open'
                              ? 'success'
                              : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {order.token_status === 'Closed' && (
                        <>
                          {order.closing_method || '-'}&nbsp;
                          {(order?.room_booking?.booking_id ||
                            order?.restaurant_invoice?.invoice_no) && (
                            <Link
                              href={
                                order?.room_booking
                                  ? `/front-office/room-booking/${order.room_booking.documentId}`
                                  : `/restaurant/invoices/${order.restaurant_invoice.documentId}`
                              }
                              style={{
                                fontSize: 10,
                                color: 'blue',
                                textDecoration: 'none',
                              }}
                            >
                              (
                              {order?.room_booking?.booking_id ||
                                order?.restaurant_invoice?.invoice_no}
                              )
                            </Link>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell>₹{totalAmount.toFixed(2) || 0}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => {
                          setViewOpen(true);
                          setSelectedRow(order);
                        }}
                      >
                        <RemoveRedEyeOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => {
                          setSelectedRow(order);
                          setDeleteOpen(true);
                        }}
                        disabled={
                          !permissions.canDelete ||
                          order.token_status === 'Closed'
                        }
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* create Invoice */}
      <ViewTableOrder
        open={viewOpen}
        setOpen={setViewOpen}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        handleConfirmDelete={handleConfirmDelete}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
    </>
  );
};

export default Page;
