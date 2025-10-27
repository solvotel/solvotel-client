'use client';
import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { useAuth } from '@/context';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { DeleteData, GetDataList, UpdateData } from '@/utils/ApiFunctions';
import { Loader } from '@/component/common';
import { useMemo, useRef, useState } from 'react';
import { SuccessToast } from '@/utils/GenerateToast';
import RoomInvoiceViewDialog from '@/component/bookingComp/RoomInvoiceViewDialog';
import EditRoomInvoiceDialog from '@/component/bookingComp/RoomInvoiceEditDialog';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const data = GetDataList({
    auth,
    endPoint: 'room-invoices',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  // filter data by invoice no
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.invoice_no?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // handle delete
  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'room-invoices',
      id: selectedRow.documentId,
    });
    SuccessToast('Invoice deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  // handle edit
  const handleEdit = (row) => {
    setEditData(row);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const {
      id,
      documentId,
      publishedAt,
      updatedAt,
      createdAt,
      room_booking,
      ...updateBody
    } = editData;
    console.log(updateBody);
    await UpdateData({
      auth,
      endPoint: 'room-invoices',
      id: editData.documentId,
      payload: {
        data: updateBody,
      },
    });
    SuccessToast('Invoice updated successfully');
    setEditOpen(false);
    setEditData(null);
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Room Invoices</Typography>
        </Breadcrumbs>
      </Box>

      {!data || !paymentMethods ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by invoice no"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Invoice No',
                    'Date/Time',
                    'Customer Name',
                    'Total Amount',
                    'GST',
                    'Payable Amount',
                    'Payment Method',
                    'Actions',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => {
                  const totalRoomGst = row?.room_tokens.reduce(
                    (sum, r) => sum + (parseFloat(r.gst) || 0),
                    0
                  );
                  const totalServiceGst = row?.service_tokens.reduce(
                    (sum, s) => sum + (parseFloat(s.total_gst) || 0),
                    0
                  );
                  const totalFoodGst = row?.food_tokens.reduce(
                    (sum, f) => sum + (parseFloat(f.total_gst) || 0),
                    0
                  );
                  const payableRoomAmount = row?.room_tokens.reduce(
                    (sum, r) => sum + (parseFloat(r.amount) || 0),
                    0
                  );
                  const payableServiceAmount = row?.service_tokens.reduce(
                    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
                    0
                  );
                  const payableFoodAmount = row?.food_tokens.reduce(
                    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
                    0
                  );

                  const finalGst =
                    totalRoomGst + totalServiceGst + totalFoodGst;
                  const finalTotalAmount =
                    payableRoomAmount +
                    payableServiceAmount +
                    payableFoodAmount;
                  const finalRate = finalTotalAmount - finalGst;

                  return (
                    <TableRow key={row.documentId}>
                      <TableCell>{row.invoice_no}</TableCell>
                      <TableCell>
                        {GetCustomDate(row.date)}&nbsp;{row.time}
                      </TableCell>
                      <TableCell>{row.customer_name}</TableCell>
                      <TableCell>{finalRate.toFixed(2)}</TableCell>
                      <TableCell>{finalGst}</TableCell>
                      <TableCell>{finalTotalAmount}</TableCell>
                      <TableCell>{row.mop}</TableCell>
                      <TableCell sx={{ width: '150px' }}>
                        <Tooltip title="View">
                          <IconButton
                            color="secondary"
                            onClick={() => {
                              setViewData(row);
                              setViewOpen(true);
                            }}
                            size="small"
                          >
                            <VisibilityIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(row)}
                            size="small"
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row)}
                            size="small"
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No invoice found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteOpen} onClose={handleCancelDelete}>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete invoice{' '}
                <strong>{selectedRow?.invoice_no}</strong>? This action cannot
                be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Dialog */}
          <RoomInvoiceViewDialog
            viewOpen={viewOpen}
            setViewOpen={setViewData}
            viewData={viewData}
          />

          {/* Edit Dialog */}
          <EditRoomInvoiceDialog
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            editData={editData}
            setEditData={setEditData}
            paymentMethods={paymentMethods}
            handleSaveEdit={handleSaveEdit}
          />
        </Box>
      )}
    </>
  );
};

export default Page;
